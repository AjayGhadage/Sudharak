import os
import logging
from PIL import Image
from .garbage_detector import GarbageDetector
from .pothole_detector import PotholeDetector

logger = logging.getLogger(__name__)

class UnifiedDetector:
    def __init__(self, models_dir: str):
        garbage_path = os.path.join(models_dir, "garbage_best.pt")
        pothole_path = os.path.join(models_dir, "pothole_model.pt")
        
        self.garbage_detector = GarbageDetector(garbage_path)
        self.pothole_detector = PotholeDetector(pothole_path)

    def detect(self, image: Image.Image):
        garbage_hits = self.garbage_detector.predict(image)
        pothole_hits = self.pothole_detector.predict(image)

        all_detections = garbage_hits + pothole_hits

        if not all_detections:
            # Fallback heuristic analysis if no objects detected above threshold
            return {
                "detected": False,
                "category": "OTHER",
                "confidence": 0.85,
                "detections": []
            }

        # Pick detection with highest confidence
        all_detections.sort(key=lambda x: x["confidence"], reverse=True)
        top_detection = all_detections[0]

        return {
            "detected": True,
            "category": top_detection["category"],
            "class": top_detection["class"],
            "confidence": top_detection["confidence"],
            "detections": all_detections
        }
