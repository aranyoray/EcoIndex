/**
 * EvaPrice Page - Energy Price Prediction Engine
 */

let map, priceData = [], markers = [];
let currentYear = 2024;
let historicalPrices = [];

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

// Average electricity prices by state (cents per kWh) - 2024 estimates
const STATE_BASE_PRICES = {
    'HI': 32.5, 'AK': 23.8, 'CT': 22.1, 'MA': 21.8, 'NH': 20.6,
    'CA': 19.9, 'RI': 19.3, 'VT': 18.4, 'NY': 17.8, 'ME': 16.7,
    'NJ': 16.2, 'MD': 13.9, 'PA': 13.3, 'DE': 12.8, 'IL': 12.6,
    'AZ': 12.4, 'NV': 12.1, 'MI': 11.9, 'WI': 11.7, 'MN': 11.5,
    'OH': 11.3, 'GA': 11.2, 'FL': 11.1, 'NC': 10.9, 'SC': 10.8,
    'TX': 10.7, 'VA': 10.6, 'TN': 10.5, 'IN': 10.3, 'MO': 10.2,
    'KY': 10.0, 'AL': 9.8, 'MS': 9.7, 'LA': 9.5, 'AR': 9.4,
    'IA': 9.3, 'KS': 9.2, 'OK': 9.1, 'NE': 9.0, 'SD': 8.9,
    'ND': 8.8, 'MT': 8.7, 'WY': 8.6, 'UT': 8.5, 'CO': 8.4,
    'NM': 8.3, 'ID': 8.2, 'OR': 8.1, 'WA': 8.0, 'WV': 9.6
};

function initMap() {
    map = new maplibregl.Map({
        container: 'map',
        style: 'https://demotiles.maplibre.org/style.json',
        center: [-98, 39],
        zoom: 4
    });

    map.on('load', loadPriceData);
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
}

async function loadPriceData() {
    const loadingEl = document.getElementById('loading');

    // Generate historical prices (2020-2024)
    generateHistoricalPrices();

    for (let i = 0; i < usCounties.length; i++) {
        const county = usCounties[i];
        const stateCode = STATE_ABBREV[county.state] || county.state;

        if (i % 50 === 0) {
            loadingEl.querySelector('p').textContent =
                `Analyzing ${county.name}, ${county.state} (${i + 1}/${usCounties.length})...`;
        }

        // Get base price for state
        const basePrice = STATE_BASE_PRICES[stateCode] || 12.0;

        // Calculate price factors
        const balance = getStateEnergyBalance(stateCode);
        const mix = getStateEnergyMix(stateCode);

        // Price adjustments
        const deficitFactor = balance.selfSufficiency < 100 ?
            1 + ((100 - balance.selfSufficiency) / 100) * 0.3 : 1.0;

        const renewableFactor = 1 - (getStateRenewablePercentage(stateCode) / 100) * 0.1;

        const urbanFactor = county.population > 500000 ? 1.05 : 1.0;

        const currentPrice = basePrice * deficitFactor * renewableFactor * urbanFactor;

        // Predict future prices
        const futurePrice2030 = predictFuturePrice(currentPrice, balance, mix, 2030);
        const futurePrice2035 = predictFuturePrice(currentPrice, balance, mix, 2035);

        // Calculate trend
        const historicalTrend = calculateTrend(stateCode);

        priceData.push({
            ...county,
            stateCode: stateCode,
            currentPrice: currentPrice,
            basePrice: basePrice,
            futurePrice2030: futurePrice2030,
            futurePrice2035: futurePrice2035,
            trend: historicalTrend,
            priceFactors: {
                deficit: deficitFactor,
                renewable: renewableFactor,
                urban: urbanFactor
            },
            selfSufficiency: balance.selfSufficiency,
            renewablePercent: getStateRenewablePercentage(stateCode)
        });

        await new Promise(resolve => setTimeout(resolve, 2));
    }

    priceData.sort((a, b) => b.currentPrice - a.currentPrice);
    loadingEl.style.display = 'none';

    createMarkers();
    updateStatistics();
    initializeTimeSlider();
}

function generateHistoricalPrices() {
    for (let year = 2020; year <= 2024; year++) {
        Object.keys(STATE_BASE_PRICES).forEach(state => {
            const basePrice = STATE_BASE_PRICES[state];
            // Add some variation over years
            const yearFactor = 1 + ((year - 2020) * 0.02) + (Math.random() * 0.05 - 0.025);
            const price = basePrice * yearFactor;

            historicalPrices.push({
                year: year,
                state: state,
                price: price
            });
        });
    }
}

function calculateTrend(stateCode) {
    const statePrices = historicalPrices.filter(p => p.state === stateCode);
    if (statePrices.length < 2) return 'stable';

    const oldest = statePrices[0].price;
    const newest = statePrices[statePrices.length - 1].price;
    const change = ((newest - oldest) / oldest) * 100;

    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
}

function predictFuturePrice(currentPrice, balance, mix, targetYear) {
    const yearsAhead = targetYear - 2024;

    // Base inflation (2% per year)
    const inflationFactor = Math.pow(1.02, yearsAhead);

    // Renewable penetration reduces prices over time
    const renewableGrowth = yearsAhead * 0.02; // 2% more renewable per year
    const renewableFactor = 1 - (renewableGrowth * 0.15);

    // Deficit increases prices
    const deficitFactor = balance.selfSufficiency < 100 ?
        1 + (yearsAhead * 0.01) : 1.0;

    // Technology improvements
    const techFactor = 1 - (yearsAhead * 0.005); // 0.5% reduction per year

    return currentPrice * inflationFactor * renewableFactor * deficitFactor * techFactor;
}

function getPriceColor(price) {
    if (price > 20) return '#c0392b';
    if (price > 15) return '#e74c3c';
    if (price > 12) return '#f39c12';
    if (price > 10) return '#27ae60';
    return '#2ecc71';
}

function createMarkers() {
    priceData.forEach(loc => {
        const el = document.createElement('div');
        const size = 10 + Math.min(loc.currentPrice, 15);

        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.borderRadius = '50%';
        el.style.backgroundColor = getPriceColor(loc.currentPrice);
        el.style.border = '2px solid white';
        el.style.cursor = 'pointer';
        el.style.transition = 'all 0.2s ease';

        const popup = new maplibregl.Popup({ offset: 25, maxWidth: '400px' }).setHTML(`
            <div style="color: #1a1a2e; min-width: 320px;">
                <h3 style="margin-bottom: 10px; color: ${getPriceColor(loc.currentPrice)};">${loc.name}, ${loc.state}</h3>

                <div style="background: #fff9e6; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
                    <h4 style="margin: 0 0 8px 0; font-size: 14px;">Current Prices (2024)</h4>
                    <p style="margin: 3px 0; font-size: 16px;"><strong>Rate:</strong> ${loc.currentPrice.toFixed(2)} ¢/kWh</p>
                    <p style="margin: 3px 0; font-size: 12px; color: #666;">
                        <strong>Trend:</strong> ${loc.trend === 'increasing' ? '📈' : loc.trend === 'decreasing' ? '📉' : '→'}
                        ${loc.trend.charAt(0).toUpperCase() + loc.trend.slice(1)}
                    </p>
                </div>

                <div style="background: #e8f5e9; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
                    <h4 style="margin: 0 0 8px 0; font-size: 14px;">Future Predictions</h4>
                    <p style="margin: 3px 0;"><strong>2030:</strong> ${loc.futurePrice2030.toFixed(2)} ¢/kWh</p>
                    <p style="margin: 3px 0;"><strong>2035:</strong> ${loc.futurePrice2035.toFixed(2)} ¢/kWh</p>
                    <p style="margin: 3px 0; font-size: 11px; color: #666;">
                        Change: ${((loc.futurePrice2030 - loc.currentPrice) / loc.currentPrice * 100).toFixed(1)}%
                    </p>
                </div>

                <div style="background: #f0f0f0; padding: 10px; border-radius: 6px;">
                    <h4 style="margin: 0 0 8px 0; font-size: 14px;">Price Factors</h4>
                    <p style="margin: 3px 0; font-size: 12px;">⚡ Deficit Impact: ${((loc.priceFactors.deficit - 1) * 100).toFixed(1)}%</p>
                    <p style="margin: 3px 0; font-size: 12px;">🌱 Renewable: ${loc.renewablePercent.toFixed(1)}%</p>
                    <p style="margin: 3px 0; font-size: 12px;">🏙️ Urban Premium: ${((loc.priceFactors.urban - 1) * 100).toFixed(1)}%</p>
                    <p style="margin: 3px 0; font-size: 12px;">📊 Self-Sufficiency: ${loc.selfSufficiency.toFixed(0)}%</p>
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

function updateStatistics() {
    const avgPrice = priceData.reduce((sum, l) => sum + l.currentPrice, 0) / priceData.length;
    const highest = priceData[0];
    const lowest = priceData[priceData.length - 1];

    const increasingCount = priceData.filter(l => l.trend === 'increasing').length;
    const totalCount = priceData.length;
    const overallTrend = increasingCount > totalCount / 2 ? 'Increasing' : 'Stable';

    document.getElementById('avgPrice').textContent = avgPrice.toFixed(2);
    document.getElementById('highestPrice').textContent =
        `${highest.state} (${highest.currentPrice.toFixed(2)} ¢/kWh)`;
    document.getElementById('lowestPrice').textContent =
        `${lowest.state} (${lowest.currentPrice.toFixed(2)} ¢/kWh)`;
    document.getElementById('priceTrend').textContent = overallTrend;
}

function showPriceTrends() {
    const states = new Set();
    const trends = { increasing: [], decreasing: [], stable: [] };

    priceData.forEach(loc => {
        if (!states.has(loc.stateCode)) {
            states.add(loc.stateCode);
            trends[loc.trend].push({ state: loc.state, price: loc.currentPrice });
        }
    });

    let message = `📊 Price Trends by State:\n\n`;
    message += `📈 Increasing (${trends.increasing.length} states)\n`;
    message += `📉 Decreasing (${trends.decreasing.length} states)\n`;
    message += `→ Stable (${trends.stable.length} states)\n\n`;

    if (trends.increasing.length > 0) {
        message += `Top Increasing:\n`;
        trends.increasing.slice(0, 5).forEach(s =>
            message += `  ${s.state}: ${s.price.toFixed(2)} ¢/kWh\n`
        );
    }

    alert(message);
}

function showHighPriceStates() {
    markers.forEach(({ element, location }) => {
        if (location.currentPrice > 15) {
            element.style.border = '3px solid #c0392b';
            element.style.boxShadow = '0 0 15px rgba(192, 57, 43, 0.8)';
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

    const highPriceCount = priceData.filter(l => l.currentPrice > 15).length;
    alert(`${highPriceCount} locations highlighted with prices >15 ¢/kWh`);
}

function predictFuturePrices() {
    // Switch to 2030 view
    markers.forEach(({ element, location }) => {
        element.style.backgroundColor = getPriceColor(location.futurePrice2030);
        const size = 10 + Math.min(location.futurePrice2030, 15);
        element.style.width = `${size}px`;
        element.style.height = `${size}px`;
    });

    const avg2030 = priceData.reduce((sum, l) => sum + l.futurePrice2030, 0) / priceData.length;
    const avgChange = ((avg2030 - 12) / 12 * 100).toFixed(1);

    alert(`2030 Forecast:\n\nAverage price: ${avg2030.toFixed(2)} ¢/kWh\nChange from 2024: ${avgChange}%\n\nClick Reset to return to current prices`);

    // Add reset button effect
    setTimeout(() => {
        markers.forEach(({ element, location }) => {
            element.style.backgroundColor = getPriceColor(location.currentPrice);
            const size = 10 + Math.min(location.currentPrice, 15);
            element.style.width = `${size}px`;
            element.style.height = `${size}px`;
        });
    }, 10000);
}

function showPriceFactors() {
    let message = `💰 Price Factors Analysis:\n\n`;
    message += `Key factors affecting electricity prices:\n\n`;
    message += `1. Supply-Demand Balance\n`;
    message += `   - Deficit states: +30% premium\n`;
    message += `   - Surplus states: base rates\n\n`;
    message += `2. Renewable Penetration\n`;
    message += `   - High renewable: -10% discount\n`;
    message += `   - Low renewable: base rates\n\n`;
    message += `3. Urban Density\n`;
    message += `   - Major cities: +5% premium\n`;
    message += `   - Rural areas: base rates\n\n`;
    message += `4. Fuel Costs\n`;
    message += `   - Natural gas prices\n`;
    message += `   - Coal prices\n`;
    message += `   - Nuclear fuel\n\n`;
    message += `5. Weather Patterns\n`;
    message += `   - Extreme heat: +demand\n`;
    message += `   - Extreme cold: +demand\n`;
    message += `   - Affects cooling/heating costs\n`;

    alert(message);
}

function initializeTimeSlider() {
    if (typeof initTimeSlider === 'function') {
        initTimeSlider({
            startYear: 2020,
            endYear: 2035,
            currentYear: 2024,
            onChange: (year) => {
                if (year <= 2024) {
                    // Show historical prices
                    const yearPrices = historicalPrices.filter(p => p.year === year);
                    console.log(`Showing ${year} prices`);
                } else {
                    // Show predictions
                    console.log(`Showing ${year} predictions`);
                }
            }
        });
    }
}

window.addEventListener('load', () => {
    initMap();
    initSharedNavigation('price');
});
