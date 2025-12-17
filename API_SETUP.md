# API Setup Guide

## Overview

EvapoScore now supports real-time climate and electricity demand data through government APIs. This guide explains how to set up and use these features.

## Data Sources

### 1. NOAA Climate Data API

**What it provides:**
- Historical temperature data
- Humidity levels
- Wind speed
- Precipitation
- Solar radiation (where available)

**Resolution:** ZIP code level (finest granularity available)

**How to get an API key:**
1. Visit: https://www.ncdc.noaa.gov/cdo-web/token
2. Enter your email address
3. Receive your API token via email (usually within minutes)
4. Free for unlimited use

**API Documentation:**
- API Docs: https://www.ncdc.noaa.gov/cdo-web/webservices/v2
- Data Coverage: https://www.climate.gov/maps-data

### 2. EIA (Energy Information Administration) API

**What it provides:**
- Historical electricity sales by state
- Electricity consumption by sector (residential, commercial, industrial)
- Price and demand data
- Power generation by source

**Resolution:** State level (ZIP code data not publicly available)

**How to get an API key:**
1. Visit: https://www.eia.gov/opendata/register.php
2. Create a free account
3. Receive API key immediately after registration
4. Free for unlimited use

**API Documentation:**
- API Browser: https://www.eia.gov/opendata/browser/
- Technical Docs: https://www.eia.gov/opendata/documentation.php
- Data Catalog: https://catalog.data.gov/dataset?publisher=U.S.+Energy+Information+Administration

## Setting Up API Keys in EvapoScore

### Method 1: Using the UI

1. Open the application
2. Click the "🔑 API Keys" button in the controls panel
3. Enter your NOAA API token
4. Enter your EIA API token
5. Click "Save"
6. Refresh the page to start using real data

### Method 2: Browser Console

```javascript
// Set NOAA token
localStorage.setItem('noaa_api_token', 'YOUR_NOAA_TOKEN_HERE');

// Set EIA token
localStorage.setItem('eia_api_token', 'YOUR_EIA_TOKEN_HERE');

// Refresh the page
location.reload();
```

## Features Available with API Integration

### 1. Time Slider (2015-2024)

- **Play/Pause:** Automatically scrub through years
- **Manual Control:** Drag slider to any specific year
- **Statistics:** View year-over-year trends
- **Comparison:** Compare multiple years side-by-side

### 2. Real Climate Data

When NOAA API is configured:
- Actual temperature readings from weather stations
- Real humidity and wind data
- Improved evaporation power calculations

### 3. Electricity Demand Data

When EIA API is configured:
- State-level electricity consumption trends
- Sector-specific demand (residential vs. commercial vs. industrial)
- Historical demand growth patterns

## Data Limitations

### What IS Available:

✅ **Climate Data (NOAA)**
- ZIP code level
- Daily granularity
- 10+ years of history
- Temperature, humidity, wind, precipitation

✅ **Electricity Data (EIA)**
- State level
- Monthly/annual granularity
- 20+ years of history
- Sales, consumption, prices by sector

### What is NOT Available:

❌ **ZIP Code Level Electricity Demand**
- Not publicly available from any federal API
- Would require aggregating data from 3,000+ utility companies
- Proprietary data from utilities

❌ **Real-time Data**
- NOAA: Updated daily
- EIA: Updated monthly
- Both have 1-2 month lag

## Without API Keys

The application works perfectly without API keys by using:
- **Simulated climate data** based on geographic algorithms
- **Estimated electricity demand** based on population and state averages
- **Historical trends** modeled from typical growth patterns

The simulations are scientifically grounded and provide reasonable estimates for planning purposes.

## API Rate Limits

### NOAA API
- **Rate limit:** 5 requests per second, 10,000 per day
- **Data points:** Up to 1,000 results per request
- **Recommendation:** Use caching (built into EvapoScore)

### EIA API
- **Rate limit:** No published limit
- **Recommendation:** Use caching (built into EvapoScore)
- **Best practice:** One request per state per year

## Caching

EvapoScore automatically caches all API responses for 24 hours to:
- Reduce API calls
- Improve performance
- Prevent hitting rate limits
- Enable offline usage

Cache is stored in browser memory and cleared on refresh.

## Troubleshooting

### "API token not set" warning
- Check that you've entered your tokens correctly
- Verify tokens are not expired
- Refresh the page after setting tokens

### Data not loading
- Check browser console for errors
- Verify API keys are valid
- Check your internet connection
- Try clearing browser cache

### ZIP code not found
- Some ZIP codes may not have weather stations nearby
- Try a nearby ZIP code
- Application will fall back to simulated data

## Future Enhancements

**Planned features:**
- 📍 True ZIP code resolution (~42,000 locations)
- 🏭 Integration with utility-specific data where available
- 🌐 Export data for analysis
- 📊 Advanced visualization options
- 🔄 Real-time data updates

## Support

For issues or questions:
- GitHub Issues: https://github.com/aranyoray/EvapoScore/issues
- NOAA Support: https://www.ncei.noaa.gov/support/access-data
- EIA Support: https://www.eia.gov/about/contact_us/

## References

- [NOAA Climate Data Online](https://www.ncei.noaa.gov/cdo-web/)
- [EIA Open Data](https://www.eia.gov/opendata/)
- [Past Weather by ZIP Code](https://www.climate.gov/maps-data/dataset/past-weather-zip-code-data-table)
- [EIA Electricity Data Browser](https://www.eia.gov/electricity/data/browser/)
