import os
import logging
from PIL import Image

logger = logging.getLogger(__name__)

class PotholeDetector:
    def __init__(self, model_path: str):
        self.model_path = model_path
        self.model = None
        self.load_model()

    def load_model(self):
        if os.path.exists(self.model_path):
            try:
                from ultralytics import YOLO
                self.model = YOLO(self.model_path)
                logger.info(f"Loaded Pothole YOLO model from {self.model_path}")
            except Exception as e:
                logger.error(f"Failed to load Pothole model from {self.model_path}: {e}")
                self.model = None
        else:
            logger.warning(f"Pothole model path not found: {self.model_path}")

    def predict(self, image: Image.Image):
        if self.model:
            try:
                results = self.model(image)
                detections = []
                for result in results:
                    boxes = result.boxes
                    for box in boxes:
                        cls_id = int(box.cls[0])
                        class_name = self.model.names[cls_id] if hasattr(self.model, 'names') else "pothole"
                        conf = float(box.conf[0])
                        xyxy = box.xyxy[0].tolist()
                        detections.append({
                            "class": class_name,
                            "category": "POTHOLE",
                            "confidence": round(conf, 4),
                            "bbox": [round(x, 2) for x in xyxy]
                        })
                return detections
            except Exception as e:
                logger.error(f"Pothole inference error: {e}")
        return []
