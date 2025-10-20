import os

os.environ["U2NET_HOME"] = "/tmp/.u2net"

import logging
from typing import Optional
from PIL import Image, ImageEnhance
from rembg import remove, new_session
import io
import numpy as np

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BackgroundRemovalError(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)

class BackgroundRemover:
    SUPPORTED_FORMATS = {'.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif', '.tiff', '.tif', '.avif'}
    
    def __init__(self, use_cloth_seg: bool = False):
        model_name = 'u2net_cloth_seg' if use_cloth_seg else 'isnet-general-use'
        self.use_cloth_seg = use_cloth_seg
        self.session = None
        self.active_model = model_name
        self._initialize_session(model_name)
    
    def _initialize_session(self, model_name: str) -> None:
        try:
            self.session = new_session(model_name)
            logger.info(f"Successfully initialized with {model_name}")
        except Exception as e:
            raise BackgroundRemovalError(f"Failed to initialize {model_name}: {e}")
    
    def _validate_input_file(self, input_path: str) -> None:
        """Only used for manual testing"""
        if not os.path.exists(input_path):
            raise FileNotFoundError(f"Input image file does not exist: {input_path}")
        
        if not os.path.isfile(input_path):
            raise ValueError(f"Input path is not a file: {input_path}")
        
        file_ext = os.path.splitext(input_path)[1].lower()
        if file_ext not in self.SUPPORTED_FORMATS:
            raise ValueError(f"Unsupported file format: {file_ext}. Supported formats: {self.SUPPORTED_FORMATS}")
    
    def _prepare_image_for_processing(self, image: Image.Image) -> Image.Image:
        """
        Prepare image for background removal:
        1. Convert transparency to white background if needed
        2. Ensure RGB format for processing
        3. Apply slight contrast enhancement for better results
        """
        # Handle images with existing transparency
        if image.mode in ('RGBA', 'LA'):
            white_background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'RGBA':
                white_background.paste(image, mask=image.split()[-1])
            else:  # LA mode
                white_background.paste(image, mask=image.split()[-1])
            image = white_background
            logger.info("Converted transparent image to white background")
        elif image.mode != 'RGB':
            image = image.convert('RGB')
            logger.info(f"Converted image from {image.mode} to RGB")
      
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.1)
        
        return image
    
    def _remove_background_with_alpha_matting_and_fallback(self, image: Image.Image) -> Image.Image:
        try:
            output_image = remove(
                image,
                session=self.session,
                alpha_matting=True,
                alpha_matting_background_threshold=270,
                alpha_matting_foreground_threshold=15,
                alpha_matting_erode_size=5
            )
            result = self._ensure_pil_image(output_image)
            return result
        except Exception as e:
            logger.warning(f"Alpha matting failed with {self.active_model}: {e}. Using basic removal...")
            try:
                output_image = remove(image, session=self.session)
                result = self._ensure_pil_image(output_image)
                return result
            except Exception as fallback_error:
                raise BackgroundRemovalError(f"Background removal failed: {fallback_error}")

    def _ensure_pil_image(self, output_image) -> Image.Image:
        if isinstance(output_image, Image.Image):
            return output_image
        elif isinstance(output_image, bytes):
            return Image.open(io.BytesIO(output_image))
        elif isinstance(output_image, np.ndarray):
            return Image.fromarray(output_image)
        else:
            raise BackgroundRemovalError("Unknown output type from rembg.remove")
    
    def remove_background_from_file(self, input_path: str, output_path: str) -> None:
        try:
            logger.info(f"Processing file: {input_path}")
            
            self._validate_input_file(input_path)
            
            try:
                input_image = Image.open(input_path)
            except Exception as e:
                raise FileNotFoundError(f"Failed to load image: {e}")
            
            prepared_image = self._prepare_image_for_processing(input_image)
            
            logger.info(f"Removing background using {self.active_model}...")
            result_image = self._remove_background_with_alpha_matting_and_fallback(prepared_image)
            
            logger.info(f"Saving result to: {output_path}")
            result_image.save(output_path, format="PNG", optimize=True)
            
            logger.info(f"Background removal completed successfully using {self.active_model}")

        except FileNotFoundError as e:
            raise FileNotFoundError(e)     
        except Exception as e:
            logger.error(f"Background removal failed: {str(e)}")
            raise BackgroundRemovalError(f"Background removal failed: {str(e)}")
    
    def remove_background_from_bytes(self, image_bytes: bytes) -> Optional[bytes]:
        try:
            logger.info("Processing image from bytes")
            
            try:
                input_image = Image.open(io.BytesIO(image_bytes))
            except Exception as e:
                logger.error(f"Failed to load image from bytes: {e}")
                raise BackgroundRemovalError(f"Failed to load image from bytes: {e}")
            
            prepared_image = self._prepare_image_for_processing(input_image)
            
            logger.info(f"Removing background using {self.active_model}...")
            result_image = self._remove_background_with_alpha_matting_and_fallback(prepared_image)
            
            output_buffer = io.BytesIO()
            result_image.save(output_buffer, format="PNG", optimize=True)
            result_bytes = output_buffer.getvalue()
            
            logger.info(f"Background removal completed using {self.active_model}. Output size: {len(result_bytes):,} bytes")
            return result_bytes
            
        except Exception as e:
            logger.error(f"Failed to process image from bytes: {e}")
            raise BackgroundRemovalError(f"Failed to process image from bytes: {e}")


# Local testing
if __name__ == "__main__":
    import sys
    
    input_path = "./inputs/test.jpg"
    output_path = "./outputs/test_no_bg.png"
    use_cloth_seg = "--cloth-seg" in sys.argv

    logger.info("Starting background removal test...")
    try:
        remover = BackgroundRemover(use_cloth_seg)
        
        remover.remove_background_from_file(input_path, output_path)
        
        logger.info("Testing bytes-based processing...")
        with open(input_path, 'rb') as f:
            image_bytes = f.read()
        
        result_bytes = remover.remove_background_from_bytes(image_bytes)
        
        if result_bytes:
            bytes_output_path = "./outputs/test_bytes_output.png"
            with open(bytes_output_path, 'wb') as f:
                f.write(result_bytes)
            logger.info(f"Bytes processing succeeded")
            logger.info(f"Bytes output saved to: {os.path.abspath(bytes_output_path)}")
        else:
            logger.error("Bytes processing failed")
            
    except Exception as e:
        logger.error(f"Test failed with error: {e}")
    
    logger.info("\nTesting completed!")