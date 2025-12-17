# Spectral Indices Integration Guide

## Overview

This app now uses real spectral indices (NDVI, NDWI, etc.) calculated from Sentinel-2 satellite data. These indices provide accurate measurements of vegetation and water quality.

## Spectral Indices Implemented

### 1. NDVI (Normalized Difference Vegetation Index)
- **Formula**: `NDVI = (NIR - Red) / (NIR + Red)`
- **Range**: -1 to 1
- **Use**: Measures vegetation health and density
- **Sentinel-2 Bands**: B4 (Red, 665nm), B8 (NIR, 842nm)
- **Interpretation**:
  - < 0: Water, clouds, snow
  - 0-0.3: Sparse vegetation, soil
  - 0.3-0.6: Moderate vegetation
  - > 0.6: Dense, healthy vegetation

### 2. NDWI (Normalized Difference Water Index)
- **Formula**: `NDWI = (Green - NIR) / (Green + NIR)`
- **Range**: -1 to 1
- **Use**: Detects water bodies and moisture
- **Sentinel-2 Bands**: B3 (Green, 560nm), B8 (NIR, 842nm)
- **Interpretation**:
  - > 0.3: Water bodies
  - 0-0.3: Moist soil/vegetation
  - < 0: Dry areas

### 3. MNDWI (Modified NDWI)
- **Formula**: `MNDWI = (Green - SWIR) / (Green + SWIR)`
- **Use**: Better water body detection (less affected by built-up areas)
- **Sentinel-2 Bands**: B3 (Green), B11 (SWIR, 1610nm)

### 4. EVI (Enhanced Vegetation Index)
- **Formula**: `EVI = 2.5 * ((NIR - Red) / (NIR + 6*Red - 7.5*Blue + 1))`
- **Use**: Improved vegetation index, less saturation in dense vegetation
- **Advantage**: Better in high biomass areas

### 5. SAVI (Soil-Adjusted Vegetation Index)
- **Formula**: `SAVI = ((NIR - Red) / (NIR + Red + L)) * (1 + L)`
- **Use**: Accounts for soil brightness, better in sparse vegetation

## Open Source Data Sources

### 1. Sentinel-2 AWS Public Dataset ⭐ RECOMMENDED
- **Cost**: Completely FREE
- **API Key**: Not required
- **Access**: AWS S3 bucket
- **Resolution**: 10m (perfect for neighborhoods)
- **Bands**: All 13 spectral bands
- **Update Frequency**: Every 5 days
- **How to Access**:
  ```python
  # Using boto3 (Python)
  import boto3
  s3 = boto3.client('s3')
  # Access: s3://sentinel-s2-l2a/tiles/{TILE}/{DATE}/
  ```
- **URL**: https://registry.opendata.aws/sentinel-2/

### 2. Sentinel Hub OGC API
- **Cost**: Free tier (5000 requests/month)
- **API Key**: Required (free signup)
- **Access**: REST API
- **Resolution**: 10m
- **How to Use**:
  ```javascript
  const url = `https://services.sentinel-hub.com/ogc/wms/{instance-id}?` +
    `SERVICE=WMS&REQUEST=GetMap&LAYERS=TRUE_COLOR&` +
    `BBOX=${lon-0.01},${lat-0.01},${lon+0.01},${lat+0.01}&` +
    `WIDTH=512&HEIGHT=512&FORMAT=image/png`;
  ```
- **URL**: https://www.sentinel-hub.com/

### 3. NASA Worldview
- **Cost**: FREE
- **Access**: Web interface + API
- **Data**: Multiple satellite sources
- **URL**: https://worldview.earthdata.nasa.gov/

### 4. USGS EarthExplorer (Landsat)
- **Cost**: FREE (account required)
- **Resolution**: 30m
- **Access**: API or direct download
- **URL**: https://earthexplorer.usgs.gov/

## Implementation Status

### Current Implementation
- ✅ Spectral indices calculator class
- ✅ NDVI, NDWI, MNDWI, EVI, SAVI calculations
- ✅ Integration with eco-percentile calculator
- ✅ Conversion from indices to quality/coverage percentages
- ⚠️ Currently using simulated data (ready for real API integration)

### To Enable Real Data

#### Option 1: AWS Sentinel-2 (Recommended)
1. Set up AWS account (free tier)
2. Access S3 bucket: `s3://sentinel-s2-l2a/`
3. Update `spectral-indices.js` `fetchSentinel2Bands()` method
4. Use AWS SDK or boto3 to fetch bands

#### Option 2: Sentinel Hub OGC API
1. Sign up at https://www.sentinel-hub.com/
2. Get instance ID (free tier available)
3. Update `fetchSentinel2Bands()` to use OGC WMS API
4. Add instance ID to config

#### Option 3: Google Earth Engine
1. Already integrated with your credentials
2. Can calculate indices server-side
3. Update `ee-integration.js` to return band data
4. Calculate indices in browser

## Band Reference

### Sentinel-2 Bands Used:
- **B2 (Blue)**: 490 nm - Coastal aerosol, water
- **B3 (Green)**: 560 nm - Vegetation, water
- **B4 (Red)**: 665 nm - Vegetation, built-up
- **B8 (NIR)**: 842 nm - Vegetation, biomass
- **B11 (SWIR)**: 1610 nm - Moisture, clouds

### Landsat 8 Bands (Alternative):
- **B2 (Blue)**: 482 nm
- **B3 (Green)**: 562 nm
- **B4 (Red)**: 655 nm
- **B5 (NIR)**: 865 nm
- **B6 (SWIR1)**: 1609 nm

## Performance Considerations

### For Sonoma County (Testing):
- **Area**: ~4,580 sq km
- **Pixels at 10m**: ~45.8 million per image
- **Processing**: Batch processing in chunks
- **Cache**: Results cached to avoid recalculation

### For Full US (Production):
- **Area**: ~9.8 million sq km
- **Pixels**: ~98 billion per image
- **Strategy**: 
  - Pre-process and store indices (not raw bands)
  - Use cloud processing (AWS Lambda, Google Cloud Functions)
  - Cache at multiple levels
  - Serve pre-computed tiles

## Next Steps

1. **Choose data source**: AWS Sentinel-2 (recommended) or Sentinel Hub
2. **Update `fetchSentinel2Bands()`**: Replace simulation with real API calls
3. **Add caching layer**: Store processed indices
4. **Optimize**: Pre-compute indices for common areas
5. **Scale**: Use cloud functions for heavy processing

## Example: Real API Integration

```javascript
// In spectral-indices.js, replace fetchSentinel2Bands():

async fetchSentinel2Bands(lat, lon, date) {
    // Option 1: AWS S3 (via backend proxy)
    const response = await fetch(`/api/sentinel2?lat=${lat}&lon=${lon}&date=${date}`);
    const data = await response.json();
    return {
        B2: data.B02,  // Blue
        B3: data.B03,  // Green
        B4: data.B04,  // Red
        B8: data.B08,  // NIR
        B11: data.B11, // SWIR
        source: 'sentinel-2-aws'
    };
    
    // Option 2: Sentinel Hub OGC
    // const instanceId = 'YOUR_INSTANCE_ID';
    // const url = `https://services.sentinel-hub.com/ogc/wms/${instanceId}?...`;
    // Fetch and parse bands...
}
```

## Resources

- **Sentinel-2 User Guide**: https://sentinel.esa.int/web/sentinel/user-guides/sentinel-2-msi
- **AWS Sentinel-2**: https://registry.opendata.aws/sentinel-2/
- **Sentinel Hub**: https://www.sentinel-hub.com/
- **NASA Worldview**: https://worldview.earthdata.nasa.gov/
- **Spectral Indices Guide**: https://www.indexdatabase.de/

