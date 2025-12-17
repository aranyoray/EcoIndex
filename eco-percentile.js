/**
 * EcoPercentile Calculator
 * Calculates neighborhood-level eco scores and percentiles
 */

class EcoPercentileCalculator {
    constructor() {
        this.allScores = [];
        this.percentilesCalculated = false;
    }

    /**
     * Calculate eco score for a tract
     * Combines water quality and greenspace
     */
    calculateEcoScore(waterQuality, greenspace) {
        // Water quality: 0-100 (higher is better)
        // Greenspace: 0-100% (higher is better)
        // Combined: 50% water + 50% greenspace
        const score = (waterQuality * 0.5) + (greenspace * 0.5);
        return Math.max(0, Math.min(100, score));
    }

    /**
     * Calculate water quality with color gradient
     * Deep blue (cleanest) to reddish (polluted)
     */
    getWaterColor(quality) {
        // Quality: 0-100, where 100 is cleanest
        if (quality >= 80) {
            // Deep blue - cleanest
            return '#003366';
        } else if (quality >= 60) {
            // Blue
            return '#0066cc';
        } else if (quality >= 40) {
            // Light blue
            return '#3399ff';
        } else if (quality >= 20) {
            // Blue-gray (transitioning)
            return '#6699cc';
        } else {
            // Reddish (polluted)
            return '#cc6666';
        }
    }

    /**
     * Calculate greenspace color gradient
     * Light green (less) to dark green (more/packed)
     */
    getGreenspaceColor(coverage) {
        // Coverage: 0-100%
        if (coverage >= 80) {
            // Dark green - most packed
            return '#004d00';
        } else if (coverage >= 60) {
            // Dark green
            return '#006600';
        } else if (coverage >= 40) {
            // Medium green
            return '#339933';
        } else if (coverage >= 20) {
            // Light green
            return '#66cc66';
        } else {
            // Very light green
            return '#99ff99';
        }
    }

    /**
     * Calculate percentile rank
     */
    calculatePercentile(score, allScores) {
        if (allScores.length === 0) return 50;
        
        const sorted = [...allScores].sort((a, b) => a - b);
        const rank = sorted.filter(s => s <= score).length;
        const percentile = (rank / sorted.length) * 100;
        return Math.round(percentile);
    }

    /**
     * Process all tracts and calculate percentiles (async version)
     */
    async processTractsAsync(tracts) {
        // Calculate scores for all tracts (with async EE calls)
        const processedTracts = await Promise.all(tracts.map(async tract => {
            // Get water quality and greenspace (can use EE if available)
            const waterQuality = await this.estimateWaterQuality(tract.properties.lat, tract.properties.lon);
            const greenspace = await this.estimateGreenspace(tract.properties.lat, tract.properties.lon);
            
            const ecoScore = this.calculateEcoScore(waterQuality, greenspace);
            
            tract.properties.waterQuality = waterQuality;
            tract.properties.greenspace = greenspace;
            tract.properties.ecoScore = ecoScore;
            tract.properties.waterColor = this.getWaterColor(waterQuality);
            tract.properties.greenspaceColor = this.getGreenspaceColor(greenspace);
            
            return ecoScore;
        });

        // Store all scores for percentile calculation
        this.allScores = processedTracts;

        // Calculate percentiles
        tracts.forEach(tract => {
            tract.properties.ecoPercentile = this.calculatePercentile(
                tract.properties.ecoScore,
                this.allScores
            );
        });

        return tracts;
    }

    /**
     * Estimate water quality for a location
     * Uses Google Earth Engine data if available
     */
    async estimateWaterQuality(lat, lon) {
        // Try to use EE service if available
        if (typeof eeService !== 'undefined' && eeService.initialized) {
            try {
                const data = await eeService.getCountyData('County', 'State', lat, lon);
                return data.waterQuality;
            } catch (e) {
                console.warn('EE service unavailable, using estimation:', e);
            }
        }
        
        // Fallback to estimation
        return this.estimateWaterQualitySync(lat, lon);
    }

    /**
     * Synchronous water quality estimation (fallback)
     */
    estimateWaterQualitySync(lat, lon) {
        // Base quality
        let quality = 60;

        // Urban areas tend to have lower quality
        const isUrban = this.isUrbanArea(lat, lon);
        if (isUrban) quality -= 15;

        // Coastal areas often better
        const isCoastal = this.isCoastalArea(lat, lon);
        if (isCoastal) quality += 10;

        // Regional variations
        if (lat > 40 && lat < 50 && lon > -125 && lon < -100) {
            // Pacific Northwest - generally good
            quality += 5;
        }

        // Add some variation
        quality += (Math.random() - 0.5) * 20;

        return Math.max(0, Math.min(100, quality));
    }

    /**
     * Process all tracts and calculate percentiles (sync version for compatibility)
     */
    processTracts(tracts) {
        // Synchronous version for backward compatibility
        const processedTracts = tracts.map(tract => {
            const waterQuality = this.estimateWaterQualitySync(tract.properties.lat, tract.properties.lon);
            const greenspace = this.estimateGreenspaceSync(tract.properties.lat, tract.properties.lon);
            
            const ecoScore = this.calculateEcoScore(waterQuality, greenspace);
            
            tract.properties.waterQuality = waterQuality;
            tract.properties.greenspace = greenspace;
            tract.properties.ecoScore = ecoScore;
            tract.properties.waterColor = this.getWaterColor(waterQuality);
            tract.properties.greenspaceColor = this.getGreenspaceColor(greenspace);
            
            return ecoScore;
        });

        this.allScores = processedTracts;

        tracts.forEach(tract => {
            tract.properties.ecoPercentile = this.calculatePercentile(
                tract.properties.ecoScore,
                this.allScores
            );
        });

        return tracts;
    }

    /**
     * Estimate greenspace coverage
     * Uses Google Earth Engine data if available
     */
    async estimateGreenspace(lat, lon) {
        // Try to use EE service if available
        if (typeof eeService !== 'undefined' && eeService.initialized) {
            try {
                const data = await eeService.getCountyData('County', 'State', lat, lon);
                return data.greenspace;
            } catch (e) {
                console.warn('EE service unavailable, using estimation:', e);
            }
        }
        
        // Fallback to estimation
        return this.estimateGreenspaceSync(lat, lon);
    }

    /**
     * Synchronous greenspace estimation (fallback)
     */
    estimateGreenspaceSync(lat, lon) {
        let coverage = 40;

        // Urban areas have less
        const isUrban = this.isUrbanArea(lat, lon);
        if (isUrban) coverage -= 20;

        // Regional variations
        if (lat > 45 && lat < 50 && lon > -125 && lon < -100) {
            // Pacific Northwest - more green
            coverage += 30;
        } else if (lat > 30 && lat < 36 && lon > -90 && lon < -75) {
            // Southeast - moderate
            coverage += 10;
        } else if (lat > 32 && lat < 40 && lon > -120 && lon < -110) {
            // Desert Southwest - less
            coverage -= 15;
        }

        // Add variation
        coverage += (Math.random() - 0.5) * 15;

        return Math.max(0, Math.min(100, coverage));
    }

    /**
     * Check if urban area
     */
    isUrbanArea(lat, lon) {
        return (
            (lat > 40 && lat < 42 && lon > -74 && lon < -73) || // NYC
            (lat > 34 && lat < 35 && lon > -119 && lon < -118) || // LA
            (lat > 41 && lat < 42 && lon > -88 && lon < -87) || // Chicago
            (lat > 29 && lat < 30 && lon > -96 && lon < -95) // Houston
        );
    }

    /**
     * Check if coastal area
     */
    isCoastalArea(lat, lon) {
        return (
            Math.abs(lon + 80) < 5 || // East Coast
            Math.abs(lon + 122) < 5 || // West Coast
            (lat > 25 && lat < 31 && lon > -85 && lon < -80) // Gulf Coast
        );
    }
}

// Global instance
const ecoPercentileCalculator = new EcoPercentileCalculator();

