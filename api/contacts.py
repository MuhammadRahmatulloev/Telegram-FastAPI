from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from database.db import get_db
from core.permissions import get_current_user
from models.user import User
from repositories.contact_repo import ContactRepository

router = APIRouter(prefix="/contacts", tags=["Contacts"])


class AddContactRequest(BaseModel):
    phone: str
    first_name: str
    last_name: str | None = None


class ContactResponse(BaseModel):
    id: int
    contact_user_id: int
    first_name: str
    last_name: str | None
    username: str
    avatar: str | None

    class Config:
        from_attributes = True


@router.get("/", response_model=list[ContactResponse])
async def get_contacts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = ContactRepository(db)
    contacts = await repo.get_contacts(current_user.id)
    result = []
    for c in contacts:
        result.append(ContactResponse(
            id=c.id,
            contact_user_id=c.contact_user_id,
            first_name=c.first_name,
            last_name=c.last_name,
            username=c.contact_user.username,
            avatar=c.contact_user.avatar
        ))
    return result


@router.post("/", response_model=ContactResponse)
async def add_contact(
    data: AddContactRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = ContactRepository(db)

    # Search user by phone
    found_user = await repo.search_user_by_phone(data.phone)
    if not found_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No users found with this phone number."
        )

    if found_user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot add yourself as a contact."
        )

    existing = await repo.get_contact(current_user.id, found_user.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This user is already in your contacts."
        )

    contact = await repo.add_contact(
        owner_id=current_user.id,
        contact_user_id=found_user.id,
        first_name=data.first_name or found_user.username,
        last_name=data.last_name
    )

    return ContactResponse(
        id=contact.id,
        contact_user_id=found_user.id,
        first_name=contact.first_name,
        last_name=contact.last_name,
        username=found_user.username,
        avatar=found_user.avatar
    )


@router.delete("/{contact_user_id}")
async def delete_contact(
    contact_user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = ContactRepository(db)
    await repo.delete_contact(current_user.id, contact_user_id)
    return {"message": "Contact removed"}
