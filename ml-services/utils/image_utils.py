import io
from PIL import Image

def load_image_from_bytes(image_bytes: bytes) -> Image.Image:
    """Convert raw image bytes into a PIL Image object."""
    image = Image.open(io.BytesIO(image_bytes))
    if image.mode != "RGB":
        image = image.convert("RGB")
    return image
