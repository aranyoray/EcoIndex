/**
 * AI Predictions Module
 * Uses TensorFlow.js to predict future water quality and greenspace trends
 */

class AIPredictor {
    constructor() {
        this.models = {
            waterQuality: null,
            greenspace: null
        };
        this.trained = false;
    }

    /**
     * Initialize and train prediction models
     */
    async initialize() {
        if (this.trained) {
            return;
        }

        // Create simple neural network models using TensorFlow.js
        await this.createModels();
        await this.trainModels();
        
        this.trained = true;
        console.log('AI models initialized and trained');
    }

    /**
     * Create TensorFlow.js models
     */
    async createModels() {
        // Check if TensorFlow.js is available
        if (typeof tf === 'undefined') {
            console.warn('TensorFlow.js not loaded, using simplified predictions');
            return;
        }

        // Water Quality Prediction Model
        this.models.waterQuality = tf.sequential({
            layers: [
                tf.layers.dense({ inputShape: [12], units: 32, activation: 'relu' }), // 12 months of historical data
                tf.layers.dense({ units: 16, activation: 'relu' }),
                tf.layers.dense({ units: 8, activation: 'relu' }),
                tf.layers.dense({ units: 1, activation: 'linear' }) // Output: quality index
            ]
        });

        // Greenspace Prediction Model
        this.models.greenspace = tf.sequential({
            layers: [
                tf.layers.dense({ inputShape: [12], units: 32, activation: 'relu' }),
                tf.layers.dense({ units: 16, activation: 'relu' }),
                tf.layers.dense({ units: 8, activation: 'relu' }),
                tf.layers.dense({ units: 1, activation: 'linear' }) // Output: coverage percentage
            ]
        });

        // Compile models
        this.models.waterQuality.compile({
            optimizer: 'adam',
            loss: 'meanSquaredError'
            // Removed metrics to avoid compatibility issues
        });

        this.models.greenspace.compile({
            optimizer: 'adam',
            loss: 'meanSquaredError'
            // Removed metrics to avoid compatibility issues
        });
    }

    /**
     * Train models with synthetic data
     * In production, use real historical data
     */
    async trainModels() {
        if (typeof tf === 'undefined' || !this.models.waterQuality) {
            console.warn('TensorFlow.js not available, skipping model training');
            return;
        }

        // Generate synthetic training data
        const trainingData = this.generateTrainingData(1000);
        
        // Train water quality model
        const waterX = trainingData.map(d => d.historical);
        const waterY = trainingData.map(d => [d.futureWater]);
        
        await this.models.waterQuality.fit(
            tf.tensor2d(waterX),
            tf.tensor2d(waterY),
            {
                epochs: 50,
                batchSize: 32,
                verbose: 0
            }
        );

        // Train greenspace model
        const greenY = trainingData.map(d => [d.futureGreen]);
        
        await this.models.greenspace.fit(
            tf.tensor2d(waterX), // Same historical input
            tf.tensor2d(greenY),
            {
                epochs: 50,
                batchSize: 32,
                verbose: 0
            }
        );
    }

    /**
     * Generate synthetic training data
     */
    generateTrainingData(count) {
        const data = [];
        
        for (let i = 0; i < count; i++) {
            // Generate 12 months of historical data with seasonal patterns
            const historical = [];
            const baseWater = 50 + Math.random() * 30;
            const baseGreen = 30 + Math.random() * 40;
            
            for (let month = 0; month < 12; month++) {
                const seasonal = Math.sin((month / 12) * 2 * Math.PI);
                historical.push(
                    baseWater + seasonal * 10 + (Math.random() - 0.5) * 5
                );
            }
            
            // Future value (next month) with trend
            const trend = (Math.random() - 0.5) * 2;
            const futureWater = historical[11] + trend;
            const futureGreen = baseGreen + Math.sin((12 / 12) * 2 * Math.PI) * 10 + trend;
            
            data.push({
                historical: historical,
                futureWater: Math.max(0, Math.min(100, futureWater)),
                futureGreen: Math.max(0, Math.min(100, futureGreen))
            });
        }
        
        return data;
    }

    /**
     * Predict future water quality
     */
    async predictWaterQuality(historicalData, monthsAhead = 1) {
        if (!this.trained) {
            await this.initialize();
        }

        // If TensorFlow.js not available, use simple prediction
        if (typeof tf === 'undefined' || !this.models.waterQuality) {
            return this.simplePrediction(historicalData);
        }

        // Ensure we have 12 months of data
        const data = this.prepareHistoricalData(historicalData, 12);
        
        // Make prediction
        const prediction = this.models.waterQuality.predict(
            tf.tensor2d([data])
        );
        
        const result = await prediction.data();
        prediction.dispose();
        
        return Math.max(0, Math.min(100, Math.round(result[0])));
    }

    /**
     * Predict future greenspace coverage
     */
    async predictGreenspace(historicalData, monthsAhead = 1) {
        if (!this.trained) {
            await this.initialize();
        }

        // If TensorFlow.js not available, use simple prediction
        if (typeof tf === 'undefined' || !this.models.greenspace) {
            return this.simplePrediction(historicalData);
        }

        const data = this.prepareHistoricalData(historicalData, 12);
        
        const prediction = this.models.greenspace.predict(
            tf.tensor2d([data])
        );
        
        const result = await prediction.data();
        prediction.dispose();
        
        return Math.max(0, Math.min(100, Math.round(result[0])));
    }

    /**
     * Simple prediction fallback (when TensorFlow.js is not available)
     */
    simplePrediction(historicalData) {
        if (historicalData.length === 0) {
            return 50; // Default
        }

        // Use average of last 3 months with seasonal adjustment
        const recent = historicalData.slice(-3);
        const avg = recent.reduce((sum, d) => {
            const value = typeof d === 'object' ? (d.quality || d.coverage || 50) : d;
            return sum + value;
        }, 0) / recent.length;

        // Add seasonal variation
        const month = new Date().getMonth();
        const seasonal = Math.sin((month / 12) * 2 * Math.PI) * 5;

        return Math.max(0, Math.min(100, Math.round(avg + seasonal)));
    }

    /**
     * Prepare historical data for model input
     */
    prepareHistoricalData(historicalData, requiredLength) {
        if (historicalData.length >= requiredLength) {
            return historicalData.slice(-requiredLength).map(d => d.quality || d.coverage || d);
        }
        
        // Pad with average if not enough data
        const avg = historicalData.length > 0 
            ? historicalData.reduce((sum, d) => sum + (d.quality || d.coverage || d), 0) / historicalData.length
            : 50;
        
        const padded = [...historicalData];
        while (padded.length < requiredLength) {
            padded.unshift(avg);
        }
        
        return padded.slice(-requiredLength).map(d => typeof d === 'object' ? (d.quality || d.coverage || avg) : d);
    }

    /**
     * Predict multiple months ahead
     */
    async predictFuture(lat, lon, months = 6) {
        // Get historical data
        const waterHistory = waterQualityAnalyzer.getHistoricalData(lat, lon, 12);
        const greenHistory = greenspaceAnalyzer.getHistoricalData(lat, lon, 12);
        
        const predictions = {
            waterQuality: [],
            greenspace: []
        };
        
        // Predict each month
        for (let i = 1; i <= months; i++) {
            const waterPred = await this.predictWaterQuality(
                waterHistory.map(d => d.quality),
                i
            );
            const greenPred = await this.predictGreenspace(
                greenHistory.map(d => d.coverage),
                i
            );
            
            const futureDate = new Date();
            futureDate.setMonth(futureDate.getMonth() + i);
            
            predictions.waterQuality.push({
                date: futureDate.toISOString(),
                quality: waterPred
            });
            
            predictions.greenspace.push({
                date: futureDate.toISOString(),
                coverage: greenPred
            });
        }
        
        return predictions;
    }

    /**
     * Get prediction confidence (based on historical data quality)
     */
    getConfidence(historicalData) {
        if (historicalData.length < 6) {
            return 'low';
        }
        if (historicalData.length < 12) {
            return 'medium';
        }
        return 'high';
    }
}

// Global instance
const aiPredictor = new AIPredictor();

// Initialize on page load
window.addEventListener('load', () => {
    // Initialize in background (non-blocking)
    setTimeout(() => {
        aiPredictor.initialize();
    }, 1000);
});

