from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import secrets
import hashlib
from datetime import datetime, timezone, timedelta
import os
import logging

logger = logging.getLogger(__name__)

def create_password_reset_routes(db):
    router = APIRouter()
    
    class ForgotPasswordRequest(BaseModel):
        email: EmailStr
    
    class ResetPasswordRequest(BaseModel):
        token: str
        new_password: str
    
    def send_reset_email(to_email: str, reset_token: str, base_url: str):
        """Send password reset email via Gmail SMTP"""
        gmail_user = os.environ.get('GMAIL_USER', 'bfm1magazine@gmail.com')
        gmail_app_password = os.environ.get('GMAIL_APP_PASSWORD')
        
        if not gmail_app_password:
            logger.error("GMAIL_APP_PASSWORD not configured")
            raise HTTPException(status_code=500, detail="Email service not configured")
        
        reset_link = f"{base_url}/reset-password?token={reset_token}"
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'BFM - Password Reset Request'
        msg['From'] = f'Bangalore Fashion Magazine <{gmail_user}>'
        msg['To'] = to_email
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #050A14; color: #F5F5F0; padding: 40px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #0A1628; border-radius: 10px; padding: 40px; border: 1px solid #D4AF37;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #D4AF37; margin: 0;">BFM</h1>
                    <p style="color: #A0A5B0; margin: 5px 0;">Bangalore Fashion Magazine</p>
                </div>
                
                <h2 style="color: #F5F5F0; text-align: center;">Password Reset Request</h2>
                
                <p style="color: #A0A5B0; line-height: 1.6;">
                    You have requested to reset your password. Click the button below to create a new password:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_link}" style="display: inline-block; background-color: #D4AF37; color: #050A14; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Reset Password
                    </a>
                </div>
                
                <p style="color: #A0A5B0; font-size: 14px;">
                    This link will expire in 1 hour. If you didn't request this, please ignore this email.
                </p>
                
                <hr style="border: none; border-top: 1px solid #D4AF37; margin: 30px 0;" />
                
                <p style="color: #A0A5B0; font-size: 12px; text-align: center;">
                    If the button doesn't work, copy and paste this link:<br/>
                    <a href="{reset_link}" style="color: #D4AF37; word-break: break-all;">{reset_link}</a>
                </p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        BFM - Password Reset Request
        
        You have requested to reset your password.
        
        Click this link to reset: {reset_link}
        
        This link will expire in 1 hour.
        If you didn't request this, please ignore this email.
        """
        
        msg.attach(MIMEText(text_content, 'plain'))
        msg.attach(MIMEText(html_content, 'html'))
        
        try:
            server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
            server.login(gmail_user, gmail_app_password)
            server.sendmail(gmail_user, to_email, msg.as_string())
            server.quit()
            logger.info(f"Password reset email sent to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to send reset email")
    
    @router.post("/forgot-password")
    async def forgot_password(request: ForgotPasswordRequest):
        """Send password reset email"""
        # Check if user exists
        user = await db.users.find_one({"email": request.email})
        
        if not user:
            # Don't reveal if email exists or not for security
            return {"message": "If this email exists, a reset link has been sent"}
        
        # Generate reset token
        reset_token = secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
        
        # Store reset token
        await db.password_resets.update_one(
            {"email": request.email},
            {"$set": {
                "email": request.email,
                "token": reset_token,
                "expires_at": expires_at.isoformat(),
                "used": False
            }},
            upsert=True
        )
        
        # Get base URL from environment or use default
        base_url = os.environ.get('FRONTEND_URL', 'https://blr-trend-mag.emergent.host')
        
        # Send email
        try:
            send_reset_email(request.email, reset_token, base_url)
        except Exception as e:
            logger.error(f"Email send failed: {e}")
            # Still return success to not reveal email existence
        
        return {"message": "If this email exists, a reset link has been sent"}
    
    @router.post("/reset-password")
    async def reset_password(request: ResetPasswordRequest):
        """Reset password using token"""
        # Find reset token
        reset_record = await db.password_resets.find_one({
            "token": request.token,
            "used": False
        })
        
        if not reset_record:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
        # Check expiry
        expires_at = datetime.fromisoformat(reset_record["expires_at"].replace('Z', '+00:00'))
        if datetime.now(timezone.utc) > expires_at:
            raise HTTPException(status_code=400, detail="Reset token has expired")
        
        # Hash new password
        salt = secrets.token_hex(16)
        password_hash = hashlib.sha256((request.new_password + salt).encode()).hexdigest()
        new_hash = f"{salt}:{password_hash}"
        
        # Update user password
        result = await db.users.update_one(
            {"email": reset_record["email"]},
            {"$set": {"password_hash": new_hash}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="Failed to update password")
        
        # Mark token as used
        await db.password_resets.update_one(
            {"token": request.token},
            {"$set": {"used": True}}
        )
        
        return {"message": "Password reset successfully"}
    
    @router.get("/verify-reset-token/{token}")
    async def verify_reset_token(token: str):
        """Verify if reset token is valid"""
        reset_record = await db.password_resets.find_one({
            "token": token,
            "used": False
        })
        
        if not reset_record:
            return {"valid": False, "message": "Invalid token"}
        
        expires_at = datetime.fromisoformat(reset_record["expires_at"].replace('Z', '+00:00'))
        if datetime.now(timezone.utc) > expires_at:
            return {"valid": False, "message": "Token expired"}
        
        return {"valid": True, "email": reset_record["email"]}
    
    return router
