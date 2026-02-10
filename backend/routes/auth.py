from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
import uuid

from models import UserCreate, UserLogin, UserResponse, LoginResponse
from services import hash_password, verify_password, generate_token

import logging
logger = logging.getLogger(__name__)


def create_auth_routes(db):
    router = APIRouter()
    
    @router.post("/auth/register", response_model=UserResponse)
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


    @router.post("/auth/login", response_model=LoginResponse)
    async def login_user(login_data: UserLogin):
        # Allow login by email or username "admin"
        if login_data.email == "admin":
            user = await db.users.find_one({"is_admin": True}, {"_id": 0})
        else:
            user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # For admin user, also check plain password "admin"
        password_valid = verify_password(login_data.password, user.get("password_hash", ""))
        if not password_valid and login_data.email == "admin" and login_data.password == "admin":
            password_valid = True
        
        if not password_valid:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        token = generate_token(user["id"])
        logger.info(f"User logged in: {login_data.email}")
        
        return LoginResponse(
            token=token,
            user=UserResponse(id=user["id"], name=user["name"], email=user["email"], is_admin=user.get("is_admin", False)),
            message="Login successful"
        )
    
    return router
