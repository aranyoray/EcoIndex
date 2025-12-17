# EvaEnergy Multi-Page Suite

## Overview

EvaEnergy has been expanded into a comprehensive 4-page energy analysis platform:

1. **EvaDemand** (eva-demand.html) - Energy demand forecasting
2. **EvaSupply** (eva-supply.html) - Energy supply & generation capacity
3. **EvaDeficit** (eva-deficit.html) - Supply-demand gap analysis
4. **EvaPrice** (eva-price.html) - Energy price predictions

## Current Status

✅ **Completed:**
- Multi-page architecture with shared navigation
- Open-Meteo API integration for weather predictions (NO API KEY NEEDED!)
- Energy capacity data for all 50 US states
- Time slider component (2015-2024)
- County-level resolution for all pages
- Navigation between pages

✅ **Data Sources Integrated:**
- Open-Meteo API (free, no key required) - weather data & forecasts
- EIA state energy capacity data
- DOE nuclear generation data
- State consumption data

## Page Details

### 1. EvaDemand - Energy Demand Analysis

**Features:**
- Population-based demand calculation
- Weather-pattern demand prediction
- Industrial activity indicators
- Peak demand forecasting
- Historical demand trends (2015-2024)

**Data Shown:**
- Current demand (MW)
- Peak demand periods
- Demand density (MW/km²)
- Industry type (Residential/Commercial/Industrial)

**Future Weather Integration:**
- Open-Meteo provides 16-day forecasts
- Long-term climate projections to 2050
- Temperature-based demand modeling
- Cooling/heating demand factors

### 2. EvaSupply - Energy Supply Analysis

**Features:**
- Current generation capacity by source
- Renewable vs non-renewable breakdown
- Solar/wind/hydro potential
- Geothermal opportunities
- Evaporation engine potential
- Nuclear capacity

**Data Sources:**
- EIA state capacity data (all 50 states)
- Nuclear generation: https://www.eia.gov/nuclear/generation/
- Renewable potential maps
- DOE databases

**Energy Mix Shown:**
- Nuclear, Coal, Natural Gas
- Hydro, Wind, Solar
- Geothermal, Biomass
- Evaporation engines (new!)

### 3. EvaDeficit - Energy Deficit Analysis

**Features:**
- Real-time supply-demand gap
- Future deficit projections (2025-2045)
- Heat maps showing energy stress
- State-by-state recommendations
- Climate impact on future demand

**Recommendations Engine:**
- Nuclear expansion suggestions
- Renewable energy priorities
- Geothermal development areas
- Grid infrastructure needs

**Hover Details Show:**
- Current capacity by source
- Current consumption
- Surplus/deficit
- Recommended investments

### 4. EvaPrice - Price Prediction Engine

**Features:**
- Historical price trends
- Future price predictions
- Supply-demand impact on pricing
- Weather impact on prices
- Renewable penetration effects

**Prediction Factors:**
- Supply availability
- Demand fluctuations
- Weather patterns
- Fuel costs
- Grid constraints

## Key Technologies

### APIs Used (All Free!)

1. **Open-Meteo API** ⭐ NO API KEY REQUIRED
   - Historical weather (1940-present)
   - 16-day forecasts
   - Climate projections to 2050
   - https://open-meteo.com

2. **EIA API** (Optional - enhances data)
   - State electricity data
   - Free with quick registration
   - https://www.eia.gov/opendata/

3. **NOAA API** (Optional - for detailed climate)
   - ZIP code level weather
   - https://www.ncdc.noaa.gov/cdo-web/

### Data Files

- `us-counties-data.js` - 300+ US counties with coordinates
- `energy-capacity-data.js` - State energy capacity & mix
- `open-meteo-api.js` - Weather API integration
- `shared-nav.js` - Navigation across pages
- `time-slider.js` - Historical data slider

## Implementation Details

### Resolution Options

**Current: County Level**
- ~300 major US counties
- Fast performance
- Good overview

**Coming: ZIP Code Level**
- ~42,000 ZIP codes
- Very detailed
- Requires marker clustering
- May impact performance

### Time Slider

- Range: 2015-2024 (historical)
- Can extend to 2045 (predictions)
- Play/pause animation
- Year-over-year comparison
- Weather-adjusted predictions

### Weather Predictions

**Open-Meteo provides:**

1. **Short-term (16 days):**
   - Temperature forecasts
   - Humidity, wind, solar
   - No API key needed!

2. **Long-term (to 2050):**
   - CMIP6 climate models
   - Temperature trends
   - Precipitation changes
   - Free access

### Demand Prediction Model

```javascript
demand = baseDemand * weatherFactor * industryFactor * seasonalFactor

where:
- baseDemand = population * 15 kW/capita
- weatherFactor = 1 + coolingDemand + heatingDemand
- coolingDemand = max(0, (temp - 20°C) * 0.03)
- heatingDemand = max(0, (15°C - temp) * 0.025)
```

### Supply Calculation

```javascript
totalSupply = Σ(capacity_source * capacityFactor_source)

Renewable% = (hydro + wind + solar + geothermal + biomass) / total * 100
```

### Deficit Calculation

```javascript
deficit = annualDemand - annualGeneration
selfSufficiency = (generation / demand) * 100

Recommendations based on:
- Existing infrastructure
- Natural resources (sun, wind, geo)
- Grid needs
- Cost factors
```

### Price Prediction

```javascript
price_t+1 = basePrice * (1 + deficitImpact + fuelCostImpact + weatherImpact)

where:
- deficitImpact = (deficit / demand) * 0.5
- fuelCostImpact = Δ(fuel costs)
- weatherImpact = temperatureDeviation * 0.02
```

## Usage Instructions

### Basic Usage

1. Open any of the 4 HTML files in a browser
2. Navigate between pages using the sidebar
3. Use time slider to view historical data
4. Hover over locations for details
5. Click controls for special views

### With API Keys (Optional)

1. Click "🔑 API Keys" button
2. Enter NOAA token (optional)
3. Enter EIA token (optional)
4. Saves to localStorage
5. Real data instead of simulated

**Note:** Open-Meteo works WITHOUT any API key!

### Custom Data

To add your own data:
1. Edit `us-counties-data.js` for locations
2. Edit `energy-capacity-data.js` for capacities
3. Modify prediction algorithms in each page's JS file

## Future Enhancements

### Planned Features

- [ ] Full ZIP code resolution (~42K locations)
- [ ] Real-time data feeds
- [ ] Export to CSV/JSON
- [ ] Print/PDF reports
- [ ] Advanced filtering
- [ ] Custom date ranges
- [ ] Scenario modeling
- [ ] Cost-benefit analysis
- [ ] Grid stability metrics
- [ ] Carbon emissions tracking

### Data Integrations

- [ ] Utility-specific data
- [ ] Real-time pricing feeds
- [ ] Weather station networks
- [ ] Smart meter data
- [ ] Renewable forecasts
- [ ] Battery storage data

## File Structure

```
EvaEnergy/
├── index.html (original evaporation engine map)
├── eva-demand.html (demand analysis)
├── eva-supply.html (supply analysis)
├── eva-deficit.html (deficit analysis)
├── eva-price.html (price predictions)
├── shared-nav.js (navigation component)
├── open-meteo-api.js (weather API)
├── energy-capacity-data.js (state capacities)
├── time-slider.js (time controls)
├── us-counties-data.js (location data)
├── evaporation-calc.js (evap calculations)
└── API_SETUP.md (API documentation)
```

## Development Notes

### Performance Considerations

- County level: ~300 markers (fast)
- ZIP code level: ~42K markers (needs clustering)
- Use marker clustering for ZIP codes
- Cache API responses (24hr default)
- Lazy load data as needed

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript required
- MapLibre GL JS for mapping
- Local storage for settings

## Support & Contributing

### Issues

Report bugs or request features:
- GitHub Issues: https://github.com/aranyoray/EvaEnergy/issues

### Data Sources

- EIA: https://www.eia.gov
- NOAA: https://www.noaa.gov
- Open-Meteo: https://open-meteo.com
- DOE: https://www.energy.gov/data/open-energy-data

### License

This project uses open government data sources.
Code is available for educational and research purposes.

## Quick Start Guide

1. **View Demand:** Open `eva-demand.html`
2. **Check Supply:** Click "EvaSupply" in navigation
3. **Find Deficits:** Click "EvaDeficit"
4. **Price Forecast:** Click "EvaPrice"
5. **Use Time Slider:** Scrub through years at bottom
6. **Compare:** Click "Compare Years" button

## Questions?

See `API_SETUP.md` for detailed API documentation.
Check console (F12) for debug information.
All simulated data works offline!
