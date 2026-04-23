from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from model import Album, AlbumCreate, ListenedAlbum, AlbumRating, User, UserCreate, UserLogin, Token
from auth import get_password_hash, verify_password, create_access_token, get_current_user, db
from datetime import timedelta
from config import settings
from bson import ObjectId

router = APIRouter()

# --- Auth Endpoints ---

@router.post("/register", response_model=User)
def register(user_data: UserCreate):
    if db.users.find_one({"username": user_data.username}):
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user_data.password)
    user_dict = {
        "username": user_data.username,
        "email": user_data.email,
        "hashed_password": hashed_password
    }
    result = db.users.insert_one(user_dict)
    user_dict["_id"] = result.inserted_id
    return User(**user_dict)

@router.post("/login", response_model=Token)
def login(user_data: UserLogin):
    user_dict = db.users.find_one({"username": user_data.username})
    if not user_dict or not verify_password(user_data.password, user_dict["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_dict["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- Album Endpoints ---

@router.get("/albums", response_model=List[Album])
def get_all_albums(current_user: User = Depends(get_current_user)):
    albums = list(db.albums.find({"owner_id": str(current_user.id)}))
    return [Album(**a) for a in albums]

@router.get("/albums/{album_id}", response_model=Album)
def get_album_from_id(album_id: str, current_user: User = Depends(get_current_user)):
    album_dict = db.albums.find_one({"_id": ObjectId(album_id), "owner_id": str(current_user.id)})
    if not album_dict:
        raise HTTPException(status_code=404, detail="Album not found")
    return Album(**album_dict)

@router.post("/albums", response_model=Album)
def create_album(album_data: AlbumCreate, current_user: User = Depends(get_current_user)):
    new_album_dict = album_data.model_dump()
    new_album_dict["owner_id"] = str(current_user.id)
    result = db.albums.insert_one(new_album_dict)
    new_album_dict["_id"] = result.inserted_id
    return Album(**new_album_dict)

@router.put("/albums/{album_id}", response_model=Album)
def update_album(album_id: str, album_update: AlbumCreate, current_user: User = Depends(get_current_user)):
    filter_query = {"_id": ObjectId(album_id), "owner_id": str(current_user.id)}
    update_data = {"$set": album_update.model_dump()}
    result = db.albums.update_one(filter_query, update_data)
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Album not found")
    
    updated_album = db.albums.find_one(filter_query)
    return Album(**updated_album)

@router.delete("/albums/{album_id}", status_code=204)
def delete_album(album_id: str, current_user: User = Depends(get_current_user)):
    result = db.albums.delete_one({"_id": ObjectId(album_id), "owner_id": str(current_user.id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Album not found")
    return None

@router.patch("/albums/{album_id}/priority", response_model=Album)
def toggle_priority(album_id: str, current_user: User = Depends(get_current_user)):
    filter_query = {"_id": ObjectId(album_id), "owner_id": str(current_user.id)}
    album = db.albums.find_one(filter_query)
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")
    
    db.albums.update_one(filter_query, {"$set": {"priority": not album["priority"]}})
    updated_album = db.albums.find_one(filter_query)
    return Album(**updated_album)

@router.get("/listened-albums", response_model=List[ListenedAlbum])
def get_listened_albums(current_user: User = Depends(get_current_user)):
    albums = list(db.listened_albums.find({"owner_id": str(current_user.id)}))
    sorted_albums = sorted(albums, key=lambda x: x["rating"], reverse=True)
    return [ListenedAlbum(**a) for a in sorted_albums]

@router.post("/albums/{album_id}/mark-as-listened", response_model=ListenedAlbum)
def mark_album_as_listened(album_id: str, rating_data: AlbumRating, current_user: User = Depends(get_current_user)):
    album_to_move = db.albums.find_one({"_id": ObjectId(album_id), "owner_id": str(current_user.id)})
    if not album_to_move:
        raise HTTPException(status_code=404, detail="Album not found in listening queue")

    new_listened_dict = {
        "title": album_to_move["title"],
        "artist": album_to_move["artist"],
        "year": album_to_move["year"],
        "listen_format": album_to_move["listen_format"],
        "rating": rating_data.rating,
        "owner_id": str(current_user.id)
    }

    result = db.listened_albums.insert_one(new_listened_dict)
    db.albums.delete_one({"_id": ObjectId(album_id)})
    
    new_listened_dict["_id"] = result.inserted_id
    return ListenedAlbum(**new_listened_dict)
