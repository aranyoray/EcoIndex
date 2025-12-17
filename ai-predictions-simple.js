/**
 * Simple AI Predictions for 10-20 Year Projections
 * Identifies areas with worst predicted future trends
 * Simple implementation - can be upgraded to CNN later
 */

class SimpleAIPredictor {
    constructor() {
        this.predictions = new Map();
        this.trained = false;
    }

    /**
     * Predict future eco score for a tract (10-20 years)
     * Uses simple trend analysis based on location patterns
     */
    async predictFutureEcoScore(tract, yearsAhead = 15) {
        const cacheKey = `${tract.properties.lat.toFixed(4)},${tract.properties.lon.toFixed(4)},${yearsAhead}`;
        
        if (this.predictions.has(cacheKey)) {
            return this.predictions.get(cacheKey);
        }

        const currentScore = tract.properties.ecoScore || 50;
        const waterQuality = tract.properties.waterQuality || 50;
        const greenspace = tract.properties.greenspace || 40;

        // Calculate trend factors
        const trend = this.calculateTrend(tract);
        const regionalFactor = this.getRegionalTrendFactor(tract);
        const urbanPressure = this.getUrbanPressureFactor(tract);
        
        // Predict future score
        const annualDecline = this.calculateAnnualDecline(trend, regionalFactor, urbanPressure);
        const predictedScore = Math.max(0, Math.min(100, currentScore + (annualDecline * yearsAhead)));
        
        // Calculate risk level
        const riskLevel = this.calculateRiskLevel(currentScore, predictedScore, yearsAhead);
        
        const prediction = {
            currentScore: currentScore,
            predictedScore: Math.round(predictedScore),
            yearsAhead: yearsAhead,
            annualDecline: annualDecline,
            riskLevel: riskLevel, // 'critical', 'high', 'moderate', 'low'
            needsAction: riskLevel === 'critical' || riskLevel === 'high',
            trend: trend,
            regionalFactor: regionalFactor,
            urbanPressure: urbanPressure
        };

        this.predictions.set(cacheKey, prediction);
        return prediction;
    }

    /**
     * Calculate trend based on location characteristics
     */
    calculateTrend(tract) {
        const lat = tract.properties.lat;
        const lon = tract.properties.lon;
        
        // Urban areas tend to decline
        if (this.isUrbanArea(lat, lon)) {
            return 'declining';
        }
        
        // Protected areas tend to be stable
        if (this.isProtectedArea(lat, lon)) {
            return 'stable';
        }
        
        // Coastal areas may face climate pressure
        if (this.isCoastal(lat, lon)) {
            return 'at_risk';
        }
        
        // Default: slight decline
        return 'slight_decline';
    }

    /**
     * Get regional trend factor
     */
    getRegionalTrendFactor(tract) {
        const lat = tract.properties.lat;
        const lon = tract.properties.lon;
        
        // Areas with high development pressure
        if (lat > 34 && lat < 36 && lon > -119 && lon < -117) {
            // Southern California - high pressure
            return -0.8;
        }
        
        if (lat > 40 && lat < 42 && lon > -74 && lon < -73) {
            // NYC area - high pressure
            return -0.7;
        }
        
        // Areas with conservation focus
        if (lat > 45 && lat < 50 && lon > -125 && lon < -100) {
            // Pacific Northwest - better protection
            return -0.2;
        }
        
        // Default moderate decline
        return -0.5;
    }

    /**
     * Get urban pressure factor
     */
    getUrbanPressureFactor(tract) {
        const lat = tract.properties.lat;
        const lon = tract.properties.lon;
        
        if (this.isUrbanArea(lat, lon)) {
            return -1.2; // Higher decline in urban areas
        }
        
        if (this.isSuburban(lat, lon)) {
            return -0.8; // Moderate decline in suburbs
        }
        
        return -0.3; // Lower decline in rural
    }

    /**
     * Calculate annual decline rate
     */
    calculateAnnualDecline(trend, regionalFactor, urbanPressure) {
        let baseDecline = 0;
        
        switch(trend) {
            case 'declining':
                baseDecline = -1.5;
                break;
            case 'at_risk':
                baseDecline = -1.0;
                break;
            case 'slight_decline':
                baseDecline = -0.5;
                break;
            case 'stable':
                baseDecline = -0.1;
                break;
        }
        
        return baseDecline + regionalFactor + urbanPressure;
    }

    /**
     * Calculate risk level
     */
    calculateRiskLevel(currentScore, predictedScore, yearsAhead) {
        const decline = currentScore - predictedScore;
        const declineRate = decline / yearsAhead;
        
        // Critical: Will drop below 30 in 20 years
        if (predictedScore < 30 || declineRate > 2) {
            return 'critical';
        }
        
        // High: Will drop below 50 or decline > 1.5 per year
        if (predictedScore < 50 || declineRate > 1.5) {
            return 'high';
        }
        
        // Moderate: Some decline expected
        if (declineRate > 0.5) {
            return 'moderate';
        }
        
        return 'low';
    }

    /**
     * Check if urban area
     */
    isUrbanArea(lat, lon) {
        return (
            (lat > 40 && lat < 42 && lon > -74 && lon < -73) || // NYC
            (lat > 34 && lat < 35 && lon > -119 && lon < -118) || // LA
            (lat > 41 && lat < 42 && lon > -88 && lon < -87) || // Chicago
            (lat > 29 && lat < 30 && lon > -96 && lon < -95) || // Houston
            (lat > 37 && lat < 38 && lon > -123 && lon < -122) // SF
        );
    }

    /**
     * Check if suburban
     */
    isSuburban(lat, lon) {
        // Areas near major cities
        return (
            (lat > 39 && lat < 41 && lon > -75 && lon < -73) || // Near NYC
            (lat > 33 && lat < 35 && lon > -118 && lon < -117) || // Near LA
            (lat > 40 && lat < 42 && lon > -89 && lon < -87) // Near Chicago
        );
    }

    /**
     * Check if protected area (national parks, etc.)
     */
    isProtectedArea(lat, lon) {
        // Simplified: areas with high greenspace and low urban pressure
        return (
            (lat > 44 && lat < 50 && lon > -125 && lon < -110) || // Pacific Northwest parks
            (lat > 36 && lat < 38 && lon > -120 && lon < -115) || // Sierra Nevada
            (lat > 35 && lat < 37 && lon > -84 && lon < -82) // Great Smoky Mountains
        );
    }

    /**
     * Check if coastal
     */
    isCoastal(lat, lon) {
        return (
            Math.abs(lon + 80) < 5 || // East Coast
            Math.abs(lon + 122) < 5 || // West Coast
            (lat > 25 && lat < 31 && lon > -85 && lon < -80) // Gulf Coast
        );
    }

    /**
     * Get worst predicted tracts (for filtering)
     */
    async getWorstPredictedTracts(tracts, yearsAhead = 15) {
        const predictions = await Promise.all(
            tracts.map(async tract => {
                const prediction = await this.predictFutureEcoScore(tract, yearsAhead);
                return {
                    tract: tract,
                    prediction: prediction
                };
            })
        );

        // Sort by risk level and predicted score
        predictions.sort((a, b) => {
            const riskOrder = { 'critical': 0, 'high': 1, 'moderate': 2, 'low': 3 };
            const riskDiff = riskOrder[a.prediction.riskLevel] - riskOrder[b.prediction.riskLevel];
            if (riskDiff !== 0) return riskDiff;
            return a.prediction.predictedScore - b.prediction.predictedScore;
        });

        // Return tracts that need action
        return predictions
            .filter(p => p.prediction.needsAction)
            .map(p => {
                p.tract.properties.prediction = p.prediction;
                return p.tract;
            });
    }
}

// Global instance
const simpleAIPredictor = new SimpleAIPredictor();

