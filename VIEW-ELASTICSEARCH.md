# Quick Elasticsearch Viewer (No Kibana Needed)

## ✅ Browser Method (Simplest!)

### View All Products
Open in browser:
```
http://localhost:9200/products/_search?pretty
```

### Search for Specific Items
```
http://localhost:9200/products/_search?q=shirt&pretty
http://localhost:9200/products/_search?q=blue&pretty
http://localhost:9200/products/_search?q=cotton&pretty
```

### Get Index Info
```
http://localhost:9200/products?pretty
```

### Count Products
```
http://localhost:9200/products/_count?pretty
```

---

## ✅ Elasticvue Browser Extension (Recommended!)

**Best alternative to Kibana** - No network issues, no Docker!

### Installation:

**Chrome:**
1. Go to: https://chrome.google.com/webstore/detail/elasticvue/hkedbapjpblbodpgbajblpnlpenaebaa
2. Click "Add to Chrome"
3. Click extension icon in toolbar
4. Connect to: `http://localhost:9200`
5. Browse `products` index

**Firefox:**
1. Go to: https://addons.mozilla.org/en-US/firefox/addon/elasticvue/
2. Click "Add to Firefox"
3. Follow same steps as Chrome

### Features:
- ✅ Browse indices like MongoDB Compass
- ✅ Search and filter data
- ✅ View document details
- ✅ Run custom queries
- ✅ No installation needed (just extension)

---

## ✅ curl Commands (Terminal)

### View all products:
```bash
curl http://localhost:9200/products/_search?pretty
```

### View first 5 products:
```bash
curl -X GET "http://localhost:9200/products/_search?pretty&size=5"
```

### Search for shirts:
```bash
curl -X GET "http://localhost:9200/products/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match": {
      "title": "shirt"
    }
  }
}
'
```

### Get all blue products:
```bash
curl -X GET "http://localhost:9200/products/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "term": {
      "color": "blue"
    }
  }
}
'
```

### View index mapping:
```bash
curl http://localhost:9200/products/_mapping?pretty
```

---

## ✅ VS Code REST Client

1. **Install Extension:**
   - Open VS Code
   - Extensions → Search "REST Client"
   - Install by Huachao Mao

2. **Create file:** `elasticsearch-queries.http`

3. **Add queries:**

```http
### Get all products
GET http://localhost:9200/products/_search?pretty

### Search for shirts
GET http://localhost:9200/products/_search
Content-Type: application/json

{
  "query": {
    "match": {
      "title": "shirt"
    }
  }
}

### Filter by color
GET http://localhost:9200/products/_search
Content-Type: application/json

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

### Get aggregations (facets)
GET http://localhost:9200/products/_search
Content-Type: application/json

{
  "size": 0,
  "aggs": {
    "brands": {
      "terms": { "field": "brand", "size": 10 }
    },
    "categories": {
      "terms": { "field": "category", "size": 10 }
    },
    "colors": {
      "terms": { "field": "color", "size": 10 }
    }
  }
}

### Test autocomplete
GET http://localhost:9200/products/_search
Content-Type: application/json

{
  "query": {
    "match": {
      "title.autocomplete": "shi"
    }
  }
}

### Count products
GET http://localhost:9200/products/_count

### View index info
GET http://localhost:9200/products

### View cluster health
GET http://localhost:9200/_cluster/health
```

4. **Click "Send Request"** above each query to run it

---

## ✅ Postman

### Setup:
1. Open Postman
2. Create new request
3. Method: **GET**
4. URL: `http://localhost:9200/products/_search`

### Common Requests:

**1. Get All Products:**
- Method: GET
- URL: `http://localhost:9200/products/_search`
- Send

**2. Search Query:**
- Method: GET
- URL: `http://localhost:9200/products/_search`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "query": {
    "match": {
      "title": "shirt"
    }
  }
}
```

**3. Filter by Category:**
```json
{
  "query": {
    "term": {
      "category": "shirt"
    }
  },
  "size": 10
}
```

**4. Complex Search:**
```json
{
  "query": {
    "bool": {
      "must": {
        "match": { "title": "cotton" }
      },
      "filter": [
        { "term": { "section": "fashion" } },
        { "range": { "price_val": { "gte": 100, "lte": 1000 } } }
      ]
    }
  },
  "sort": [
    { "price_val": "asc" }
  ]
}
```

---

## 🔧 Fix Kibana Network Issue (Optional)

If you want to fix Kibana later:

### Option 1: Check Internet Connection
```bash
# Test connectivity
ping docker.elastic.co
```

### Option 2: Use VPN or Different Network
Sometimes corporate networks block Docker registry

### Option 3: Pull Image Manually
```bash
docker pull docker.elastic.co/kibana/kibana:8.11.0
```

### Option 4: Use Alternative Kibana Image
Try official Elasticsearch Docker Hub:
```yaml
kibana:
  image: kibana:8.11.0  # Alternative registry
```

---

## 📊 My Recommendation

**For NOW:**
1. **Install Elasticvue extension** (2 minutes, works perfectly)
2. **Use browser** for quick checks: `http://localhost:9200/products/_search?pretty`
3. **Use VS Code REST Client** for complex queries

**For LATER:**
- Fix network and uncomment Kibana in docker-compose.yml
- Or just stick with Elasticvue - it's actually quite good!

---

## 🚀 Quick Start Now

```bash
# 1. Start services (without Kibana)
docker-compose up -d

# 2. Verify Elasticsearch is running
curl http://localhost:9200

# 3. View your products in browser
# Open: http://localhost:9200/products/_search?pretty

# 4. Or install Elasticvue extension
# Chrome: https://chrome.google.com/webstore/detail/elasticvue/hkedbapjpblbodpgbajblpnlpenaebaa
```

**You're good to go!** 🎉
