/**
 * EvaDeficit Page - Supply-Demand Gap Analysis
 */

let map, deficitData = [], markers = [];
let currentYear = 2024;
let showingFuture = false;

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

    map.on('load', loadDeficitData);
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
}

async function loadDeficitData() {
    const loadingEl = document.getElementById('loading');

    // Track state-level calculations
    const stateDeficits = {};

    for (let i = 0; i < usCounties.length; i++) {
        const county = usCounties[i];
        const stateCode = STATE_ABBREV[county.state] || county.state;

        if (i % 50 === 0) {
            loadingEl.querySelector('p').textContent =
                `Analyzing ${county.name}, ${county.state} (${i + 1}/${usCounties.length})...`;
        }

        // Calculate demand (population-based)
        const demand = county.population * 0.015; // 15 kW per capita
        const annualDemand = demand * 8760; // MWh per year

        // Get state energy balance
        const balance = getStateEnergyBalance(stateCode);
        const recommendations = recommendEnergyExpansion(stateCode);

        // Calculate deficit/surplus
        const selfSufficiency = balance.selfSufficiency || 100;
        const deficit = balance.surplus < 0 ? Math.abs(balance.surplus) : 0;
        const surplus = balance.surplus > 0 ? balance.surplus : 0;

        // Store state deficit if not already tracked
        if (!stateDeficits[stateCode]) {
            stateDeficits[stateCode] = {
                state: county.state,
                stateCode: stateCode,
                totalDeficit: deficit,
                totalSurplus: surplus,
                selfSufficiency: selfSufficiency,
                balance: balance,
                recommendations: recommendations || []
            };
        }

        deficitData.push({
            ...county,
            stateCode: stateCode,
            demand: annualDemand,
            supply: balance.annualGeneration,
            deficit: deficit,
            surplus: surplus,
            selfSufficiency: selfSufficiency,
            status: getDeficitStatus(selfSufficiency),
            stateBalance: balance,
            recommendations: recommendations || []
        });

        await new Promise(resolve => setTimeout(resolve, 2));
    }

    deficitData.sort((a, b) => b.deficit - a.deficit);
    loadingEl.style.display = 'none';

    createMarkers();
    updateStatistics();
    initializeTimeSlider();
}

function getDeficitStatus(selfSufficiency) {
    if (selfSufficiency >= 120) return 'large-surplus';
    if (selfSufficiency >= 100) return 'balanced';
    if (selfSufficiency >= 80) return 'small-deficit';
    if (selfSufficiency >= 60) return 'large-deficit';
    return 'critical-deficit';
}

function getDeficitColor(status) {
    const colors = {
        'large-surplus': '#27ae60',
        'balanced': '#95a5a6',
        'small-deficit': '#f39c12',
        'large-deficit': '#e74c3c',
        'critical-deficit': '#c0392b'
    };
    return colors[status] || '#95a5a6';
}

function createMarkers() {
    deficitData.forEach(loc => {
        const el = document.createElement('div');
        const size = 12 + Math.min(Math.abs(100 - loc.selfSufficiency) / 5, 15);

        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.borderRadius = '50%';
        el.style.backgroundColor = getDeficitColor(loc.status);
        el.style.border = '2px solid white';
        el.style.cursor = 'pointer';
        el.style.transition = 'all 0.2s ease';

        const popup = new maplibregl.Popup({ offset: 25, maxWidth: '450px' }).setHTML(`
            <div style="color: #1a1a2e; min-width: 350px;">
                <h3 style="margin-bottom: 10px; color: ${getDeficitColor(loc.status)};">${loc.name}, ${loc.state}</h3>

                <div style="background: #f8f9fa; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
                    <h4 style="margin: 0 0 8px 0; font-size: 14px;">Energy Balance</h4>
                    <p style="margin: 3px 0;"><strong>Demand:</strong> ${(loc.demand/1000000).toFixed(2)} GWh/yr</p>
                    <p style="margin: 3px 0;"><strong>Supply:</strong> ${(loc.supply/1000000).toFixed(2)} GWh/yr</p>
                    <p style="margin: 3px 0; color: ${loc.deficit > 0 ? '#e74c3c' : '#27ae60'};">
                        <strong>${loc.deficit > 0 ? 'Deficit' : 'Surplus'}:</strong>
                        ${(Math.abs(loc.deficit - loc.surplus)/1000000).toFixed(2)} GWh/yr
                    </p>
                    <p style="margin: 3px 0;"><strong>Self-Sufficiency:</strong> ${loc.selfSufficiency.toFixed(1)}%</p>
                </div>

                <div style="background: ${loc.deficit > 0 ? '#fff3cd' : '#d4edda'}; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
                    <h4 style="margin: 0 0 8px 0; font-size: 14px;">State Capacity</h4>
                    <p style="margin: 3px 0;"><strong>☢️ Nuclear:</strong> ${(loc.stateBalance.capacity * 0.12).toFixed(0)} MW</p>
                    <p style="margin: 3px 0;"><strong>🌱 Renewables:</strong> ${(loc.stateBalance.capacity * 0.25).toFixed(0)} MW</p>
                    <p style="margin: 3px 0;"><strong>⚫ Fossil:</strong> ${(loc.stateBalance.capacity * 0.63).toFixed(0)} MW</p>
                </div>

                ${loc.recommendations && loc.recommendations.length > 0 ? `
                    <div style="background: #e3f2fd; padding: 10px; border-radius: 6px;">
                        <h4 style="margin: 0 0 8px 0; font-size: 14px;">💡 Recommendations</h4>
                        ${loc.recommendations.slice(0, 3).map(rec => `
                            <p style="margin: 5px 0; font-size: 12px;">
                                <strong>${rec.source}:</strong> ${rec.reason}
                                <br><span style="color: #666;">Priority: ${rec.priority} | +${rec.suggestedIncrease.toFixed(0)} MW</span>
                            </p>
                        `).join('')}
                    </div>
                ` : ''}
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

function updateStatistics() {
    const deficitStates = deficitData.filter(l => l.deficit > 0);
    const uniqueDeficitStates = new Set(deficitStates.map(l => l.stateCode)).size;
    const totalDeficit = deficitData.reduce((sum, l) => sum + l.deficit, 0);
    const worstDeficit = deficitData[0];

    document.getElementById('deficitCount').textContent = uniqueDeficitStates;
    document.getElementById('totalDeficit').textContent = `${(totalDeficit/1000000).toFixed(0)} GWh`;
    document.getElementById('worstDeficit').textContent = `${worstDeficit.state} (${worstDeficit.selfSufficiency.toFixed(0)}%)`;

    const totalRecs = deficitData.reduce((sum, l) => sum + (l.recommendations?.length || 0), 0);
    document.getElementById('recCount').textContent = totalRecs;
}

function showDeficitStates() {
    markers.forEach(({ element, location }) => {
        if (location.deficit > 0) {
            element.style.border = '3px solid #e74c3c';
            element.style.boxShadow = '0 0 15px rgba(231, 76, 60, 0.8)';
            element.style.transform = 'scale(1.3)';
        } else {
            element.style.opacity = '0.2';
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

    const deficitCount = deficitData.filter(l => l.deficit > 0).length;
    alert(`${deficitCount} locations highlighted with energy deficits`);
}

function showSurplusStates() {
    markers.forEach(({ element, location }) => {
        if (location.surplus > 0) {
            element.style.border = '3px solid #27ae60';
            element.style.boxShadow = '0 0 15px rgba(39, 174, 96, 0.8)';
            element.style.transform = 'scale(1.3)';
        } else {
            element.style.opacity = '0.2';
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

    const surplusCount = deficitData.filter(l => l.surplus > 0).length;
    alert(`${surplusCount} locations highlighted with energy surplus`);
}

function showRecommendations() {
    const statesWithRecs = new Map();

    deficitData.forEach(loc => {
        if (loc.recommendations && loc.recommendations.length > 0 && !statesWithRecs.has(loc.stateCode)) {
            statesWithRecs.set(loc.stateCode, {
                state: loc.state,
                recommendations: loc.recommendations
            });
        }
    });

    let message = `📊 Energy Expansion Recommendations:\n\n`;

    statesWithRecs.forEach(({ state, recommendations }) => {
        message += `${state}:\n`;
        recommendations.slice(0, 2).forEach(rec => {
            message += `  • ${rec.source}: +${rec.suggestedIncrease.toFixed(0)} MW (${rec.priority} priority)\n`;
        });
        message += `\n`;
    });

    alert(message);
}

async function toggleFutureProjection() {
    showingFuture = !showingFuture;

    if (showingFuture) {
        // Project to 2035 with climate change impact
        const loadingEl = document.getElementById('loading');
        loadingEl.style.display = 'block';
        loadingEl.querySelector('p').textContent = 'Projecting to 2035...';

        for (let i = 0; i < deficitData.length; i++) {
            const loc = deficitData[i];

            // Fetch climate projection
            try {
                const futureClimate = await openMeteoAPI.fetchClimateProjections(
                    loc.lat, loc.lon,
                    '2035-01-01', '2035-12-31'
                );

                // Increase demand due to population growth and warming
                const growthFactor = 1.20; // 20% growth
                const climateImpact = futureClimate?.summary ?
                    (1 + (futureClimate.summary.avgTempMean - 15) * 0.02) : 1.1;

                loc.futureDemand = loc.demand * growthFactor * climateImpact;
                loc.futureDeficit = Math.max(0, loc.futureDemand - loc.supply);
                loc.futureSelfSufficiency = (loc.supply / loc.futureDemand) * 100;
            } catch (error) {
                console.error('Error projecting:', error);
                loc.futureDemand = loc.demand * 1.20;
                loc.futureDeficit = Math.max(0, loc.futureDemand - loc.supply);
                loc.futureSelfSufficiency = (loc.supply / loc.futureDemand) * 100;
            }

            if (i % 50 === 0) {
                loadingEl.querySelector('p').textContent =
                    `Projecting ${loc.state} (${i+1}/${deficitData.length})...`;
            }
        }

        loadingEl.style.display = 'none';

        // Update markers
        markers.forEach(({ element, location }) => {
            const futureStatus = getDeficitStatus(location.futureSelfSufficiency);
            element.style.backgroundColor = getDeficitColor(futureStatus);
        });

        alert('Now showing 2035 projections with climate impact');
    } else {
        // Reset to current
        markers.forEach(({ element, location }) => {
            element.style.backgroundColor = getDeficitColor(location.status);
        });
        alert('Back to current (2024) data');
    }
}

function initializeTimeSlider() {
    if (typeof initTimeSlider === 'function') {
        initTimeSlider({
            startYear: 2015,
            endYear: 2045,
            currentYear: 2024,
            onChange: async (year) => {
                if (year > 2024) {
                    showingFuture = true;
                    await toggleFutureProjection();
                }
            }
        });
    }
}

window.addEventListener('load', () => {
    initMap();
    initSharedNavigation('deficit');
});
