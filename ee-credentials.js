/**
 * Google Earth Engine Credentials
 * Load your service account JSON file here
 * 
 * IMPORTANT: This file should contain your actual credentials
 * Copy your ee-*.json file contents here, or load from file
 */

// Option 1: Load from your JSON file (recommended)
// The actual credentials file should be in the same directory
// and named: ee-aranyoray-f02dcae4760d.json

let EE_CREDENTIALS = null;

// Try to load from file (if available)
try {
    // In production, use fetch to load the JSON file
    // For now, user should copy their credentials here
    EE_CREDENTIALS = {
        // Copy your service account JSON contents here
        // Or load dynamically from file
    };
} catch (e) {
    console.warn('EE credentials not loaded. Using fallback estimation.');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EE_CREDENTIALS };
}

