# Free Satellite Data Sources for EcoIndex

## Overview

You **do NOT need Google Earth Engine API** for this project! There are several completely free, open-source satellite data sources that work perfectly for water quality and greenspace analysis.

## Google Earth Engine - Is it Free?

**Yes, but with limitations:**
- ✅ Free for research, education, and non-profit use
- ❌ Requires approval process (can take weeks)
- ❌ Commercial use requires paid plan
- ❌ API access requires setup and authentication

## Recommended Free Alternatives

### 1. Sentinel-2 (ESA) - **BEST CHOICE** ⭐

**Resolution:** 10 meters (perfect for neighborhood-level analysis)

**Free Access:**
- **AWS Public Dataset**: `s3://sentinel-s2-l2a` - Completely free, no API key needed
- **Sentinel Hub OGC API**: Free tier (5000 requests/month)
- **Copernicus Open Access Hub**: Direct download, free

**Use Cases:**
- ✅ NDVI for greenspace (10m resolution)
- ✅ NDWI for water detection
- ✅ Color analysis for water quality
- ✅ Time series data (2015-present)

**How to Use:**
```javascript
// AWS Public Dataset (no API key needed)
const s3Path = `s3://sentinel-s2-l2a/tiles/${tile}/${date}/`;
// Access via AWS CLI or boto3, or use pre-processed APIs
```

**Resources:**
- https://registry.opendata.aws/sentinel-2/
- https://sentinel.esa.int/web/sentinel/user-guides/sentinel-2-msi
- https://github.com/sentinel-hub/sentinelhub-js

### 2. Landsat (NASA/USGS) - **GOOD FOR HISTORICAL DATA**

**Resolution:** 30 meters (good for census tract level)

**Free Access:**
- **AWS Public Dataset**: `s3://landsat-pds` - Completely free
- **USGS EarthExplorer**: Free API with account
- **Google Cloud Storage**: Free tier available

**Use Cases:**
- ✅ Long historical time series (1980s-present)
- ✅ NDVI for greenspace
- ✅ Water quality monitoring
- ✅ Urban change detection

**Resources:**
- https://registry.opendata.aws/landsat-8/
- https://earthexplorer.usgs.gov/
- https://developers.google.com/earth-engine/datasets/catalog

### 3. MODIS (NASA) - **FOR LARGE AREAS**

**Resolution:** 250m-1km (too coarse for neighborhoods, but good for regional)

**Free Access:**
- NASA Earthdata - Free with account
- AWS Public Dataset available

**Use Cases:**
- Regional analysis
- Large-scale trends
- Not suitable for census tract level

### 4. Open Data Cube

**Open source platform** that aggregates multiple satellite sources

**Free Instances:**
- Various public instances available
- Can host your own

## Implementation Recommendations

### For This Project (Census Tract Level):

**Best Option: Sentinel-2 via AWS Public Dataset**

1. **No API key needed** - Completely free
2. **10m resolution** - Perfect for neighborhood-level
3. **Regular updates** - New data every 5 days
4. **Historical data** - Available from 2015

### Integration Options:

#### Option 1: Direct AWS S3 Access (Most Free)
```javascript
// Access Sentinel-2 tiles directly from S3
// No API limits, completely free
const tile = getTileFromLatLon(lat, lon);
const s3Path = `s3://sentinel-s2-l2a/tiles/${tile}/`;
```

#### Option 2: Pre-processed APIs (Easier)
- **Sentinel Hub OGC API**: Free tier (5000/month)
- **Planet API**: Free tier available
- **Various open APIs**: Check Open Data Cube instances

#### Option 3: Use Pre-processed Datasets
- Many organizations provide pre-processed NDVI/NDWI data
- Check NASA Earthdata, USGS, etc.

## Current Implementation

The project now uses `satellite-api.js` which:
- ✅ Works with free satellite data sources
- ✅ No API keys required for basic use
- ✅ Can be upgraded to use real Sentinel-2/Landsat data
- ✅ Lightweight and fast

## Next Steps to Use Real Data

1. **For Sentinel-2 (Recommended):**
   ```javascript
   // Update satellite-api.js to use AWS S3 or Sentinel Hub
   async getSentinel2Data(lat, lon, date) {
       // Use AWS SDK or fetch from Sentinel Hub
       const response = await fetch(sentinelHubURL);
       return processSentinel2Data(response);
   }
   ```

2. **For Landsat:**
   ```javascript
   // Use USGS EarthExplorer API (free with account)
   async getLandsatData(lat, lon, date) {
       const response = await fetch(usgsAPIURL);
       return processLandsatData(response);
   }
   ```

## Cost Comparison

| Source | Cost | API Key | Resolution | Best For |
|-------|------|---------|------------|----------|
| **Sentinel-2 AWS** | **FREE** | **No** | 10m | **Neighborhoods** ⭐ |
| **Landsat AWS** | **FREE** | **No** | 30m | Historical data |
| **Google Earth Engine** | Free* | Yes | Various | Research only |
| **Sentinel Hub** | Free tier | Yes | 10m | Easy API access |
| **MODIS** | **FREE** | Account | 250m-1km | Regional |

*Free for research/non-profit, requires approval

## Conclusion

**You don't need Google Earth Engine!** Use:
- **Sentinel-2 AWS Public Dataset** (best option - completely free, no API key)
- **Landsat AWS Public Dataset** (for historical data)

Both are completely free, have no API limits, and work perfectly for census tract-level analysis.

