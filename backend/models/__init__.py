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
    store_subcategories: Optional[List[str]] = []  # For Designer Store: can select multiple categories
    bio: Optional[str] = ""
    profile_image: str
    portfolio_images: Optional[List[str]] = []
    portfolio_video: Optional[str] = ""  # Base64 video data, max 45 seconds
    agreed_to_terms: Optional[bool] = False
    agreed_at: Optional[str] = ""

class TalentUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    instagram_id: Optional[str] = None
    category: Optional[str] = None
    store_subcategories: Optional[List[str]] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    portfolio_images: Optional[List[str]] = None
    portfolio_video: Optional[str] = None  # Base64 video data, max 45 seconds

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
    portfolio_video: str = ""  # Video URL/data
    is_approved: bool = False
    rank: int = 999
    votes: int = 0
    created_at: str = ""
    agreed_to_terms: bool = False
    agreed_at: str = ""

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
    talent_id: str = ""  # Link to talent profile

class AwardUpdate(BaseModel):
    title: Optional[str] = None
    winner_name: Optional[str] = None
    winner_image: Optional[str] = None
    winner_images: Optional[List[str]] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    talent_id: Optional[str] = None


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


# ============== Party Events Models ==============
class PartyEventCreate(BaseModel):
    title: str
    venue: str
    event_date: str
    description: str = ""
    image: str = ""
    entry_code: str = ""
    booking_info: str = ""
    contact: str = ""
    is_active: bool = True

class PartyEventUpdate(BaseModel):
    title: Optional[str] = None
    venue: Optional[str] = None
    event_date: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    entry_code: Optional[str] = None
    booking_info: Optional[str] = None
    contact: Optional[str] = None
    is_active: Optional[bool] = None


# ============== Admin Password Reset ==============
class AdminPasswordReset(BaseModel):
    password: str


# ============== Designer Store Models ==============
# Designer Store Categories
STORE_CATEGORIES = [
    "Everyday Chic",    # Casuals
    "After Dark",       # Party
    "Heritage Luxe",    # Ethnic
    "Accessories Room"  # Accessories
]

class ProductCreate(BaseModel):
    name: str
    description: str = ""
    store_category: str = "Everyday Chic"  # One of STORE_CATEGORIES
    size: str = ""
    material: str = ""
    price: float
    discount_percent: Optional[int] = 0  # Discount percentage (0-100)
    shipping_info: str = ""
    images: List[str] = []  # Max 5 images
    video: str = ""  # Video URL (max 45 seconds)
    designer_id: str  # Talent ID of the designer

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    store_category: Optional[str] = None
    size: Optional[str] = None
    material: Optional[str] = None
    price: Optional[float] = None
    discount_percent: Optional[int] = None  # Discount percentage (0-100)
    shipping_info: Optional[str] = None
    images: Optional[List[str]] = None
    video: Optional[str] = None
    is_active: Optional[bool] = None

class ProductResponse(BaseModel):
    id: str
    name: str
    description: str = ""
    store_category: str = "Everyday Chic"
    size: str = ""
    material: str = ""
    price: float
    discount_percent: int = 0  # Discount percentage
    discounted_price: float = 0  # Calculated discounted price
    shipping_info: str = ""
    images: List[str] = []
    video: str = ""
    designer_id: str
    designer_name: str = ""
    is_active: bool = True
    created_at: str = ""

class OrderCreate(BaseModel):
    product_id: str
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_address: str
    notes: Optional[str] = ""

class OrderResponse(BaseModel):
    id: str
    product_id: str
    product_name: str = ""
    product_price: float = 0
    product_size: str = ""
    designer_id: str = ""
    designer_name: str = ""
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_address: str
    notes: str = ""
    status: str = "pending"  # pending, confirmed, shipped, delivered
    created_at: str = ""

class ProductReviewCreate(BaseModel):
    product_id: str
    reviewer_name: str
    rating: int  # 1-5
    comment: str = ""

class ProductReviewResponse(BaseModel):
    id: str
    product_id: str
    reviewer_name: str
    rating: int
    comment: str = ""
    created_at: str = ""

class DesignerStoreSettingsCreate(BaseModel):
    hero_images: List[str] = []  # Up to 5 hero images
    contact_email: str = ""
    contact_phone: str = ""
    contact_instagram: str = ""
