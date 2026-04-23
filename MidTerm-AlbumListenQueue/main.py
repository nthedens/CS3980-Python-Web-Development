from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import api

app = FastAPI(title="AlbumQueue")

# Silence Chrome DevTools background discovery errors
@app.get("/.well-known/appspecific/com.chrome.devtools.json")
async def silence_chrome_errors():
    return {}

@app.get("/")
async def home():
    return FileResponse("./Frontend/index.html")

app.include_router(api.router)

# mount must come after routes
app.mount("/", StaticFiles(directory="Frontend"), name="static")
