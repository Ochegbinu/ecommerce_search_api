# Ecommerce Search API

A scalable Node.js + Express API for product search with autosuggestion, semantic search, and fuzzy matching, powered by MongoDB and Elasticsearch.

## Tech Stack
- **Node.js + Express**
- **TypeScript**
- **MongoDB** (Primary storage)
- **Elasticsearch** (Search engine)

## Features
- **Autosuggestion**: Fast edge-ngram based suggestions.
- **Fuzzy Search**: Handles misspellings automatically.
- **Semantic Search**: Multi-match search across title, category, tags, and description with field boosting.
- **Scalability**: Decoupled search engine (Elasticsearch) to handle millions of records.

## Prerequisites
- Node.js v18+
- MongoDB
- Elasticsearch

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Configure environment variables (create `.env` from `.env.example`):
   ```bash
   cp .env.example .env
   ```

3. Seed the database:
   ```bash
   pnpm seed
   ```

4. Start the server:
   ```bash
   pnpm start
   ```

## Local Setup with Docker (Optional)
If you don't have MongoDB and Elasticsearch installed locally, you can use Docker:
```bash
# Start MongoDB and Elasticsearch
docker run -d --name mongodb -p 27017:27017 mongo
docker run -d --name elasticsearch -p 9200:9200 -e "discovery.type=single-node" -e "xpack.security.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:8.12.2
```

## API Endpoints

### 1. Autosuggestion
**GET** `/api/suggest?q=shi`

Response:
```json
["Plot T-Shirt", "Cotton White Shirt"]
```

### 2. Search
**GET** `/api/search?q=cotton shirt`

Supports fuzzy matching and priority boosting.

### 3. Add Product
**POST** `/api/products`

```json
{
  "title": "Plot T-Shirt",
  "brand": "Lee Cooper",
  "description": "Red cotton half sleeve t-shirt",
  "section": "fashion",
  "category": "tshirt",
  "sub_category": "half-sleeve",
  "tags": ["red", "cotton", "men"],
  "price": "343USD",
  "color": "red"
}
```

## Architecture
- **MongoDB**: Acts as the source of truth for product data.
- **Elasticsearch**: Indices are kept in sync for high-performance searching.
- **Search Logic**: Uses `edge_ngram` tokenizer for real-time suggestions and `multi_match` with `fuzziness: AUTO` for robust search.
# ecommerce_search_api
# ecommerce_search_api
