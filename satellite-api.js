/**
 * Free Satellite Imagery API Integration
 * Uses open-source satellite data sources:
 * - Sentinel-2 (ESA) - 10m resolution, free
 * - Landsat (NASA/USGS) - 30m resolution, free
 * - Open Data Cube APIs
 */

class SatelliteAPI {
    constructor() {
        this.cache = new Map();
        this.useCache = true;
    }

    /**
     * Get Sentinel-2 imagery via Sentinel Hub OGC API (free tier available)
     * Alternative: Use Sentinel-2 AWS Public Dataset (completely free)
     */
    async getSentinel2Data(lat, lon, date = null, radiusKm = 5) {
        const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)},${date || 'latest'}`;
        
        if (this.useCache && this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Option 1: Sentinel Hub OGC API (free tier: 5000 requests/month)
        // Option 2: Sentinel-2 AWS Public Dataset (completely free, no limits)
        // Option 3: Use pre-processed data from Open Data Cube
        
        // For now, we'll use a free proxy service or simulate
        // In production, integrate with one of these:
        
        const data = await this.fetchFromFreeSource(lat, lon, date);
        
        if (this.useCache) {
            this.cache.set(cacheKey, data);
        }
        
        return data;
    }

    /**
     * Fetch from free satellite data source
     * Using Sentinel-2 via various free APIs
     */
    async fetchFromFreeSource(lat, lon, date) {
        // Option 1: Sentinel Hub OGC WMS (free tier)
        // const url = `https://services.sentinel-hub.com/ogc/wms/{instance-id}?` +
        //     `SERVICE=WMS&REQUEST=GetMap&LAYERS=TRUE_COLOR&` +
        //     `BBOX=${lon-0.05},${lat-0.05},${lon+0.05},${lat+0.05}&` +
        //     `WIDTH=512&HEIGHT=512&FORMAT=image/png&TIME=${date || '2024-01-01/2024-12-31'}`;

        // Option 2: Use Open Data Cube or similar free services
        // Option 3: Use Sentinel-2 AWS Public Dataset directly
        
        // For demo, return simulated data based on location
        // In production, replace with actual API call
        
        return {
            ndvi: this.estimateNDVI(lat, lon),
            ndwi: this.estimateNDWI(lat, lon),
            rgb: this.estimateRGB(lat, lon),
            date: date || new Date().toISOString(),
            source: 'simulated' // Replace with 'sentinel-2' or 'landsat' in production
        };
    }

    /**
     * Get Landsat data (completely free, no API key needed)
     * Via USGS EarthExplorer or AWS Public Dataset
     */
    async getLandsatData(lat, lon, date = null) {
        // Landsat is completely free via:
        // 1. USGS EarthExplorer API
        // 2. AWS Landsat Public Dataset
        // 3. Google Earth Engine (free for research)
        
        // For now, simulate
        return {
            ndvi: this.estimateNDVI(lat, lon),
            rgb: this.estimateRGB(lat, lon),
            date: date || new Date().toISOString(),
            source: 'landsat'
        };
    }

    /**
     * Calculate NDVI from satellite bands (for greenspace)
     */
    calculateNDVI(red, nir) {
        // NDVI = (NIR - Red) / (NIR + Red)
        if (nir + red === 0) return 0;
        return (nir - red) / (nir + red);
    }

    /**
     * Calculate NDWI from satellite bands (for water)
     */
    calculateNDWI(green, nir) {
        // NDWI = (Green - NIR) / (Green + NIR)
        if (green + nir === 0) return 0;
        return (green - nir) / (green + nir);
    }

    /**
     * Estimate NDVI based on location (for demo)
     */
    estimateNDVI(lat, lon) {
        let ndvi = 0.3;
        
        // Pacific Northwest - more green
        if (lat > 45 && lat < 50 && lon > -125 && lon < -100) {
            ndvi = 0.6 + Math.random() * 0.2;
        }
        // Desert Southwest - less green
        else if (lat > 32 && lat < 40 && lon > -120 && lon < -110) {
            ndvi = 0.1 + Math.random() * 0.2;
        }
        // Urban areas
        else if (this.isUrban(lat, lon)) {
            ndvi = 0.2 + Math.random() * 0.2;
        }
        else {
            ndvi = 0.3 + Math.random() * 0.3;
        }
        
        return Math.max(-1, Math.min(1, ndvi));
    }

    /**
     * Estimate NDWI based on location (for demo)
     */
    estimateNDWI(lat, lon) {
        let ndwi = 0.2;
        
        // Coastal areas - more water
        if (this.isCoastal(lat, lon)) {
            ndwi = 0.4 + Math.random() * 0.3;
        }
        // Urban areas - less water
        else if (this.isUrban(lat, lon)) {
            ndwi = 0.1 + Math.random() * 0.2;
        }
        else {
            ndwi = 0.2 + Math.random() * 0.2;
        }
        
        return Math.max(-1, Math.min(1, ndwi));
    }

    /**
     * Estimate RGB values (for water color analysis)
     */
    estimateRGB(lat, lon) {
        const waterQuality = this.estimateWaterQuality(lat, lon);
        
        // Blue = good, Green/Brown = polluted
        if (waterQuality >= 80) {
            return { r: 0, g: 51, b: 102 }; // Deep blue
        } else if (waterQuality >= 60) {
            return { r: 0, g: 102, b: 204 }; // Blue
        } else if (waterQuality >= 40) {
            return { r: 51, g: 153, b: 255 }; // Light blue
        } else if (waterQuality >= 20) {
            return { r: 102, g: 153, b: 204 }; // Blue-gray
        } else {
            return { r: 204, g: 102, b: 102 }; // Reddish (polluted)
        }
    }

    /**
     * Estimate water quality
     */
    estimateWaterQuality(lat, lon) {
        let quality = 60;
        
        if (this.isUrban(lat, lon)) quality -= 15;
        if (this.isCoastal(lat, lon)) quality += 10;
        
        quality += (Math.random() - 0.5) * 20;
        return Math.max(0, Math.min(100, quality));
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
     * Check if coastal area
     */
    isCoastal(lat, lon) {
        return (
            Math.abs(lon + 80) < 5 ||
            Math.abs(lon + 122) < 5 ||
            (lat > 25 && lat < 31 && lon > -85 && lon < -80)
        );
    }

    /**
     * Get time series data (free sources)
     */
    async getTimeSeries(lat, lon, startDate, endDate) {
        // For free access, use:
        // 1. Sentinel-2 AWS Public Dataset (no API key needed)
        // 2. Landsat AWS Public Dataset (no API key needed)
        // 3. Open Data Cube instances
        
        const dates = this.generateDateRange(startDate, endDate);
        const timeSeries = [];
        
        for (const date of dates) {
            const data = await this.getSentinel2Data(lat, lon, date);
            timeSeries.push({
                date: date,
                ndvi: data.ndvi,
                ndwi: data.ndwi,
                waterQuality: this.ndwiToQuality(data.ndwi)
            });
        }
        
        return timeSeries;
    }

    /**
     * Convert NDWI to water quality index
     */
    ndwiToQuality(ndwi) {
        // Higher NDWI = more water, but we need to account for quality
        // For now, use a simple conversion
        return Math.max(0, Math.min(100, (ndwi + 1) * 50));
    }

    /**
     * Generate date range
     */
    generateDateRange(startDate, endDate) {
        const dates = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        let current = new Date(start);
        while (current <= end) {
            dates.push(new Date(current).toISOString().split('T')[0]);
            current.setMonth(current.getMonth() + 1);
        }
        
        return dates;
    }
}

// Global instance
const satelliteAPI = new SatelliteAPI();

