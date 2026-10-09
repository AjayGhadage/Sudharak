import os
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from utils.image_utils import load_image_from_bytes
from utils.response_utils import format_response
from services.detector import UnifiedDetector
from services.analyzer import analyze_issue

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sudharak-ml")

app = FastAPI(
    title="Sudharak ML Microservice",
    description="YOLO Object Detection for Civic & Environmental Issues",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
detector = UnifiedDetector(MODELS_DIR)

@app.get("/")
def read_root():
    return format_response(True, {
        "service": "Sudharak ML Microservice",
        "status": "online",
        "models_loaded": {
            "garbage": detector.garbage_detector.model is not None,
            "pothole": detector.pothole_detector.model is not None
        }
    })

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "garbage_model": os.path.exists(os.path.join(MODELS_DIR, "garbage_best.pt")),
        "pothole_model": os.path.exists(os.path.join(MODELS_DIR, "pothole_model.pt"))
    }

@app.post("/predict")
async def predict_issue(image: UploadFile = File(...)):
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File uploaded is not an image")
    
    try:
        contents = await image.read()
        pil_image = load_image_from_bytes(contents)
        
        detection_result = detector.detect(pil_image)
        analysis_data = analyze_issue(detection_result)
        
        return format_response(True, {
            "filename": image.filename,
            "detection": detection_result,
            "analysis": analysis_data
        })
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        return format_response(False, error=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
