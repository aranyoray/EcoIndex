/**
 * EcoIndex Map - Census Tract Level Visualization
 * Lightweight map showing EcoPercentile for neighborhoods
 */

let map;
let tractLayers = [];
let currentView = 'both'; // 'water', 'greenspace', 'both', 'eco'
let visibleTracts = [];
let actionFilterActive = false;
let worstPredictedTracts = [];

// Initialize minimalist map
function initMap() {
    map = new maplibregl.Map({
        container: 'map',
        style: {
            version: 8,
            sources: {
                'carto-positron': {
                    type: 'raster',
                    tiles: [
                        'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
                        'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
                        'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
                    ],
                    tileSize: 256,
                    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>'
                }
            },
            layers: [{
                id: 'carto-positron-layer',
                type: 'raster',
                source: 'carto-positron',
                minzoom: 0,
                maxzoom: 22
            }]
        },
        center: [-122.9, 38.5], // Sonoma County, CA (testing mode)
        zoom: 10,
        attributionControl: true
    });

    map.on('load', async () => {
        document.getElementById('loading').style.display = 'none';
        await loadTractsForView();
        updateLegend();
    });

    // Load tracts when map moves (for performance)
    map.on('moveend', debounce(loadTractsForView, 500));
    map.on('zoomend', debounce(loadTractsForView, 500));

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Load tracts for current viewport
async function loadTractsForView() {
    const bounds = map.getBounds();
    const mapBounds = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
    };

    // Get tracts in viewport
    const tracts = censusTractData.getTractsInBounds(mapBounds);
    
    // Limit to reasonable number for performance (especially for testing)
    const maxTracts = 500; // Limit to 500 tracts at a time
    const limitedTracts = tracts.slice(0, maxTracts);
    
    if (tracts.length > maxTracts) {
        console.warn(`Limiting to ${maxTracts} tracts for performance (${tracts.length} total in viewport)`);
    }
    
    // Get loading elements first
    const loading = document.getElementById('loading');
    const loadingText = document.getElementById('loading-text');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    // Process tracts with eco data (async for EE integration)
    if (typeof ecoPercentileCalculator === 'undefined') {
        console.error('ecoPercentileCalculator not loaded - retrying in 500ms');
        if (loading) loading.style.display = 'none';
        
        // Retry after a short delay
        setTimeout(() => {
            if (typeof ecoPercentileCalculator !== 'undefined') {
                loadTractsForView();
            } else {
                console.error('ecoPercentileCalculator still not available');
                alert('Error: Calculator module not loaded. Please refresh the page.');
            }
        }, 500);
        return;
    }
    const loadingText = document.getElementById('loading-text');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    if (loading) {
        loading.style.display = 'block';
        if (loadingText) loadingText.textContent = `Processing ${limitedTracts.length} neighborhoods...`;
        if (progressBar) progressBar.style.width = '0%';
        if (progressText) progressText.textContent = '0%';
    }
    
    try {
        // Process with progress updates
        const processedTracts = await processTractsWithProgress(limitedTracts, (progress) => {
            if (progressBar) progressBar.style.width = progress + '%';
            if (progressText) progressText.textContent = Math.round(progress) + '%';
            if (loadingText) {
                loadingText.textContent = `Processing satellite data... ${Math.round(progress)}%`;
            }
        });
        
        visibleTracts = processedTracts;
        
        // Update map layers
        updateTractLayers();
        
        if (loading) {
            loading.style.display = 'none';
        }
    } catch (error) {
        console.error('Error processing tracts:', error);
        if (loading) {
            loading.style.display = 'none';
        }
    }
}

// Process tracts with progress updates
async function processTractsWithProgress(tracts, progressCallback) {
    if (typeof ecoPercentileCalculator === 'undefined') {
        throw new Error('ecoPercentileCalculator not available');
    }
    
    const total = tracts.length;
    const batchSize = 10; // Process in batches for progress updates
    const results = [];
    
    for (let i = 0; i < tracts.length; i += batchSize) {
        const batch = tracts.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(async (tract) => {
                const waterQuality = await ecoPercentileCalculator.estimateWaterQuality(
                    tract.properties.lat, 
                    tract.properties.lon
                );
                const greenspace = await ecoPercentileCalculator.estimateGreenspace(
                    tract.properties.lat, 
                    tract.properties.lon
                );
                
                const ecoScore = ecoPercentileCalculator.calculateEcoScore(waterQuality, greenspace);
                
                tract.properties.waterQuality = waterQuality;
                tract.properties.greenspace = greenspace;
                tract.properties.ecoScore = ecoScore;
                tract.properties.waterColor = ecoPercentileCalculator.getWaterColor(waterQuality);
                tract.properties.greenspaceColor = ecoPercentileCalculator.getGreenspaceColor(greenspace);
                
                return ecoScore;
            })
        );
        
        results.push(...batchResults);
        
        // Update progress
        const progress = ((i + batch.length) / total) * 100;
        if (progressCallback) progressCallback(progress);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    // Calculate percentiles
    ecoPercentileCalculator.allScores = results;
    tracts.forEach(tract => {
        tract.properties.ecoPercentile = ecoPercentileCalculator.calculatePercentile(
            tract.properties.ecoScore,
            ecoPercentileCalculator.allScores
        );
    });
    
    return tracts;
}

// Update tract layers on map
function updateTractLayers() {
    // Remove existing layers
    if (map.getLayer('water-tracts')) {
        map.removeLayer('water-tracts');
    }
    if (map.getLayer('greenspace-tracts')) {
        map.removeLayer('greenspace-tracts');
    }
    if (map.getLayer('eco-tracts')) {
        map.removeLayer('eco-tracts');
    }
    if (map.getSource('tracts-data')) {
        map.removeSource('tracts-data');
    }

    if (visibleTracts.length === 0) return;

    // Filter tracts if action filter is active
    let tractsToDisplay = visibleTracts;
    if (actionFilterActive && worstPredictedTracts.length > 0) {
        const worstTractIds = new Set(worstPredictedTracts.map(t => t.properties.id || `${t.properties.lat}_${t.properties.lon}`));
        tractsToDisplay = visibleTracts.filter(tract => {
            const tractId = tract.properties.id || `${tract.properties.lat}_${tract.properties.lon}`;
            return worstTractIds.has(tractId);
        });
    }

    // Create GeoJSON features
    const features = tractsToDisplay.map(tract => {
        const props = tract.properties;
        
        // Determine color based on view
        let fillColor;
        if (actionFilterActive && props.prediction) {
            // Highlight action-needed areas with red/orange
            const risk = props.prediction.riskLevel;
            if (risk === 'critical') {
                fillColor = '#ff0000'; // Bright red
            } else if (risk === 'high') {
                fillColor = '#ff6600'; // Orange
            } else {
                fillColor = '#ff9900'; // Light orange
            }
        } else if (currentView === 'water') {
            fillColor = props.waterColor;
        } else if (currentView === 'greenspace') {
            fillColor = props.greenspaceColor;
        } else if (currentView === 'eco') {
            // EcoPercentile gradient (green = good, red = bad)
            fillColor = getEcoPercentileColor(props.ecoPercentile);
        } else {
            // Both: blend water and greenspace
            fillColor = blendColors(props.waterColor, props.greenspaceColor, 0.5);
        }

        return {
            type: 'Feature',
            geometry: tract.geometry,
            properties: {
                ...props,
                fillColor: fillColor
            }
        };
    });

    // Add source
    map.addSource('tracts-data', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: features
        }
    });

    // Add fill layer
    map.addLayer({
        id: 'tracts-fill',
        type: 'fill',
        source: 'tracts-data',
        paint: {
            'fill-color': ['get', 'fillColor'],
            'fill-opacity': 0.6
        }
    });

    // Add outline
    map.addLayer({
        id: 'tracts-outline',
        type: 'line',
        source: 'tracts-data',
        paint: {
            'line-color': '#333',
            'line-width': 0.5,
            'line-opacity': 0.3
        }
    });

    // Add hover interaction
    let currentPopup = null;
    
    map.on('mouseenter', 'tracts-fill', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        
        const props = e.features[0].properties;
        if (currentPopup) {
            currentPopup.remove();
        }
        
        let popupHTML = `
            <div style="min-width: 200px;">
                <h3 style="margin-bottom: 10px; font-size: 16px;">Census Tract</h3>
                <p style="margin: 5px 0;"><strong>EcoPercentile:</strong> ${props.ecoPercentile}th</p>
                <p style="margin: 5px 0;"><strong>Water Quality:</strong> ${props.waterQuality.toFixed(0)}/100</p>
                <p style="margin: 5px 0;"><strong>Greenspace:</strong> ${props.greenspace.toFixed(0)}%</p>
                <p style="margin: 5px 0;"><strong>Eco Score:</strong> ${props.ecoScore.toFixed(0)}/100</p>
        `;
        
        // Add prediction info if available
        if (props.prediction) {
            const pred = props.prediction;
            const riskColor = pred.riskLevel === 'critical' ? '#ff0000' : 
                            pred.riskLevel === 'high' ? '#ff6600' : '#ff9900';
            popupHTML += `
                <hr style="margin: 10px 0; border: none; border-top: 1px solid #444;">
                <h4 style="margin: 10px 0 5px 0; font-size: 14px; color: ${riskColor};">
                    🚨 ${pred.riskLevel.toUpperCase()} RISK
                </h4>
                <p style="margin: 5px 0; font-size: 12px;"><strong>Predicted Score (${pred.yearsAhead} years):</strong> ${pred.predictedScore}/100</p>
                <p style="margin: 5px 0; font-size: 12px;"><strong>Annual Decline:</strong> ${pred.annualDecline.toFixed(2)} points/year</p>
                <p style="margin: 5px 0; font-size: 12px;"><strong>Action Needed:</strong> ${pred.needsAction ? 'YES' : 'No'}</p>
            `;
        }
        
        popupHTML += `</div>`;
        
        currentPopup = new maplibregl.Popup({ closeOnClick: false })
            .setLngLat(e.lngLat)
            .setHTML(popupHTML)
            .addTo(map);
    });

    map.on('mouseleave', 'tracts-fill', () => {
        map.getCanvas().style.cursor = '';
        if (currentPopup) {
            currentPopup.remove();
            currentPopup = null;
        }
    });
    
    // Update statistics
    updateStatistics();
}

// Get color for EcoPercentile
function getEcoPercentileColor(percentile) {
    // Green (good) to red (bad)
    if (percentile >= 80) return '#00cc00'; // Dark green - best
    if (percentile >= 60) return '#66cc00'; // Green
    if (percentile >= 40) return '#ffcc00'; // Yellow
    if (percentile >= 20) return '#ff9900'; // Orange
    return '#cc0000'; // Red - worst
}

// Blend two colors
function blendColors(color1, color2, ratio) {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);
    
    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);
    
    const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
    const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
    const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Toggle view mode
function toggleView(mode) {
    currentView = mode;
    actionFilterActive = false; // Turn off action filter when changing views
    
    // Update button states
    const buttons = ['btn-water', 'btn-greenspace', 'btn-both', 'btn-eco', 'btn-action'];
    buttons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.classList.toggle('active', btnId === `btn-${mode}` || (btnId === 'btn-action' && actionFilterActive));
        }
    });
    
    // Update map
    updateTractLayers();
    updateLegend();
}

// Toggle action filter (worst predicted areas)
async function toggleActionFilter() {
    actionFilterActive = !actionFilterActive;
    
    const btn = document.getElementById('btn-action');
    if (btn) {
        btn.classList.toggle('active', actionFilterActive);
    }
    
    if (actionFilterActive) {
        // Calculate predictions for visible tracts
        const loading = document.getElementById('loading');
        loading.style.display = 'block';
        loading.querySelector('p').textContent = 'Analyzing future projections...';
        
        try {
            worstPredictedTracts = await simpleAIPredictor.getWorstPredictedTracts(visibleTracts, 15);
            loading.style.display = 'none';
            
            // Update legend for action filter
            updateLegend();
            updateTractLayers();
            
            // Show count
            alert(`🚨 Found ${worstPredictedTracts.length} neighborhoods needing urgent action\n\nThese areas are predicted to have critical or high-risk declines in the next 15 years.`);
        } catch (error) {
            console.error('Error calculating predictions:', error);
            loading.style.display = 'none';
            alert('Error calculating predictions. Please try again.');
        }
    } else {
        // Turn off filter
        updateTractLayers();
        updateLegend();
    }
}

// Update legend
function updateLegend() {
    const legendTitle = document.getElementById('legend-title');
    const legendContent = document.getElementById('legend-content');

    if (currentView === 'water') {
        legendTitle.textContent = 'Water Quality';
        legendContent.innerHTML = `
            <div class="legend-item">
                <div class="legend-color" style="background: #003366;"></div>
                <span>Excellent (80-100)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #0066cc;"></div>
                <span>Good (60-80)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #3399ff;"></div>
                <span>Moderate (40-60)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #6699cc;"></div>
                <span>Poor (20-40)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #cc6666;"></div>
                <span>Polluted (0-20)</span>
            </div>
        `;
    } else if (currentView === 'greenspace') {
        legendTitle.textContent = 'Greenspace Coverage';
        legendContent.innerHTML = `
            <div class="legend-item">
                <div class="legend-color" style="background: #004d00;"></div>
                <span>Dense (80-100%)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #006600;"></div>
                <span>High (60-80%)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #339933;"></div>
                <span>Moderate (40-60%)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #66cc66;"></div>
                <span>Low (20-40%)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #99ff99;"></div>
                <span>Minimal (0-20%)</span>
            </div>
        `;
    } else if (currentView === 'eco') {
        legendTitle.textContent = 'EcoPercentile';
        legendContent.innerHTML = `
            <div class="legend-item">
                <div class="legend-color" style="background: #00cc00;"></div>
                <span>Excellent (80-100th)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #66cc00;"></div>
                <span>Good (60-80th)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #ffcc00;"></div>
                <span>Moderate (40-60th)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #ff9900;"></div>
                <span>Poor (20-40th)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #cc0000;"></div>
                <span>Very Poor (0-20th)</span>
            </div>
        `;
    } else if (actionFilterActive) {
        legendTitle.textContent = '🚨 Action Needed (15-Year Projection)';
        legendContent.innerHTML = `
            <div class="legend-item">
                <div class="legend-color" style="background: #ff0000;"></div>
                <span>Critical Risk - Urgent Action</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #ff6600;"></div>
                <span>High Risk - Action Required</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #ff9900;"></div>
                <span>Moderate Risk - Monitor</span>
            </div>
            <p style="font-size: 11px; color: #888; margin-top: 10px;">Areas predicted to decline significantly in next 15 years</p>
        `;
    } else {
        legendTitle.textContent = 'Water & Greenspace';
        legendContent.innerHTML = `
            <div class="legend-item">
                <div class="legend-color" style="background: #003366;"></div>
                <span>Clean Water</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #004d00;"></div>
                <span>Dense Greenspace</span>
            </div>
            <p style="font-size: 11px; color: #888; margin-top: 10px;">Colors blend water quality and greenspace</p>
        `;
    }
}

// Update statistics
function updateStatistics() {
    if (visibleTracts.length === 0) return;
    
    const avgPercentile = visibleTracts.reduce((sum, t) => sum + t.properties.ecoPercentile, 0) / visibleTracts.length;
    
    document.getElementById('tract-count').textContent = visibleTracts.length;
    document.getElementById('avg-percentile').textContent = Math.round(avgPercentile);
    
    const viewNames = {
        'water': 'Water Quality',
        'greenspace': 'Greenspace',
        'both': 'Both',
        'eco': 'EcoPercentile'
    };
    document.getElementById('view-mode').textContent = viewNames[currentView] || 'Both';
}

// Reset view
function resetView() {
    // Reset to Sonoma County (testing mode)
    map.flyTo({
        center: [-122.9, 38.5], // Sonoma County, CA
        zoom: 10,
        duration: 2000
    });
}

// Missing functions for HTML buttons
function useMyLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                map.flyTo({
                    center: [position.coords.longitude, position.coords.latitude],
                    zoom: 12,
                    duration: 2000
                });
            },
            (error) => {
                alert('Could not get your location: ' + error.message);
            }
        );
    } else {
        alert('Geolocation is not supported by your browser');
    }
}

function searchLocation() {
    const zipInput = document.getElementById('zip-input');
    const zipCode = zipInput.value.trim();
    
    if (!zipCode) {
        alert('Please enter a ZIP code');
        return;
    }
    
    // Simple geocoding (in production, use real API)
    alert('ZIP code search coming soon. For now, use "Use My Location" or pan the map.');
    zipInput.value = '';
}

function showComparison() {
    alert('Comparison feature coming soon. Use the "Action Needed" filter to see worst predicted areas.');
}

// Initialize on page load
window.addEventListener('load', () => {
    // Wait for calculator with retry
    function waitAndInit(maxWait = 3000) {
        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            if (typeof ecoPercentileCalculator !== 'undefined') {
                clearInterval(checkInterval);
                console.log('✓ All modules loaded, initializing map...');
                initMap();
            } else if (Date.now() - startTime > maxWait) {
                clearInterval(checkInterval);
                console.error('✗ Timeout waiting for ecoPercentileCalculator');
                const loading = document.getElementById('loading');
                if (loading) {
                    loading.querySelector('p').textContent = 
                        'Error: Calculator not loaded. Check browser console.';
                }
            }
        }, 50);
    }
    
    waitAndInit();
});

