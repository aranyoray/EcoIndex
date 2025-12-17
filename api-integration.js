/**
 * API Integration Module for Climate and Energy Data
 * Integrates with NOAA Climate Data API and EIA Energy Data API
 */

class DataAPIIntegration {
    constructor() {
        // API endpoints
        this.noaaBaseURL = 'https://www.ncei.noaa.gov/cdo-web/api/v2';
        this.eiaBaseURL = 'https://api.eia.gov/v2';

        // API keys (users should set their own)
        this.noaaToken = localStorage.getItem('noaa_api_token') || null;
        this.eiaToken = localStorage.getItem('eia_api_token') || null;

        // Cache for API responses
        this.cache = new Map();
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
    }

    /**
     * Set API tokens
     */
    setTokens(noaaToken, eiaToken) {
        this.noaaToken = noaaToken;
        this.eiaToken = eiaToken;
        if (noaaToken) localStorage.setItem('noaa_api_token', noaaToken);
        if (eiaToken) localStorage.setItem('eia_api_token', eiaToken);
    }

    /**
     * Fetch NOAA climate data for a location
     * @param {string} zipCode - US ZIP code
     * @param {string} startDate - Start date (YYYY-MM-DD)
     * @param {string} endDate - End date (YYYY-MM-DD)
     * @returns {Promise<Object>} Climate data
     */
    async fetchNOAAClimateData(zipCode, startDate, endDate) {
        const cacheKey = `noaa_${zipCode}_${startDate}_${endDate}`;

        // Check cache
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        if (!this.noaaToken) {
            console.warn('NOAA API token not set. Using simulated data.');
            return this.simulateClimateData(zipCode, startDate, endDate);
        }

        try {
            // First, get the location ID for the ZIP code
            const locationResponse = await fetch(
                `${this.noaaBaseURL}/locations?locationcategoryid=ZIP&limit=1000`,
                {
                    headers: { 'token': this.noaaToken }
                }
            );

            if (!locationResponse.ok) {
                throw new Error(`NOAA API error: ${locationResponse.status}`);
            }

            // Then fetch daily summaries for the location
            const dataResponse = await fetch(
                `${this.noaaBaseURL}/data?datasetid=GHCND&locationid=ZIP:${zipCode}` +
                `&startdate=${startDate}&enddate=${endDate}` +
                `&datatypeid=TMAX,TMIN,AWND,PRCP&units=metric&limit=1000`,
                {
                    headers: { 'token': this.noaaToken }
                }
            );

            if (!dataResponse.ok) {
                throw new Error(`NOAA API error: ${dataResponse.status}`);
            }

            const data = await dataResponse.json();
            const processedData = this.processNOAAData(data);

            this.setCache(cacheKey, processedData);
            return processedData;

        } catch (error) {
            console.error('Error fetching NOAA data:', error);
            return this.simulateClimateData(zipCode, startDate, endDate);
        }
    }

    /**
     * Process raw NOAA API data
     */
    processNOAAData(rawData) {
        if (!rawData.results || rawData.results.length === 0) {
            return null;
        }

        const grouped = {};

        rawData.results.forEach(record => {
            const date = record.date.split('T')[0];
            if (!grouped[date]) {
                grouped[date] = {};
            }
            grouped[date][record.datatype] = record.value;
        });

        // Calculate averages
        const dates = Object.keys(grouped);
        let avgTempMax = 0, avgTempMin = 0, avgWind = 0, totalPrecip = 0;

        dates.forEach(date => {
            const day = grouped[date];
            if (day.TMAX) avgTempMax += day.TMAX;
            if (day.TMIN) avgTempMin += day.TMIN;
            if (day.AWND) avgWind += day.AWND;
            if (day.PRCP) totalPrecip += day.PRCP;
        });

        const count = dates.length;

        return {
            avgTemp: ((avgTempMax + avgTempMin) / 2 / count),
            avgTempMax: avgTempMax / count,
            avgTempMin: avgTempMin / count,
            avgWindSpeed: avgWind / count,
            totalPrecipitation: totalPrecip,
            daysAnalyzed: count,
            dateRange: {
                start: dates[0],
                end: dates[dates.length - 1]
            }
        };
    }

    /**
     * Fetch EIA electricity data by state
     * @param {string} state - State abbreviation (e.g., 'CA')
     * @param {string} year - Year (e.g., '2024')
     * @returns {Promise<Object>} Electricity demand data
     */
    async fetchEIAElectricityData(state, year) {
        const cacheKey = `eia_${state}_${year}`;

        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        if (!this.eiaToken) {
            console.warn('EIA API token not set. Using simulated data.');
            return this.simulateElectricityData(state, year);
        }

        try {
            // Fetch state-level electricity sales data
            const response = await fetch(
                `${this.eiaBaseURL}/electricity/retail-sales/data/` +
                `?api_key=${this.eiaToken}&frequency=annual&data[0]=sales` +
                `&facets[stateid][]=${state}&start=${year}&end=${year}&sort[0][column]=period&sort[0][direction]=desc`,
                {
                    headers: {
                        'X-Params': JSON.stringify({
                            frequency: 'annual',
                            data: ['sales'],
                            facets: { stateid: [state] },
                            start: year,
                            end: year
                        })
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`EIA API error: ${response.status}`);
            }

            const data = await response.json();
            const processedData = this.processEIAData(data, state, year);

            this.setCache(cacheKey, processedData);
            return processedData;

        } catch (error) {
            console.error('Error fetching EIA data:', error);
            return this.simulateElectricityData(state, year);
        }
    }

    /**
     * Process raw EIA API data
     */
    processEIAData(rawData, state, year) {
        if (!rawData.response || !rawData.response.data) {
            return null;
        }

        const data = rawData.response.data;

        // Aggregate by sector
        const sectors = {
            residential: 0,
            commercial: 0,
            industrial: 0,
            transportation: 0,
            total: 0
        };

        data.forEach(record => {
            const sector = record.sectorid?.toLowerCase() || 'other';
            const sales = parseFloat(record.sales) || 0;

            if (sectors.hasOwnProperty(sector)) {
                sectors[sector] += sales;
            }
            sectors.total += sales;
        });

        return {
            state: state,
            year: parseInt(year),
            sales: sectors,
            unit: 'million kilowatthours',
            avgDemandMWh: sectors.total / 12 // Monthly average
        };
    }

    /**
     * Simulate climate data when API is not available
     */
    simulateClimateData(zipCode, startDate, endDate) {
        // Use a deterministic random based on zip code
        const seed = parseInt(zipCode) || 10000;
        const random = () => {
            const x = Math.sin(seed) * 10000;
            return x - Math.floor(x);
        };

        return {
            avgTemp: 15 + random() * 20,
            avgTempMax: 20 + random() * 25,
            avgTempMin: 10 + random() * 15,
            avgWindSpeed: 2 + random() * 5,
            totalPrecipitation: random() * 1000,
            daysAnalyzed: 365,
            dateRange: { start: startDate, end: endDate },
            simulated: true
        };
    }

    /**
     * Simulate electricity data when API is not available
     */
    simulateElectricityData(state, year) {
        const statePopulations = {
            'CA': 39538223, 'TX': 29145505, 'FL': 21538187, 'NY': 20201249,
            'PA': 13002700, 'IL': 12812508, 'OH': 11799448, 'GA': 10711908,
            // Add more states as needed
        };

        const population = statePopulations[state] || 5000000;
        const baseConsumption = 11000; // kWh per capita per year (US average)
        const totalMWh = (population * baseConsumption) / 1000;

        return {
            state: state,
            year: parseInt(year),
            sales: {
                residential: totalMWh * 0.38,
                commercial: totalMWh * 0.36,
                industrial: totalMWh * 0.26,
                transportation: totalMWh * 0.001,
                total: totalMWh
            },
            unit: 'million kilowatthours',
            avgDemandMWh: totalMWh / 12,
            simulated: true
        };
    }

    /**
     * Get historical data for multiple years
     */
    async fetchHistoricalData(location, startYear, endYear, dataType = 'both') {
        const years = [];
        for (let year = startYear; year <= endYear; year++) {
            years.push(year);
        }

        const results = await Promise.all(
            years.map(async (year) => {
                const data = { year };

                if (dataType === 'climate' || dataType === 'both') {
                    data.climate = await this.fetchNOAAClimateData(
                        location,
                        `${year}-01-01`,
                        `${year}-12-31`
                    );
                }

                if (dataType === 'electricity' || dataType === 'both') {
                    // For electricity, we need state code
                    data.electricity = await this.fetchEIAElectricityData(
                        location.state || 'CA',
                        year.toString()
                    );
                }

                return data;
            })
        );

        return results;
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
const dataAPI = new DataAPIIntegration();

/**
 * UI for API token configuration
 */
function showAPIConfigModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(26, 26, 46, 0.98);
        padding: 30px;
        border-radius: 12px;
        z-index: 10000;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.7);
        max-width: 500px;
        color: #eee;
    `;

    modal.innerHTML = `
        <h2 style="margin-bottom: 20px; color: #667eea;">API Configuration</h2>
        <p style="margin-bottom: 15px; font-size: 14px; color: #aaa;">
            Get free API keys from:
        </p>
        <ul style="margin-bottom: 20px; padding-left: 20px; font-size: 13px; color: #aaa;">
            <li><a href="https://www.ncdc.noaa.gov/cdo-web/token" target="_blank" style="color: #667eea;">NOAA Climate Data</a></li>
            <li><a href="https://www.eia.gov/opendata/register.php" target="_blank" style="color: #667eea;">EIA Energy Data</a></li>
        </ul>
        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-size: 14px;">NOAA API Token:</label>
            <input type="text" id="noaa-token" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #444; background: #1a1a2e; color: #eee;"
                   value="${dataAPI.noaaToken || ''}" placeholder="Enter NOAA token">
        </div>
        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-size: 14px;">EIA API Token:</label>
            <input type="text" id="eia-token" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #444; background: #1a1a2e; color: #eee;"
                   value="${dataAPI.eiaToken || ''}" placeholder="Enter EIA token">
        </div>
        <div style="display: flex; gap: 10px;">
            <button id="save-tokens" style="flex: 1; padding: 10px; background: #667eea; border: none; border-radius: 6px; color: white; cursor: pointer; font-weight: bold;">
                Save
            </button>
            <button id="cancel-tokens" style="flex: 1; padding: 10px; background: #444; border: none; border-radius: 6px; color: white; cursor: pointer;">
                Cancel
            </button>
        </div>
    `;

    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 9999;
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    document.getElementById('save-tokens').onclick = () => {
        const noaaToken = document.getElementById('noaa-token').value;
        const eiaToken = document.getElementById('eia-token').value;
        dataAPI.setTokens(noaaToken, eiaToken);
        document.body.removeChild(modal);
        document.body.removeChild(overlay);
        alert('API tokens saved! Refresh the page to use real data.');
    };

    document.getElementById('cancel-tokens').onclick = () => {
        document.body.removeChild(modal);
        document.body.removeChild(overlay);
    };
}
