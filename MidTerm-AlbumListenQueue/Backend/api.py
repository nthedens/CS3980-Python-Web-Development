#api.py
from fastapi import APIRouter,HTTPException
from typing import List
from Backend.model import Album, AlbumCreate,ListenedAlbum, AlbumRating
from Backend.database import album_list,listened_album_list

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

@router.get("/listened-albums", response_model=List[ListenedAlbum])
async def get_listened_albums():
    """Retrieve all albums from the listened-to list."""
    return sorted(listened_album_list, key=lambda x: x.rating, reverse=True)


@router.post("/albums/{album_id}/mark-as-listened", response_model=ListenedAlbum)
async def mark_album_as_listened(album_id: int, rating_data: AlbumRating):
    """Move an album from the listening queue to the listened-to list."""
    album_to_move = None

    for album in album_list:
        if album.id == album_id:
            album_to_move = album
            break

    if not album_to_move:
        raise HTTPException(status_code=404, detail="Album not found in listening queue")

    album_list.remove(album_to_move)

    new_listened_id=max((album.id for album in listened_album_list),default=0) + 1 

    new_listened_album = ListenedAlbum(
        id=new_listened_id,
        title=album_to_move.title,
        artist=album_to_move.artist,
        year=album_to_move.year,
        listen_format=album_to_move.listen_format,
        rating=rating_data.rating
    )

    listened_album_list.append(new_listened_album)
    return new_listened_album