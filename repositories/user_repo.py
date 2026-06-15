from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from models.user import User, VerificationCode, RefreshToken
from datetime import datetime


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, email: str, username: str, password_hash: str) -> User:
        user = User(email=email, username=username, password_hash=password_hash)
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def get_by_id(self, user_id: int) -> User | None:
        result = await self.db.execute(
            select(User).where(User.id == user_id, User.deleted_at == None)
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(
            select(User).where(User.email == email, User.deleted_at == None)
        )
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> User | None:
        result = await self.db.execute(
            select(User).where(User.username == username, User.deleted_at == None)
        )
        return result.scalar_one_or_none()

    async def update(self, user_id: int, **kwargs) -> User | None:
        await self.db.execute(
            update(User).where(User.id == user_id).values(**kwargs)
        )
        await self.db.commit()
        return await self.get_by_id(user_id)

    async def soft_delete(self, user_id: int):
        await self.db.execute(
            update(User).where(User.id == user_id).values(deleted_at=datetime.utcnow())
        )
        await self.db.commit()

    async def create_verification_code(self, user_id: int, code: str, expires_at: datetime) -> VerificationCode:
        verification = VerificationCode(user_id=user_id, code=code, expires_at=expires_at)
        self.db.add(verification)
        await self.db.commit()
        await self.db.refresh(verification)
        return verification

    async def get_verification_code(self, user_id: int, code: str) -> VerificationCode | None:
        result = await self.db.execute(
            select(VerificationCode).where(
                VerificationCode.user_id == user_id,
                VerificationCode.code == code,
                VerificationCode.expires_at > datetime.utcnow()
            )
        )
        return result.scalar_one_or_none()

    async def delete_verification_codes(self, user_id: int):
        result = await self.db.execute(
            select(VerificationCode).where(VerificationCode.user_id == user_id)
        )
        codes = result.scalars().all()
        for code in codes:
            await self.db.delete(code)
        await self.db.commit()

    async def create_refresh_token(self, user_id: int, token: str, expires_at: datetime) -> RefreshToken:
        refresh = RefreshToken(user_id=user_id, token=token, expires_at=expires_at)
        self.db.add(refresh)
        await self.db.commit()
        await self.db.refresh(refresh)
        return refresh

    async def get_refresh_token(self, token: str) -> RefreshToken | None:
        result = await self.db.execute(
            select(RefreshToken).where(
                RefreshToken.token == token,
                RefreshToken.expires_at > datetime.utcnow()
            )
        )
        return result.scalar_one_or_none()

    async def delete_refresh_token(self, token: str):
        result = await self.db.execute(
            select(RefreshToken).where(RefreshToken.token == token)
        )
        refresh = result.scalar_one_or_none()
        if refresh:
            await self.db.delete(refresh)
            await self.db.commit()