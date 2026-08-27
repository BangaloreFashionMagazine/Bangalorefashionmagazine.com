from fastapi import Header, HTTPException, Path
from typing import Optional
import jwt as pyjwt

from services import decode_access_token


def _decode_bearer(authorization: Optional[str]) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    token = authorization.split(" ", 1)[1]
    try:
        return decode_access_token(token)
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired, please log in again")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")


async def get_current_admin(authorization: Optional[str] = Header(None)) -> dict:
    """Require a valid, non-expired JWT belonging to an admin user."""
    payload = _decode_bearer(authorization)
    if not payload.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return payload


async def get_current_talent(authorization: Optional[str] = Header(None)) -> dict:
    """Require a valid, non-expired JWT belonging to a talent account."""
    payload = _decode_bearer(authorization)
    if payload.get("type") != "talent":
        raise HTTPException(status_code=403, detail="Talent access required")
    return payload


async def get_current_talent_or_admin(talent_id: str = Path(...), authorization: Optional[str] = Header(None)) -> dict:
    """Require either an admin token, or a talent token whose subject matches the talent_id in the URL."""
    payload = _decode_bearer(authorization)
    if payload.get("is_admin"):
        return payload
    if payload.get("type") == "talent" and payload.get("sub") == talent_id:
        return payload
    raise HTTPException(status_code=403, detail="Not authorized to modify this talent")
