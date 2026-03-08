#api.py
from fastapi import APIRouter,HTTPException
from typing import List
from model import Album, AlbumCreate
from database import album_list

