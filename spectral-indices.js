/**
 * Spectral Indices Calculator
 * Calculates NDVI, NDWI, and other indices from Sentinel-2/Landsat bands
 * Uses open-source NASA and ESA data
 */

class SpectralIndicesCalculator {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Calculate NDVI (Normalized Difference Vegetation Index)
     * NDVI = (NIR - Red) / (NIR + Red)
     * 
     * Sentinel-2 bands:
     * - Red: B4 (665 nm)
     * - NIR: B8 (842 nm)
     * 
     * Landsat bands:
     * - Red: B4 (655 nm)
     * - NIR: B5 (865 nm)
     */
    calculateNDVI(red, nir) {
        if (nir + red === 0) return 0;
        const ndvi = (nir - red) / (nir + red);
        return Math.max(-1, Math.min(1, ndvi));
    }

    /**
     * Calculate NDWI (Normalized Difference Water Index)
     * NDWI = (Green - NIR) / (Green + NIR)
     * 
     * Sentinel-2 bands:
     * - Green: B3 (560 nm)
     * - NIR: B8 (842 nm)
     */
    calculateNDWI(green, nir) {
        if (green + nir === 0) return 0;
        const ndwi = (green - nir) / (green + nir);
        return Math.max(-1, Math.min(1, ndwi));
    }

    /**
     * Calculate EVI (Enhanced Vegetation Index)
     * EVI = 2.5 * ((NIR - Red) / (NIR + 6*Red - 7.5*Blue + 1))
     */
    calculateEVI(red, nir, blue) {
        const denominator = nir + 6 * red - 7.5 * blue + 1;
        if (denominator === 0) return 0;
        const evi = 2.5 * ((nir - red) / denominator);
        return Math.max(-1, Math.min(1, evi));
    }

    /**
     * Calculate MNDWI (Modified NDWI)
     * MNDWI = (Green - SWIR) / (Green + SWIR)
     * Better for water body detection
     */
    calculateMNDWI(green, swir) {
        if (green + swir === 0) return 0;
        const mndwi = (green - swir) / (green + swir);
        return Math.max(-1, Math.min(1, mndwi));
    }

    /**
     * Calculate SAVI (Soil-Adjusted Vegetation Index)
     * SAVI = ((NIR - Red) / (NIR + Red + L)) * (1 + L)
     * L = 0.5 (soil brightness correction factor)
     */
    calculateSAVI(red, nir, L = 0.5) {
        const denominator = nir + red + L;
        if (denominator === 0) return 0;
        const savi = ((nir - red) / denominator) * (1 + L);
        return Math.max(-1, Math.min(1, savi));
    }

    /**
     * Get Sentinel-2 data from open APIs
     * Uses Sentinel Hub OGC API (free tier) or AWS Public Dataset
     */
    async getSentinel2Bands(lat, lon, date = null) {
        const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)},${date || 'latest'}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Option 1: Use Sentinel Hub OGC API (free tier: 5000 requests/month)
        // Option 2: Use Sentinel-2 AWS Public Dataset (completely free)
        // Option 3: Use pre-processed indices from Open Data Cube
        
        const bands = await this.fetchSentinel2Bands(lat, lon, date);
        
        this.cache.set(cacheKey, bands);
        return bands;
    }

    /**
     * Fetch Sentinel-2 bands from open source
     */
    async fetchSentinel2Bands(lat, lon, date) {
        // For production, use one of these:
        
        // 1. Sentinel Hub OGC WMS API (free tier)
        /*
        const instanceId = 'YOUR_INSTANCE_ID'; // Get from sentinel-hub.com
        const url = `https://services.sentinel-hub.com/ogc/wms/${instanceId}?` +
            `SERVICE=WMS&REQUEST=GetMap&LAYERS=TRUE_COLOR&` +
            `BBOX=${lon-0.01},${lat-0.01},${lon+0.01},${lat+0.01}&` +
            `WIDTH=512&HEIGHT=512&FORMAT=image/png&TIME=${date || '2024-01-01/2024-12-31'}`;
        */
        
        // 2. AWS Sentinel-2 Public Dataset (completely free, no API key)
        // Access via: s3://sentinel-s2-l2a/tiles/{TILE}/{DATE}/
        // Or use AWS CLI/boto3
        
        // 3. NASA Worldview (for quick visualization)
        // https://worldview.earthdata.nasa.gov/
        
        // For now, simulate realistic band values based on location
        return this.simulateSentinel2Bands(lat, lon);
    }

    /**
     * Simulate Sentinel-2 bands (replace with real API call)
     */
    simulateSentinel2Bands(lat, lon) {
        // Base reflectance values (0-1 range, typical for Sentinel-2)
        const baseRed = 0.15 + Math.random() * 0.1;
        const baseGreen = 0.18 + Math.random() * 0.1;
        const baseBlue = 0.12 + Math.random() * 0.1;
        const baseNIR = 0.25 + Math.random() * 0.15;
        const baseSWIR = 0.20 + Math.random() * 0.1;
        
        // Adjust based on location characteristics
        const isUrban = this.isUrban(lat, lon);
        const isCoastal = this.isCoastal(lat, lon);
        const hasVegetation = this.hasVegetation(lat, lon);
        
        let red = baseRed;
        let green = baseGreen;
        let blue = baseBlue;
        let nir = baseNIR;
        let swir = baseSWIR;
        
        // Urban areas: lower vegetation, higher built-up reflectance
        if (isUrban) {
            nir *= 0.7; // Less vegetation
            red *= 1.2; // More built-up areas
        }
        
        // Vegetated areas: higher NIR
        if (hasVegetation) {
            nir *= 1.3;
            green *= 1.2;
        }
        
        // Coastal/water areas: higher green, lower NIR
        if (isCoastal) {
            green *= 1.1;
            nir *= 0.8;
        }
        
        return {
            B2: blue * 10000,      // Blue (490 nm) - scaled to 0-10000
            B3: green * 10000,     // Green (560 nm)
            B4: red * 10000,       // Red (665 nm)
            B8: nir * 10000,       // NIR (842 nm)
            B11: swir * 10000,     // SWIR (1610 nm)
            date: date || new Date().toISOString(),
            source: 'simulated' // Replace with 'sentinel-2' when using real API
        };
    }

    /**
     * Calculate all spectral indices from bands
     */
    async calculateAllIndices(lat, lon, date = null) {
        const bands = await this.getSentinel2Bands(lat, lon, date);
        
        // Convert to reflectance (0-1)
        const red = bands.B4 / 10000;
        const green = bands.B3 / 10000;
        const blue = bands.B2 / 10000;
        const nir = bands.B8 / 10000;
        const swir = bands.B11 / 10000;
        
        // Calculate indices
        const ndvi = this.calculateNDVI(red, nir);
        const ndwi = this.calculateNDWI(green, nir);
        const mndwi = this.calculateMNDWI(green, swir);
        const evi = this.calculateEVI(red, nir, blue);
        const savi = this.calculateSAVI(red, nir);
        
        return {
            ndvi: ndvi,
            ndwi: ndwi,
            mndwi: mndwi,
            evi: evi,
            savi: savi,
            bands: bands,
            date: bands.date
        };
    }

    /**
     * Convert NDVI to greenspace percentage
     */
    ndviToGreenspace(ndvi) {
        // NDVI ranges from -1 to 1
        // Typical values: -0.2 to 0.8
        // Convert to 0-100% coverage
        if (ndvi < 0) return 0;
        if (ndvi < 0.3) return ndvi * 50; // 0-15%
        if (ndvi < 0.6) return 15 + (ndvi - 0.3) * 100; // 15-45%
        return 45 + (ndvi - 0.6) * 137.5; // 45-100%
    }

    /**
     * Convert NDWI to water quality index
     */
    ndwiToWaterQuality(ndwi) {
        // NDWI ranges from -1 to 1
        // Higher NDWI = more water, but we need quality
        // For quality, we also consider turbidity from other bands
        const baseQuality = (ndwi + 1) * 50; // Convert -1 to 1 -> 0 to 100
        
        // Adjust based on NDWI value
        // Very high NDWI might indicate turbid water
        if (ndwi > 0.5) {
            return Math.min(100, baseQuality + 20); // Clear water
        } else if (ndwi > 0) {
            return baseQuality; // Moderate water
        } else {
            return Math.max(0, baseQuality - 20); // Little/no water
        }
    }

    /**
     * Check if urban area
     */
    isUrban(lat, lon) {
        return (
            (lat > 40 && lat < 42 && lon > -74 && lon < -73) ||
            (lat > 34 && lat < 35 && lon > -119 && lon < -118) ||
            (lat > 41 && lat < 42 && lon > -88 && lon < -87)
        );
    }

    /**
     * Check if coastal
     */
    isCoastal(lat, lon) {
        return (
            Math.abs(lon + 80) < 5 ||
            Math.abs(lon + 122) < 5 ||
            (lat > 25 && lat < 31 && lon > -85 && lon < -80)
        );
    }

    /**
     * Check if has vegetation
     */
    hasVegetation(lat, lon) {
        // Pacific Northwest, Southeast, etc.
        return (
            (lat > 45 && lat < 50 && lon > -125 && lon < -100) ||
            (lat > 30 && lat < 36 && lon > -90 && lon < -75)
        );
    }
}

// Global instance
const spectralIndicesCalculator = new SpectralIndicesCalculator();

/**
 * OPEN SOURCE DATA SOURCES FOR SPECTRAL INDICES:
 * 
 * 1. NASA Earthdata CMR API + AWS S3 (BEST - Completely Free) ⭐
 *    - CMR API: https://cmr.earthdata.nasa.gov/
 *    - AWS S3: s3://sentinel-s2-l2a/tiles/{TILE}/{DATE}/
 *    - No API key needed for public bucket
 *    - All bands available (B2-B12)
 *    - https://www.earthdata.nasa.gov/data/instruments/sentinel-2-msi/data-access-tools
 *    - Requires backend proxy for browser access (CORS)
 * 
 * 2. Sentinel-2 AWS Public Dataset (Completely Free)
 *    - s3://sentinel-s2-l2a/tiles/{TILE}/{DATE}/
 *    - No API key needed
 *    - All bands available (B2-B12)
 *    - https://registry.opendata.aws/sentinel-2/
 * 
 * 3. Sentinel Hub OGC API (Free Tier)
 *    - 5000 requests/month free
 *    - Easy API access
 *    - https://www.sentinel-hub.com/
 * 
 * 4. NASA Worldview
 *    - Quick visualization
 *    - https://worldview.earthdata.nasa.gov/
 * 
 * 5. USGS EarthExplorer (Landsat)
 *    - Free with account
 *    - https://earthexplorer.usgs.gov/
 * 
 * 6. Google Earth Engine (Free for Research)
 *    - Already integrated
 *    - Can calculate indices server-side
 */

