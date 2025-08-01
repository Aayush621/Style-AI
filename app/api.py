from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any 
import io 
import os
import torch
import clip 
from PIL import Image 
import os
from qdrant_client import QdrantClient, models 

from dotenv import load_dotenv

load_dotenv()

#  --- Configuration ---

def set_env(name: str):
    env_value = os.getenv(name)
    if env_value is None:
        raise ValueError(f"Environment variable {name} is not set.")
    os.environ[name] = env_value


set_env("QDRANT_URL")
set_env("QDRANT_API_KEY") 
set_env("S3_BUCKET_BASE_URL")

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
S3_BUCKET_BASE_URL = os.getenv("S3_BUCKET_BASE_URL")

# --- Global Variables / Configuration (Load once on startup) ---
CLIP_MODEL: Optional[Any] = None 
CLIP_PREPROCESS: Optional[Any] = None
QDRANT_CLIENT: Optional[QdrantClient] = None
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Configuration
CLIP_MODEL_NAME = 'ViT-B/32'
QDRANT_HOST = "localhost"
QDRANT_PORT = 6333
IMAGE_COLLECTION_NAME = "fashion_product_images"
TOP_N_DEFAULT = 4

print("--- CONFIGURATION CHECK ---")
print(f"S3_BUCKET_BASE_URL as seen by the app: {S3_BUCKET_BASE_URL}")
print("---------------------------")
# --- Pydantic Models (Request and Response Schemas) ---

class TextSearchQuery(BaseModel):
    query_text: str = Field(..., min_length=1, description="The text query for searching fashion items.")
    top_n: int = Field(default=TOP_N_DEFAULT, gt=0, le=20, description="Number of results to return.")


class ProductSuggestion(BaseModel):
    rank: int
    product_id_str: Optional[str] = Field(None, alias="productIdStr")
    name: Optional[str] = None
    category: Optional[str] = None
    score: float
    image_url: Optional[str] = Field(None, description="Public URL to the product image.", alias="imageUrl")

    class Config:
        populate_by_name = True

class SearchResponse(BaseModel):
    query_type: str = Field(..., alias="queryType")
    query_content: Optional[Dict[str, Any]] = Field(None, alias="queryContent") # Updated to Dict[str, Any]
    results: List[ProductSuggestion]

    class Config:
        populate_by_name = True


# --- FastAPI Application Instance ---
app = FastAPI(
    title="Fashion Suggestion AI API",
    description="API for suggesting fashion products based on text or image queries.",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Lifespan Events (for model loading/unloading, DB connections) ---
@app.on_event("startup")
async def startup_event():
    global CLIP_MODEL, CLIP_PREPROCESS, QDRANT_CLIENT
    print(f"Loading CLIP model ('{CLIP_MODEL_NAME}') on {DEVICE}...")
    try:
        CLIP_MODEL, CLIP_PREPROCESS = clip.load(CLIP_MODEL_NAME, device=DEVICE)
        CLIP_MODEL.eval()
        print("CLIP model loaded successfully.")
    except Exception as e:
        print(f"FATAL: Could not load CLIP model: {e}")
        raise RuntimeError(f"Could not load CLIP model: {e}") from e

    print(f"Connecting to Qdrant at {QDRANT_HOST}:{QDRANT_PORT}...")
    print(f"Connecting to Qdrant at {QDRANT_URL.split(':')[0] if QDRANT_URL else 'Not Provided'}...")
    if not QDRANT_URL or not QDRANT_API_KEY:
        raise RuntimeError("QDRANT_URL and QDRANT_API_KEY environment variables are not set.")

    try:
        QDRANT_CLIENT = QdrantClient(
            url=QDRANT_URL,
            api_key=QDRANT_API_KEY,
            timeout=20 # Increase timeout for cloud connections
        )
        collection_info = QDRANT_CLIENT.get_collection(collection_name=IMAGE_COLLECTION_NAME)
        print(f"Connected to Qdrant. Collection '{IMAGE_COLLECTION_NAME}' has {collection_info.points_count} points.")
    except Exception as e:
        print(f"FATAL: Could not connect to Qdrant or collection not found: {e}")
        raise RuntimeError(f"Could not connect to Qdrant or collection not found: {e}") from e
    print("Startup complete.")

@app.on_event("shutdown")
async def shutdown_event():
    print("Shutdown complete.")


def format_qdrant_results(hits: List[models.ScoredPoint]) -> List[ProductSuggestion]:
    suggestions = []
    print(f"DEBUG: Using S3 base URL for formatting: {S3_BUCKET_BASE_URL}")
    for i, hit in enumerate(hits):
        payload = hit.payload if hit.payload else {}
        product_id = payload.get("product_id_str")
        
        image_url = None
        if product_id and S3_BUCKET_BASE_URL:
            image_url = f"{S3_BUCKET_BASE_URL}/{product_id}.jpg"

        suggestions.append(
            ProductSuggestion(
                rank=i + 1,
                productIdStr=product_id,
                name=payload.get("productDisplayName"),
                category=payload.get("masterCategory"),
                score=hit.score,
                imageUrl=image_url
            )
        )
    return suggestions

# --- API Endpoints ---

@app.get("/health", summary="Check API Health", response_model=Dict[str, str])
async def health_check():
    if CLIP_MODEL is None or QDRANT_CLIENT is None:
        raise HTTPException(status_code=503, detail="Service not ready: Models or DB not initialized.")
    return {"status": "ok", "message": "API is healthy"}


@app.post("/search/text-to-image", response_model=SearchResponse, summary="Search by Text Query")
async def api_text_to_image_search(query: TextSearchQuery):
    if QDRANT_CLIENT is None or CLIP_MODEL is None:
        raise HTTPException(status_code=503, detail="Service not fully initialized.")

    print(f"API: Received text query: '{query.query_text}', top_n: {query.top_n}")
    try:
        with torch.no_grad():
            text_input = clip.tokenize([query.query_text]).to(DEVICE)
            query_embedding_tensor = CLIP_MODEL.encode_text(text_input)
            query_embedding_tensor /= query_embedding_tensor.norm(dim=-1, keepdim=True)
        query_vector = query_embedding_tensor.cpu().numpy().squeeze().tolist()

        search_hits = QDRANT_CLIENT.search(
            collection_name=IMAGE_COLLECTION_NAME,
            query_vector=query_vector,
            limit=query.top_n,
            with_payload=True
        )
        
        results = format_qdrant_results(search_hits)
        return SearchResponse(
            queryType="text",
            queryContent={"text": query.query_text, "top_n": query.top_n},
            results=results
        )
    except Exception as e:
        print(f"Error during text search: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing text search: {str(e)}")


@app.post("/search/image-to-image", response_model=SearchResponse, summary="Search by Image Query")
async def api_image_to_image_search(
    top_n: Optional[int] = Form(TOP_N_DEFAULT, gt=0, le=20, description="Number of results to return."),
    query_image: UploadFile = File(..., description="Image file to search for similar items.")
):
    if QDRANT_CLIENT is None or CLIP_MODEL is None or CLIP_PREPROCESS is None:
        raise HTTPException(status_code=503, detail="Service not fully initialized.")

    print(f"API: Received image query: {query_image.filename}, top_n: {top_n}")

    if not query_image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image (e.g., JPEG, PNG).")

    try:
        image_bytes = await query_image.read() # Read image bytes
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        with torch.no_grad():
            image_input = CLIP_PREPROCESS(pil_image).unsqueeze(0).to(DEVICE)
            query_embedding_tensor = CLIP_MODEL.encode_image(image_input)
            query_embedding_tensor /= query_embedding_tensor.norm(dim=-1, keepdim=True)
        query_vector = query_embedding_tensor.cpu().numpy().squeeze().tolist()

        search_hits_raw = QDRANT_CLIENT.search(
            collection_name=IMAGE_COLLECTION_NAME,
            query_vector=query_vector,
            limit=top_n + 1, 
            with_payload=True
        )

        final_hits = search_hits_raw[:top_n] # Taking the top_n actual results

        results = format_qdrant_results(final_hits)
        return SearchResponse(
            queryType="image",
            queryContent={"filename": query_image.filename, "content_type": query_image.content_type, "top_n": top_n},
            results=results
        )
    except Exception as e:
        print(f"Error during image search: {e}")

        raise HTTPException(status_code=500, detail=f"Error processing image search: {str(e)}")
    finally:
        await query_image.close() 


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.api:app", host="0.0.0.0", port=8000, reload=True)