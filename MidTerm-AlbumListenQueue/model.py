from typing import Optional, List, Annotated
from pydantic import BaseModel, EmailStr, Field, BeforeValidator

# Helper to handle MongoDB ObjectId
PyObjectId = Annotated[str, BeforeValidator(str)]

class User(BaseModel):
    id: Optional[PyObjectId] = Field(validation_alias="_id", default=None)
    username: str
    email: EmailStr
    hashed_password: str

    model_config = {
        "populate_by_name": True,
    }

class Album(BaseModel):
    id: Optional[PyObjectId] = Field(validation_alias="_id", default=None)
    title: str
    artist: str
    year: int = 0
    listen_format: str
    priority: bool = False
    owner_id: Optional[str] = None

    model_config = {
        "populate_by_name": True,
    }

class AlbumCreate(BaseModel):
    title: str
    artist: str
    year: int = 0 
    listen_format: str
    priority: bool = False

class ListenedAlbum(BaseModel):
    id: Optional[PyObjectId] = Field(validation_alias="_id", default=None)
    title: str
    artist: str
    year: int = 0
    listen_format: str 
    rating: float
    owner_id: Optional[str] = None

    model_config = {
        "populate_by_name": True,
    }

class AlbumRating(BaseModel):
    rating: float

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
