/**
 * Census Tract Data Generator
 * Generates lightweight census tract data for US neighborhoods
 * In production, use actual Census Bureau GeoJSON data
 */

class CensusTractData {
    constructor() {
        this.tracts = [];
        this.initialized = false;
    }

    /**
     * Generate sample census tract data for a state/region
     * In production, load from Census Bureau API or GeoJSON files
     */
    generateTractsForRegion(bounds, density = 'medium') {
        const { minLat, maxLat, minLon, maxLon } = bounds;
        
        // Adjust density based on parameter
        const latStep = density === 'high' ? 0.05 : density === 'medium' ? 0.1 : 0.2;
        const lonStep = density === 'high' ? 0.05 : density === 'medium' ? 0.1 : 0.2;
        
        const tracts = [];
        
        for (let lat = minLat; lat < maxLat; lat += latStep) {
            for (let lon = minLon; lon < maxLon; lon += lonStep) {
                // Create a simple polygon for each tract (simplified rectangle)
                const tract = {
                    id: `tract_${lat.toFixed(2)}_${lon.toFixed(2)}`,
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[
                            [lon, lat],
                            [lon + lonStep, lat],
                            [lon + lonStep, lat + latStep],
                            [lon, lat + latStep],
                            [lon, lat]
                        ]]
                    },
                    properties: {
                        lat: lat + latStep / 2,
                        lon: lon + lonStep / 2,
                        // Will be populated with eco data
                        ecoPercentile: null,
                        waterQuality: null,
                        greenspace: null
                    }
                };
                
                tracts.push(tract);
            }
        }
        
        return tracts;
    }

    /**
     * Generate tracts for entire US (simplified for performance)
     * For testing, limit to Sonoma County, CA
     */
    generateUSTracts() {
        if (this.initialized && this.tracts.length > 0) {
            return this.tracts;
        }

        // TESTING MODE: Sonoma County, CA only
        // Sonoma County bounds: ~38.2°N to 38.8°N, ~122.5°W to 123.5°W
        const testBounds = {
            minLat: 38.2,
            maxLat: 38.8,
            minLon: -123.5,
            maxLon: -122.5
        };

        // Use higher density for detailed testing
        this.tracts = this.generateTractsForRegion(testBounds, 'high');
        this.initialized = true;
        
        console.log(`Generated ${this.tracts.length} tracts for Sonoma County (testing mode)`);
        return this.tracts;

        /* PRODUCTION MODE: Uncomment for full US
        // US bounds (simplified)
        const usBounds = {
            minLat: 24.5,
            maxLat: 49.5,
            minLon: -125,
            maxLon: -66
        };

        // Use medium density for performance
        this.tracts = this.generateTractsForRegion(usBounds, 'medium');
        this.initialized = true;
        
        return this.tracts;
        */
    }

    /**
     * Get tracts for visible map bounds (for performance)
     */
    getTractsInBounds(mapBounds) {
        const allTracts = this.generateUSTracts();
        
        return allTracts.filter(tract => {
            const { lat, lon } = tract.properties;
            return lat >= mapBounds.south &&
                   lat <= mapBounds.north &&
                   lon >= mapBounds.west &&
                   lon <= mapBounds.east;
        });
    }
}

// Global instance
const censusTractData = new CensusTractData();

