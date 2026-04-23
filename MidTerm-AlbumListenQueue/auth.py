import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from bcrypt import hashpw, gensalt, checkpw
from model import User, TokenData
from config import settings
import pymongo
from bson import ObjectId

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Shared client for sync pymongo
client = pymongo.MongoClient(settings.MONGODB_URI)
db = client.album_queue

def get_password_hash(password: str) -> str:
    return hashpw(password.encode('utf-8'), gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except jwt.PyJWTError:
        raise credentials_exception
    
    user_dict = db.users.find_one({"username": token_data.username})
    if user_dict is None:
        raise credentials_exception
    return User(**user_dict)
