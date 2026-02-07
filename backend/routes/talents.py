from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone, timedelta
from typing import List, Optional
import uuid
import secrets

from models import (
    TalentCreate, TalentUpdate, TalentResponse, TalentLoginResponse,
    UserLogin, ForgotPasswordRequest, ResetPasswordRequest
)
from services import hash_password, verify_password, generate_token, TALENT_CATEGORIES

import logging
logger = logging.getLogger(__name__)


def create_talent_routes(db):
    router = APIRouter()
    
    @router.post("/talent/register", response_model=TalentResponse)
    async def register_talent(talent_data: TalentCreate):
        # Case-insensitive email check
        existing = await db.talents.find_one({"email": {"$regex": f"^{talent_data.email}$", "$options": "i"}})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        if talent_data.category and talent_data.category not in TALENT_CATEGORIES:
            raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of: {TALENT_CATEGORIES}")
        
        if len(talent_data.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        
        if not talent_data.profile_image:
            raise HTTPException(status_code=400, detail="Profile image is required")
        
        portfolio = (talent_data.portfolio_images or [])[:7]
        
        talent_id = str(uuid.uuid4())
        talent_doc = {
            "id": talent_id,
            "name": talent_data.name,
            "email": talent_data.email.lower(),
            "password_hash": hash_password(talent_data.password),
            "password_plain": talent_data.password,
            "phone": talent_data.phone,
            "instagram_id": talent_data.instagram_id or "",
            "category": talent_data.category,
            "bio": talent_data.bio or "",
            "profile_image": talent_data.profile_image,
            "portfolio_images": portfolio,
            "is_approved": False,
            "rank": 999,
            "votes": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True,
            "agreed_to_terms": talent_data.agreed_to_terms or False,
            "agreed_at": talent_data.agreed_at or datetime.now(timezone.utc).isoformat()
        }
        await db.talents.insert_one(talent_doc)
        logger.info(f"New talent registered: {talent_data.email}")
        
        return TalentResponse(
            id=talent_id, name=talent_data.name, email=talent_data.email, phone=talent_data.phone,
            instagram_id=talent_doc["instagram_id"], category=talent_data.category, bio=talent_doc["bio"],
            profile_image=talent_data.profile_image, portfolio_images=portfolio,
            is_approved=False, rank=999, votes=0, created_at=talent_doc["created_at"]
        )


    @router.post("/talent/login", response_model=TalentLoginResponse)
    async def login_talent(login_data: UserLogin):
        talent = await db.talents.find_one({"email": {"$regex": f"^{login_data.email}$", "$options": "i"}}, {"_id": 0})
        if not talent:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        if not verify_password(login_data.password, talent.get("password_hash", "")):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        token = generate_token(talent["id"])
        logger.info(f"Talent logged in: {login_data.email}")
        
        return TalentLoginResponse(
            token=token,
            talent=TalentResponse(
                id=talent["id"], name=talent["name"], email=talent["email"], phone=talent["phone"],
                instagram_id=talent.get("instagram_id", ""), category=talent["category"],
                bio=talent.get("bio", ""), profile_image=talent.get("profile_image", ""),
                portfolio_images=talent.get("portfolio_images", []), is_approved=talent.get("is_approved", False),
                rank=talent.get("rank", 999), votes=talent.get("votes", 0), created_at=talent.get("created_at", "")
            ),
            message="Login successful"
        )


    @router.post("/talent/forgot-password")
    async def talent_forgot_password(request: ForgotPasswordRequest):
        talent = await db.talents.find_one({"email": {"$regex": f"^{request.email}$", "$options": "i"}})
        if not talent:
            raise HTTPException(status_code=404, detail="Email not found. Please register first.")
        
        otp = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
        
        await db.password_resets.delete_many({"email": request.email})
        await db.password_resets.insert_one({
            "email": request.email,
            "otp": otp,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()
        })
        
        logger.info(f"OTP generated for {request.email}: {otp}")
        return {"message": "OTP generated successfully", "otp": otp}


    @router.post("/talent/reset-password")
    async def talent_reset_password(request: ResetPasswordRequest):
        reset_doc = await db.password_resets.find_one({
            "email": {"$regex": f"^{request.email}$", "$options": "i"}, 
            "otp": request.reset_code
        })
        if not reset_doc:
            raise HTTPException(status_code=400, detail="Invalid OTP")
        
        expires = datetime.fromisoformat(reset_doc["expires_at"].replace("Z", "+00:00"))
        if datetime.now(timezone.utc) > expires:
            await db.password_resets.delete_one({"email": reset_doc["email"]})
            raise HTTPException(status_code=400, detail="OTP has expired")
        
        if len(request.new_password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        
        await db.talents.update_one(
            {"email": {"$regex": f"^{request.email}$", "$options": "i"}},
            {"$set": {"password_hash": hash_password(request.new_password), "password_plain": request.new_password}}
        )
        await db.password_resets.delete_one({"email": reset_doc["email"]})
        
        logger.info(f"Password reset for {request.email}")
        return {"message": "Password reset successful"}


    @router.put("/talent/{talent_id}", response_model=TalentResponse)
    async def update_talent(talent_id: str, data: TalentUpdate):
        talent = await db.talents.find_one({"id": talent_id}, {"_id": 0})
        if not talent:
            raise HTTPException(status_code=404, detail="Talent not found")
        
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if "portfolio_images" in update_data:
            update_data["portfolio_images"] = update_data["portfolio_images"][:7]
        
        if update_data:
            await db.talents.update_one({"id": talent_id}, {"$set": update_data})
        
        updated = await db.talents.find_one({"id": talent_id}, {"_id": 0})
        return TalentResponse(
            id=updated["id"], name=updated["name"], email=updated["email"], phone=updated["phone"],
            instagram_id=updated.get("instagram_id", ""), category=updated["category"],
            bio=updated.get("bio", ""), profile_image=updated.get("profile_image", ""),
            portfolio_images=updated.get("portfolio_images", []), is_approved=updated.get("is_approved", False),
            rank=updated.get("rank", 999), votes=updated.get("votes", 0), created_at=updated.get("created_at", "")
        )


    @router.get("/talent/{talent_id}", response_model=TalentResponse)
    async def get_talent(talent_id: str):
        talent = await db.talents.find_one({"id": talent_id}, {"_id": 0})
        if not talent:
            raise HTTPException(status_code=404, detail="Talent not found")
        
        return TalentResponse(
            id=talent["id"], name=talent["name"], email=talent["email"], phone=talent["phone"],
            instagram_id=talent.get("instagram_id", ""), category=talent["category"],
            bio=talent.get("bio", ""), profile_image=talent.get("profile_image", ""),
            portfolio_images=talent.get("portfolio_images", []), is_approved=talent.get("is_approved", False),
            rank=talent.get("rank", 999), votes=talent.get("votes", 0), created_at=talent.get("created_at", "")
        )


    @router.get("/talents", response_model=List[TalentResponse])
    async def get_talents(approved_only: bool = True, category: Optional[str] = None):
        query = {}
        if approved_only:
            query["is_approved"] = True
        if category:
            query["category"] = category
        
        talents = await db.talents.find(query, {"_id": 0}).sort([("rank", 1), ("votes", -1)]).to_list(1000)
        
        return [
            TalentResponse(
                id=t["id"], name=t["name"], email=t["email"], phone=t["phone"],
                instagram_id=t.get("instagram_id", ""), category=t["category"],
                bio=t.get("bio", ""), profile_image=t.get("profile_image", ""),
                portfolio_images=t.get("portfolio_images", []), is_approved=t.get("is_approved", False),
                rank=t.get("rank", 999), votes=t.get("votes", 0), created_at=t.get("created_at", "")
            ) for t in talents
        ]
    
    return router
