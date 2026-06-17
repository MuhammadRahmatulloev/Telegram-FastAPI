from fastapi import FastAPI
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.redis import init_redis, close_redis
from api.auth import router as auth_router
from api.users import router as users_router
from api.chats import router as chats_router
from api.messages import router as messages_router
from api.files import router as files_router
from api.admin import router as admin_router
from api.contacts import router as contacts_router
from websocket.chat_ws import router as chat_ws_router
from websocket.call_ws import router as call_ws_router

security = HTTPBearer()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_redis()
    yield
    await close_redis()


app = FastAPI(
    title="Telegram FastAPI",
    version="1.0.0",
    lifespan=lifespan,
    swagger_ui_parameters={"persistAuthorization": True},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PREFIX = "/api/v1"

app.include_router(auth_router,     prefix=PREFIX)
app.include_router(users_router,    prefix=PREFIX)
app.include_router(chats_router,    prefix=PREFIX)
app.include_router(messages_router, prefix=PREFIX)
app.include_router(files_router,    prefix=PREFIX)
app.include_router(admin_router,    prefix=PREFIX)
app.include_router(contacts_router, prefix=PREFIX)

app.include_router(chat_ws_router)
app.include_router(call_ws_router)