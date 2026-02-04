from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import hashlib
import secrets
import io
import csv


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ============== Health Check Endpoint ==============
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Service is running"}


# ============== Constants ==============
TALENT_CATEGORIES = [
    "Model - Female",
    "Model - Male", 
    "Designers",
    "Makeup & Hair",
    "Photography",
    "Event Management",
    "Other"
]


# ============== Models ==============
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirmPassword: Optional[str] = None
    is_admin: Optional[bool] = False

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    rememberMe: Optional[bool] = False

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    is_admin: bool = False

class LoginResponse(BaseModel):
    token: str
    user: UserResponse
    message: str


# Talent Models
class TalentCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str
    instagram_id: Optional[str] = ""
    category: str
    bio: Optional[str] = ""
    profile_image: str  # Required
    portfolio_images: Optional[List[str]] = []

class TalentUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    instagram_id: Optional[str] = None
    category: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    portfolio_images: Optional[List[str]] = None

class TalentResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    instagram_id: str
    category: str
    bio: str
    profile_image: str
    portfolio_images: List[str]
    is_approved: bool
    rank: int
    votes: int
    created_at: str

class TalentLoginResponse(BaseModel):
    token: str
    talent: TalentResponse
    message: str


# Hero Image Models
class HeroImageCreate(BaseModel):
    image_data: str
    title: str
    subtitle: str
    category: str
    order: int

class HeroImageUpdate(BaseModel):
    image_data: Optional[str] = None
    title: Optional[str] = None
    subtitle: Optional[str] = None
    category: Optional[str] = None
    order: Optional[int] = None


# Award Models
class AwardCreate(BaseModel):
    title: str
    winner_name: str
    winner_image: str
    description: str = ""
    category: str = ""

class AwardUpdate(BaseModel):
    title: Optional[str] = None
    winner_name: Optional[str] = None
    winner_image: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


# Advertisement Models
class AdvertisementCreate(BaseModel):
    image_data: str
    title: str
    link: Optional[str] = ""
    order: int = 1
    is_active: bool = True

class AdvertisementUpdate(BaseModel):
    image_data: Optional[str] = None
    title: Optional[str] = None
    link: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None


# Voting Models
class VoteCreate(BaseModel):
    talent_id: str
    voter_email: Optional[str] = ""


# Password Reset Models
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    reset_code: str
    new_password: str


# ============== Helper Functions ==============
def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}:{password_hash}"

def verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt, password_hash = stored_hash.split(":")
        return hashlib.sha256((password + salt).encode()).hexdigest() == password_hash
    except ValueError:
        return False

def generate_token(user_id: str) -> str:
    token_data = f"{user_id}:{secrets.token_hex(32)}:{datetime.now(timezone.utc).isoformat()}"
    return hashlib.sha256(token_data.encode()).hexdigest()


# ============== Routes ==============
@api_router.get("/")
async def root():
    return {"message": "Bangalore Fashion Magazine API"}

@api_router.get("/categories")
async def get_categories():
    return {"categories": TALENT_CATEGORIES}


# ============== User Auth ==============
@api_router.post("/auth/register", response_model=UserResponse)
async def register_user(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if len(user_data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "is_admin": user_data.is_admin or False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_active": True
    }
    await db.users.insert_one(user_doc)
    logger.info(f"New user registered: {user_data.email}")
    
    return UserResponse(id=user_id, name=user_data.name, email=user_data.email, is_admin=user_doc["is_admin"])


@api_router.post("/auth/login", response_model=LoginResponse)
async def login_user(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(login_data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = generate_token(user["id"])
    logger.info(f"User logged in: {login_data.email}")
    
    return LoginResponse(
        token=token,
        user=UserResponse(id=user["id"], name=user["name"], email=user["email"], is_admin=user.get("is_admin", False)),
        message="Login successful"
    )


# ============== Talent Registration & Auth ==============
@api_router.post("/talent/register", response_model=TalentResponse)
async def register_talent(talent_data: TalentCreate):
    # Case-insensitive email check
    existing = await db.talents.find_one({"email": {"$regex": f"^{talent_data.email}$", "$options": "i"}})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Allow empty category or valid category
    if talent_data.category and talent_data.category not in TALENT_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of: {TALENT_CATEGORIES}")
    
    if len(talent_data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    if not talent_data.profile_image:
        raise HTTPException(status_code=400, detail="Profile image is required")
    
    # Limit portfolio to 7 images
    portfolio = (talent_data.portfolio_images or [])[:7]
    
    # Store email in lowercase for consistency
    talent_id = str(uuid.uuid4())
    talent_doc = {
        "id": talent_id,
        "name": talent_data.name,
        "email": talent_data.email.lower(),
        "password_hash": hash_password(talent_data.password),
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
        "is_active": True
    }
    await db.talents.insert_one(talent_doc)
    logger.info(f"New talent registered: {talent_data.email}")
    
    return TalentResponse(
        id=talent_id, name=talent_data.name, email=talent_data.email, phone=talent_data.phone,
        instagram_id=talent_doc["instagram_id"], category=talent_data.category, bio=talent_doc["bio"],
        profile_image=talent_data.profile_image, portfolio_images=portfolio,
        is_approved=False, rank=999, votes=0, created_at=talent_doc["created_at"]
    )


@api_router.post("/talent/login", response_model=TalentLoginResponse)
async def login_talent(login_data: UserLogin):
    # Case-insensitive email search
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


# ============== Talent Password Reset ==============
@api_router.post("/talent/forgot-password")
async def talent_forgot_password(request: ForgotPasswordRequest):
    # Case-insensitive email search
    talent = await db.talents.find_one({"email": {"$regex": f"^{request.email}$", "$options": "i"}})
    if not talent:
        raise HTTPException(status_code=404, detail="Email not found. Please register first.")
    
    # Generate 6-digit OTP
    otp = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
    
    # Store OTP (expires in 15 minutes)
    await db.password_resets.delete_many({"email": request.email})
    await db.password_resets.insert_one({
        "email": request.email,
        "otp": otp,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()
    })
    
    logger.info(f"OTP generated for {request.email}: {otp}")
    
    return {"message": "OTP generated successfully", "otp": otp}


@api_router.post("/talent/reset-password")
async def talent_reset_password(request: ResetPasswordRequest):
    # Case-insensitive email lookup
    reset_doc = await db.password_resets.find_one({
        "email": {"$regex": f"^{request.email}$", "$options": "i"}, 
        "otp": request.reset_code
    })
    if not reset_doc:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Check expiry
    expires = datetime.fromisoformat(reset_doc["expires_at"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > expires:
        await db.password_resets.delete_one({"email": reset_doc["email"]})
        raise HTTPException(status_code=400, detail="OTP has expired")
    
    if len(request.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    # Update password - case-insensitive
    await db.talents.update_one(
        {"email": {"$regex": f"^{request.email}$", "$options": "i"}},
        {"$set": {"password_hash": hash_password(request.new_password)}}
    )
    await db.password_resets.delete_one({"email": reset_doc["email"]})
    
    logger.info(f"Password reset for {request.email}")
    return {"message": "Password reset successful"}


# ============== Talent Management ==============
@api_router.put("/talent/{talent_id}", response_model=TalentResponse)
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


@api_router.get("/talent/{talent_id}", response_model=TalentResponse)
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


@api_router.get("/talents", response_model=List[TalentResponse])
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


# ============== Voting System ==============
@api_router.post("/vote")
async def vote_for_talent(vote: VoteCreate):
    talent = await db.talents.find_one({"id": vote.talent_id})
    if not talent:
        raise HTTPException(status_code=404, detail="Talent not found")
    
    if not talent.get("is_approved"):
        raise HTTPException(status_code=400, detail="Cannot vote for unapproved talent")
    
    # Record vote
    await db.votes.insert_one({
        "id": str(uuid.uuid4()),
        "talent_id": vote.talent_id,
        "voter_email": vote.voter_email,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Increment vote count
    await db.talents.update_one({"id": vote.talent_id}, {"$inc": {"votes": 1}})
    
    updated = await db.talents.find_one({"id": vote.talent_id}, {"_id": 0})
    return {"message": "Vote recorded", "votes": updated.get("votes", 0)}


@api_router.get("/votes/{talent_id}")
async def get_talent_votes(talent_id: str):
    talent = await db.talents.find_one({"id": talent_id}, {"_id": 0})
    if not talent:
        raise HTTPException(status_code=404, detail="Talent not found")
    return {"talent_id": talent_id, "votes": talent.get("votes", 0)}


# ============== Admin Endpoints ==============
@api_router.get("/admin/talents/pending", response_model=List[TalentResponse])
async def get_pending_talents():
    talents = await db.talents.find({"is_approved": False}, {"_id": 0}).to_list(1000)
    return [
        TalentResponse(
            id=t["id"], name=t["name"], email=t["email"], phone=t["phone"],
            instagram_id=t.get("instagram_id", ""), category=t["category"],
            bio=t.get("bio", ""), profile_image=t.get("profile_image", ""),
            portfolio_images=t.get("portfolio_images", []), is_approved=False,
            rank=t.get("rank", 999), votes=t.get("votes", 0), created_at=t.get("created_at", "")
        ) for t in talents
    ]


@api_router.put("/admin/talent/{talent_id}/approve")
async def approve_talent(talent_id: str):
    result = await db.talents.update_one({"id": talent_id}, {"$set": {"is_approved": True}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Talent not found")
    return {"message": "Talent approved"}


@api_router.put("/admin/talent/{talent_id}/reject")
async def reject_talent(talent_id: str):
    result = await db.talents.update_one({"id": talent_id}, {"$set": {"is_approved": False}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Talent not found")
    return {"message": "Talent rejected"}


@api_router.put("/admin/talent/{talent_id}/rank")
async def update_talent_rank(talent_id: str, rank: int):
    result = await db.talents.update_one({"id": talent_id}, {"$set": {"rank": rank}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Talent not found")
    return {"message": f"Rank updated to {rank}"}


@api_router.delete("/admin/talent/{talent_id}")
async def delete_talent(talent_id: str):
    result = await db.talents.delete_one({"id": talent_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Talent not found")
    return {"message": "Talent deleted"}


@api_router.get("/admin/talents/export")
async def export_talents():
    talents = await db.talents.find({}, {"_id": 0}).to_list(1000)
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Name", "Email", "Phone", "Instagram", "Category", "Status", "Rank", "Votes"])
    
    for t in talents:
        writer.writerow([
            t.get("name", ""), t.get("email", ""), t.get("phone", ""),
            t.get("instagram_id", ""), t.get("category", ""),
            "Approved" if t.get("is_approved") else "Pending",
            t.get("rank", 999), t.get("votes", 0)
        ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=talents_export.csv"}
    )


# ============== Hero Images ==============
@api_router.get("/hero-images")
async def get_hero_images():
    images = await db.hero_images.find({}, {"_id": 0}).sort("order", 1).to_list(10)
    return images


@api_router.post("/admin/hero-images")
async def create_hero_image(data: HeroImageCreate):
    image_id = str(uuid.uuid4())
    doc = {
        "id": image_id,
        "image_data": data.image_data,
        "title": data.title,
        "subtitle": data.subtitle,
        "category": data.category,
        "order": data.order,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.hero_images.insert_one(doc)
    return {"message": "Hero image created", "id": image_id}


@api_router.put("/admin/hero-images/{image_id}")
async def update_hero_image(image_id: str, data: HeroImageUpdate):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if update_data:
        await db.hero_images.update_one({"id": image_id}, {"$set": update_data})
    return {"message": "Hero image updated"}


@api_router.delete("/admin/hero-images/{image_id}")
async def delete_hero_image(image_id: str):
    result = await db.hero_images.delete_one({"id": image_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Image not found")
    return {"message": "Hero image deleted"}


# ============== Awards ==============
@api_router.get("/awards")
async def get_awards(active_only: bool = True):
    query = {"is_active": True} if active_only else {}
    awards = await db.awards.find(query, {"_id": 0}).to_list(100)
    return awards


@api_router.post("/admin/awards")
async def create_award(data: AwardCreate):
    award_id = str(uuid.uuid4())
    doc = {
        "id": award_id,
        "title": data.title,
        "winner_name": data.winner_name,
        "winner_image": data.winner_image,
        "description": data.description,
        "category": data.category,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.awards.insert_one(doc)
    return {"message": "Award created", "id": award_id}


@api_router.put("/admin/awards/{award_id}")
async def update_award(award_id: str, data: AwardUpdate):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if update_data:
        await db.awards.update_one({"id": award_id}, {"$set": update_data})
    return {"message": "Award updated"}


@api_router.delete("/admin/awards/{award_id}")
async def delete_award(award_id: str):
    result = await db.awards.delete_one({"id": award_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Award not found")
    return {"message": "Award deleted"}


# ============== Advertisements ==============
@api_router.get("/advertisements")
async def get_advertisements():
    ads = await db.advertisements.find({"is_active": True}, {"_id": 0}).sort("order", 1).to_list(20)
    return ads


@api_router.post("/admin/advertisements")
async def create_advertisement(data: AdvertisementCreate):
    ad_id = str(uuid.uuid4())
    doc = {
        "id": ad_id,
        "image_data": data.image_data,
        "title": data.title,
        "link": data.link,
        "order": data.order,
        "is_active": data.is_active,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.advertisements.insert_one(doc)
    return {"message": "Advertisement created", "id": ad_id}


@api_router.put("/admin/advertisements/{ad_id}")
async def update_advertisement(ad_id: str, data: AdvertisementUpdate):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if update_data:
        await db.advertisements.update_one({"id": ad_id}, {"$set": update_data})
    return {"message": "Advertisement updated"}


@api_router.delete("/admin/advertisements/{ad_id}")
async def delete_advertisement(ad_id: str):
    result = await db.advertisements.delete_one({"id": ad_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Advertisement not found")
    return {"message": "Advertisement deleted"}


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
