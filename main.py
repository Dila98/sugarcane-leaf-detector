from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO
import shutil
import os
import uuid
import cv2

app = FastAPI()

# Create static directory if not exist
os.makedirs("static", exist_ok=True)
os.makedirs("uploads", exist_ok=True)

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to ["http://localhost:3000"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static folder for annotated images
app.mount("/static", StaticFiles(directory="static"), name="static")

# Load the YOLO model
model = YOLO("best.pt")  # Replace with your model filename

# Create static directory if not exist
os.makedirs("static", exist_ok=True)
os.makedirs("uploads", exist_ok=True)


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Save uploaded image to uploads/
    file_ext = file.filename.split('.')[-1]
    file_id = f"{uuid.uuid4()}.{file_ext}"
    upload_path = os.path.join("uploads", file_id)

    with open(upload_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Run YOLO prediction
    results = model(upload_path)
    boxes = results[0].boxes
    names = model.names

    # Get disease class name from result
    disease = "Unknown"
    if len(boxes) > 0:
        class_id = int(boxes[0].cls[0])
        disease = names[class_id]

    # Save annotated image
    annotated_img_path = os.path.join("static", f"annotated_{file_id}")
    results[0].save(filename=annotated_img_path)

    # Create URL for frontend
    annotated_url = f"http://localhost:8000/static/annotated_{file_id}"

    return JSONResponse({
        "disease": disease,
        "annotated_image_url": annotated_url
    })
