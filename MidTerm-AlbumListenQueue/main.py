
# Album
from fastapi import FastAPI
import api

app = FastAPI(title="AlbumQueue")

# Include the routes from the api.py file
app.include_router(api.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the AlbumQueue. Go to /docs for API documentation."}