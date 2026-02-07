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


# Talent Categories
TALENT_CATEGORIES = [
    "Model - Female",
    "Model - Male", 
    "Designers",
    "Makeup & Hair",
    "Photography",
    "Event Management",
    "Other"
]
