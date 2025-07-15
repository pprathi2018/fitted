from contextlib import asynccontextmanager
import os
import logging
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import io
from background_removal import BackgroundRemover, BackgroundRemovalError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

model_cache = {}

async def get_or_use_bg_remover_model(use_cloth_seg: bool) -> BackgroundRemover:
  cache_key = 'cloth_seg' if use_cloth_seg else 'general'
  if cache_key not in model_cache:
    logger.info("Instantiating background remover")
    remover = BackgroundRemover(use_cloth_seg)
    model_cache[cache_key] = remover
    return remover
  else:
    logger.info("Using cached background remover")
    return model_cache[cache_key]

app = FastAPI(
    title="Fitted Background Removal API",
    description="Remove backgrounds from clothing images",
    version="1.0.0"
)

# TODO: Update these URLs
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://fitted.vercel.app",  # TODO: Update this
        "*"  # TODO: Remove this in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Fitted Background Removal API",
        "status": "active",
        "endpoints": {
            "health": "/health",
            "remove_background": "/api/remove-background",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "background-removal",
    }

@app.post("/api/remove-background")
async def remove_background(file: UploadFile = File(...), use_cloth_seg: bool = False):
    try:
        remover = await get_or_use_bg_remover_model(use_cloth_seg)
        logger.info("Background remover initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize background remover: {e}")
        raise HTTPException(
            status_code=503, 
            detail="Background removal service is not available. Please try again later."
        )
    
    allowed_types = ["image/jpeg", "image/jpg", "image/png"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}"
        )
    
    try:
        contents = await file.read()
        file_size_mb = len(contents) / (1024 * 1024)
        
        if file_size_mb > 10:
            raise HTTPException(
                status_code=400,
                detail=f"File too large ({file_size_mb:.1f}MB). Maximum size is 10MB."
            )
        
        logger.info(f"Processing image")
        
        result_bytes = remover.remove_background_from_bytes(contents)
        
        if result_bytes is None:
            raise HTTPException(
                status_code=500, 
                detail="Background removal failed. Please try again."
            )
        
        logger.info(f"Successfully processed: {file.filename}")
        
        return Response(
            content=result_bytes, 
            media_type="image/png",
            headers={
                "Cache-Control": "public, max-age=3600",
                "Content-Disposition": f'inline; filename="processed_{file.filename}"'
            }
        )
        
    except BackgroundRemovalError as e:
        logger.error(f"Background removal error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=500, 
            detail="An unexpected error occurred. Please try again."
        )

# local testing
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)