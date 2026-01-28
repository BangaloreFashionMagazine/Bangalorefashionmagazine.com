from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
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
import base64
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


# ============== Health Check Endpoint (Required for Kubernetes) ==============
@app.get("/health")
async def health_check():
    """Health check endpoint for Kubernetes liveness/readiness probes"""
    return {"status": "healthy", "message": "Service is running"}


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str


# ============== Authentication Models ==============
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

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    password_hash: str
    is_admin: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    is_admin: bool = False

class LoginResponse(BaseModel):
    token: str
    user: UserResponse
    message: str


# ============== Talent Models ==============
TALENT_CATEGORIES = ["Model", "Photographer", "Designer", "Makeup Artist", "Stylist", "Other"]

class TalentCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str
    instagram_id: str
    category: str
    bio: Optional[str] = ""
    profile_image: Optional[str] = ""  # Base64 encoded image
    portfolio_images: Optional[List[str]] = []  # List of base64 encoded images

class TalentUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    instagram_id: Optional[str] = None
    category: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    portfolio_images: Optional[List[str]] = None

class Talent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    password_hash: str
    phone: str
    instagram_id: str
    category: str
    bio: str = ""
    profile_image: str = ""
    portfolio_images: List[str] = []
    is_approved: bool = False
    rank: int = 999  # Default rank (lower = higher priority)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

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
    created_at: str

class TalentLoginResponse(BaseModel):
    token: str
    talent: TalentResponse
    message: str


# ============== Hero Image Models ==============
class HeroImage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    image_data: str  # Base64 encoded image
    title: str
    subtitle: str
    category: str
    order: int
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

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


# ============== Award Models ==============
class Award(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str  # e.g., "Model of the Week"
    winner_name: str
    winner_image: str  # Base64 encoded image
    description: str = ""
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AwardCreate(BaseModel):
    title: str
    winner_name: str
    winner_image: str
    description: str = ""

class AwardUpdate(BaseModel):
    title: Optional[str] = None
    winner_name: Optional[str] = None
    winner_image: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


# ============== Password Reset Models ==============
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    reset_code: str
    new_password: str


# ============== Helper Functions ==============
def hash_password(password: str) -> str:
    """Hash password using SHA-256 with salt"""
    salt = secrets.token_hex(16)
    password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}:{password_hash}"

def verify_password(password: str, stored_hash: str) -> bool:
    """Verify password against stored hash"""
    try:
        salt, password_hash = stored_hash.split(":")
        return hashlib.sha256((password + salt).encode()).hexdigest() == password_hash
    except ValueError:
        return False

def generate_token(user_id: str) -> str:
    """Generate a simple token for authentication"""
    token_data = f"{user_id}:{secrets.token_hex(32)}:{datetime.now(timezone.utc).isoformat()}"
    return hashlib.sha256(token_data.encode()).hexdigest()


# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


# ============== User Authentication Endpoints ==============
@api_router.post("/auth/register", response_model=UserResponse)
async def register_user(user_data: UserCreate):
    """Register a new user (admin or regular)"""
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if user_data.confirmPassword and user_data.password != user_data.confirmPassword:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    if len(user_data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        is_admin=user_data.is_admin or False
    )
    
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    await db.users.insert_one(user_dict)
    
    logger.info(f"New user registered: {user_data.email}")
    
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        is_admin=user.is_admin
    )


@api_router.post("/auth/login", response_model=LoginResponse)
async def login_user(login_data: UserLogin):
    """Authenticate user and return token"""
    user_doc = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(login_data.password, user_doc.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user_doc.get("is_active", True):
        raise HTTPException(status_code=401, detail="Account is deactivated")
    
    token = generate_token(user_doc["id"])
    
    await db.sessions.insert_one({
        "token": token,
        "user_id": user_doc["id"],
        "user_type": "user",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "remember_me": login_data.rememberMe
    })
    
    logger.info(f"User logged in: {login_data.email}")
    
    return LoginResponse(
        token=token,
        user=UserResponse(
            id=user_doc["id"],
            name=user_doc["name"],
            email=user_doc["email"],
            is_admin=user_doc.get("is_admin", False)
        ),
        message="Login successful"
    )


# ============== Talent Endpoints ==============
@api_router.post("/talent/register", response_model=TalentResponse)
async def register_talent(talent_data: TalentCreate):
    """Register a new talent"""
    # Check if talent already exists
    existing_talent = await db.talents.find_one({"email": talent_data.email})
    if existing_talent:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate category
    if talent_data.category not in TALENT_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of: {TALENT_CATEGORIES}")
    
    if len(talent_data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    # Limit portfolio images to 7
    portfolio_images = talent_data.portfolio_images or []
    if len(portfolio_images) > 7:
        portfolio_images = portfolio_images[:7]
    
    talent = Talent(
        name=talent_data.name,
        email=talent_data.email,
        password_hash=hash_password(talent_data.password),
        phone=talent_data.phone,
        instagram_id=talent_data.instagram_id,
        category=talent_data.category,
        bio=talent_data.bio or "",
        profile_image=talent_data.profile_image or "",
        portfolio_images=portfolio_images,
        is_approved=False,
        rank=999
    )
    
    talent_dict = talent.model_dump()
    talent_dict['created_at'] = talent_dict['created_at'].isoformat()
    await db.talents.insert_one(talent_dict)
    
    logger.info(f"New talent registered: {talent_data.email}")
    
    return TalentResponse(
        id=talent.id,
        name=talent.name,
        email=talent.email,
        phone=talent.phone,
        instagram_id=talent.instagram_id,
        category=talent.category,
        bio=talent.bio,
        profile_image=talent.profile_image,
        portfolio_images=talent.portfolio_images,
        is_approved=talent.is_approved,
        rank=talent.rank,
        created_at=talent_dict['created_at']
    )


@api_router.post("/talent/login", response_model=TalentLoginResponse)
async def login_talent(login_data: UserLogin):
    """Authenticate talent and return token"""
    talent_doc = await db.talents.find_one({"email": login_data.email}, {"_id": 0})
    
    if not talent_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(login_data.password, talent_doc.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not talent_doc.get("is_active", True):
        raise HTTPException(status_code=401, detail="Account is deactivated")
    
    token = generate_token(talent_doc["id"])
    
    await db.sessions.insert_one({
        "token": token,
        "user_id": talent_doc["id"],
        "user_type": "talent",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "remember_me": login_data.rememberMe
    })
    
    logger.info(f"Talent logged in: {login_data.email}")
    
    return TalentLoginResponse(
        token=token,
        talent=TalentResponse(
            id=talent_doc["id"],
            name=talent_doc["name"],
            email=talent_doc["email"],
            phone=talent_doc["phone"],
            instagram_id=talent_doc["instagram_id"],
            category=talent_doc["category"],
            bio=talent_doc.get("bio", ""),
            profile_image=talent_doc.get("profile_image", ""),
            portfolio_images=talent_doc.get("portfolio_images", []),
            is_approved=talent_doc.get("is_approved", False),
            rank=talent_doc.get("rank", 999),
            created_at=talent_doc.get("created_at", "")
        ),
        message="Login successful"
    )


@api_router.put("/talent/{talent_id}", response_model=TalentResponse)
async def update_talent(talent_id: str, talent_data: TalentUpdate):
    """Update talent profile"""
    talent_doc = await db.talents.find_one({"id": talent_id}, {"_id": 0})
    
    if not talent_doc:
        raise HTTPException(status_code=404, detail="Talent not found")
    
    update_data = {k: v for k, v in talent_data.model_dump().items() if v is not None}
    
    if update_data:
        await db.talents.update_one({"id": talent_id}, {"$set": update_data})
    
    updated_talent = await db.talents.find_one({"id": talent_id}, {"_id": 0})
    
    return TalentResponse(
        id=updated_talent["id"],
        name=updated_talent["name"],
        email=updated_talent["email"],
        phone=updated_talent["phone"],
        instagram_id=updated_talent["instagram_id"],
        category=updated_talent["category"],
        bio=updated_talent.get("bio", ""),
        profile_image=updated_talent.get("profile_image", ""),
        portfolio_images=updated_talent.get("portfolio_images", []),
        is_approved=updated_talent.get("is_approved", False),
        rank=updated_talent.get("rank", 999),
        created_at=updated_talent.get("created_at", "")
    )


@api_router.get("/talent/{talent_id}", response_model=TalentResponse)
async def get_talent(talent_id: str):
    """Get talent by ID"""
    talent_doc = await db.talents.find_one({"id": talent_id}, {"_id": 0})
    
    if not talent_doc:
        raise HTTPException(status_code=404, detail="Talent not found")
    
    return TalentResponse(
        id=talent_doc["id"],
        name=talent_doc["name"],
        email=talent_doc["email"],
        phone=talent_doc["phone"],
        instagram_id=talent_doc["instagram_id"],
        category=talent_doc["category"],
        bio=talent_doc.get("bio", ""),
        profile_image=talent_doc.get("profile_image", ""),
        portfolio_images=talent_doc.get("portfolio_images", []),
        is_approved=talent_doc.get("is_approved", False),
        rank=talent_doc.get("rank", 999),
        created_at=talent_doc.get("created_at", "")
    )


@api_router.get("/talents", response_model=List[TalentResponse])
async def get_all_talents(approved_only: bool = True, category: Optional[str] = None):
    """Get all talents, optionally filtered by approval status and category"""
    query = {}
    if approved_only:
        query["is_approved"] = True
    if category:
        query["category"] = category
    
    talents = await db.talents.find(query, {"_id": 0}).sort("rank", 1).to_list(1000)
    
    return [
        TalentResponse(
            id=t["id"],
            name=t["name"],
            email=t["email"],
            phone=t["phone"],
            instagram_id=t["instagram_id"],
            category=t["category"],
            bio=t.get("bio", ""),
            profile_image=t.get("profile_image", ""),
            portfolio_images=t.get("portfolio_images", []),
            is_approved=t.get("is_approved", False),
            rank=t.get("rank", 999),
            created_at=t.get("created_at", "")
        )
        for t in talents
    ]


# ============== Admin Endpoints ==============
@api_router.get("/admin/talents/pending", response_model=List[TalentResponse])
async def get_pending_talents():
    """Get all pending (unapproved) talents"""
    talents = await db.talents.find({"is_approved": False}, {"_id": 0}).to_list(1000)
    
    return [
        TalentResponse(
            id=t["id"],
            name=t["name"],
            email=t["email"],
            phone=t["phone"],
            instagram_id=t["instagram_id"],
            category=t["category"],
            bio=t.get("bio", ""),
            profile_image=t.get("profile_image", ""),
            portfolio_images=t.get("portfolio_images", []),
            is_approved=t.get("is_approved", False),
            rank=t.get("rank", 999),
            created_at=t.get("created_at", "")
        )
        for t in talents
    ]


@api_router.put("/admin/talent/{talent_id}/approve")
async def approve_talent(talent_id: str):
    """Approve a talent"""
    result = await db.talents.update_one({"id": talent_id}, {"$set": {"is_approved": True}})
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Talent not found")
    
    return {"message": "Talent approved successfully"}


@api_router.put("/admin/talent/{talent_id}/reject")
async def reject_talent(talent_id: str):
    """Reject/disapprove a talent"""
    result = await db.talents.update_one({"id": talent_id}, {"$set": {"is_approved": False}})
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Talent not found")
    
    return {"message": "Talent rejected successfully"}


@api_router.put("/admin/talent/{talent_id}/rank")
async def update_talent_rank(talent_id: str, rank: int):
    """Update talent rank (lower = higher priority)"""
    result = await db.talents.update_one({"id": talent_id}, {"$set": {"rank": rank}})
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Talent not found")
    
    return {"message": f"Talent rank updated to {rank}"}


@api_router.delete("/admin/talent/{talent_id}")
async def delete_talent(talent_id: str):
    """Delete a talent"""
    result = await db.talents.delete_one({"id": talent_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Talent not found")
    
    return {"message": "Talent deleted successfully"}


@api_router.get("/admin/talents/export")
async def export_talents():
    """Export all talents as CSV"""
    talents = await db.talents.find({}, {"_id": 0}).to_list(1000)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(["Name", "Email", "Phone", "Instagram ID", "Category", "Status", "Rank"])
    
    # Write data
    for t in talents:
        writer.writerow([
            t.get("name", ""),
            t.get("email", ""),
            t.get("phone", ""),
            t.get("instagram_id", ""),
            t.get("category", ""),
            "Approved" if t.get("is_approved", False) else "Pending",
            t.get("rank", 999)
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=talents_export.csv"}
    )


# ============== Hero Images Endpoints ==============
@api_router.get("/hero-images")
async def get_hero_images():
    """Get all hero images ordered by order field"""
    images = await db.hero_images.find({}, {"_id": 0}).sort("order", 1).to_list(10)
    return images


@api_router.post("/admin/hero-images")
async def create_hero_image(image_data: HeroImageCreate):
    """Create a new hero image"""
    hero_image = HeroImage(
        image_data=image_data.image_data,
        title=image_data.title,
        subtitle=image_data.subtitle,
        category=image_data.category,
        order=image_data.order
    )
    
    hero_dict = hero_image.model_dump()
    hero_dict['created_at'] = hero_dict['created_at'].isoformat()
    await db.hero_images.insert_one(hero_dict)
    
    return {"message": "Hero image created", "id": hero_image.id}


@api_router.put("/admin/hero-images/{image_id}")
async def update_hero_image(image_id: str, image_data: HeroImageUpdate):
    """Update a hero image"""
    update_data = {k: v for k, v in image_data.model_dump().items() if v is not None}
    
    if update_data:
        result = await db.hero_images.update_one({"id": image_id}, {"$set": update_data})
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Hero image not found")
    
    return {"message": "Hero image updated"}


@api_router.delete("/admin/hero-images/{image_id}")
async def delete_hero_image(image_id: str):
    """Delete a hero image"""
    result = await db.hero_images.delete_one({"id": image_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Hero image not found")
    
    return {"message": "Hero image deleted"}


# ============== Awards Endpoints ==============
@api_router.get("/awards")
async def get_awards(active_only: bool = True):
    """Get all awards"""
    query = {"is_active": True} if active_only else {}
    awards = await db.awards.find(query, {"_id": 0}).to_list(100)
    return awards


@api_router.post("/admin/awards")
async def create_award(award_data: AwardCreate):
    """Create a new award"""
    award = Award(
        title=award_data.title,
        winner_name=award_data.winner_name,
        winner_image=award_data.winner_image,
        description=award_data.description,
        is_active=True
    )
    
    award_dict = award.model_dump()
    award_dict['created_at'] = award_dict['created_at'].isoformat()
    await db.awards.insert_one(award_dict)
    
    return {"message": "Award created", "id": award.id}


@api_router.put("/admin/awards/{award_id}")
async def update_award(award_id: str, award_data: AwardUpdate):
    """Update an award"""
    update_data = {k: v for k, v in award_data.model_dump().items() if v is not None}
    
    if update_data:
        result = await db.awards.update_one({"id": award_id}, {"$set": update_data})
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Award not found")
    
    return {"message": "Award updated"}


@api_router.delete("/admin/awards/{award_id}")
async def delete_award(award_id: str):
    """Delete an award"""
    result = await db.awards.delete_one({"id": award_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Award not found")
    
    return {"message": "Award deleted"}


# Include the router in the main app
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
