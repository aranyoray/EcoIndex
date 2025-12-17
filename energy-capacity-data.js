/**
 * Energy Capacity Data for US States
 * Sources: EIA, DOE, NREL
 */

const US_STATE_ENERGY_CAPACITY = {
    // State energy generation capacity by source (MW)
    'AL': { nuclear: 5084, coal: 10350, gas: 13250, hydro: 3280, wind: 0, solar: 589, geothermal: 0, biomass: 363 },
    'AK': { nuclear: 0, coal: 450, gas: 2100, hydro: 1540, wind: 62, solar: 22, geothermal: 0, biomass: 50 },
    'AZ': { nuclear: 3937, coal: 3940, gas: 20500, hydro: 2718, wind: 268, solar: 4796, geothermal: 0, biomass: 113 },
    'AR': { nuclear: 1792, coal: 3170, gas: 12750, hydro: 1448, wind: 1545, solar: 482, geothermal: 0, biomass: 322 },
    'CA': { nuclear: 2256, coal: 0, gas: 45600, hydro: 13650, wind: 5972, solar: 15472, geothermal: 2732, biomass: 1327 },
    'CO': { nuclear: 0, coal: 3550, gas: 9300, hydro: 2000, wind: 4980, solar: 1743, geothermal: 0, biomass: 93 },
    'CT': { nuclear: 2090, coal: 0, gas: 7950, hydro: 145, wind: 5, solar: 765, geothermal: 0, biomass: 344 },
    'DE': { nuclear: 0, coal: 0, gas: 3430, hydro: 0, wind: 2, solar: 259, geothermal: 0, biomass: 23 },
    'FL': { nuclear: 3189, coal: 5930, gas: 53100, hydro: 38, wind: 0, solar: 4368, geothermal: 0, biomass: 1507 },
    'GA': { nuclear: 4330, coal: 8690, gas: 29600, hydro: 1932, wind: 0, solar: 2964, geothermal: 0, biomass: 1027 },
    'HI': { nuclear: 0, coal: 180, gas: 1750, hydro: 38, wind: 206, solar: 1078, geothermal: 38, biomass: 126 },
    'ID': { nuclear: 0, coal: 35, gas: 620, hydro: 2500, wind: 973, solar: 101, geothermal: 15, biomass: 21 },
    'IL': { nuclear: 11582, coal: 10690, gas: 15100, hydro: 38, wind: 5984, solar: 680, geothermal: 0, biomass: 245 },
    'IN': { nuclear: 0, coal: 14860, gas: 11200, hydro: 127, wind: 2453, solar: 695, geothermal: 0, biomass: 287 },
    'IA': { nuclear: 615, coal: 5630, gas: 5750, hydro: 139, wind: 11660, solar: 157, geothermal: 0, biomass: 144 },
    'KS': { nuclear: 1166, coal: 2900, gas: 8730, hydro: 2, wind: 7016, solar: 103, geothermal: 0, biomass: 38 },
    'KY': { nuclear: 0, coal: 12580, gas: 8100, hydro: 853, wind: 12, solar: 144, geothermal: 0, biomass: 270 },
    'LA': { nuclear: 2052, coal: 2540, gas: 33800, hydro: 192, wind: 0, solar: 569, geothermal: 0, biomass: 826 },
    'ME': { nuclear: 0, coal: 0, gas: 1580, hydro: 726, wind: 933, solar: 258, geothermal: 0, biomass: 767 },
    'MD': { nuclear: 1829, coal: 2380, gas: 10900, hydro: 566, wind: 191, solar: 1563, geothermal: 0, biomass: 233 },
    'MA': { nuclear: 696, coal: 0, gas: 13400, hydro: 536, wind: 117, solar: 3664, geothermal: 0, biomass: 599 },
    'MI': { nuclear: 4163, coal: 9860, gas: 16100, hydro: 446, wind: 2062, solar: 538, geothermal: 0, biomass: 455 },
    'MN': { nuclear: 1730, coal: 4510, gas: 8970, hydro: 200, wind: 3699, solar: 936, geothermal: 0, biomass: 582 },
    'MS': { nuclear: 1410, coal: 2280, gas: 18900, hydro: 0, wind: 0, solar: 243, geothermal: 0, biomass: 464 },
    'MO': { nuclear: 1190, coal: 8680, gas: 10400, hydro: 564, wind: 1143, solar: 238, geothermal: 0, biomass: 125 },
    'MT': { nuclear: 0, coal: 2330, gas: 680, hydro: 2685, wind: 695, solar: 117, geothermal: 0, biomass: 26 },
    'NE': { nuclear: 1236, coal: 2060, gas: 4480, hydro: 73, wind: 2379, solar: 145, geothermal: 0, biomass: 38 },
    'NV': { nuclear: 0, coal: 1635, gas: 11300, hydro: 1132, wind: 152, solar: 3264, geothermal: 735, biomass: 23 },
    'NH': { nuclear: 1245, coal: 0, gas: 2930, hydro: 453, wind: 185, solar: 373, geothermal: 0, biomass: 503 },
    'NJ': { nuclear: 3479, coal: 0, gas: 17400, hydro: 15, wind: 11, solar: 3819, geothermal: 0, biomass: 335 },
    'NM': { nuclear: 0, coal: 2470, gas: 6870, hydro: 78, wind: 1800, solar: 953, geothermal: 0, biomass: 22 },
    'NY': { nuclear: 4125, coal: 0, gas: 31700, hydro: 5080, wind: 2042, solar: 3396, geothermal: 0, biomass: 586 },
    'NC': { nuclear: 5043, coal: 8980, gas: 26700, hydro: 2056, wind: 208, solar: 6783, geothermal: 0, biomass: 1021 },
    'ND': { nuclear: 0, coal: 3570, gas: 1170, hydro: 593, wind: 4427, solar: 10, geothermal: 0, biomass: 12 },
    'OH': { nuclear: 2128, coal: 14920, gas: 19100, hydro: 131, wind: 738, solar: 684, geothermal: 0, biomass: 258 },
    'OK': { nuclear: 0, coal: 5560, gas: 29400, hydro: 874, wind: 10690, solar: 104, geothermal: 0, biomass: 154 },
    'OR': { nuclear: 1170, coal: 0, gas: 6740, hydro: 11170, wind: 3213, solar: 345, geothermal: 0, biomass: 431 },
    'PA': { nuclear: 9515, coal: 13200, gas: 20900, hydro: 1759, wind: 1450, solar: 679, geothermal: 0, biomass: 782 },
    'RI': { nuclear: 0, coal: 0, gas: 2700, hydro: 2, wind: 56, solar: 278, geothermal: 0, biomass: 18 },
    'SC': { nuclear: 6479, coal: 6650, gas: 13000, hydro: 1670, wind: 0, solar: 1405, geothermal: 0, biomass: 595 },
    'SD': { nuclear: 0, coal: 590, gas: 820, hydro: 1732, wind: 1404, solar: 15, geothermal: 0, biomass: 22 },
    'TN': { nuclear: 7174, coal: 6040, gas: 12400, hydro: 3963, wind: 29, solar: 785, geothermal: 0, biomass: 416 },
    'TX': { nuclear: 5143, coal: 19350, gas: 83200, hydro: 677, wind: 35754, solar: 7729, geothermal: 0, biomass: 555 },
    'UT': { nuclear: 0, coal: 4120, gas: 5740, hydro: 318, wind: 391, solar: 1374, geothermal: 38, biomass: 17 },
    'VT': { nuclear: 0, coal: 0, gas: 360, hydro: 449, wind: 149, solar: 236, geothermal: 0, biomass: 155 },
    'VA': { nuclear: 3898, coal: 2620, gas: 22900, hydro: 802, wind: 0, solar: 1886, geothermal: 0, biomass: 884 },
    'WA': { nuclear: 1174, coal: 1370, gas: 10900, hydro: 22430, wind: 3395, solar: 245, geothermal: 0, biomass: 350 },
    'WV': { nuclear: 0, coal: 13040, gas: 3600, hydro: 345, wind: 686, solar: 53, geothermal: 0, biomass: 39 },
    'WI': { nuclear: 1135, coal: 4920, gas: 11100, hydro: 517, wind: 752, solar: 304, geothermal: 0, biomass: 525 },
    'WY': { nuclear: 0, coal: 6620, gas: 1640, hydro: 310, wind: 1810, solar: 48, geothermal: 0, biomass: 4 }
};

/**
 * State electricity consumption (MWh/year) - 2024 estimates
 */
const US_STATE_CONSUMPTION = {
    'TX': 478000000, 'CA': 278000000, 'FL': 258000000, 'NY': 156000000, 'PA': 147000000,
    'IL': 144000000, 'OH': 142000000, 'GA': 137000000, 'NC': 133000000, 'MI': 108000000,
    'VA': 118000000, 'IN': 106000000, 'TN': 99000000, 'AZ': 92000000, 'LA': 89000000,
    'WI': 73000000, 'MO': 84000000, 'AL': 87000000, 'SC': 82000000, 'KY': 80000000,
    'WA': 94000000, 'OR': 52000000, 'OK': 65000000, 'CO': 58000000, 'CT': 31000000,
    'IA': 52000000, 'MS': 49000000, 'AR': 49000000, 'KS': 43000000, 'UT': 32000000,
    'NV': 36000000, 'NM': 23000000, 'NE': 30000000, 'WV': 30000000, 'ID': 25000000,
    'HI': 10000000, 'ME': 12000000, 'NH': 12000000, 'RI': 8000000, 'MT': 14000000,
    'DE': 12000000, 'SD': 11000000, 'ND': 20000000, 'AK': 6800000, 'VT': 6000000,
    'WY': 15000000, 'MA': 58000000, 'MD': 66000000, 'MN': 71000000, 'NJ': 82000000
};

/**
 * Get total generation capacity for a state
 */
function getStateGenerationCapacity(stateCode) {
    const capacity = US_STATE_ENERGY_CAPACITY[stateCode];
    if (!capacity) return 0;

    return Object.values(capacity).reduce((sum, val) => sum + val, 0);
}

/**
 * Get generation mix percentages
 */
function getStatenergyMix(stateCode) {
    const capacity = US_STATE_ENERGY_CAPACITY[stateCode];
    if (!capacity) return null;

    const total = getStateGenerationCapacity(stateCode);

    return {
        nuclear: (capacity.nuclear / total * 100),
        coal: (capacity.coal / total * 100),
        gas: (capacity.gas / total * 100),
        hydro: (capacity.hydro / total * 100),
        wind: (capacity.wind / total * 100),
        solar: (capacity.solar / total * 100),
        geothermal: (capacity.geothermal / total * 100),
        biomass: (capacity.biomass / total * 100)
    };
}

/**
 * Calculate renewable percentage
 */
function getStateRenewablePercentage(stateCode) {
    const capacity = US_STATE_ENERGY_CAPACITY[stateCode];
    if (!capacity) return 0;

    const renewable = capacity.hydro + capacity.wind + capacity.solar +
                      capacity.geothermal + capacity.biomass;
    const total = getStateGenerationCapacity(stateCode);

    return (renewable / total * 100);
}

/**
 * Get state consumption and capacity factor
 */
function getStateEnergyBalance(stateCode) {
    const capacity = getStateGenerationCapacity(stateCode);
    const consumption = US_STATE_CONSUMPTION[stateCode] || 0;

    // Convert capacity to annual generation (assuming 50% capacity factor)
    const annualGeneration = capacity * 8760 * 0.5; // MWh per year

    return {
        capacity: capacity, // MW
        annualGeneration: annualGeneration, // MWh
        consumption: consumption, // MWh
        surplus: annualGeneration - consumption, // MWh
        isSurplus: annualGeneration > consumption,
        selfSufficiency: (annualGeneration / consumption * 100) // %
    };
}

/**
 * Recommend energy source expansion for a state
 */
function recommendEnergyExpansion(stateCode, futuredemand = null) {
    const current = US_STATE_ENERGY_CAPACITY[stateCode];
    const balance = getStateEnergyBalance(stateCode);

    if (!current) return null;

    const demand = futuredemand || balance.consumption;
    const deficit = demand - balance.annualGeneration;

    const recommendations = [];

    // Nuclear recommendation
    if (current.nuclear > 0 && balance.selfSufficiency < 100) {
        recommendations.push({
            source: 'Nuclear',
            priority: 'High',
            reason: 'Existing nuclear infrastructure; reliable baseload power',
            suggestedIncrease: Math.max(1000, deficit * 0.0002), // MW
            cost: 'High initial, low operational'
        });
    } else if (deficit > 5000000000 && balance.renewablePercentage < 30) {
        recommendations.push({
            source: 'Nuclear',
            priority: 'Medium',
            reason: 'Large deficit; need reliable baseload capacity',
            suggestedIncrease: 2000, // MW
            cost: 'High initial, low operational'
        });
    }

    // Solar recommendation (based on latitude/sunny states)
    const sunnyStates = ['AZ', 'NV', 'CA', 'NM', 'TX', 'FL'];
    if (sunnyStates.includes(stateCode)) {
        recommendations.push({
            source: 'Solar',
            priority: 'High',
            reason: 'Excellent solar resource; decreasing costs',
            suggestedIncrease: Math.max(500, deficit * 0.0001),
            cost: 'Medium initial, minimal operational'
        });
    }

    // Wind recommendation
    const windyStates = ['TX', 'IA', 'OK', 'KS', 'ND', 'SD', 'NE'];
    if (windyStates.includes(stateCode)) {
        recommendations.push({
            source: 'Wind',
            priority: 'High',
            reason: 'Strong wind resources; proven technology',
            suggestedIncrease: Math.max(1000, deficit * 0.00015),
            cost: 'Low initial, minimal operational'
        });
    }

    // Geothermal recommendation
    const geothermalStates = ['CA', 'NV', 'UT', 'ID', 'OR', 'HI'];
    if (geothermalStates.includes(stateCode) && current.geothermal < 1000) {
        recommendations.push({
            source: 'Geothermal',
            priority: 'Medium',
            reason: 'Untapped geothermal potential; baseload power',
            suggestedIncrease: 500,
            cost: 'High initial, low operational'
        });
    }

    // Natural gas (transitional)
    if (deficit > 1000000000) {
        recommendations.push({
            source: 'Natural Gas',
            priority: 'Low',
            reason: 'Quick deployment; transition fuel',
            suggestedIncrease: Math.max(500, deficit * 0.0001),
            cost: 'Low initial, medium operational'
        });
    }

    return recommendations;
}
