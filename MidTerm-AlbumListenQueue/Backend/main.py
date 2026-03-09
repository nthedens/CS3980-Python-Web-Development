from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from Backend import api

app = FastAPI(title="AlbumQueue")

@app.get("/")
async def home():
    return FileResponse("./Frontend/index.html")

app.include_router(api.router)

# mount must come after routes
app.mount("/", StaticFiles(directory="Frontend"), name="static")