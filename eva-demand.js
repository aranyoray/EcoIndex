/**
 * EvaDemand Page - Energy Demand Analysis
 */

let map, demandData = [], markers = [];
let currentResolution = 'county';
let currentYear = 2024;

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

    map.on('load', loadDemandData);
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
}

async function loadDemandData() {
    const loadingEl = document.getElementById('loading');

    for (let i = 0; i < usCounties.length; i++) {
        const county = usCounties[i];
        const stateCode = STATE_ABBREV[county.state] || county.state;

        if (i % 50 === 0) {
            loadingEl.querySelector('p').textContent =
                `Analyzing ${county.name}, ${county.state} (${i + 1}/${usCounties.length})...`;
        }

        // Calculate base demand based on population
        const basedemand = county.population * 0.015; // 15 kW per capita average
        const annualDemand = basedemand * 8760; // MWh per year

        // Adjust for industry type (based on population size as proxy)
        let industryType = 'Residential';
        let industryFactor = 1.0;

        if (county.population > 1000000) {
            industryType = 'Mixed';
            industryFactor = 1.3; // Higher demand in major cities
        } else if (county.population > 500000) {
            industryType = 'Commercial';
            industryFactor = 1.2;
        } else if (county.population < 100000) {
            // Rural areas might have agriculture/light industry
            if (Math.random() > 0.5) {
                industryType = 'Industrial';
                industryFactor = 1.4;
            }
        }

        // Weather impact (simplified)
        const lat = Math.abs(county.lat);
        const weatherFactor = lat > 35 ? 1.15 : (lat < 30 ? 1.2 : 1.0); // More heating/cooling needed

        // Calculate final demand
        const demand = basedemand * industryFactor * weatherFactor;
        const peakdemand = demand * 1.4; // Peak is typically 40% higher
        const demandDensity = demand / (county.population / 100000); // MW per 100k people

        demandData.push({
            ...county,
            stateCode: stateCode,
            demand: demand,
            annualDemand: annualDemand,
            peakdemand: peakdemand,
            demandDensity: demandDensity,
            industryType: industryType,
            industryFactor: industryFactor,
            weatherFactor: weatherFactor,
            perCapitaDemand: (demand / county.population) * 1000 // kW per person
        });

        await new Promise(resolve => setTimeout(resolve, 2));
    }

    demandData.sort((a, b) => b.demand - a.demand);
    loadingEl.style.display = 'none';

    createMarkers();
    updateStatistics();
    initializeTimeSlider();
}

function createMarkers() {
    demandData.forEach(loc => {
        const el = document.createElement('div');
        const size = 10 + Math.min(loc.demand / 50, 20);

        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.borderRadius = '50%';
        el.style.backgroundColor = getDemandColor(loc.demandDensity);
        el.style.border = '2px solid white';
        el.style.cursor = 'pointer';
        el.style.transition = 'all 0.2s ease';

        const popup = new maplibregl.Popup({ offset: 25, maxWidth: '380px' }).setHTML(`
            <div style="color: #1a1a2e; min-width: 300px;">
                <h3 style="margin-bottom: 10px; color: #667eea;">${loc.name}, ${loc.state}</h3>

                <div style="background: #f0f4ff; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
                    <h4 style="margin: 0 0 8px 0; font-size: 14px;">Current Demand</h4>
                    <p style="margin: 3px 0;"><strong>Average:</strong> ${loc.demand.toFixed(1)} MW</p>
                    <p style="margin: 3px 0;"><strong>Peak:</strong> ${loc.peakdemand.toFixed(1)} MW</p>
                    <p style="margin: 3px 0;"><strong>Annual:</strong> ${(loc.annualDemand/1000000).toFixed(2)} GWh</p>
                    <p style="margin: 3px 0;"><strong>Per Capita:</strong> ${loc.perCapitaDemand.toFixed(2)} kW</p>
                </div>

                <div style="background: #fff9e6; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
                    <h4 style="margin: 0 0 8px 0; font-size: 14px;">Demand Profile</h4>
                    <p style="margin: 3px 0;"><strong>Type:</strong> ${loc.industryType}</p>
                    <p style="margin: 3px 0;"><strong>Density:</strong> ${loc.demandDensity.toFixed(2)} MW/100k pop</p>
                    <p style="margin: 3px 0;"><strong>Industry Factor:</strong> ${((loc.industryFactor - 1) * 100).toFixed(0)}%</p>
                    <p style="margin: 3px 0;"><strong>Weather Impact:</strong> ${((loc.weatherFactor - 1) * 100).toFixed(0)}%</p>
                </div>

                <div style="background: #e8f5e9; padding: 10px; border-radius: 6px;">
                    <p style="margin: 0; font-size: 12px;"><strong>📍 Population:</strong> ${loc.population.toLocaleString()}</p>
                    <p style="margin: 5px 0 0 0; font-size: 11px; color: #666;">
                        Demand based on population, industry, and climate factors
                    </p>
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

function getDemandColor(density) {
    if (density > 50) return '#d73027';
    if (density > 25) return '#fc8d59';
    if (density > 10) return '#fee090';
    if (density > 5) return '#91bfdb';
    return '#4575b4';
}

function updateStatistics() {
    const avgDemand = demandData.reduce((sum, l) => sum + l.demand, 0) / demandData.length;
    const peak = demandData[0];

    document.getElementById('locationCount').textContent = demandData.length;
    document.getElementById('avgDemand').textContent = avgDemand.toFixed(0);
    document.getElementById('peakDemand').textContent =
        `${peak.name}, ${peak.state} (${peak.demand.toFixed(0)} MW)`;
}

function showTopDemand() {
    const top10 = demandData.slice(0, 10);

    markers.forEach(({ element, location }) => {
        if (top10.includes(location)) {
            element.style.border = '3px solid gold';
            element.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.8)';
            element.style.transform = 'scale(1.3)';
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

    const topList = top10.map((l, i) =>
        `${i+1}. ${l.name}, ${l.state}: ${l.demand.toFixed(0)} MW (${l.industryType})`
    ).join('\n');

    alert(`Top 10 Demand Locations:\n\n${topList}`);
}

function toggleResolution() {
    alert('ZIP code resolution coming soon!\n\nThis will show ~42,000 ZIP codes with detailed demand patterns.');
}

function toggleIndustryLayer() {
    const types = ['All', 'Residential', 'Commercial', 'Industrial', 'Mixed'];
    const current = prompt('Show industry type:\n' + types.join('\n'), 'All');

    if (current && current !== 'All') {
        markers.forEach(({ element, location }) => {
            if (location.industryType === current) {
                element.style.opacity = '1';
                element.style.transform = 'scale(1.2)';
            } else {
                element.style.opacity = '0.2';
            }
        });

        setTimeout(() => {
            markers.forEach(({ element }) => {
                element.style.opacity = '1';
                element.style.transform = 'scale(1)';
            });
        }, 5000);
    }
}

async function initializeTimeSlider() {
    if (typeof initTimeSlider === 'function') {
        const slider = initTimeSlider({
            startYear: 2015,
            endYear: 2035,
            currentYear: 2024,
            onChange: async (year) => {
                currentYear = year;

                if (year > 2024) {
                    // Project future demand with weather predictions
                    const loadingEl = document.getElementById('loading');
                    if (loadingEl) {
                        loadingEl.style.display = 'block';
                        loadingEl.querySelector('p').textContent = `Projecting demand for ${year}...`;
                    }

                    // Use Open-Meteo for future climate
                    for (let loc of demandData.slice(0, 50)) { // Sample for performance
                        try {
                            const futureWeather = await openMeteoAPI.fetchClimateProjections(
                                loc.lat, loc.lon,
                                `${year}-01-01`, `${year}-12-31`
                            );

                            if (futureWeather && futureWeather.summary) {
                                const weatherDemand = predictDemandFromWeather(
                                    futureWeather,
                                    loc.demand,
                                    loc
                                );
                                loc.futureDemand = weatherDemand;
                            }
                        } catch (error) {
                            // Fallback: simple growth model
                            const growthFactor = 1 + ((year - 2024) * 0.015); // 1.5% annual growth
                            loc.futureDemand = loc.demand * growthFactor;
                        }
                    }

                    if (loadingEl) {
                        loadingEl.style.display = 'none';
                    }
                }

                console.log(`Viewing demand data for ${year}`);
            }
        });

        // Initialize historical data
        for (let year = 2015; year <= 2024; year++) {
            const avgDemand = demandData.reduce((sum, l) => sum + l.demand, 0) / demandData.length;
            const yearFactor = 1 - ((2024 - year) * 0.015); // Historical growth

            slider.setYearData(year, {
                avgDemand: avgDemand * yearFactor,
                avgTemp: 15 + (year - 2020) * 0.03, // Slight warming trend
                avgPower: 150
            });
        }
    }
}

window.addEventListener('load', () => {
    initMap();
    initSharedNavigation('demand');
});
