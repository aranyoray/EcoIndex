/**
 * Open-Meteo API Integration
 * Free weather API for historical and forecast data
 * No API key required!
 */

class OpenMeteoAPI {
    constructor() {
        this.baseURL = 'https://api.open-meteo.com/v1';
        this.cache = new Map();
        this.cacheExpiry = 12 * 60 * 60 * 1000; // 12 hours
    }

    /**
     * Fetch historical weather data
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @param {string} startDate - Start date (YYYY-MM-DD)
     * @param {string} endDate - End date (YYYY-MM-DD)
     */
    async fetchHistoricalWeather(lat, lon, startDate, endDate) {
        const cacheKey = `hist_${lat}_${lon}_${startDate}_${endDate}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const params = new URLSearchParams({
                latitude: lat,
                longitude: lon,
                start_date: startDate,
                end_date: endDate,
                daily: 'temperature_2m_max,temperature_2m_min,temperature_2m_mean,' +
                       'relative_humidity_2m_mean,wind_speed_10m_max,precipitation_sum,' +
                       'shortwave_radiation_sum',
                temperature_unit: 'celsius',
                wind_speed_unit: 'ms',
                precipitation_unit: 'mm'
            });

            const response = await fetch(
                `${this.baseURL}/archive?${params}`,
                { method: 'GET' }
            );

            if (!response.ok) {
                throw new Error(`Open-Meteo API error: ${response.status}`);
            }

            const data = await response.json();
            const processed = this.processHistoricalData(data);
            this.setCache(cacheKey, processed);
            return processed;

        } catch (error) {
            console.error('Error fetching historical weather:', error);
            return null;
        }
    }

    /**
     * Fetch weather forecast (up to 16 days)
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @param {number} days - Number of forecast days (1-16)
     */
    async fetchWeatherForecast(lat, lon, days = 16) {
        const cacheKey = `forecast_${lat}_${lon}_${days}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const params = new URLSearchParams({
                latitude: lat,
                longitude: lon,
                daily: 'temperature_2m_max,temperature_2m_min,temperature_2m_mean,' +
                       'relative_humidity_2m_mean,wind_speed_10m_max,precipitation_sum,' +
                       'shortwave_radiation_sum',
                forecast_days: days,
                temperature_unit: 'celsius',
                wind_speed_unit: 'ms',
                precipitation_unit: 'mm'
            });

            const response = await fetch(
                `${this.baseURL}/forecast?${params}`,
                { method: 'GET' }
            );

            if (!response.ok) {
                throw new Error(`Open-Meteo API error: ${response.status}`);
            }

            const data = await response.json();
            const processed = this.processHistoricalData(data); // Same format
            this.setCache(cacheKey, processed);
            return processed;

        } catch (error) {
            console.error('Error fetching weather forecast:', error);
            return null;
        }
    }

    /**
     * Fetch climate model predictions (future projections)
     * Using CMIP6 climate models for long-term predictions
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @param {string} startDate - Start date (YYYY-MM-DD)
     * @param {string} endDate - End date (YYYY-MM-DD, up to 2050)
     */
    async fetchClimateProjections(lat, lon, startDate, endDate) {
        const cacheKey = `climate_${lat}_${lon}_${startDate}_${endDate}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const params = new URLSearchParams({
                latitude: lat,
                longitude: lon,
                start_date: startDate,
                end_date: endDate,
                models: 'MRI_AGCM3_2_S', // One of the available climate models
                daily: 'temperature_2m_mean,temperature_2m_max,temperature_2m_min,' +
                       'precipitation_sum,shortwave_radiation_sum',
                temperature_unit: 'celsius'
            });

            const response = await fetch(
                `${this.baseURL}/climate?${params}`,
                { method: 'GET' }
            );

            if (!response.ok) {
                console.warn('Climate API not available, using trend projection');
                return this.projectClimateFromHistorical(lat, lon, startDate, endDate);
            }

            const data = await response.json();
            const processed = this.processHistoricalData(data);
            this.setCache(cacheKey, processed);
            return processed;

        } catch (error) {
            console.error('Error fetching climate projections:', error);
            // Fallback to trend-based projection
            return this.projectClimateFromHistorical(lat, lon, startDate, endDate);
        }
    }

    /**
     * Process raw API data into usable format
     */
    processHistoricalData(rawData) {
        if (!rawData.daily) {
            return null;
        }

        const daily = rawData.daily;
        const dates = daily.time;
        const processedDays = [];

        for (let i = 0; i < dates.length; i++) {
            processedDays.push({
                date: dates[i],
                tempMax: daily.temperature_2m_max?.[i],
                tempMin: daily.temperature_2m_min?.[i],
                tempMean: daily.temperature_2m_mean?.[i],
                humidity: daily.relative_humidity_2m_mean?.[i],
                windSpeed: daily.wind_speed_10m_max?.[i],
                precipitation: daily.precipitation_sum?.[i],
                solarRadiation: daily.shortwave_radiation_sum?.[i]
            });
        }

        // Calculate averages
        const validDays = processedDays.filter(d => d.tempMean !== null);
        const count = validDays.length;

        return {
            days: processedDays,
            summary: {
                avgTempMax: validDays.reduce((sum, d) => sum + (d.tempMax || 0), 0) / count,
                avgTempMin: validDays.reduce((sum, d) => sum + (d.tempMin || 0), 0) / count,
                avgTempMean: validDays.reduce((sum, d) => sum + (d.tempMean || 0), 0) / count,
                avgHumidity: validDays.reduce((sum, d) => sum + (d.humidity || 0), 0) / count,
                avgWindSpeed: validDays.reduce((sum, d) => sum + (d.windSpeed || 0), 0) / count,
                totalPrecipitation: validDays.reduce((sum, d) => sum + (d.precipitation || 0), 0),
                avgSolarRadiation: validDays.reduce((sum, d) => sum + (d.solarRadiation || 0), 0) / count,
                daysAnalyzed: count
            }
        };
    }

    /**
     * Project future climate based on historical trends
     * Used as fallback when climate models not available
     */
    async projectClimateFromHistorical(lat, lon, startDate, endDate) {
        // Fetch last 10 years of historical data
        const currentYear = new Date().getFullYear();
        const historicalStart = `${currentYear - 10}-01-01`;
        const historicalEnd = `${currentYear - 1}-12-31`;

        const historical = await this.fetchHistoricalWeather(lat, lon, historicalStart, historicalEnd);

        if (!historical) {
            return this.simulateClimateProjection(lat, lon, startDate, endDate);
        }

        // Calculate trend (simple linear for demo)
        const baseTemp = historical.summary.avgTempMean;
        const tempTrendPerYear = 0.03; // ~0.03°C per year (conservative estimate)

        const startYear = parseInt(startDate.split('-')[0]);
        const endYear = parseInt(endDate.split('-')[0]);
        const yearsInFuture = startYear - currentYear;

        return {
            days: [],
            summary: {
                avgTempMax: historical.summary.avgTempMax + (tempTrendPerYear * yearsInFuture * 1.2),
                avgTempMin: historical.summary.avgTempMin + (tempTrendPerYear * yearsInFuture * 0.8),
                avgTempMean: baseTemp + (tempTrendPerYear * yearsInFuture),
                avgHumidity: historical.summary.avgHumidity * (1 + yearsInFuture * 0.001), // Slight increase
                avgWindSpeed: historical.summary.avgWindSpeed,
                totalPrecipitation: historical.summary.totalPrecipitation * (1 + yearsInFuture * 0.005),
                avgSolarRadiation: historical.summary.avgSolarRadiation * (0.98 ** yearsInFuture), // Slight decrease due to cloud cover
                daysAnalyzed: 365,
                projected: true,
                trendBased: true
            }
        };
    }

    /**
     * Simulate climate projection when no data available
     */
    simulateClimateProjection(lat, lon, startDate, endDate) {
        const absLat = Math.abs(lat);
        const baseTemp = 30 - (absLat * 0.6);

        const startYear = parseInt(startDate.split('-')[0]);
        const currentYear = new Date().getFullYear();
        const yearsInFuture = startYear - currentYear;

        return {
            days: [],
            summary: {
                avgTempMax: baseTemp + 8 + (yearsInFuture * 0.03),
                avgTempMin: baseTemp - 5 + (yearsInFuture * 0.03),
                avgTempMean: baseTemp + (yearsInFuture * 0.03),
                avgHumidity: 0.65 - (absLat * 0.005),
                avgWindSpeed: 3 + Math.abs(Math.sin(absLat * Math.PI / 90)) * 2,
                totalPrecipitation: 800 - (absLat * 10),
                avgSolarRadiation: 200 - (absLat * 2),
                daysAnalyzed: 365,
                projected: true,
                simulated: true
            }
        };
    }

    /**
     * Batch fetch for multiple locations
     */
    async fetchBatchHistorical(locations, startDate, endDate) {
        const results = await Promise.all(
            locations.map(loc =>
                this.fetchHistoricalWeather(loc.lat, loc.lon, startDate, endDate)
            )
        );

        return results.map((data, i) => ({
            location: locations[i],
            weather: data
        }));
    }

    /**
     * Cache management
     */
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        if (Date.now() - cached.timestamp > this.cacheExpiry) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    clearCache() {
        this.cache.clear();
    }
}

// Create global instance
const openMeteoAPI = new OpenMeteoAPI();

/**
 * Helper function to predict electricity demand based on weather
 */
function predictDemandFromWeather(weatherData, baselinedemand, location) {
    if (!weatherData || !weatherData.summary) {
        return baselinedemand;
    }

    const { avgTempMean, avgHumidity, avgSolarRadiation } = weatherData.summary;

    // Cooling demand (increases with temperature above 20°C)
    const coolingFactor = Math.max(0, (avgTempMean - 20) / 10);

    // Heating demand (increases with temperature below 15°C)
    const heatingFactor = Math.max(0, (15 - avgTempMean) / 15);

    // Solar offset (more solar = less grid demand during day)
    const solarOffsetFactor = avgSolarRadiation / 250; // Normalized

    // Combined weather impact
    const weatherImpact = 1 + (coolingFactor * 0.3) + (heatingFactor * 0.25) - (solarOffsetFactor * 0.1);

    return baselinedemand * weatherImpact;
}
