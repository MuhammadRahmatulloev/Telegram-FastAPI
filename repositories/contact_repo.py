from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.contact import Contact
from models.user import User


class ContactRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_contacts(self, owner_id: int) -> list[Contact]:
        result = await self.db.execute(
            select(Contact).where(Contact.owner_id == owner_id)
        )
        return result.scalars().all()

    async def add_contact(self, owner_id: int, contact_user_id: int, first_name: str, last_name: str | None) -> Contact:
        contact = Contact(
            owner_id=owner_id,
            contact_user_id=contact_user_id,
            first_name=first_name,
            last_name=last_name
        )
        self.db.add(contact)
        await self.db.commit()
        await self.db.refresh(contact)
        return contact

    async def get_contact(self, owner_id: int, contact_user_id: int) -> Contact | None:
        result = await self.db.execute(
            select(Contact).where(
                Contact.owner_id == owner_id,
                Contact.contact_user_id == contact_user_id
            )
        )
        return result.scalar_one_or_none()

    async def delete_contact(self, owner_id: int, contact_user_id: int):
        contact = await self.get_contact(owner_id, contact_user_id)
        if contact:
            await self.db.delete(contact)
            await self.db.commit()

    async def search_user_by_phone(self, phone: str) -> User | None:
        cleaned = phone.replace(' ', '').replace('-', '').replace('+', '')
        result = await self.db.execute(
            select(User).where(
                User.phone.like(f'%{cleaned}%'),
                User.deleted_at == None,
                User.is_verified == True
            )
        )
        return result.scalar_one_or_none()
