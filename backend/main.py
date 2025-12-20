from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from service_gemini import analyze_receipt

app = FastAPI()

# --- CORS CONFIGURATION ---
# This allows your frontend (localhost:3000) to talk to this backend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Your live Vercel URL (I added the https:// part for you)
    "https://receipt-j8rf-ogvjok7t8-ahmed-maliks-projects-906fba3a.vercel.app",
    "https://receipt-j8rf-ogvjok7t8-ahmed-maliks-projects-906fba3a.vercel.app/"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Pantry Tracker API is running!"}

@app.post("/upload")
async def upload_receipt(file: UploadFile = File(...)):
    """
    Endpoint that accepts an image file, sends it to Gemini,
    and returns a JSON list of food items.
    """
    # 1. Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # 2. Read the file bytes
    contents = await file.read()

    # 3. Send to Gemini Service
    result = await analyze_receipt(contents)

    return result

# To run this server: uvicorn main:app --reload