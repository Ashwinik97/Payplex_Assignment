from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import shutil
import os

app = FastAPI()

# Enable CORS so React can talk to Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create folder for photos if it doesn't exist
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Serve the 'uploads' folder so images can be seen in the browser
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Mock Database
users_db = [
    {
        "id": 1,
        "name": "Admin User",
        "address": "Pune Office",
        "gmail": "admin@payplex.in",
        "contact": "9876543210",
        "dob": "1990-01-01",
        "status": "Active",
        "photo": None
    }
]

@app.get("/users")
async def get_users():
    return users_db

@app.post("/register")
async def register(
    name: str = Form(...),
    address: str = Form(...),
    gmail: str = Form(...),
    contact: str = Form(...),
    dob: str = Form(...),
    profile_photo: UploadFile = File(...)
):
    if any(u["gmail"] == gmail for u in users_db):
        raise HTTPException(status_code=400, detail="User already exists")

    file_path = os.path.join(UPLOAD_DIR, profile_photo.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(profile_photo.file, buffer)

    new_user = {
        "id": len(users_db) + 1,
        "name": name,
        "address": address,
        "gmail": gmail,
        "contact": contact,
        "dob": dob,
        "status": "Active",
        "photo": profile_photo.filename
    }
    users_db.append(new_user)
    return {"message": "Success", "user": new_user}

@app.post("/login")
async def login(credentials: dict):
    email = credentials.get("gmail")
    for user in users_db:
        if user["gmail"] == email:
            if user["status"] == "Active":
                return {"message": "Login Successful", "user": user}
            else:
                raise HTTPException(status_code=403, detail="Account Inactive. Contact Admin.")
    raise HTTPException(status_code=404, detail="User not found.")

@app.patch("/users/{user_id}/status")
async def toggle_status(user_id: int):
    for user in users_db:
        if user["id"] == user_id:
            user["status"] = "Inactive" if user["status"] == "Active" else "Active"
            return {"message": "Success", "new_status": user["status"]}
    raise HTTPException(status_code=404, detail="User not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)