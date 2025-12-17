/**
 * Greenspace Analysis Module
 * Analyzes greenspace coverage using satellite imagery (NDVI)
 */

class GreenspaceAnalyzer {
    constructor() {
        this.greenspaceCache = new Map();
        this.historicalData = new Map();
    }

    /**
     * Analyze greenspace coverage for a location
     * Uses NDVI (Normalized Difference Vegetation Index) from satellite imagery
     */
    async analyzeGreenspace(lat, lon, date = null) {
        const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)},${date || 'latest'}`;
        
        if (this.greenspaceCache.has(cacheKey)) {
            return this.greenspaceCache.get(cacheKey);
        }

        // In production, use Google Earth Engine NDVI analysis
        const greenspace = await this.simulateGreenspaceAnalysis(lat, lon, date);
        
        this.greenspaceCache.set(cacheKey, greenspace);
        return greenspace;
    }

    /**
     * Simulate greenspace analysis (replace with Google Earth Engine API)
     */
    async simulateGreenspaceAnalysis(lat, lon, date) {
        // NDVI ranges from -1 to 1
        // > 0.3 = vegetation, > 0.6 = dense vegetation
        
        let ndvi = 0.3; // Base NDVI
        
        // Urban areas have less greenspace
        const isUrban = this.isUrbanArea(lat, lon);
        if (isUrban) {
            ndvi -= 0.2;
        }

        // Parks and natural areas
        const hasParks = this.hasParksNearby(lat, lon);
        if (hasParks) {
            ndvi += 0.15;
        }

        // Seasonal variation (summer = more green)
        const month = date ? new Date(date).getMonth() : new Date().getMonth();
        const seasonalFactor = Math.sin((month / 12) * 2 * Math.PI - Math.PI / 2) * 0.2;
        ndvi += seasonalFactor;

        // Regional variation
        const regionalFactor = this.getRegionalGreenspace(lat, lon);
        ndvi += regionalFactor;

        // Clamp to -1 to 1
        ndvi = Math.max(-1, Math.min(1, ndvi));

        // Convert NDVI to percentage coverage
        const coverage = this.ndviToCoverage(ndvi);
        
        const greenspace = {
            ndvi: Math.round(ndvi * 100) / 100,
            coverage: Math.round(coverage),
            category: this.getGreenspaceCategory(coverage),
            parks: this.estimateParks(lat, lon),
            trees: this.estimateTreeCoverage(coverage),
            trend: this.calculateTrend(lat, lon),
            lastUpdated: date || new Date().toISOString()
        };

        // Store historical data
        const locationKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
        if (!this.historicalData.has(locationKey)) {
            this.historicalData.set(locationKey, []);
        }
        this.historicalData.get(locationKey).push({
            date: date || new Date().toISOString(),
            coverage: greenspace.coverage,
            ndvi: greenspace.ndvi
        });

        return greenspace;
    }

    /**
     * Convert NDVI to coverage percentage
     */
    ndviToCoverage(ndvi) {
        if (ndvi < 0) return 0;
        if (ndvi < 0.3) return ndvi * 50; // 0-15%
        if (ndvi < 0.6) return 15 + (ndvi - 0.3) * 100; // 15-45%
        return 45 + (ndvi - 0.6) * 137.5; // 45-100%
    }

    /**
     * Get greenspace category
     */
    getGreenspaceCategory(coverage) {
        if (coverage >= 60) return 'Excellent';
        if (coverage >= 40) return 'Good';
        if (coverage >= 20) return 'Moderate';
        if (coverage >= 10) return 'Poor';
        return 'Very Poor';
    }

    /**
     * Estimate number of parks
     */
    estimateParks(lat, lon) {
        const isUrban = this.isUrbanArea(lat, lon);
        if (isUrban) {
            return Math.floor(Math.random() * 5) + 2; // 2-6 parks
        }
        return Math.floor(Math.random() * 3) + 1; // 1-3 parks
    }

    /**
     * Estimate tree coverage
     */
    estimateTreeCoverage(totalCoverage) {
        // Trees typically make up 60-80% of greenspace
        return Math.round(totalCoverage * (0.6 + Math.random() * 0.2));
    }

    /**
     * Calculate trend over time
     */
    calculateTrend(lat, lon) {
        const locationKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
        const history = this.historicalData.get(locationKey) || [];
        
        if (history.length < 2) {
            return 'stable';
        }

        const recent = history.slice(-6);
        const trend = recent[recent.length - 1].coverage - recent[0].coverage;
        
        if (trend > 3) return 'increasing';
        if (trend < -3) return 'decreasing';
        return 'stable';
    }

    /**
     * Check if location is urban
     */
    isUrbanArea(lat, lon) {
        return (
            (lat > 40 && lat < 42 && lon > -74 && lon < -73) ||
            (lat > 34 && lat < 35 && lon > -119 && lon < -118) ||
            (lat > 41 && lat < 42 && lon > -88 && lon < -87)
        );
    }

    /**
     * Check if location has parks nearby
     */
    hasParksNearby(lat, lon) {
        // Simplified: assume 60% of locations have parks
        return Math.random() > 0.4;
    }

    /**
     * Get regional greenspace factor
     */
    getRegionalGreenspace(lat, lon) {
        // Pacific Northwest = more green
        if (lat > 45 && lat < 50 && lon > -125 && lon < -120) {
            return 0.3;
        }
        // Desert Southwest = less green
        if (lat > 32 && lat < 40 && lon > -120 && lon < -110) {
            return -0.2;
        }
        // Southeast = moderate green
        if (lat > 30 && lat < 36 && lon > -90 && lon < -75) {
            return 0.1;
        }
        return 0;
    }

    /**
     * Get historical data for a location
     */
    getHistoricalData(lat, lon, months = 12) {
        const locationKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
        const history = this.historicalData.get(locationKey) || [];
        
        if (history.length === 0) {
            const now = new Date();
            for (let i = months - 1; i >= 0; i--) {
                const date = new Date(now);
                date.setMonth(date.getMonth() - i);
                this.analyzeGreenspace(lat, lon, date.toISOString());
            }
        }
        
        return this.historicalData.get(locationKey) || [];
    }
}

// Global instance
const greenspaceAnalyzer = new GreenspaceAnalyzer();

