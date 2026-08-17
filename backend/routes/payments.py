from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import os
import uuid
import razorpay

import logging
logger = logging.getLogger(__name__)

class PaymentOrderRequest(BaseModel):
    amount: int  # Amount in paise (e.g., 49900 for ₹499)
    talent_id: str
    talent_name: str
    talent_email: str
    talent_phone: str

class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    talent_id: str

class PaymentSettingsUpdate(BaseModel):
    payment_enabled: bool
    registration_fee: int  # Amount in INR (e.g., 499 for ₹499)

def create_payments_router(db):
    router = APIRouter()
    
    # Initialize Razorpay client
    def get_razorpay_client():
        key_id = os.environ.get('RAZORPAY_KEY_ID')
        key_secret = os.environ.get('RAZORPAY_KEY_SECRET')
        if not key_id or not key_secret:
            return None
        return razorpay.Client(auth=(key_id, key_secret))
    
    # Get payment settings
    @router.get("/payment-settings")
    async def get_payment_settings():
        settings = await db.settings.find_one({"type": "payment_settings"})
        if not settings:
            # Default settings
            return {
                "payment_enabled": False,
                "registration_fee": 499,  # Default ₹499
                "razorpay_configured": bool(os.environ.get('RAZORPAY_KEY_ID'))
            }
        return {
            "payment_enabled": settings.get("payment_enabled", False),
            "registration_fee": settings.get("registration_fee", 499),
            "razorpay_configured": bool(os.environ.get('RAZORPAY_KEY_ID'))
        }
    
    # Update payment settings (admin only)
    @router.post("/payment-settings")
    async def update_payment_settings(settings: PaymentSettingsUpdate):
        await db.settings.update_one(
            {"type": "payment_settings"},
            {"$set": {
                "type": "payment_settings",
                "payment_enabled": settings.payment_enabled,
                "registration_fee": settings.registration_fee,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )
        return {"message": "Payment settings updated", "settings": settings.dict()}
    
    # Create Razorpay order for talent registration
    @router.post("/create-order")
    async def create_payment_order(request: PaymentOrderRequest):
        client = get_razorpay_client()
        if not client:
            raise HTTPException(status_code=500, detail="Razorpay not configured. Please add API keys.")
        
        try:
            # Create Razorpay order
            order_data = {
                "amount": request.amount,  # Amount in paise
                "currency": "INR",
                "receipt": f"talent_{request.talent_id[:20]}",
                "payment_capture": 1,  # Auto capture
                "notes": {
                    "talent_id": request.talent_id,
                    "talent_name": request.talent_name,
                    "talent_email": request.talent_email,
                    "purpose": "talent_registration"
                }
            }
            
            razorpay_order = client.order.create(data=order_data)
            
            # Store order in database
            await db.payment_orders.insert_one({
                "id": str(uuid.uuid4()),
                "razorpay_order_id": razorpay_order["id"],
                "talent_id": request.talent_id,
                "talent_name": request.talent_name,
                "talent_email": request.talent_email,
                "talent_phone": request.talent_phone,
                "amount": request.amount,
                "currency": "INR",
                "status": "created",
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            
            return {
                "order_id": razorpay_order["id"],
                "amount": razorpay_order["amount"],
                "currency": razorpay_order["currency"],
                "key_id": os.environ.get('RAZORPAY_KEY_ID')
            }
            
        except Exception as e:
            logger.error(f"Razorpay order creation failed: {e}")
            raise HTTPException(status_code=500, detail=f"Payment order creation failed: {str(e)}")
    
    # Verify payment and complete registration
    @router.post("/verify-payment")
    async def verify_payment(request: PaymentVerifyRequest):
        client = get_razorpay_client()
        if not client:
            raise HTTPException(status_code=500, detail="Razorpay not configured")
        
        try:
            # Verify signature
            params_dict = {
                'razorpay_order_id': request.razorpay_order_id,
                'razorpay_payment_id': request.razorpay_payment_id,
                'razorpay_signature': request.razorpay_signature
            }
            
            client.utility.verify_payment_signature(params_dict)
            
            # Update order status
            await db.payment_orders.update_one(
                {"razorpay_order_id": request.razorpay_order_id},
                {"$set": {
                    "status": "paid",
                    "razorpay_payment_id": request.razorpay_payment_id,
                    "razorpay_signature": request.razorpay_signature,
                    "paid_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            
            # Update talent status to show payment completed (still pending admin approval)
            await db.talents.update_one(
                {"id": request.talent_id},
                {"$set": {
                    "payment_status": "paid",
                    "payment_id": request.razorpay_payment_id,
                    "payment_date": datetime.now(timezone.utc).isoformat()
                }}
            )
            
            return {
                "status": "success",
                "message": "Payment verified successfully. Your registration is pending admin approval."
            }
            
        except razorpay.errors.SignatureVerificationError:
            logger.error("Payment signature verification failed")
            raise HTTPException(status_code=400, detail="Payment verification failed. Invalid signature.")
        except Exception as e:
            logger.error(f"Payment verification error: {e}")
            raise HTTPException(status_code=500, detail=f"Payment verification failed: {str(e)}")
    
    # Get payment history (admin)
    @router.get("/payment-history")
    async def get_payment_history():
        payments = await db.payment_orders.find(
            {"status": "paid"},
            {"_id": 0}
        ).sort("paid_at", -1).to_list(100)
        
        total_revenue = sum(p.get("amount", 0) for p in payments) / 100  # Convert paise to INR
        
        return {
            "payments": payments,
            "total_revenue": total_revenue,
            "total_count": len(payments)
        }
    
    # Webhook handler for Razorpay events
    @router.post("/webhook")
    async def handle_webhook(request: Request):
        try:
            payload = await request.json()
            event = payload.get("event")
            
            if event == "payment.captured":
                payment = payload.get("payload", {}).get("payment", {}).get("entity", {})
                order_id = payment.get("order_id")
                payment_id = payment.get("id")
                
                # Update order status
                await db.payment_orders.update_one(
                    {"razorpay_order_id": order_id},
                    {"$set": {
                        "status": "captured",
                        "webhook_payment_id": payment_id,
                        "webhook_received_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
                
            elif event == "payment.failed":
                payment = payload.get("payload", {}).get("payment", {}).get("entity", {})
                order_id = payment.get("order_id")
                
                await db.payment_orders.update_one(
                    {"razorpay_order_id": order_id},
                    {"$set": {
                        "status": "failed",
                        "failure_reason": payment.get("error_description"),
                        "webhook_received_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
            
            return {"status": "processed"}
            
        except Exception as e:
            logger.error(f"Webhook processing error: {e}")
            return {"status": "error", "message": str(e)}
    
    return router
