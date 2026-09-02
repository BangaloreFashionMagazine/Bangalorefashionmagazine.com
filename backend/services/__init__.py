import hashlib
import secrets
import os
import time
import logging
from collections import defaultdict
from datetime import datetime, timezone, timedelta

import jwt as pyjwt

logger = logging.getLogger(__name__)


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


# ============== JWT session tokens ==============
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24

JWT_SECRET = os.environ.get("JWT_SECRET")
if not JWT_SECRET:
    JWT_SECRET = secrets.token_hex(32)
    logger.warning(
        "JWT_SECRET is not set in the environment. Using a randomly generated secret for this process "
        "only - all issued sessions will be invalidated on every restart. Set JWT_SECRET in .env before "
        "deploying to production."
    )


def create_access_token(subject: str, is_admin: bool = False, token_type: str = "admin") -> str:
    """Create a signed, expiring JWT for a user or talent session."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "is_admin": is_admin,
        "type": token_type,
        "iat": now,
        "exp": now + timedelta(hours=JWT_EXPIRY_HOURS),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Decode and validate a JWT. Raises jwt.PyJWTError subclasses on failure."""
    return pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])


# ============== Lightweight in-memory rate limiting ==============
# Single-process, in-memory sliding window keyed by (bucket, client ip).
# Sufficient for this app's single-instance deployment (no horizontal scaling).
_RATE_LIMIT_HITS = defaultdict(list)


def check_rate_limit(bucket: str, key: str, max_requests: int, window_seconds: int) -> bool:
    """Returns True if the request is allowed, False if the caller should be throttled."""
    now = time.monotonic()
    hits = _RATE_LIMIT_HITS[(bucket, key)]
    cutoff = now - window_seconds
    while hits and hits[0] < cutoff:
        hits.pop(0)
    if len(hits) >= max_requests:
        return False
    hits.append(now)
    return True


# Talent Categories - storage format (as saved in the database)
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

# Display category names (shown in UI) - must stay in sync with
# frontend/src/lib/config.js TALENT_CATEGORIES/CATEGORY_DB
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

# Map display names to storage names (supports multiple variations)
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
    "Choreographers": "Choreographers",
    "Casting Coordinators": "Casting Coordinators",
    "Featured Talents": "Featured",
    "Designer Store": "Designer Store",
    "Event Management": "Event Management"
}

# All valid categories (both storage and display forms)
ALL_VALID_CATEGORIES = TALENT_CATEGORIES + NEW_TALENT_CATEGORIES


def normalize_category(category):
    """Convert a display category name to its storage (database) name if needed. Idempotent."""
    return CATEGORY_TO_DB.get(category, category)
