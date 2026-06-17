from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database.db import get_db
from schemas.auth import RegisterRequest, VerifyEmailRequest, LoginRequest, TokenResponse, RefreshTokenRequest, VerifyLoginRequest
from services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register")
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.register(data.email, data.username, data.password, data.phone)


@router.post("/verify")
async def verify_email(data: VerifyEmailRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.verify_email(data.email, data.code)


@router.post("/login")
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.login(data.email, data.password)


@router.post("/verify-login", response_model=TokenResponse)
async def verify_login(data: VerifyLoginRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.verify_login(data.email, data.code)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.refresh(data.refresh_token)


@router.post("/logout")
async def logout(data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.logout(data.refresh_token)