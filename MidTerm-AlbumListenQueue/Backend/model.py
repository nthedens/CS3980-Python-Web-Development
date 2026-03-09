from pydantic import BaseModel

# The main Album API
class Album(BaseModel):
    id: int
    title: str
    artist: str
    year: int
    listen_format: str  # e.g., "Vinyl", "CD", "Digital"
    priority: bool # how urgent to listen (Reccomendation or personal interest)

# model creating new albums,ID is not needed
class AlbumCreate(BaseModel):
    title: str
    artist: str
    year: int
    listen_format: str
    priority: bool =False