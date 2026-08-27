"""
"Get Featured in Magazine" - talents submit details + files/posters, pay a
fee, and admin reviews submissions (filterable by category/payment status)
to pull content from directly into the magazine. Reuses the same Razorpay
integration pattern already used in routes/payments.py.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
import os
import uuid
import razorpay

from dependencies.auth import get_current_admin, get_current_identity

import logging
logger = logging.getLogger(__name__)


class MagazineFeatureSubmit(BaseModel):
    talent_id: str
    name: str
    email: str
    phone: str
    category: str
    notes: Optional[str] = ""
    files: List[str] = []  # base64 data URIs (images/poster/docs)


class MagazineFeatureVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class MagazineFeatureSettingsUpdate(BaseModel):
    enabled: bool = True
    fee: int  # Amount in INR


MAX_FILES = 10


def create_magazine_feature_routes(db):
    router = APIRouter()
    admin_router = APIRouter()

    def get_razorpay_client():
        key_id = os.environ.get('RAZORPAY_KEY_ID')
        key_secret = os.environ.get('RAZORPAY_KEY_SECRET')
        if not key_id or not key_secret or key_id.startswith('your_') or key_secret.startswith('your_'):
            return None
        return razorpay.Client(auth=(key_id, key_secret))

    def _require_owner_or_admin(identity: dict, owner_id: str):
        if identity.get("is_admin"):
            return
        if identity.get("type") == "talent" and identity.get("sub") == owner_id:
            return
        raise HTTPException(status_code=403, detail="Not authorized to perform this action")

    # ============== Settings ==============
    @router.get("/magazine-feature-settings")
    async def get_settings():
        settings = await db.settings.find_one({"type": "magazine_feature_settings"}, {"_id": 0})
        if not settings:
            return {"enabled": True, "fee": 999}
        return {"enabled": settings.get("enabled", True), "fee": settings.get("fee", 999)}

    @admin_router.put("/admin/magazine-feature-settings")
    async def update_settings(data: MagazineFeatureSettingsUpdate):
        await db.settings.update_one(
            {"type": "magazine_feature_settings"},
            {"$set": {"type": "magazine_feature_settings", "enabled": data.enabled, "fee": data.fee}},
            upsert=True
        )
        return {"message": "Magazine feature settings updated"}

    # ============== Submission ==============
    @router.post("/magazine-features")
    async def submit(data: MagazineFeatureSubmit, identity: dict = Depends(get_current_identity)):
        _require_owner_or_admin(identity, data.talent_id)

        talent = await db.talents.find_one({"id": data.talent_id})
        if not talent:
            raise HTTPException(status_code=404, detail="Talent not found")

        files = (data.files or [])[:MAX_FILES]
        doc = {
            "id": str(uuid.uuid4()),
            "talent_id": data.talent_id,
            "name": data.name,
            "email": data.email,
            "phone": data.phone,
            "category": data.category,
            "notes": data.notes or "",
            "files": files,
            "payment_status": "pending",
            "review_status": "submitted",  # submitted, reviewed, used
            "admin_notes": "",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.magazine_features.insert_one(doc)
        logger.info(f"Magazine feature submission created for talent {data.talent_id}")
        return {"message": "Submission created", "id": doc["id"]}

    @router.put("/magazine-features/{submission_id}")
    async def update_submission(submission_id: str, data: MagazineFeatureSubmit, identity: dict = Depends(get_current_identity)):
        existing = await db.magazine_features.find_one({"id": submission_id})
        if not existing:
            raise HTTPException(status_code=404, detail="Submission not found")
        _require_owner_or_admin(identity, existing["talent_id"])
        if existing.get("payment_status") == "paid" and not identity.get("is_admin"):
            raise HTTPException(status_code=400, detail="Cannot edit a submission after payment - contact admin")

        files = (data.files or [])[:MAX_FILES]
        await db.magazine_features.update_one(
            {"id": submission_id},
            {"$set": {
                "name": data.name, "email": data.email, "phone": data.phone,
                "category": data.category, "notes": data.notes or "", "files": files,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }}
        )
        return {"message": "Submission updated"}

    @router.get("/magazine-features/{submission_id}")
    async def get_submission(submission_id: str, identity: dict = Depends(get_current_identity)):
        submission = await db.magazine_features.find_one({"id": submission_id}, {"_id": 0})
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        _require_owner_or_admin(identity, submission["talent_id"])
        return submission

    @router.get("/magazine-features")
    async def list_own_submissions(talent_id: str, identity: dict = Depends(get_current_identity)):
        _require_owner_or_admin(identity, talent_id)
        submissions = await db.magazine_features.find(
            {"talent_id": talent_id}, {"_id": 0}
        ).sort("created_at", -1).to_list(50)
        return submissions

    # ============== Payment ==============
    @router.post("/magazine-features/{submission_id}/create-order")
    async def create_order(submission_id: str, identity: dict = Depends(get_current_identity)):
        submission = await db.magazine_features.find_one({"id": submission_id})
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        _require_owner_or_admin(identity, submission["talent_id"])

        client = get_razorpay_client()
        if not client:
            raise HTTPException(status_code=500, detail="Razorpay not configured. Please add API keys.")

        settings = await db.settings.find_one({"type": "magazine_feature_settings"})
        fee = settings.get("fee", 999) if settings else 999
        amount_paise = fee * 100

        try:
            order = client.order.create({
                "amount": amount_paise,
                "currency": "INR",
                "receipt": f"magfeature_{submission_id[:20]}",
                "payment_capture": 1,
                "notes": {
                    "submission_id": submission_id,
                    "talent_id": submission["talent_id"],
                    "purpose": "magazine_feature"
                }
            })
            await db.magazine_features.update_one(
                {"id": submission_id},
                {"$set": {"razorpay_order_id": order["id"], "amount": fee}}
            )
            return {
                "order_id": order["id"],
                "amount": amount_paise,
                "currency": "INR",
                "key_id": os.environ.get('RAZORPAY_KEY_ID')
            }
        except Exception as e:
            logger.error(f"Magazine feature order creation failed: {e}")
            raise HTTPException(status_code=500, detail=f"Payment order creation failed: {str(e)}")

    @router.post("/magazine-features/{submission_id}/verify-payment")
    async def verify_payment(submission_id: str, request: MagazineFeatureVerify, identity: dict = Depends(get_current_identity)):
        submission = await db.magazine_features.find_one({"id": submission_id})
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        _require_owner_or_admin(identity, submission["talent_id"])

        client = get_razorpay_client()
        if not client:
            raise HTTPException(status_code=500, detail="Razorpay not configured")

        try:
            client.utility.verify_payment_signature({
                'razorpay_order_id': request.razorpay_order_id,
                'razorpay_payment_id': request.razorpay_payment_id,
                'razorpay_signature': request.razorpay_signature
            })
        except razorpay.errors.SignatureVerificationError:
            raise HTTPException(status_code=400, detail="Payment verification failed. Invalid signature.")

        await db.magazine_features.update_one(
            {"id": submission_id},
            {"$set": {
                "payment_status": "paid",
                "razorpay_payment_id": request.razorpay_payment_id,
                "paid_at": datetime.now(timezone.utc).isoformat(),
            }}
        )
        return {"status": "success", "message": "Payment verified. Your submission is now with the admin team."}

    # ============== Admin review ==============
    @admin_router.get("/admin/magazine-features")
    async def admin_list(category: Optional[str] = None, payment_status: Optional[str] = None, review_status: Optional[str] = None):
        query = {}
        if category:
            query["category"] = category
        if payment_status:
            query["payment_status"] = payment_status
        if review_status:
            query["review_status"] = review_status
        submissions = await db.magazine_features.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
        return submissions

    @admin_router.put("/admin/magazine-features/{submission_id}")
    async def admin_update(submission_id: str, data: dict):
        update_data = {}
        if "review_status" in data and data["review_status"] in ("submitted", "reviewed", "used"):
            update_data["review_status"] = data["review_status"]
        if "admin_notes" in data:
            update_data["admin_notes"] = data["admin_notes"]
        if not update_data:
            raise HTTPException(status_code=400, detail="No valid fields to update")
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

        result = await db.magazine_features.update_one({"id": submission_id}, {"$set": update_data})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Submission not found")
        return {"message": "Submission updated"}

    @admin_router.delete("/admin/magazine-features/{submission_id}")
    async def admin_delete(submission_id: str):
        result = await db.magazine_features.delete_one({"id": submission_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Submission not found")
        return {"message": "Submission deleted"}

    router.include_router(admin_router, dependencies=[Depends(get_current_admin)])
    return router
