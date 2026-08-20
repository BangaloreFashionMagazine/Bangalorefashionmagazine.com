import hashlib
import secrets
from datetime import datetime, timezone


def hash_password(password: str) -> str:
    """Hash a password with a random salt."""
    salt = secrets.token_hex(16)
    password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}:{password_hash}"


def verify_password(password: str, stored_hash: str) -> bool:
    """Verify a password against a stored hash."""
    try:
        salt, password_hash = stored_hash.split(":")
        return hashlib.sha256((password + salt).encode()).hexdigest() == password_hash
    except ValueError:
        return False


def generate_token(user_id: str) -> str:
    """Generate a unique token for user authentication."""
    token_data = f"{user_id}:{secrets.token_hex(32)}:{datetime.now(timezone.utc).isoformat()}"
    return hashlib.sha256(token_data.encode()).hexdigest()


# Talent Categories - Old names (stored in database)
TALENT_CATEGORIES = [
    "female model",
    "male model", 
    "designers",
    "photographers",
    "Model - Female",
    "Model - Male",
    "Designers",
    "Designer Store",
    "Makeup & Hair",
    "Hair Stylists",
    "Stylists",
    "Photography",
    "DJs",
    "Choreographers",
    "Casting Coordinators",
    "Event Management",
    "Other"
]

# New category names (displayed in UI)
NEW_TALENT_CATEGORIES = [
    "All Talents",
    "Models – Male",
    "Models – Female",
    "Designers",
    "Photographers",
    "Makeup Artists",
    "Hair Stylists",
    "Stylists",
    "DJs",
    "Choreographers",
    "Casting Coordinators",
    "Featured Talents"
]

# Map new names to old database names (supports multiple variations)
# IMPORTANT: Must match EXACTLY what's in the production database
CATEGORY_TO_DB = {
    "All Talents": "All",
    "Models – Male": "Model - Male",
    "Models – Female": "Model - Female",
    "Designers": "Designers",
    "Photographers": "Photography",
    "Makeup Artists": "Makeup & Hair",
    "Hair Stylists": "Hair Stylists",
    "Stylists": "Stylists",
    "DJs": "DJs",
    "Choreographers": "Event Management",
    "Casting Coordinators": "Casting Coordinators",
    "Featured Talents": "Featured",
    "Designer Store": "Designer Store"
}

# All valid categories (both old and new)
ALL_VALID_CATEGORIES = TALENT_CATEGORIES + NEW_TALENT_CATEGORIES

def normalize_category(category):
    """Convert new category name to old database name if needed"""
    return CATEGORY_TO_DB.get(category, category)
