import logging
import io
import torch
import open_clip
from PIL import Image

logger = logging.getLogger(__name__)


class ImageEmbeddingError(Exception):
    pass


class ImageEmbedder:
    def __init__(self, model_name="hf-hub:Marqo/marqo-fashionCLIP"):
        logger.info(f"Loading FashionCLIP model: {model_name}")
        self.model, _, self.preprocess = open_clip.create_model_and_transforms(
            model_name
        )
        self.model.eval()
        logger.info("CLIP model loaded successfully")

    def generate_embedding(self, image_bytes: bytes) -> list[float]:
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            # Adding a batch dimension since we only process one item
            image_tensor = self.preprocess(image).unsqueeze(0)

            # No gradient since we are doing inference and not training and don't need gradient descent
            with torch.no_grad():
                embedding = self.model.encode_image(image_tensor)
                # L2 normalization of the vector
                embedding = embedding / embedding.norm(dim=-1, keepdim=True)

            return embedding.squeeze().tolist()
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            raise ImageEmbeddingError(f"Failed to generate embedding: {e}")
