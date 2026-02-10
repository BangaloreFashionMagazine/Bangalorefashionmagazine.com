from pydantic import BaseModel, EmailStr
from typing import List, Optional


# ============== User Models ==============
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


# ============== Talent Models ==============
class TalentCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str
    instagram_id: Optional[str] = ""
    category: str
    bio: Optional[str] = ""
    profile_image: str
    portfolio_images: Optional[List[str]] = []
    agreed_to_terms: Optional[bool] = False
    agreed_at: Optional[str] = ""

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
    instagram_id: str = ""
    category: str = ""
    bio: str = ""
    profile_image: str = ""
    portfolio_images: List[str] = []
    is_approved: bool = False
    rank: int = 999
    votes: int = 0
    created_at: str = ""

class TalentLoginResponse(BaseModel):
    token: str
    talent: TalentResponse
    message: str


# ============== Hero Image Models ==============
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
class AwardCreate(BaseModel):
    title: str
    winner_name: str
    winner_image: str = ""
    winner_images: List[str] = []
    description: str = ""
    category: str = ""

class AwardUpdate(BaseModel):
    title: Optional[str] = None
    winner_name: Optional[str] = None
    winner_image: Optional[str] = None
    winner_images: Optional[List[str]] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


# ============== Advertisement Models ==============
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


# ============== Voting Models ==============
class VoteCreate(BaseModel):
    talent_id: str
    voter_email: Optional[str] = ""


# ============== Password Reset Models ==============
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    reset_code: str
    new_password: str


# ============== Magazine Models ==============
class MagazineCreate(BaseModel):
    title: str
    file_data: str
    file_name: str = ""


# ============== Music Models ==============
class MusicCreate(BaseModel):
    title: str
    file_data: str
    file_name: str = ""


# ============== Video Models ==============
class VideoCreate(BaseModel):
    title: str
    video_url: str
    video_type: str = "youtube"


# ============== Admin Password Reset ==============
class AdminPasswordReset(BaseModel):
    password: str
