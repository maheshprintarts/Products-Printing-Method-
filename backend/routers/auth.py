from fastapi import APIRouter, HTTPException
from models import LoginRequest, Token
from datetime import datetime, timedelta
from jose import jwt

router = APIRouter(prefix="/api/auth", tags=["Auth"])

SECRET_KEY = "printartsSecretKey2026!SpecSystem"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8  # 8 hours

# MVP: single hardcoded admin user
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/login", response_model=Token)
async def login(data: LoginRequest):
    if data.username != ADMIN_USERNAME or data.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_access_token({"sub": data.username, "role": "admin"})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/verify")
async def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"valid": True, "username": payload.get("sub"), "role": payload.get("role")}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
