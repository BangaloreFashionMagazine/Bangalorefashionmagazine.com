from fastapi import FastAPI, APIRouter, HTTPException
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


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
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
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class UserResponse(BaseModel):
    id: str
    name: str
    email: str

class LoginResponse(BaseModel):
    token: str
    user: UserResponse
    message: str


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
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


# ============== Authentication Endpoints ==============
@api_router.post("/auth/register", response_model=UserResponse)
async def register_user(user_data: UserCreate):
    """Register a new user"""
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate passwords match if confirmPassword is provided
    if user_data.confirmPassword and user_data.password != user_data.confirmPassword:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    # Validate password strength
    if len(user_data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    # Create user
    user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password)
    )
    
    # Store in database
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    await db.users.insert_one(user_dict)
    
    logger.info(f"New user registered: {user_data.email}")
    
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email
    )


@api_router.post("/auth/login", response_model=LoginResponse)
async def login_user(login_data: UserLogin):
    """Authenticate user and return token"""
    # Find user by email
    user_doc = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(login_data.password, user_doc.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check if user is active
    if not user_doc.get("is_active", True):
        raise HTTPException(status_code=401, detail="Account is deactivated")
    
    # Generate token
    token = generate_token(user_doc["id"])
    
    # Store token in database (optional: for session management)
    await db.sessions.insert_one({
        "token": token,
        "user_id": user_doc["id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "remember_me": login_data.rememberMe
    })
    
    logger.info(f"User logged in: {login_data.email}")
    
    return LoginResponse(
        token=token,
        user=UserResponse(
            id=user_doc["id"],
            name=user_doc["name"],
            email=user_doc["email"]
        ),
        message="Login successful"
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()