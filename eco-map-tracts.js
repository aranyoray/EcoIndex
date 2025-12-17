/**
 * EcoIndex Map - Census Tract Level Visualization
 * Lightweight map showing EcoPercentile for neighborhoods
 */

let map;
let tractLayers = [];
let currentView = 'both'; // 'water', 'greenspace', 'both', 'eco'
let visibleTracts = [];

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
        center: [-98, 39], // Center of US
        zoom: 4,
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
    
    // Process tracts with eco data (async for EE integration)
    if (typeof ecoPercentileCalculator === 'undefined') {
        console.error('ecoPercentileCalculator not loaded');
        return;
    }
    const processedTracts = await ecoPercentileCalculator.processTractsAsync(tracts);
    
    visibleTracts = processedTracts;
    
    // Update map layers
    updateTractLayers();
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

    // Create GeoJSON features
    const features = visibleTracts.map(tract => {
        const props = tract.properties;
        
        // Determine color based on view
        let fillColor;
        if (currentView === 'water') {
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
        
        currentPopup = new maplibregl.Popup({ closeOnClick: false })
            .setLngLat(e.lngLat)
            .setHTML(`
                <div style="min-width: 200px;">
                    <h3 style="margin-bottom: 10px; font-size: 16px;">Census Tract</h3>
                    <p style="margin: 5px 0;"><strong>EcoPercentile:</strong> ${props.ecoPercentile}th</p>
                    <p style="margin: 5px 0;"><strong>Water Quality:</strong> ${props.waterQuality.toFixed(0)}/100</p>
                    <p style="margin: 5px 0;"><strong>Greenspace:</strong> ${props.greenspace.toFixed(0)}%</p>
                    <p style="margin: 5px 0;"><strong>Eco Score:</strong> ${props.ecoScore.toFixed(0)}/100</p>
                </div>
            `)
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
    
    // Update button states
    const buttons = ['btn-water', 'btn-greenspace', 'btn-both', 'btn-eco'];
    buttons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.classList.toggle('active', btnId === `btn-${mode}`);
        }
    });
    
    // Update map
    updateTractLayers();
    updateLegend();
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
    map.flyTo({
        center: [-98, 39],
        zoom: 4,
        duration: 2000
    });
}

// Initialize on page load
window.addEventListener('load', () => {
    initMap();
});

