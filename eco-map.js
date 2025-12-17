/**
 * EcoDestination Map Visualization
 * Main map controller for water quality and greenspace analysis
 */

let map;
let currentView = 'water'; // 'water', 'greenspace', 'both'
let waterBodies = [];
let greenspaceLayers = [];
let currentLocation = null;
let comparisonChart = null;

// Initialize map
function initMap() {
    map = new maplibregl.Map({
        container: 'map',
        style: 'https://demotiles.maplibre.org/style.json',
        center: [-98, 39], // Center of US
        zoom: 4,
        attributionControl: true
    });

    map.on('load', () => {
        document.getElementById('loading').style.display = 'none';
        updateLegend();
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
}

// Toggle view mode
function toggleView(mode) {
    currentView = mode;
    
    // Update button states
    document.getElementById('btn-water').classList.toggle('active', mode === 'water');
    document.getElementById('btn-greenspace').classList.toggle('active', mode === 'greenspace');
    document.getElementById('btn-both').classList.toggle('active', mode === 'both');
    
    // Update map display
    updateMapDisplay();
    updateLegend();
}

// Update map display based on current view
async function updateMapDisplay() {
    if (!currentLocation) {
        return;
    }

    // Clear existing layers
    clearMapLayers();

    if (currentView === 'water' || currentView === 'both') {
        await displayWaterBodies();
    }

    if (currentView === 'greenspace' || currentView === 'both') {
        await displayGreenspace();
    }
}

// Display water bodies
async function displayWaterBodies() {
    if (!currentLocation) return;

    const lat = currentLocation.lat;
    const lon = currentLocation.lon;

    // Find water bodies
    waterBodies = await waterQualityAnalyzer.findWaterBodies(lat, lon, 10);

    // Add markers for each water body
    waterBodies.forEach(waterBody => {
        const el = document.createElement('div');
        el.className = 'water-marker';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = waterBody.quality.color;
        el.style.border = '2px solid white';
        el.style.cursor = 'pointer';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

        // Create popup
        const popupContent = `
            <div style="min-width: 280px;">
                <h3 style="margin-bottom: 12px; font-size: 18px; border-bottom: 2px solid ${waterBody.quality.color}; padding-bottom: 8px;">
                    ${waterBody.type.charAt(0).toUpperCase() + waterBody.type.slice(1)}
                </h3>
                <div style="background: rgba(0, 212, 255, 0.1); padding: 10px; border-radius: 6px; margin-bottom: 10px;">
                    <p style="margin: 5px 0; font-size: 16px;"><strong>Quality Index:</strong> 
                        <span style="color: ${waterBody.quality.color}; font-weight: bold;">${waterBody.quality.index}/100</span>
                    </p>
                    <p style="margin: 5px 0;"><strong>Category:</strong> ${waterBody.quality.category}</p>
                    <p style="margin: 5px 0;"><strong>Trend:</strong> ${waterBody.quality.trend}</p>
                </div>
                <p style="font-size: 12px; margin: 8px 0;"><strong>📍 Area:</strong> ${waterBody.area.toFixed(2)} km²</p>
                <p style="font-size: 12px; margin: 8px 0;"><strong>🌊 Color:</strong> ${waterBody.quality.color.description}</p>
                <hr style="margin: 12px 0; border: none; border-top: 1px solid #444;">
                <p style="font-size: 13px; font-weight: bold; margin: 8px 0;">Pollutants:</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
                    <p>🧪 Nutrients: ${waterBody.quality.pollutants.nutrients}</p>
                    <p>🏔️ Sediments: ${waterBody.quality.pollutants.sediments}</p>
                    <p>🌿 Organic: ${waterBody.quality.pollutants.organic}</p>
                    <p>⚗️ Chemicals: ${waterBody.quality.pollutants.chemicals}</p>
                </div>
            </div>
        `;

        const popup = new maplibregl.Popup({
            offset: 25,
            closeButton: true,
            maxWidth: '350px'
        }).setHTML(popupContent);

        const marker = new maplibregl.Marker({ element: el })
            .setLngLat([waterBody.lon, waterBody.lat])
            .setPopup(popup)
            .addTo(map);
    });

    // Update info panel
    if (waterBodies.length > 0) {
        const avgQuality = waterBodies.reduce((sum, w) => sum + w.quality.index, 0) / waterBodies.length;
        document.getElementById('water-quality').textContent = Math.round(avgQuality);
    }
}

// Display greenspace
async function displayGreenspace() {
    if (!currentLocation) return;

    const lat = currentLocation.lat;
    const lon = currentLocation.lon;

    // Analyze greenspace
    const greenspace = await greenspaceAnalyzer.analyzeGreenspace(lat, lon);

    // Create a circle to represent greenspace coverage
    const radius = greenspace.coverage * 100; // meters

    // Add source and layer for greenspace
    if (!map.getSource('greenspace')) {
        map.addSource('greenspace', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [lon, lat]
                    },
                    properties: {
                        coverage: greenspace.coverage,
                        ndvi: greenspace.ndvi
                    }
                }]
            }
        });

        map.addLayer({
            id: 'greenspace-heat',
            type: 'circle',
            source: 'greenspace',
            paint: {
                'circle-radius': radius,
                'circle-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'coverage'],
                    0, '#ff0000',
                    25, '#ff8800',
                    50, '#88ff00',
                    75, '#00ff88',
                    100, '#00ff00'
                ],
                'circle-opacity': 0.4,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#00ff88'
            }
        });
    }

    // Update info panel
    document.getElementById('greenspace-pct').textContent = greenspace.coverage;
    
    // Calculate eco score
    const waterQuality = waterBodies.length > 0 
        ? waterBodies.reduce((sum, w) => sum + w.quality.index, 0) / waterBodies.length 
        : 50;
    const ecoScore = Math.round((waterQuality * 0.5 + greenspace.coverage * 0.5));
    document.getElementById('eco-score').textContent = ecoScore;
}

// Clear map layers
function clearMapLayers() {
    // Remove water body markers
    document.querySelectorAll('.water-marker').forEach(el => {
        const marker = el.closest('.maplibregl-marker');
        if (marker) marker.remove();
    });

    // Remove greenspace layer
    if (map.getLayer('greenspace-heat')) {
        map.removeLayer('greenspace-heat');
    }
    if (map.getSource('greenspace')) {
        map.removeSource('greenspace');
    }
}

// Update legend
function updateLegend() {
    const legendTitle = document.getElementById('legend-title');
    const legendContent = document.getElementById('legend-content');

    if (currentView === 'water' || currentView === 'both') {
        legendTitle.textContent = 'Water Quality Index';
        legendContent.innerHTML = `
            <div class="legend-item">
                <div class="legend-color" style="background: #0066cc;"></div>
                <span>Excellent (80-100)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #0099ff;"></div>
                <span>Good (60-80)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #00cc99;"></div>
                <span>Moderate (40-60)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #996633;"></div>
                <span>Poor (20-40)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #663300;"></div>
                <span>Very Poor (0-20)</span>
            </div>
        `;
    } else if (currentView === 'greenspace') {
        legendTitle.textContent = 'Greenspace Coverage';
        legendContent.innerHTML = `
            <div class="legend-item">
                <div class="legend-color" style="background: #00ff00;"></div>
                <span>Excellent (60-100%)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #88ff00;"></div>
                <span>Good (40-60%)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #ff8800;"></div>
                <span>Moderate (20-40%)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #ff0000;"></div>
                <span>Poor (0-20%)</span>
            </div>
        `;
    }
}

// Use my location
async function useMyLocation() {
    const loading = document.getElementById('loading');
    loading.style.display = 'block';
    loading.querySelector('p').textContent = 'Getting your location...';

    try {
        const location = await locationService.useMyLocation();
        currentLocation = location;
        
        // Update display
        document.getElementById('current-location').textContent = 
            locationService.formatLocationName(location);
        
        // Center map
        map.flyTo({
            center: [location.lon, location.lat],
            zoom: 12,
            duration: 2000
        });

        // Add to comparison
        locationService.addToComparison(location);

        // Update map
        await updateMapDisplay();
        
        loading.style.display = 'none';
    } catch (error) {
        alert('Error getting location: ' + error.message);
        loading.style.display = 'none';
    }
}

// Search location
async function searchLocation() {
    const zipInput = document.getElementById('zip-input');
    const zipCode = zipInput.value.trim();

    if (!zipCode) {
        alert('Please enter a ZIP code');
        return;
    }

    const loading = document.getElementById('loading');
    loading.style.display = 'block';
    loading.querySelector('p').textContent = `Looking up ZIP code ${zipCode}...`;

    try {
        const location = await locationService.lookupZipCode(zipCode);
        currentLocation = location;
        
        // Update display
        document.getElementById('current-location').textContent = 
            locationService.formatLocationName(location);
        
        // Center map
        map.flyTo({
            center: [location.lon, location.lat],
            zoom: 12,
            duration: 2000
        });

        // Add to comparison
        locationService.addToComparison(location);

        // Update map
        await updateMapDisplay();
        
        loading.style.display = 'none';
        zipInput.value = '';
    } catch (error) {
        alert('Error looking up ZIP code: ' + error.message);
        loading.style.display = 'none';
    }
}

// Show comparison
async function showComparison() {
    const comparisonLocations = locationService.getComparisonLocations();
    
    if (comparisonLocations.length === 0) {
        alert('Please add at least one location to compare');
        return;
    }

    const panel = document.getElementById('comparison-panel');
    panel.classList.add('active');

    // Display ZIP tags
    const zipTags = document.getElementById('zip-tags');
    zipTags.innerHTML = comparisonLocations.map(loc => `
        <span class="zip-code-tag">
            ${locationService.formatLocationName(loc)}
            <span class="remove" onclick="removeFromComparison('${loc.zipCode || loc.lat + ',' + loc.lon}')">×</span>
        </span>
    `).join('');

    // Create comparison chart
    await createComparisonChart(comparisonLocations);
}

// Create comparison chart
async function createComparisonChart(locations) {
    const ctx = document.getElementById('comparison-chart').getContext('2d');

    // Destroy existing chart
    if (comparisonChart) {
        comparisonChart.destroy();
    }

    // Get data for each location
    const datasets = [];
    const labels = locations.map(loc => locationService.formatLocationName(loc));

    // Water quality data
    const waterData = await Promise.all(
        locations.map(async loc => {
            const waterBodies = await waterQualityAnalyzer.findWaterBodies(loc.lat, loc.lon, 10);
            return waterBodies.length > 0
                ? waterBodies.reduce((sum, w) => sum + w.quality.index, 0) / waterBodies.length
                : 50;
        })
    );

    // Greenspace data
    const greenData = await Promise.all(
        locations.map(async loc => {
            const greenspace = await greenspaceAnalyzer.analyzeGreenspace(loc.lat, loc.lon);
            return greenspace.coverage;
        })
    );

    // Eco scores
    const ecoScores = waterData.map((water, i) => 
        Math.round(water * 0.5 + greenData[i] * 0.5)
    );

    comparisonChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Water Quality',
                    data: waterData,
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Greenspace %',
                    data: greenData,
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Eco Score',
                    data: ecoScores,
                    borderColor: '#ffd700',
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#eee'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: '#aaa'
                    },
                    grid: {
                        color: '#333'
                    }
                },
                x: {
                    ticks: {
                        color: '#aaa'
                    },
                    grid: {
                        color: '#333'
                    }
                }
            }
        }
    });

    // Find best location
    const bestIndex = ecoScores.indexOf(Math.max(...ecoScores));
    const bestLocation = locations[bestIndex];
    
    // Add best location indicator
    setTimeout(() => {
        alert(`🏆 Best Eco Destination: ${locationService.formatLocationName(bestLocation)} (Score: ${ecoScores[bestIndex]}/100)`);
    }, 500);
}

// Remove from comparison
function removeFromComparison(identifier) {
    const locations = locationService.getComparisonLocations();
    const location = locations.find(loc => 
        (loc.zipCode && loc.zipCode === identifier) ||
        (loc.lat + ',' + loc.lon === identifier)
    );
    
    if (location) {
        locationService.removeFromComparison(location);
        showComparison(); // Refresh
    }
}

// Close comparison
function closeComparison() {
    document.getElementById('comparison-panel').classList.remove('active');
}

// Show AI predictions
async function showPredictions() {
    if (!currentLocation) {
        alert('Please select a location first');
        return;
    }

    const loading = document.getElementById('loading');
    loading.style.display = 'block';
    loading.querySelector('p').textContent = 'Generating AI predictions...';

    try {
        const predictions = await aiPredictor.predictFuture(
            currentLocation.lat,
            currentLocation.lon,
            6
        );

        // Display predictions in a modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(26, 26, 46, 0.98);
            padding: 30px;
            border-radius: 12px;
            z-index: 10001;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.7);
            max-width: 800px;
            color: #eee;
        `;

        modal.innerHTML = `
            <h2 style="margin-bottom: 20px; color: #00d4ff;">🤖 AI Predictions (Next 6 Months)</h2>
            <canvas id="prediction-chart" width="700" height="400"></canvas>
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="this.closest('div').remove(); document.querySelector('.modal-overlay')?.remove();" 
                        style="padding: 10px 24px; background: #00d4ff; border: none; border-radius: 6px; color: #1a1a2e; cursor: pointer; font-weight: bold;">
                    Close
                </button>
            </div>
        `;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(modal);

        // Create prediction chart
        const ctx = document.getElementById('prediction-chart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: predictions.waterQuality.map(p => new Date(p.date).toLocaleDateString()),
                datasets: [
                    {
                        label: 'Predicted Water Quality',
                        data: predictions.waterQuality.map(p => p.quality),
                        borderColor: '#00d4ff',
                        backgroundColor: 'rgba(0, 212, 255, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Predicted Greenspace %',
                        data: predictions.greenspace.map(p => p.coverage),
                        borderColor: '#00ff88',
                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#eee'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: '#aaa'
                        },
                        grid: {
                            color: '#333'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#aaa'
                        },
                        grid: {
                            color: '#333'
                        }
                    }
                }
            }
        });

        loading.style.display = 'none';
    } catch (error) {
        console.error('Error generating predictions:', error);
        alert('Error generating predictions: ' + error.message);
        loading.style.display = 'none';
    }
}

// Reset view
function resetView() {
    map.flyTo({
        center: [-98, 39],
        zoom: 4,
        duration: 2000
    });
    currentLocation = null;
    clearMapLayers();
    document.getElementById('current-location').textContent = 'None selected';
    document.getElementById('water-quality').textContent = '--';
    document.getElementById('greenspace-pct').textContent = '--';
    document.getElementById('eco-score').textContent = '--';
}

// Initialize on page load
window.addEventListener('load', () => {
    initMap();
});

// Allow Enter key to search
document.addEventListener('DOMContentLoaded', () => {
    const zipInput = document.getElementById('zip-input');
    if (zipInput) {
        zipInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchLocation();
            }
        });
    }
});

