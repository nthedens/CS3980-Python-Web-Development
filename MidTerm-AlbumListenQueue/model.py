from pydantic import BaseModel

# The main Album API
class Album(BaseModel):
    id: int
    title: str
    artist: str
    year: int =0  # default value for unknow year
    listen_format: str  # e.g., "Vinyl", "CD", "Digital"
    priority: bool # how urgent to listen (listen now  or later)

# model creating new albums,ID is not needed
class AlbumCreate(BaseModel):
    title: str
    artist: str
    year: int =0 
    listen_format: str
    priority: bool =False #default false priority (not really needed but just in case)


class ListenedAlbum(BaseModel):
    id: int
    title: str
    artist: str
    year: int =0
    listen_format: str 
    rating: float # score for album

# used for POST body for mark as listened
# allows to check for vaild input without the rest of the album info needing to be sent, 
# the album info will just be moved to the proper spot between the 2 databases 
# keeps so it just needs id and float
class AlbumRating(BaseModel):
    rating: float