import random
import string
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from repositories.user_repo import UserRepository
from core.security import hash_password, verify_password, create_access_token, create_refresh_token
from core.config import settings
from tasks.email_tasks import send_verification_email


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    def generate_code(self) -> str:
        return ''.join(random.choices(string.digits, k=5))

    async def register(self, email: str, username: str, password: str, phone: str | None = None):
        existing_email = await self.user_repo.get_by_email(email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        existing_username = await self.user_repo.get_by_username(username)
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        password_hash = hash_password(password)
        user = await self.user_repo.create(email=email, username=username, password_hash=password_hash, phone=phone)
        code = self.generate_code()
        expires_at = datetime.utcnow() + timedelta(minutes=5)
        await self.user_repo.delete_verification_codes(user.id)
        await self.user_repo.create_verification_code(user.id, code, expires_at)
        send_verification_email.delay(email, code)
        return {"message": "Registration successful. Check your email for verification code."}

    async def verify_email(self, email: str, code: str):
        user = await self.user_repo.get_by_email(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        verification = await self.user_repo.get_verification_code(user.id, code)
        if not verification:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired code"
            )
        await self.user_repo.update(user.id, is_verified=True)
        await self.user_repo.delete_verification_codes(user.id)
        return {"message": "Email verified successfully"}

    async def login(self, email: str, password: str):
        user = await self.user_repo.get_by_email(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        if not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        if not user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email not verified"
            )
        # 2FA: отправляем код на email при каждом логине
        code = self.generate_code()
        expires_at = datetime.utcnow() + timedelta(minutes=5)
        await self.user_repo.delete_verification_codes(user.id)
        await self.user_repo.create_verification_code(user.id, code, expires_at)
        send_verification_email.delay(email, code)
        return {"message": "code_sent", "email": email}

    async def verify_login(self, email: str, code: str):
        user = await self.user_repo.get_by_email(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        verification = await self.user_repo.get_verification_code(user.id, code)
        if not verification:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired code"
            )
        await self.user_repo.delete_verification_codes(user.id)
        access_token = create_access_token({"sub": str(user.id)})
        refresh_token = create_refresh_token({"sub": str(user.id)})
        expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        await self.user_repo.create_refresh_token(user.id, refresh_token, expires_at)
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }

    async def refresh(self, refresh_token: str):
        token = await self.user_repo.get_refresh_token(refresh_token)
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )
        access_token = create_access_token({"sub": str(token.user_id)})
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }

    async def logout(self, refresh_token: str):
        await self.user_repo.delete_refresh_token(refresh_token)
        return {"message": "Logged out successfully"}