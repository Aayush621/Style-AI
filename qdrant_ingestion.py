import numpy as np
import os
import pandas as pd
from qdrant_client import QdrantClient, models
from qdrant_client.http.models import PointStruct, Distance, VectorParams
from dotenv import load_dotenv
import time

load_dotenv()

# --- Configuration ---

# Set environment variables
def set_env(name: str):
    env_value = os.getenv(name)
    if env_value is None:
        raise ValueError(f"Environment variable {name} is not set.")
    os.environ[name] = env_value

# Set required environment variables
set_env("QDRANT_URL")
set_env("QDRANT_API_KEY") 


QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_HOST = "localhost"
QDRANT_PORT = 6333 # gRPC port
IMAGE_COLLECTION_NAME = "fashion_product_images"
# TEXT_COLLECTION_NAME = "fashion_product_texts" # If you also want to store CLIP text embeddings of products

IMAGE_EMBEDDINGS_FILE = 'embeddings/image_embeddings_aligned.npy'
TEXT_EMBEDDINGS_FILE = 'embeddings/text_embeddings_aligned.npy'
PRODUCT_IDS_FILE = 'embeddings/product_ids_aligned.npy'
IMAGE_PATHS_FILE = 'data/image_paths_dl.txt'
PRODUCT_CATALOG_FILE = 'data/styles.csv' # Needed for payload metadata

# For fused CLIP (image + text), dim remains 512 after averaging
EMBEDDING_DIM = 512 # Make sure this matches your CLIP model's output dimension
BATCH_SIZE_QDRANT = 100 # How many points to upsert at a time

if not QDRANT_URL or not QDRANT_API_KEY:
    raise ValueError("QDRANT_URL and QDRANT_API_KEY environment variables must be set.")

# --- Initialize Qdrant Client ---
try:
    # Connect to Qdrant Cloud
    client = QdrantClient(
        url=QDRANT_URL,
        api_key=QDRANT_API_KEY,
        timeout=120
    )
    print(f"Successfully connected to Qdrant Cloud at {QDRANT_URL.split(':')[0]}")
except Exception as e:
    print(f"Could not connect to Qdrant Cloud: {e}")
    exit()



def create_collection_if_not_exists(collection_name, vector_size, distance_metric=models.Distance.COSINE):
    """Creates a Qdrant collection if it doesn't already exist."""
    try:
        client.get_collection(collection_name=collection_name)
        print(f"Collection '{collection_name}' already exists.")
    except Exception: # Catches specific exception for collection not found if library provides one
        print(f"Collection '{collection_name}' not found. Creating new collection.")
        client.recreate_collection(
            collection_name=collection_name,
            vectors_config=models.VectorParams(size=vector_size, distance=distance_metric)
        )
        print(f"Collection '{collection_name}' created successfully.")

def ingest_fused_embeddings():
    print(f"Loading CLIP image and text embeddings...")
    try:
        image_embeddings = np.load(IMAGE_EMBEDDINGS_FILE)
        text_embeddings = np.load(TEXT_EMBEDDINGS_FILE)
        product_ids_ordered = np.load(PRODUCT_IDS_FILE)

        if image_embeddings.shape != text_embeddings.shape:
            raise ValueError("Image and text embeddings must have same shape")

        if len(image_embeddings) != len(product_ids_ordered):
            raise ValueError("Number of embeddings and product IDs must match")

       # Fuse: Weighted average (adjust weights; alt: np.concatenate([image, text], axis=1) for 1024D)
        fused_embeddings = 0.6 * image_embeddings + 0.4 * text_embeddings
        fused_embeddings /= np.linalg.norm(fused_embeddings, axis=1, keepdims=True)  # Normalize
        
        print(f"SUCCESS: Loaded and fused {fused_embeddings.shape[0]} embeddings.")
    except Exception as e:
        print(f"FATAL ERROR loading embeddings: {e}. Exiting.")
        return

    # 2. Load Product Catalog for metadata payload
    try:
        products_df_original = pd.read_csv(PRODUCT_CATALOG_FILE, on_bad_lines='skip')
        products_df = products_df_original.copy()
        products_df['id'] = products_df['id'].astype(str) # Ensure string ID
        products_df.set_index('id', inplace=True)
        print("Product catalog loaded for metadata.")
    except Exception as e:
        print(f"Error loading product catalog: {e}")
        # Continue without metadata if catalog fails, but warn
        products_df = None
        print("Warning: Proceeding without product catalog metadata for payload.")


    # 3. Prepare and Upsert Points (Embeddings + Payload)
    print("STEP 3: Preparing points for upsert...")
    points_to_upsert = []
    total_points = len(product_ids_ordered)

    for i in range(total_points):
        # Optional: Print progress every so often
        if (i + 1) % 5000 == 0:
            print(f"  Processed {i+1}/{total_points} points...")

        product_id_str = str(product_ids_ordered[i])  # Extract ID as string
        embedding = fused_embeddings[i].tolist()  # Qdrant expects list for vector

        # Create payload (metadata)
        payload = {"product_id_str": product_id_str}

        if products_df is not None and product_id_str in products_df.index:
                product_info = products_df.loc[product_id_str]
                payload["productDisplayName"] = product_info.get('productDisplayName', 'N/A')
                payload["masterCategory"] = product_info.get('masterCategory', 'N/A')
                # Add any other relevant metadata from your catalog
        else: # product_id not in catalog or catalog not loaded
                payload["productDisplayName"] = "N/A (Not in Catalog)"
                payload["masterCategory"] = "N/A"

        # For this example, let's use index 'i' as the point ID.
        points_to_upsert.append(PointStruct(id=i, vector=embedding, payload=payload))
   
        if len(points_to_upsert) >= BATCH_SIZE_QDRANT:
            print(f"  Attempting to upsert batch of {len(points_to_upsert)} points...")
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    client.upsert(collection_name=IMAGE_COLLECTION_NAME, points=points_to_upsert, wait=True)
                    print(f"  SUCCESS: Upserted batch.")
                    points_to_upsert = []
                    break
                except Exception as e:
                    print(f"FATAL ERROR during batch upsert: {e}. Exiting.")
                    time.sleep(5 * (attempt + 1))
            else :
                 print(f"FATAL ERROR after {max_retries} retries. Exiting.")
                 return



   # Upsert any remaining points
    if points_to_upsert:
        print(f"  Attempting to upsert final batch of {len(points_to_upsert)} points...")
        max_retries = 3
        for attempt in range(max_retries):
            try:
                client.upsert(collection_name=IMAGE_COLLECTION_NAME, points=points_to_upsert, wait=True)
                print(f"  SUCCESS: Upserted final batch.")
            except Exception as e:
                print(f"FATAL ERROR during final upsert: {e}. Exiting.")
                return # Exit function
        else:
            print(f"FATAL ERROR after {max_retries} retries. Exiting.")
            return
        
    print("STEP 4: Verifying final count in Qdrant...")
    try:
        final_count = client.get_collection(IMAGE_COLLECTION_NAME).points_count
        print(f"--- INGESTION FINISHED ---")
        print(f"Final verified count in Qdrant collection '{IMAGE_COLLECTION_NAME}': {final_count} points.")
    except Exception as e:
        print(f"FATAL ERROR verifying final count: {e}")
        
if __name__ == "__main__":
 # Recreate collection to ensure a clean ingestion with fused dim
    print(f"Recreating collection '{IMAGE_COLLECTION_NAME}' to ensure a clean ingestion...")
    client.recreate_collection(
        collection_name=IMAGE_COLLECTION_NAME,
        vectors_config=models.VectorParams(size=EMBEDDING_DIM, distance=models.Distance.COSINE)
    )
    ingest_fused_embeddings()