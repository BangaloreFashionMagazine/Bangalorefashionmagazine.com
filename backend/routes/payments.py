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
        # Check for missing keys OR placeholder values
        if not key_id or not key_secret or key_id.startswith('your_') or key_secret.startswith('your_'):
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
            logger.error("Razorpay client not available for verification")
            raise HTTPException(status_code=500, detail="Razorpay not configured")
        
        logger.info(f"Verifying payment - Order: {request.razorpay_order_id}, Payment: {request.razorpay_payment_id}, Talent: {request.talent_id}")
        
        try:
            # Verify signature
            params_dict = {
                'razorpay_order_id': request.razorpay_order_id,
                'razorpay_payment_id': request.razorpay_payment_id,
                'razorpay_signature': request.razorpay_signature
            }
            
            try:
                client.utility.verify_payment_signature(params_dict)
                logger.info("Payment signature verified successfully")
            except razorpay.errors.SignatureVerificationError as sig_err:
                logger.error(f"Signature verification failed: {sig_err}")
                raise HTTPException(status_code=400, detail="Payment verification failed. Invalid signature.")
            
            # Update order status
            update_result = await db.payment_orders.update_one(
                {"razorpay_order_id": request.razorpay_order_id},
                {"$set": {
                    "status": "paid",
                    "razorpay_payment_id": request.razorpay_payment_id,
                    "razorpay_signature": request.razorpay_signature,
                    "paid_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            logger.info(f"Payment order updated: {update_result.modified_count} records")
            
            # Update talent status to show payment completed (still pending admin approval)
            if request.talent_id:
                talent_update = await db.talents.update_one(
                    {"id": request.talent_id},
                    {"$set": {
                        "payment_status": "paid",
                        "payment_id": request.razorpay_payment_id,
                        "payment_date": datetime.now(timezone.utc).isoformat()
                    }}
                )
                logger.info(f"Talent payment status updated: {talent_update.modified_count} records")
            
            return {
                "status": "success",
                "message": "Payment verified successfully. Your registration is pending admin approval."
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Payment verification error: {type(e).__name__}: {e}")
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

    # ============== CUSTOM EVENTS/CONTESTS PAYMENT SYSTEM ==============
    
    class EventCreate(BaseModel):
        title: str
        description: Optional[str] = ""
        amount: int  # Amount in INR
        event_type: str = "contest"  # contest, event, workshop, etc.
        max_participants: Optional[int] = None
        deadline: Optional[str] = None
        is_active: bool = True

    class EventPaymentRequest(BaseModel):
        event_id: str
        talent_id: str
        talent_name: str
        talent_email: str
        talent_phone: str

    # Create a new event/contest
    @router.post("/events/create")
    async def create_event(event: EventCreate):
        event_data = {
            "id": str(uuid.uuid4()),
            "title": event.title,
            "description": event.description,
            "amount": event.amount,
            "event_type": event.event_type,
            "max_participants": event.max_participants,
            "deadline": event.deadline,
            "is_active": event.is_active,
            "participants": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.events.insert_one(event_data)
        return {"message": "Event created successfully", "event": event_data}

    # Get all events
    @router.get("/events")
    async def get_events(active_only: bool = True):
        query = {"is_active": True} if active_only else {}
        events = await db.events.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
        return events

    # Get single event
    @router.get("/events/{event_id}")
    async def get_event(event_id: str):
        event = await db.events.find_one({"id": event_id}, {"_id": 0})
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        return event

    # Update event
    @router.put("/events/{event_id}")
    async def update_event(event_id: str, event: EventCreate):
        result = await db.events.update_one(
            {"id": event_id},
            {"$set": {
                "title": event.title,
                "description": event.description,
                "amount": event.amount,
                "event_type": event.event_type,
                "max_participants": event.max_participants,
                "deadline": event.deadline,
                "is_active": event.is_active,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Event not found")
        return {"message": "Event updated successfully"}

    # Delete event
    @router.delete("/events/{event_id}")
    async def delete_event(event_id: str):
        result = await db.events.delete_one({"id": event_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Event not found")
        return {"message": "Event deleted successfully"}

    # Create payment order for event
    @router.post("/events/create-order")
    async def create_event_payment_order(request: EventPaymentRequest):
        client = get_razorpay_client()
        if not client:
            raise HTTPException(status_code=400, detail="Razorpay not configured")
        
        # Get event details
        event = await db.events.find_one({"id": request.event_id})
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        if not event.get("is_active"):
            raise HTTPException(status_code=400, detail="Event is no longer active")
        
        # Check if talent already registered
        if request.talent_id in event.get("participants", []):
            raise HTTPException(status_code=400, detail="Already registered for this event")
        
        # Check max participants
        if event.get("max_participants"):
            if len(event.get("participants", [])) >= event["max_participants"]:
                raise HTTPException(status_code=400, detail="Event is full")
        
        amount_paise = event["amount"] * 100
        
        try:
            order = client.order.create({
                "amount": amount_paise,
                "currency": "INR",
                "receipt": f"event_{request.event_id}_{request.talent_id}",
                "notes": {
                    "event_id": request.event_id,
                    "event_title": event["title"],
                    "talent_id": request.talent_id,
                    "talent_name": request.talent_name,
                    "payment_type": "event"
                }
            })
            
            # Store order details
            await db.event_payments.insert_one({
                "id": str(uuid.uuid4()),
                "event_id": request.event_id,
                "event_title": event["title"],
                "razorpay_order_id": order["id"],
                "talent_id": request.talent_id,
                "talent_name": request.talent_name,
                "talent_email": request.talent_email,
                "talent_phone": request.talent_phone,
                "amount": event["amount"],
                "status": "created",
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            
            return {
                "order_id": order["id"],
                "amount": amount_paise,
                "currency": "INR",
                "key_id": os.environ.get('RAZORPAY_KEY_ID'),
                "event_title": event["title"]
            }
            
        except Exception as e:
            logger.error(f"Event payment order creation failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    # Verify event payment
    @router.post("/events/verify-payment")
    async def verify_event_payment(request: PaymentVerifyRequest):
        client = get_razorpay_client()
        if not client:
            raise HTTPException(status_code=400, detail="Razorpay not configured")
        
        try:
            # Verify signature
            client.utility.verify_payment_signature({
                'razorpay_order_id': request.razorpay_order_id,
                'razorpay_payment_id': request.razorpay_payment_id,
                'razorpay_signature': request.razorpay_signature
            })
            
            # Get order details
            order = await db.event_payments.find_one({"razorpay_order_id": request.razorpay_order_id})
            if not order:
                raise HTTPException(status_code=404, detail="Order not found")
            
            # Update payment status
            await db.event_payments.update_one(
                {"razorpay_order_id": request.razorpay_order_id},
                {"$set": {
                    "status": "paid",
                    "razorpay_payment_id": request.razorpay_payment_id,
                    "paid_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            
            # Add talent to event participants
            await db.events.update_one(
                {"id": order["event_id"]},
                {"$addToSet": {"participants": request.talent_id}}
            )
            
            return {"status": "success", "message": "Payment verified and registration complete"}
            
        except razorpay.errors.SignatureVerificationError:
            await db.event_payments.update_one(
                {"razorpay_order_id": request.razorpay_order_id},
                {"$set": {"status": "verification_failed"}}
            )
            raise HTTPException(status_code=400, detail="Payment verification failed")

    # Get event participants
    @router.get("/events/{event_id}/participants")
    async def get_event_participants(event_id: str):
        payments = await db.event_payments.find(
            {"event_id": event_id, "status": "paid"},
            {"_id": 0}
        ).sort("paid_at", -1).to_list(500)
        return payments

    # Get all event payments (admin)
    @router.get("/events/payments/all")
    async def get_all_event_payments():
        payments = await db.event_payments.find(
            {},
            {"_id": 0}
        ).sort("created_at", -1).to_list(500)
        return payments

    # Get talent's event registrations
    @router.get("/events/talent/{talent_id}")
    async def get_talent_events(talent_id: str):
        payments = await db.event_payments.find(
            {"talent_id": talent_id, "status": "paid"},
            {"_id": 0}
        ).to_list(100)
        return payments
    
    return router
