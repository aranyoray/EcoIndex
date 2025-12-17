/**
 * EvaSupply Page - Energy Supply & Capacity Analysis
 */

let map, supplyData = [], markers = [];
let currentResolution = 'county';
let currentSourceView = 'total'; // total, nuclear, renewable, fossil

// State abbreviation lookup
const STATE_ABBREV = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
    'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
    'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
    'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
    'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
    'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
    'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
    'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
};

function initMap() {
    map = new maplibregl.Map({
        container: 'map',
        style: 'https://demotiles.maplibre.org/style.json',
        center: [-98, 39],
        zoom: 4
    });

    map.on('load', loadSupplyData);
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
}

async function loadSupplyData() {
    const loadingEl = document.getElementById('loading');

    for (let i = 0; i < usCounties.length; i++) {
        const county = usCounties[i];
        const stateCode = STATE_ABBREV[county.state] || county.state;

        if (i % 50 === 0) {
            loadingEl.querySelector('p').textContent =
                `Analyzing ${county.name}, ${county.state} (${i + 1}/${usCounties.length})...`;
        }

        // Get state capacity data
        const stateCapacity = US_STATE_ENERGY_CAPACITY[stateCode] || {
            nuclear: 0, coal: 0, gas: 0, hydro: 0, wind: 0, solar: 0, geothermal: 0, biomass: 0
        };

        // Distribute state capacity to county based on population
        const stateData = US_STATE_CONSUMPTION[stateCode];
        const populationFactor = county.population / 1000000; // Normalize

        // Calculate evaporation potential
        const climate = estimateClimateData(county.lat, county.lon);
        const evapPower = evapCalc.estimatePowerFromClimateaverages(climate);
        const evapCapacity = evapPower * 0.001; // Convert W/m² to rough MW estimate

        const totalCapacity = getStateGenerationCapacity(stateCode);
        const countyCapacity = totalCapacity * populationFactor * 0.01; // Rough distribution

        supplyData.push({
            ...county,
            stateCode: stateCode,
            capacity: {
                total: countyCapacity,
                nuclear: stateCapacity.nuclear * populationFactor * 0.01,
                coal: stateCapacity.coal * populationFactor * 0.01,
                gas: stateCapacity.gas * populationFactor * 0.01,
                hydro: stateCapacity.hydro * populationFactor * 0.01,
                wind: stateCapacity.wind * populationFactor * 0.01,
                solar: stateCapacity.solar * populationFactor * 0.01,
                geothermal: stateCapacity.geothermal * populationFactor * 0.01,
                biomass: stateCapacity.biomass * populationFactor * 0.01,
                evaporation: evapCapacity
            },
            stateCapacity: totalCapacity,
            renewablePercent: getStateRenewablePercentage(stateCode),
            energyMix: getStateEnergyMix(stateCode),
            evaporationPotential: evapPower
        });

        await new Promise(resolve => setTimeout(resolve, 2));
    }

    supplyData.sort((a, b) => b.capacity.total - a.capacity.total);
    loadingEl.style.display = 'none';

    createMarkers();
    updateStatistics();
    initializeTimeSlider();
}

function createMarkers() {
    supplyData.forEach(loc => {
        const el = document.createElement('div');
        const size = 10 + Math.min(loc.capacity.total / 100, 20);

        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.borderRadius = '50%';
        el.style.backgroundColor = getCapacityColor(loc.capacity.total);
        el.style.border = '2px solid white';
        el.style.cursor = 'pointer';
        el.style.transition = 'all 0.2s ease';

        const popup = new maplibregl.Popup({ offset: 25, maxWidth: '400px' }).setHTML(`
            <div style="color: #1a1a2e; min-width: 300px;">
                <h3 style="margin-bottom: 10px; color: #4CAF50;">${loc.name}, ${loc.state}</h3>

                <div style="background: #f0f0f0; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
                    <h4 style="margin: 0 0 8px 0; font-size: 14px;">County Capacity</h4>
                    <p style="margin: 3px 0;"><strong>Total:</strong> ${loc.capacity.total.toFixed(1)} MW</p>
                    <p style="margin: 3px 0;"><strong>Evaporation Potential:</strong> ${loc.evaporationPotential.toFixed(1)} W/m²</p>
                </div>

                <div style="background: #e8f5e9; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
                    <h4 style="margin: 0 0 8px 0; font-size: 14px;">State: ${loc.state}</h4>
                    <p style="margin: 3px 0;"><strong>☢️ Nuclear:</strong> ${loc.capacity.nuclear.toFixed(0)} MW</p>
                    <p style="margin: 3px 0;"><strong>⚫ Coal:</strong> ${loc.capacity.coal.toFixed(0)} MW</p>
                    <p style="margin: 3px 0;"><strong>🔥 Natural Gas:</strong> ${loc.capacity.gas.toFixed(0)} MW</p>
                    <p style="margin: 3px 0;"><strong>💧 Hydro:</strong> ${loc.capacity.hydro.toFixed(0)} MW</p>
                    <p style="margin: 3px 0;"><strong>💨 Wind:</strong> ${loc.capacity.wind.toFixed(0)} MW</p>
                    <p style="margin: 3px 0;"><strong>☀️ Solar:</strong> ${loc.capacity.solar.toFixed(0)} MW</p>
                    <p style="margin: 3px 0;"><strong>🌋 Geothermal:</strong> ${loc.capacity.geothermal.toFixed(0)} MW</p>
                    <p style="margin: 3px 0;"><strong>🌱 Biomass:</strong> ${loc.capacity.biomass.toFixed(0)} MW</p>
                </div>

                <div style="background: #fff3cd; padding: 10px; border-radius: 6px;">
                    <p style="margin: 0;"><strong>Renewable %:</strong> ${loc.renewablePercent.toFixed(1)}%</p>
                    <p style="margin: 5px 0 0 0;"><strong>State Total:</strong> ${loc.stateCapacity.toFixed(0)} MW</p>
                </div>
            </div>
        `);

        el.addEventListener('mouseenter', () => {
            el.style.transform = 'scale(1.5)';
            el.style.zIndex = '1000';
            popup.setLngLat([loc.lon, loc.lat]).addTo(map);
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'scale(1)';
            el.style.zIndex = '1';
            setTimeout(() => {
                if (!popup.getElement()?.matches(':hover')) {
                    popup.remove();
                }
            }, 300);
        });

        new maplibregl.Marker({ element: el })
            .setLngLat([loc.lon, loc.lat])
            .addTo(map);

        markers.push({ element: el, location: loc, popup });
    });
}

function getCapacityColor(capacity) {
    if (capacity > 5000) return '#2ecc71';
    if (capacity > 2000) return '#3498db';
    if (capacity > 1000) return '#f39c12';
    if (capacity > 500) return '#e67e22';
    return '#95a5a6';
}

function updateStatistics() {
    // Calculate total US capacity
    const states = new Set(supplyData.map(l => l.stateCode));
    let totalCapacity = 0;
    let totalNuclear = 0;
    let totalRenewable = 0;
    let totalFossil = 0;

    states.forEach(state => {
        const cap = US_STATE_ENERGY_CAPACITY[state];
        if (cap) {
            const stateTotal = Object.values(cap).reduce((sum, v) => sum + v, 0);
            totalCapacity += stateTotal;
            totalNuclear += cap.nuclear;
            totalRenewable += cap.hydro + cap.wind + cap.solar + cap.geothermal + cap.biomass;
            totalFossil += cap.coal + cap.gas;
        }
    });

    const renewablePercent = (totalRenewable / totalCapacity * 100);

    document.getElementById('totalCapacity').textContent = (totalCapacity / 1000).toFixed(1) + 'k';
    document.getElementById('renewablePercent').textContent = renewablePercent.toFixed(1);
    document.getElementById('nuclearCapacity').textContent = (totalNuclear / 1000).toFixed(1) + 'k MW';

    const largestSource = totalFossil > totalRenewable ?
        (totalNuclear > totalFossil ? 'Nuclear' : 'Fossil Fuels') :
        'Renewables';
    document.getElementById('largestSource').textContent = largestSource;
}

function showEnergyMix() {
    // Calculate and display energy mix
    const states = new Set(supplyData.map(l => l.stateCode));
    let mix = { nuclear: 0, coal: 0, gas: 0, hydro: 0, wind: 0, solar: 0, geothermal: 0, biomass: 0 };

    states.forEach(state => {
        const cap = US_STATE_ENERGY_CAPACITY[state];
        if (cap) {
            Object.keys(mix).forEach(source => {
                mix[source] += cap[source] || 0;
            });
        }
    });

    const total = Object.values(mix).reduce((sum, v) => sum + v, 0);
    const mixPercent = Object.entries(mix).map(([source, val]) =>
        `${source}: ${(val/total*100).toFixed(1)}%`
    ).join('\n');

    alert(`US Energy Mix:\n\n${mixPercent}\n\nTotal: ${(total/1000).toFixed(0)}k MW`);
}

function toggleSourceLayer() {
    const sources = ['total', 'nuclear', 'renewable', 'fossil'];
    const currentIndex = sources.indexOf(currentSourceView);
    currentSourceView = sources[(currentIndex + 1) % sources.length];

    markers.forEach(({ element, location }) => {
        let value = 0;
        if (currentSourceView === 'nuclear') {
            value = location.capacity.nuclear;
        } else if (currentSourceView === 'renewable') {
            value = location.capacity.hydro + location.capacity.wind +
                    location.capacity.solar + location.capacity.geothermal;
        } else if (currentSourceView === 'fossil') {
            value = location.capacity.coal + location.capacity.gas;
        } else {
            value = location.capacity.total;
        }

        element.style.backgroundColor = getCapacityColor(value);
        const size = 10 + Math.min(value / 100, 20);
        element.style.width = `${size}px`;
        element.style.height = `${size}px`;
    });

    alert(`Now showing: ${currentSourceView.toUpperCase()} capacity`);
}

function showRenewablePotential() {
    // Highlight states with high renewable potential
    markers.forEach(({ element, location }) => {
        if (location.renewablePercent > 50) {
            element.style.border = '3px solid #2ecc71';
            element.style.boxShadow = '0 0 15px rgba(46, 204, 113, 0.8)';
        } else if (location.renewablePercent > 25) {
            element.style.border = '3px solid #f39c12';
            element.style.boxShadow = '0 0 15px rgba(243, 156, 18, 0.8)';
        } else {
            element.style.border = '2px solid white';
            element.style.boxShadow = 'none';
        }
    });

    setTimeout(() => {
        markers.forEach(({ element }) => {
            element.style.border = '2px solid white';
            element.style.boxShadow = 'none';
        });
    }, 5000);

    alert('Green = >50% renewable, Orange = 25-50% renewable');
}

function showNuclearStates() {
    // Highlight states with nuclear capacity
    markers.forEach(({ element, location }) => {
        if (location.capacity.nuclear > 1000) {
            element.style.border = '3px solid #9b59b6';
            element.style.boxShadow = '0 0 15px rgba(155, 89, 182, 0.8)';
            element.style.transform = 'scale(1.3)';
        } else if (location.capacity.nuclear > 0) {
            element.style.border = '3px solid #3498db';
        } else {
            element.style.opacity = '0.3';
        }
    });

    setTimeout(() => {
        markers.forEach(({ element }) => {
            element.style.border = '2px solid white';
            element.style.boxShadow = 'none';
            element.style.transform = 'scale(1)';
            element.style.opacity = '1';
        });
    }, 5000);

    alert('Purple = Large nuclear (>1GW), Blue = Has nuclear, Faded = No nuclear');
}

function initializeTimeSlider() {
    if (typeof initTimeSlider === 'function') {
        initTimeSlider({
            startYear: 2015,
            endYear: 2024,
            onChange: (year) => {
                // Could show capacity growth over time
                console.log(`Viewing supply data for ${year}`);
            }
        });
    }
}

// Shared climate estimation function (from map.js)
function estimateClimateData(lat, lon) {
    const absLat = Math.abs(lat);
    let avgTemp = 30 - (absLat * 0.6);
    let avgHumidity = 0.7 - (absLat * 0.005);
    let avgWindSpeed = 2 + Math.abs(Math.sin(absLat * Math.PI / 90)) * 3;
    let avgSolarRadiation = 250 - (absLat * 2.5);

    // Regional adjustments
    if (lat > 15 && lat < 35 && lon > -15 && lon < 40) {
        avgTemp += 8; avgHumidity -= 0.4; avgSolarRadiation += 80;
    }
    if (lat > 12 && lat < 32 && lon > 34 && lon < 60) {
        avgTemp += 10; avgHumidity -= 0.45; avgSolarRadiation += 100;
    }
    if (lat > 25 && lat < 40 && lon > -120 && lon < -100) {
        avgTemp += 5; avgHumidity -= 0.35; avgSolarRadiation += 60;
    }

    return {
        avgTemp: Math.max(-10, Math.min(45, avgTemp)),
        avgHumidity: Math.max(0.15, Math.min(0.95, avgHumidity)),
        avgWindSpeed: Math.max(1, Math.min(10, avgWindSpeed)),
        avgSolarRadiation: Math.max(50, Math.min(400, avgSolarRadiation))
    };
}

window.addEventListener('load', () => {
    initMap();
    initSharedNavigation('supply');
});
