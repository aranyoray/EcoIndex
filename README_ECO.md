# 🌊 EcoDestination - Water Quality & Greenspace Analysis

An interactive web application for analyzing water quality and greenspace coverage using satellite imagery and AI predictions. Compare multiple locations to find the most eco-friendly destinations.

## 🎯 Features

### Water Quality Analysis
- **Satellite Color Analysis**: Analyzes water bodies using satellite imagery color patterns
- **Quality Index**: 0-100 scale rating water quality
- **Pollution Detection**: Estimates nutrient, sediment, organic, and chemical pollutants
- **Trend Analysis**: Tracks water quality trends over time (improving/declining/stable)
- **Historical Data**: View water quality changes over the past 12 months

### Greenspace Analysis
- **NDVI Analysis**: Uses Normalized Difference Vegetation Index from satellite imagery
- **Coverage Percentage**: Shows greenspace coverage as a percentage
- **Park Detection**: Identifies parks and natural areas
- **Tree Coverage**: Estimates tree coverage within greenspace
- **Seasonal Patterns**: Accounts for seasonal variations in vegetation

### Location Services
- **Geolocation**: Automatically detect your current location
- **ZIP Code Lookup**: Search by ZIP code to analyze any US location
- **Multiple Location Comparison**: Compare water quality and greenspace across multiple locations

### AI Predictions
- **Future Trends**: Predicts water quality and greenspace trends for the next 6 months
- **Machine Learning**: Uses TensorFlow.js neural networks trained on historical patterns
- **Seasonal Forecasting**: Accounts for seasonal patterns in predictions
- **Confidence Levels**: Provides prediction confidence based on data quality

### Comparison Tools
- **Multi-Location Charts**: Line graphs comparing water quality, greenspace, and eco scores
- **Eco Score Calculation**: Combined score (50% water quality + 50% greenspace)
- **Best Destination Finder**: Automatically identifies the best eco destination

## 🚀 Getting Started

### Quick Start

Simply open `eco-destination.html` in a modern web browser. No build process required!

```bash
# Open in browser
open eco-destination.html                    # macOS
xdg-open eco-destination.html               # Linux
start eco-destination.html                   # Windows
```

### Files Structure

```
EcoDestination/
├── eco-destination.html      # Main HTML file
├── water-quality.js          # Water quality analysis module
├── greenspace-analysis.js    # Greenspace analysis module
├── location-service.js       # Geolocation and ZIP code lookup
├── earth-engine.js           # Google Earth Engine integration
├── ai-predictions.js         # AI prediction models
└── eco-map.js                # Main map visualization
```

## 📊 How to Use

### 1. Select a Location

**Option A: Use Your Location**
- Click "📍 Use My Location" button
- Grant location permissions when prompted
- The map will center on your location and analyze nearby water bodies and greenspace

**Option B: Enter ZIP Code**
- Type a ZIP code in the search box
- Click "🔍 Search" or press Enter
- The map will center on that location

### 2. View Analysis

**Toggle Views:**
- **💧 Water Quality**: Shows only water bodies with quality indicators
- **🌳 Greenspace**: Shows greenspace coverage areas
- **🌊🌳 Both**: Shows both water and greenspace data

**Click on Markers:**
- Click any water body marker to see detailed quality information
- View pollution levels, trends, and historical data

### 3. Compare Locations

1. Add multiple locations (use location button or search ZIP codes)
2. Click "📊 Compare Locations"
3. View line graphs comparing:
   - Water Quality Index
   - Greenspace Coverage %
   - Combined Eco Score
4. The app will highlight the best eco destination

### 4. AI Predictions

1. Select a location first
2. Click "🤖 AI Predictions"
3. View predicted trends for the next 6 months
4. See how water quality and greenspace are expected to change

## 🔬 Technical Details

### Water Quality Analysis

The water quality index is calculated using:
- **Satellite Color Analysis**: Blue = good, Green/Brown = algae/pollution, Dark = sediment
- **Regional Factors**: Urban areas, coastal regions, seasonal variations
- **Pollution Estimates**: Nutrients, sediments, organic matter, chemicals

### Greenspace Analysis

Uses NDVI (Normalized Difference Vegetation Index):
- **NDVI Range**: -1 to 1
- **> 0.3**: Vegetation present
- **> 0.6**: Dense vegetation
- **Coverage Calculation**: Converts NDVI to percentage coverage

### AI Predictions

**Model Architecture:**
- Neural network with 3 hidden layers (32, 16, 8 neurons)
- Trained on 12 months of historical data
- Uses seasonal patterns and trends
- Built with TensorFlow.js

**Input Features:**
- 12 months of historical water quality/greenspace data
- Seasonal patterns
- Regional factors

**Output:**
- Predicted quality/coverage for next 6 months
- Confidence levels (low/medium/high)

### Google Earth Engine Integration

The app is designed to integrate with Google Earth Engine API for real satellite imagery:

**Water Quality:**
- Uses Sentinel-2 or Landsat imagery
- Calculates NDWI (Normalized Difference Water Index)
- Analyzes turbidity from color bands

**Greenspace:**
- Uses Landsat NDVI calculations
- Detects vegetation coverage
- Accounts for seasonal variations

**Note**: Currently uses simulated data. To use real satellite data:
1. Set up Google Earth Engine API credentials
2. Update `earth-engine.js` with your API key
3. Uncomment the Earth Engine API calls

## 🎨 Color Coding

### Water Quality
- 🔵 **Blue (#0066cc)**: Excellent (80-100)
- 🔵 **Light Blue (#0099ff)**: Good (60-80)
- 🟢 **Green (#00cc99)**: Moderate (40-60)
- 🟤 **Brown (#996633)**: Poor (20-40)
- 🟤 **Dark Brown (#663300)**: Very Poor (0-20)

### Greenspace
- 🟢 **Green (#00ff00)**: Excellent (60-100%)
- 🟢 **Light Green (#88ff00)**: Good (40-60%)
- 🟠 **Orange (#ff8800)**: Moderate (20-40%)
- 🔴 **Red (#ff0000)**: Poor (0-20%)

## 🌟 Future Enhancements

- [ ] Real-time Google Earth Engine API integration
- [ ] More detailed pollution breakdown
- [ ] Historical trend charts for individual locations
- [ ] Export comparison reports
- [ ] Mobile app version
- [ ] Integration with EPA water quality databases
- [ ] Real-time satellite imagery updates
- [ ] Community reporting features
- [ ] Environmental impact scoring

## 📚 API Integration

### Google Earth Engine Setup

To use real satellite imagery:

1. **Sign up for Google Earth Engine**: https://earthengine.google.com/
2. **Get API credentials**: Follow Google Cloud setup
3. **Add API key**: Set environment variable or update `earth-engine.js`

```javascript
// In earth-engine.js
await earthEngineService.initialize('YOUR_API_KEY');
```

### Geocoding API

For production ZIP code lookup, integrate with:
- Google Maps Geocoding API
- Mapbox Geocoding API
- OpenStreetMap Nominatim

Update `location-service.js` with your preferred service.

## 🐛 Known Limitations

- Currently uses simulated data (replace with real APIs for production)
- ZIP code lookup is limited to common US ZIP codes
- AI models are trained on synthetic data (use real historical data for production)
- Google Earth Engine integration requires API setup
- Limited to US locations (can be extended globally)

## 📝 License

This project is created for environmental analysis and educational purposes.

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Add more accurate geocoding
- Integrate real satellite data sources
- Improve AI model accuracy
- Add more location types (international)
- Enhance visualization options

---

**Made with 🌊🌳 for understanding and protecting our environment**

