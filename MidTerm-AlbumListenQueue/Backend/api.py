#api.py
from fastapi import APIRouter,HTTPException
from typing import List
from Backend.model import Album, AlbumCreate
from Backend.database import album_list

router=APIRouter()

#read all albums
@router.get("/albums", response_model=List[Album])
async def get_all_albums():
    return album_list

# read album by ID
@router.get("/albums/{album_id}", response_model=Album)
async def get_album_from_id(album_id: int):
    for album in album_list:
        if album.id == album_id:
            return album
        else:
            raise HTTPException(status_code=404, detail="Album not found")

#Create album 
@router.post("/albums", response_model=Album)
async def create_album(album_data:AlbumCreate):
    # create new ID make id 1 if empty
    new_id=max((album.id for album in album_list),default=0) + 1 
    new_album= Album(id=new_id, **album_data.model_dump())
    album_list.append(new_album)
    return new_album


#Update existing album
@router.post("/albums/{album_id}", response_model=Album)
async def update_album(album_id: int, album_update : AlbumCreate):
    for i, album in enumerate(album_list):
        if album.id == album_id:
            updated_album = Album(id=album_id, **album_update.model_dump())
            album_list[i]  = updated_album
            return updated_album
    
    raise HTTPException(status_code=404, detail="Album not found")

@router.delete("/albums/{album_id}", status_code=204)
async def delete_album(album_id :int):
    for album in album_list:
        if album.id == album_id:
            album_list.remove(album)
            return {"message": f"Album with id {album_id} has been deleted."}
    raise HTTPException(status_code=404, detail="Album not found")

# update priority of an album
@router.patch("/albums/{album_id}/priority", response_model=Album)
async def toggle_priority(album_id :int):
    for album in album_list:
        if album.id == album_id:
            album.priority = not album.priority
            return album
    raise HTTPException(status_code=404, detail="Album not found")