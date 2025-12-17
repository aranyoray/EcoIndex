/**
 * Location Service Module
 * Handles geolocation and ZIP code lookup
 */

class LocationService {
    constructor() {
        this.currentLocation = null;
        this.comparisonLocations = []; // Array of locations for comparison
        this.zipCodeCache = new Map();
    }

    /**
     * Get user's current location
     */
    async useMyLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                        source: 'geolocation'
                    };

                    // Try to get ZIP code from coordinates
                    try {
                        const zipCode = await this.getZipCodeFromCoordinates(location.lat, location.lon);
                        location.zipCode = zipCode;
                    } catch (e) {
                        console.warn('Could not get ZIP code:', e);
                    }

                    this.currentLocation = location;
                    resolve(location);
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }

    /**
     * Lookup location from ZIP code
     */
    async lookupZipCode(zipCode) {
        // Check cache first
        if (this.zipCodeCache.has(zipCode)) {
            return this.zipCodeCache.get(zipCode);
        }

        // Use a geocoding service (in production, use Google Maps Geocoding API or similar)
        try {
            // For demo, use a simple API or simulate
            const location = await this.geocodeZipCode(zipCode);
            this.zipCodeCache.set(zipCode, location);
            return location;
        } catch (error) {
            console.error('Error geocoding ZIP code:', error);
            throw error;
        }
    }

    /**
     * Geocode ZIP code to coordinates
     * In production, use Google Maps Geocoding API or similar
     */
    async geocodeZipCode(zipCode) {
        // Simulate geocoding with some common ZIP codes
        const knownZips = {
            '10001': { lat: 40.7506, lon: -73.9972, city: 'New York', state: 'NY' },
            '90210': { lat: 34.0901, lon: -118.4065, city: 'Beverly Hills', state: 'CA' },
            '60601': { lat: 41.8825, lon: -87.6441, city: 'Chicago', state: 'IL' },
            '33139': { lat: 25.7907, lon: -80.1300, city: 'Miami Beach', state: 'FL' },
            '98101': { lat: 47.6062, lon: -122.3321, city: 'Seattle', state: 'WA' },
        };

        if (knownZips[zipCode]) {
            return {
                ...knownZips[zipCode],
                zipCode: zipCode
            };
        }

        // For unknown ZIPs, generate a random US location
        // In production, use actual geocoding API
        return {
            lat: 38 + Math.random() * 10, // Roughly US latitude range
            lon: -98 + Math.random() * 40, // Roughly US longitude range
            zipCode: zipCode,
            city: 'Unknown',
            state: 'US'
        };
    }

    /**
     * Get ZIP code from coordinates (reverse geocoding)
     */
    async getZipCodeFromCoordinates(lat, lon) {
        // In production, use reverse geocoding API
        // For demo, return a simulated ZIP
        return Math.floor(10000 + Math.random() * 90000).toString();
    }

    /**
     * Add location to comparison list
     */
    addToComparison(location) {
        if (!this.comparisonLocations.find(loc => 
            loc.zipCode === location.zipCode || 
            (Math.abs(loc.lat - location.lat) < 0.01 && Math.abs(loc.lon - location.lon) < 0.01)
        )) {
            this.comparisonLocations.push(location);
        }
    }

    /**
     * Remove location from comparison
     */
    removeFromComparison(location) {
        this.comparisonLocations = this.comparisonLocations.filter(loc => 
            loc.zipCode !== location.zipCode && 
            !(Math.abs(loc.lat - location.lat) < 0.01 && Math.abs(loc.lon - location.lon) < 0.01)
        );
    }

    /**
     * Clear comparison list
     */
    clearComparison() {
        this.comparisonLocations = [];
    }

    /**
     * Get all comparison locations
     */
    getComparisonLocations() {
        return this.comparisonLocations;
    }

    /**
     * Format location name
     */
    formatLocationName(location) {
        if (location.zipCode) {
            return `ZIP ${location.zipCode}`;
        }
        if (location.city && location.state) {
            return `${location.city}, ${location.state}`;
        }
        return `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`;
    }
}

// Global instance
const locationService = new LocationService();

