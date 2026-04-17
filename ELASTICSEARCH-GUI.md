# Elasticsearch GUI Tools Guide

## Option 1: Kibana (Recommended 🌟)

**Kibana** is the official Elasticsearch UI - like MongoDB Compass for Elasticsearch.

### Setup (Already added to docker-compose.yml)

1. **Start/Restart Docker services:**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

2. **Wait for Kibana to start** (takes ~30-60 seconds)
   ```bash
   docker logs -f ecommerce-kibana
   # Wait for "Kibana is now available"
   ```

3. **Open Kibana in browser:**
   ```
   http://localhost:5601
   ```

### How to View Your Products Index

#### Method 1: Dev Tools (Best for queries)

1. Open: **http://localhost:5601**
2. Click on the hamburger menu (☰) → **Management** → **Dev Tools**
3. Try these queries:

```json
# Get all products
GET products/_search
{
  "query": {
    "match_all": {}
  }
}

# Search for specific product
GET products/_search
{
  "query": {
    "match": {
      "title": "shirt"
    }
  }
}

# Get product by ID
GET products/_doc/YOUR_PRODUCT_ID

# View index mapping
GET products/_mapping

# View index settings
GET products/_settings

# Count documents
GET products/_count
```

#### Method 2: Discover (Best for browsing)

1. Open: **http://localhost:5601**
2. Go to **Management** → **Stack Management** → **Index Patterns**
3. Click **Create index pattern**
4. Type: `products*`
5. Click **Next step** → **Create index pattern**
6. Go to **Discover** (left sidebar)
7. Select **products*** from dropdown
8. Browse your data like a table!

#### Method 3: Search Profiler (Best for debugging)

1. Open: **http://localhost:5601**
2. Go to **Management** → **Dev Tools** → **Search Profiler**
3. Paste your query and click **Profile**
4. See detailed performance metrics

### Useful Kibana Features

| Feature | Purpose | Location |
|---------|---------|----------|
| **Dev Tools** | Run Elasticsearch queries | Management → Dev Tools |
| **Discover** | Browse data like a table | Discover (sidebar) |
| **Dashboard** | Create visualizations | Dashboard (sidebar) |
| **Index Management** | Manage indices | Management → Index Management |
| **Search Profiler** | Debug query performance | Dev Tools → Search Profiler |

---

## Option 2: Elasticvue (Lightweight Browser Extension)

**Best for:** Quick data browsing without installing anything heavy

### Installation

1. Install Chrome/Firefox extension:
   - Chrome: [Elasticvue Extension](https://chrome.google.com/webstore/detail/elasticvue/hkedbapjpblbodpgbajblpnlpenaebaa)
   - Firefox: [Elasticvue Add-on](https://addons.mozilla.org/en-US/firefox/addon/elasticvue/)

2. Click on extension icon
3. Connect to: `http://localhost:9200`
4. Browse your `products` index

### Features:
- ✅ Browse indices and documents
- ✅ Run queries
- ✅ Lightweight (no server needed)
- ✅ Simple UI

---

## Option 3: Dejavu (Web-based UI)

**Best for:** Simple, modern UI without installation

### Using Docker:
```bash
docker run -p 1358:1358 -d appbaseio/dejavu
```

### Using Online Version:
1. Go to: **https://dejavu.appbase.io/**
2. Connect to: `http://localhost:9200`
3. Select index: `products`
4. Browse and edit data

### Features:
- ✅ Modern UI like MongoDB Compass
- ✅ Edit documents inline
- ✅ Import/Export data
- ✅ Build queries visually

---

## Option 4: Direct HTTP Requests (No GUI)

### Using curl:
```bash
# Get all products
curl http://localhost:9200/products/_search?pretty

# Search for shirts
curl -X GET "http://localhost:9200/products/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match": {
      "title": "shirt"
    }
  }
}
'

# Get index info
curl http://localhost:9200/products?pretty

# Count products
curl http://localhost:9200/products/_count?pretty
```

### Using VS Code REST Client:
1. Install "REST Client" extension
2. Create `elasticsearch.http` file:

```http
### Get all products
GET http://localhost:9200/products/_search
Content-Type: application/json

{
  "query": {
    "match_all": {}
  }
}

### Search for shirt
GET http://localhost:9200/products/_search
Content-Type: application/json

{
  "query": {
    "match": {
      "title": "shirt"
    }
  }
}
```

---

## Option 5: Postman

1. Create new request
2. Method: **GET**
3. URL: `http://localhost:9200/products/_search`
4. Headers:
   - `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "query": {
    "match_all": {}
  }
}
```

---

## Quick Comparison

| Tool | Best For | Pros | Cons |
|------|----------|------|------|
| **Kibana** 🌟 | Everything | Official, powerful, full-featured | Heavy (~500MB) |
| **Elasticvue** | Quick browsing | Lightweight, browser extension | Limited features |
| **Dejavu** | Visual exploration | Modern UI, easy to use | Requires browser/Docker |
| **Dev Tools** | Queries & debugging | Fast, built into Kibana | No visual browsing |
| **curl/Postman** | Testing APIs | Simple, scriptable | No GUI |

---

## Recommended Workflow

### For Development (What I Recommend):
1. **Kibana** - For serious work and debugging
2. **Elasticvue** - For quick checks

### For Production Monitoring:
1. **Kibana** with dashboards
2. **Elasticsearch monitoring** built-in

---

## Common Kibana Queries for Your Project

Open Dev Tools (http://localhost:5601/app/dev_tools#/console) and try:

```json
# 1. Get all products
GET products/_search

# 2. Search with filter
GET products/_search
{
  "query": {
    "bool": {
      "must": {
        "match": { "category": "shirt" }
      },
      "filter": {
        "term": { "color": "blue" }
      }
    }
  }
}

# 3. Test autocomplete
GET products/_search
{
  "query": {
    "match": {
      "title.autocomplete": "shi"
    }
  }
}

# 4. Get aggregations (facets)
GET products/_search
{
  "size": 0,
  "aggs": {
    "brands": {
      "terms": { "field": "brand" }
    },
    "categories": {
      "terms": { "field": "category" }
    }
  }
}

# 5. Test fuzzy search (misspellings)
GET products/_search
{
  "query": {
    "match": {
      "title": {
        "query": "shrit",
        "fuzziness": "AUTO"
      }
    }
  }
}

# 6. View index stats
GET products/_stats

# 7. Check index health
GET _cluster/health

# 8. Delete and recreate index (careful!)
DELETE products
```

---

## Troubleshooting

### Kibana not loading?
```bash
# Check if Kibana is running
docker ps | grep kibana

# Check logs
docker logs ecommerce-kibana

# Restart Kibana
docker-compose restart kibana
```

### Can't connect to Elasticsearch?
```bash
# Test Elasticsearch directly
curl http://localhost:9200

# Should return cluster info
```

### Index pattern not showing?
1. Make sure you've seeded data first: `pnpm seed:large`
2. In Kibana, create index pattern with `products*`
3. Refresh the index pattern

---

## Next Steps

1. **Start Kibana**: `docker-compose up -d`
2. **Open**: http://localhost:5601
3. **Go to Dev Tools**: Management → Dev Tools
4. **Run**: `GET products/_search`
5. **Explore your data!**

For quick viewing, I also recommend installing **Elasticvue** browser extension - it's like a mini MongoDB Compass for Elasticsearch.
