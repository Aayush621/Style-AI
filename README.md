# Style-AI
![AWS Deployed Recommendation System](https://github.com/user-attachments/assets/ef9973ff-1b98-4647-b78d-9204f4dbb75d)

A fashion product search engine powered by AI that enables both text-to-image and image-to-image search capabilities using CLIP for multimodal embeddings, Qdrant for vector storage and queries, and AWS S3 for image hosting; developed FastAPI backend, Dockerized it, and deployed on AWS ECS.
Integrated with AWS S3-hosted frontend via AWS CloudFront, secured API with AWS API Gateway for HTTPS, enabling efficient product recommendations.

## 🔍 Features

- **Text-to-Image Search**: Find fashion products using natural language descriptions
- **Image-to-Image Search**: Upload an image to find similar fashion items
- **Vector Similarity Search**: Powered by CLIP embeddings and Qdrant vector database
- **Scalable Architecture**: Load-balanced deployment with multiple app instances
- **REST API**: FastAPI-based API with automatic documentation

## 🛠️ Tech Stack

- **Backend**: FastAPI, Python 3.13
- **AI/ML**: OpenAI CLIP, PyTorch, Sentence Transformers
- **Vector Database**: Qdrant
- **Containerization**: Docker, Docker Compose
- **Data Processing**: Pandas, NumPy, Pillow

## 🚀 Quick Start

### Prerequisites

- Docker
- Python 3.13+ (for local development)

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/Aayush621/Style-AI.git
cd style-ai
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure your `.env` file:
```env
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_api_key
S3_BUCKET_BASE_URL=your_s3_bucket_url
```

### Docker Deployment (Recommended)

```bash
# Access the API
# App instances: http://localhost:8000
```

### Local Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the API server
cd app
uvicorn api:app --reload --port 8000
```

## 📚 API Documentation

Once running, access the interactive API documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Key Endpoints

#### Health Check
```http
GET /health
```

#### Text-to-Image Search
```http
POST /search/text-to-image
Content-Type: application/json

{
  "query": "red summer dress",
  "top_n": 4
}
```

#### Image-to-Image Search
```http
POST /search/image-to-image
Content-Type: multipart/form-data

{
  "image": [uploaded_file],
  "top_n": 4
}
```

## 📁 Project Structure

```
search_ai/
├── app/                    # FastAPI application
│   ├── api.py             # Main API endpoints
│   ├── Dockerfile         # Container configuration
│   └── requirements.txt   # Python dependencies
├── data/                  # Dataset files
│   ├── image_paths_dl.txt # Image file paths
│   └── styles.csv         # Product metadata
├── embeddings/            # Pre-computed embeddings
│   ├── image_embeddings_aligned.npy
│   ├── text_embeddings_aligned.npy
│   └── product_ids_aligned.npy
└── qdrant_ingestion.py   # Data ingestion script
```

## 🔧 Data Setup

### Vector Database Ingestion

```bash
# Run the ingestion script to populate Qdrant
python qdrant_ingestion.py
```

This script:
- Loads fashion product data from CSV
- Processes images with CLIP model
- Stores embeddings in Qdrant vector database
- Aligns text and image embeddings

## 🏗️ Architecture

The system uses a microservices architecture:

- **App Instance**: FastAPI server (port 8000)
- **Qdrant**: Vector database for similarity search
- **CLIP Model**: Text and image embedding generation

## 🔍 How It Works

1. **Text Search**: 
   - User submits text query
   - CLIP generates text embedding
   - Qdrant finds similar image embeddings
   - Returns ranked fashion products

2. **Image Search**:
   - User uploads image
   - CLIP generates image embedding
   - Qdrant finds similar image embeddings
   - Returns visually similar fashion products

## 🛡️ Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `QDRANT_URL` | Qdrant database URL | ✅ |
| `QDRANT_API_KEY` | Qdrant authentication key | ✅ |
| `S3_BUCKET_BASE_URL` | Base URL for product images | ✅ |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚨 Security Note

Never commit `.env` files containing sensitive credentials. Use `.env.example` for templates.
