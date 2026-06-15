from sqlalchemy import Column, Integer, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database.db import Base


class CallType(str, enum.Enum):
    AUDIO = "audio"
    VIDEO = "video"


class CallStatus(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    ENDED = "ended"
    MISSED = "missed"
    REJECTED = "rejected"


class Call(Base):
    __tablename__ = "calls"

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id", ondelete="CASCADE"), nullable=False)
    started_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    call_type = Column(SAEnum(CallType), nullable=False)
    status = Column(SAEnum(CallStatus), default=CallStatus.PENDING, nullable=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)

    chat = relationship("Chat", back_populates="calls")
    started_by_user = relationship("User", back_populates="calls", foreign_keys=[started_by])