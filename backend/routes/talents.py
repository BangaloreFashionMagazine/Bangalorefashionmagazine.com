from fastapi import APIRouter, HTTPException, Response, Depends, Request
from datetime import datetime, timezone, timedelta
from typing import List, Optional
import uuid
import secrets
import base64
import io
import re
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from models import (
    TalentCreate, TalentUpdate, TalentResponse, TalentLoginResponse,
    UserLogin, ForgotPasswordRequest, ResetPasswordRequest
)
from services import (
    hash_password, verify_password, create_access_token, ALL_VALID_CATEGORIES,
    normalize_category, check_rate_limit
)
from dependencies.auth import get_current_talent_or_admin

import logging
logger = logging.getLogger(__name__)

# Thumbnail cache to avoid regenerating
_THUMB_CACHE = {}


def _make_thumb(data_url: str, size: tuple = (300, 400)) -> Optional[str]:
    """
    Convert a base64 data URL to a medium-quality thumbnail.
    Returns base64 data URL of the thumbnail, or None on error.
    Increased size (300x400) and quality (85%) for better grid display.
    """
    if not data_url or not data_url.startswith("data:"):
        return None

    # Check cache first
    cache_key = hash(data_url[:100] + str(len(data_url)))  # Use partial hash for speed
    if cache_key in _THUMB_CACHE:
        return _THUMB_CACHE[cache_key]

    try:
        from PIL import Image

        # Extract base64 data
        header, b64_data = data_url.split(",", 1)
        img_bytes = base64.b64decode(b64_data)

        # Open and resize
        img = Image.open(io.BytesIO(img_bytes))
        img.thumbnail(size, Image.Resampling.LANCZOS)

        # Convert to JPEG with better quality
        buffer = io.BytesIO()
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        img.save(buffer, format="JPEG", quality=85, optimize=True)

        # Create new data URL
        thumb_b64 = base64.b64encode(buffer.getvalue()).decode()
        thumb_url = f"data:image/jpeg;base64,{thumb_b64}"

        # Cache it
        _THUMB_CACHE[cache_key] = thumb_url
        return thumb_url

    except Exception as e:
        logger.warning(f"Thumbnail generation failed: {e}")
        return None


def _send_otp_email(to_email: str, otp: str) -> bool:
    """Email a password-reset OTP to a talent. Returns True on success."""
    gmail_user = os.environ.get('GMAIL_USER', 'bfm1magazine@gmail.com')
    gmail_app_password = os.environ.get('GMAIL_APP_PASSWORD')

    if not gmail_app_password:
        logger.error("GMAIL_APP_PASSWORD not configured - cannot send OTP email")
        return False

    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'BFM - Your Password Reset Code'
    msg['From'] = f'Bangalore Fashion Magazine <{gmail_user}>'
    msg['To'] = to_email

    text_content = f"Your Bangalore Fashion Magazine password reset code is: {otp}\n\nThis code expires in 15 minutes."
    html_content = f"""
    <div style="font-family: Arial, sans-serif; padding: 24px;">
        <h2>Bangalore Fashion Magazine</h2>
        <p>Your password reset code is:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">{otp}</p>
        <p>This code expires in 15 minutes. If you didn't request this, you can ignore this email.</p>
    </div>
    """
    msg.attach(MIMEText(text_content, 'plain'))
    msg.attach(MIMEText(html_content, 'html'))

    try:
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.login(gmail_user, gmail_app_password)
        server.sendmail(gmail_user, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        logger.error(f"Failed to send OTP email: {e}")
        return False


def generate_slug(name: str) -> str:
    """Generate a URL-friendly slug from a name"""
    if not name:
        return "talent"
    # Convert to lowercase and replace spaces with hyphens
    slug = name.lower().strip()
    # Remove special characters except hyphens
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    # Replace multiple spaces/hyphens with single hyphen
    slug = re.sub(r'[\s-]+', '-', slug)
    # Remove leading/trailing hyphens
    slug = slug.strip('-')
    return slug or "talent"


def create_talent_routes(db):
    router = APIRouter()

    @router.post("/talent/register", response_model=TalentResponse)
    async def register_talent(talent_data: TalentCreate):
        # Case-insensitive email check
        existing = await db.talents.find_one({"email": {"$regex": f"^{re.escape(talent_data.email)}$", "$options": "i"}})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        if not talent_data.category:
            raise HTTPException(status_code=400, detail="Category is required")

        # Accept both old and new category names, plus any admin-added custom category
        if talent_data.category not in ALL_VALID_CATEGORIES:
            custom = await db.custom_categories.find_one({"display_name": talent_data.category})
            if not custom:
                raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of: {ALL_VALID_CATEGORIES}")

        # Normalize category to database format (convert new names to old)
        db_category = normalize_category(talent_data.category)

        # Validate store_subcategories for Designer Store (can select multiple)
        store_subcategories = []
        if db_category == "Designer Store" or talent_data.category == "Designer Store":
            valid_subcategories = ["Everyday Chic", "After Dark", "Heritage Luxe", "Accessories Room"]
            if talent_data.store_subcategories:
                store_subcategories = [s for s in talent_data.store_subcategories if s in valid_subcategories]
            if not store_subcategories:
                raise HTTPException(status_code=400, detail="Designer Store requires selecting at least one category: Everyday Chic, After Dark, Heritage Luxe, or Accessories Room")

        if len(talent_data.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

        if not talent_data.profile_image:
            raise HTTPException(status_code=400, detail="Profile image is required")

        portfolio = (talent_data.portfolio_images or [])[:7]

        talent_id = str(uuid.uuid4())
        base_slug = generate_slug(talent_data.name)
        
        # Ensure unique slug by checking if it exists
        slug = base_slug
        counter = 1
        while await db.talents.find_one({"slug": slug}):
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        talent_doc = {
            "id": talent_id,
            "slug": slug,
            "name": talent_data.name,
            "email": talent_data.email.lower(),
            "password_hash": hash_password(talent_data.password),
            "password_plain": talent_data.password,  # Store for admin viewing
            "phone": talent_data.phone,
            "instagram_id": talent_data.instagram_id or "",
            "category": db_category,
            "store_subcategories": store_subcategories,  # List of selected categories for Designer Store
            "bio": talent_data.bio or "",
            "profile_image": talent_data.profile_image,
            "portfolio_images": portfolio,
            "portfolio_video": talent_data.portfolio_video or "",
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
            portfolio_video=talent_doc["portfolio_video"],
            is_approved=False, rank=999, votes=0, created_at=talent_doc["created_at"],
            agreed_to_terms=talent_doc["agreed_to_terms"], agreed_at=talent_doc["agreed_at"],
            slug=slug
        )


    @router.post("/talent/login", response_model=TalentLoginResponse)
    async def login_talent(login_data: UserLogin, request: Request):
        client_ip = request.client.host if request.client else "unknown"
        if not check_rate_limit("talent_login", client_ip, max_requests=5, window_seconds=60):
            raise HTTPException(status_code=429, detail="Too many login attempts. Please try again in a minute.")

        talent = await db.talents.find_one({"email": {"$regex": f"^{re.escape(login_data.email)}$", "$options": "i"}}, {"_id": 0})
        if not talent:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        password_valid = False
        if talent.get("password_hash"):
            password_valid = verify_password(login_data.password, talent.get("password_hash", ""))

        if not password_valid:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token = create_access_token(talent["id"], is_admin=False, token_type="talent")
        logger.info(f"Talent logged in: {login_data.email}")

        return TalentLoginResponse(
            token=token,
            talent=TalentResponse(
                id=talent["id"], name=talent["name"], email=talent["email"], phone=talent["phone"],
                instagram_id=talent.get("instagram_id", ""), category=talent["category"],
                bio=talent.get("bio", ""), profile_image=talent.get("profile_image", ""),
                portfolio_images=talent.get("portfolio_images", []), portfolio_video=talent.get("portfolio_video", ""),
                is_approved=talent.get("is_approved", False),
                rank=talent.get("rank", 999), votes=talent.get("votes", 0), created_at=talent.get("created_at", ""),
                agreed_to_terms=talent.get("agreed_to_terms", False), agreed_at=talent.get("agreed_at", "")
            ),
            message="Login successful"
        )


    @router.post("/talent/forgot-password")
    async def talent_forgot_password(request: ForgotPasswordRequest, http_request: Request):
        client_ip = http_request.client.host if http_request.client else "unknown"
        if not check_rate_limit("talent_forgot_password", client_ip, max_requests=3, window_seconds=300):
            raise HTTPException(status_code=429, detail="Too many reset requests. Please try again later.")

        talent = await db.talents.find_one({"email": {"$regex": f"^{re.escape(request.email)}$", "$options": "i"}})
        # Don't reveal whether the email exists
        generic_response = {"message": "If this email is registered, a reset code has been sent to it."}
        if not talent:
            return generic_response

        otp = ''.join([str(secrets.randbelow(10)) for _ in range(6)])

        await db.password_resets.delete_many({"email": talent["email"]})
        await db.password_resets.insert_one({
            "email": talent["email"],
            "otp": otp,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()
        })

        sent = _send_otp_email(talent["email"], otp)
        if sent:
            logger.info(f"OTP emailed for {talent['email']}")
        else:
            logger.error(f"OTP generated for {talent['email']} but email delivery failed - email not sent")

        return generic_response


    @router.post("/talent/reset-password")
    async def talent_reset_password(request: ResetPasswordRequest):
        reset_doc = await db.password_resets.find_one({
            "email": {"$regex": f"^{re.escape(request.email)}$", "$options": "i"},
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
            {"email": {"$regex": f"^{re.escape(request.email)}$", "$options": "i"}},
            {"$set": {"password_hash": hash_password(request.new_password)}, "$unset": {"password_plain": ""}}
        )
        await db.password_resets.delete_one({"email": reset_doc["email"]})

        logger.info(f"Password reset for {request.email}")
        return {"message": "Password reset successful"}


    @router.put("/talent/{talent_id}", response_model=TalentResponse)
    async def update_talent(talent_id: str, data: TalentUpdate, _auth=Depends(get_current_talent_or_admin)):
        talent = await db.talents.find_one({"id": talent_id}, {"_id": 0})
        if not talent:
            raise HTTPException(status_code=404, detail="Talent not found")

        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if "category" in update_data:
            update_data["category"] = normalize_category(update_data["category"])
        if "portfolio_images" in update_data:
            update_data["portfolio_images"] = update_data["portfolio_images"][:7]

        if update_data:
            await db.talents.update_one({"id": talent_id}, {"$set": update_data})

        updated = await db.talents.find_one({"id": talent_id}, {"_id": 0})
        return TalentResponse(
            id=updated["id"], name=updated["name"], email=updated["email"], phone=updated["phone"],
            instagram_id=updated.get("instagram_id", ""), category=updated["category"],
            bio=updated.get("bio", ""), profile_image=updated.get("profile_image", ""),
            portfolio_images=updated.get("portfolio_images", []), portfolio_video=updated.get("portfolio_video", ""),
            is_approved=updated.get("is_approved", False),
            rank=updated.get("rank", 999), votes=updated.get("votes", 0), created_at=updated.get("created_at", ""),
            agreed_to_terms=updated.get("agreed_to_terms", False), agreed_at=updated.get("agreed_at", ""),
            slug=updated.get("slug", "")
        )


    @router.get("/talent/{talent_identifier}", response_model=TalentResponse)
    async def get_talent(talent_identifier: str, include_contact: bool = False):
        """
        Get talent details by ID or slug. Phone and email are hidden by default for privacy.
        Admin dashboard should pass include_contact=true to see contact info.
        """
        # Try to find by ID first, then by slug
        talent = await db.talents.find_one({"id": talent_identifier}, {"_id": 0})
        if not talent:
            talent = await db.talents.find_one({"slug": talent_identifier}, {"_id": 0})
        if not talent:
            raise HTTPException(status_code=404, detail="Talent not found")

        # Hide contact info for public requests (privacy protection)
        email_value = talent["email"] if include_contact else ""
        phone_value = talent["phone"] if include_contact else ""

        return TalentResponse(
            id=talent["id"], name=talent["name"], email=email_value, phone=phone_value,
            instagram_id=talent.get("instagram_id", ""), category=talent["category"],
            bio=talent.get("bio", ""), profile_image=talent.get("profile_image", ""),
            portfolio_images=talent.get("portfolio_images", []), portfolio_video=talent.get("portfolio_video", ""),
            is_approved=talent.get("is_approved", False),
            rank=talent.get("rank", 999), votes=talent.get("votes", 0), created_at=talent.get("created_at", ""),
            agreed_to_terms=talent.get("agreed_to_terms", False), agreed_at=talent.get("agreed_at", ""),
            slug=talent.get("slug", "")
        )


    @router.get("/talents", response_model=List[TalentResponse])
    async def get_talents(
        approved_only: bool = True,
        category: Optional[str] = None,
        lightweight: bool = False,
        featured: bool = False,
        search: Optional[str] = None,
        location: Optional[str] = None,
        skip: int = 0,
        limit: int = 1000
    ):
        query = {}
        if approved_only:
            query["is_approved"] = True
        if featured:
            query["is_featured"] = True
        if category:
            db_category = normalize_category(category)
            if db_category not in ("All", "All Talents"):
                query["category"] = db_category

        # Search by name (case-insensitive)
        if search and search.strip():
            query["name"] = {"$regex": re.escape(search.strip()), "$options": "i"}

        # Filter by location if provided
        if location and location.strip():
            query["location"] = {"$regex": re.escape(location.strip()), "$options": "i"}

        # Always exclude large portfolio fields from list view for faster loading
        projection = {"_id": 0, "portfolio_images": 0, "portfolio_video": 0, "password_hash": 0, "password_plain": 0}

        # Lightweight mode: Also exclude profile_image, email, phone for faster public grid loading
        if lightweight:
            projection["profile_image"] = 0
            projection["email"] = 0
            projection["phone"] = 0

        talents = await db.talents.find(query, projection).sort([("rank", 1), ("votes", -1)]).skip(skip).limit(limit).to_list(limit)

        return [
            TalentResponse(
                id=t["id"], name=t["name"],
                email=t.get("email", ""),  # Will be empty in lightweight mode
                phone=t.get("phone", ""),  # Will be empty in lightweight mode
                instagram_id=t.get("instagram_id", ""), category=t["category"],
                bio=t.get("bio", ""),
                profile_image=t.get("profile_image", ""),  # Will be empty in lightweight mode
                portfolio_images=[],  # Empty for list view - load on detail view
                portfolio_video="",   # Empty for list view
                is_approved=t.get("is_approved", False),
                is_featured=t.get("is_featured", False),
                is_paid_manual=t.get("is_paid_manual", False),
                hero_enabled=t.get("hero_enabled", False),
                hero_images=t.get("hero_images", []),
                rank=t.get("rank", 999), votes=t.get("votes", 0), created_at=t.get("created_at", ""),
                agreed_to_terms=t.get("agreed_to_terms", False), agreed_at=t.get("agreed_at", ""),
                store_subcategories=t.get("store_subcategories", []),
                location=t.get("location", ""),
                slug=t.get("slug", "")
            ) for t in talents
        ]

    @router.get("/talent/{talent_id}/thumb")
    async def get_talent_thumbnail(talent_id: str):
        """
        Returns a small JPEG thumbnail for the talent's profile image.
        Falls back to original image URL if it's not base64 or thumbnail fails.
        """
        talent = await db.talents.find_one({"id": talent_id}, {"_id": 0, "profile_image": 1})
        if not talent:
            raise HTTPException(status_code=404, detail="Talent not found")

        profile_image = talent.get("profile_image", "")

        # If it's a URL (not base64), redirect to it
        if profile_image.startswith("http"):
            return Response(
                status_code=302,
                headers={"Location": profile_image}
            )

        # If it's base64, generate thumbnail
        if profile_image.startswith("data:"):
            thumb = _make_thumb(profile_image)
            if thumb:
                # Extract the actual image bytes from thumbnail data URL
                _, b64_data = thumb.split(",", 1)
                img_bytes = base64.b64decode(b64_data)
                return Response(
                    content=img_bytes,
                    media_type="image/jpeg",
                    headers={"Cache-Control": "public, max-age=86400"}  # Cache for 24 hours
                )

        # Fallback: return a placeholder
        raise HTTPException(status_code=404, detail="No valid image")


    # ============== Submit Talent Referral ==============
    @router.post("/talent/referrals/submit")
    async def submit_referral(data: dict):
        """Allow talents to refer other people to BFM"""
        referrer_id = data.get("referrer_id")
        referrer_name = data.get("referrer_name", "")
        name = data.get("name", "").strip()
        phone = data.get("phone", "").strip()
        email = data.get("email", "").strip()
        instagram_id = data.get("instagram_id", "").strip()
        category = data.get("category", "Model - Female")
        
        if not name or not phone:
            raise HTTPException(status_code=400, detail="Name and phone are required")
        
        # Check if this phone already exists in referrals
        existing = await db.talent_referrals.find_one({"phone": phone})
        if existing:
            raise HTTPException(status_code=400, detail="This person has already been referred")
        
        referral_doc = {
            "id": str(uuid.uuid4()),
            "referrer_id": referrer_id,
            "referrer_name": referrer_name,
            "name": name,
            "phone": phone,
            "email": email,
            "instagram_id": instagram_id,
            "category": category,
            "status": "pending",  # pending, contacted, approved, rejected
            "created_at": datetime.now(timezone.utc).isoformat(),
            "notes": ""
        }
        
        await db.talent_referrals.insert_one(referral_doc)
        logger.info(f"New referral submitted by {referrer_name}: {name} ({category})")
        
        return {"message": "Referral submitted successfully", "id": referral_doc["id"]}

    return router
