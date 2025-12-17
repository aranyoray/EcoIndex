/**
 * Storage Calculator for Satellite Data
 * Calculates storage requirements for historical satellite imagery
 */

class StorageCalculator {
    /**
     * Calculate storage for 10 years of satellite data
     * 
     * For water quality and greenspace analysis:
     * - NDVI (greenspace): Single band, 16-bit
     * - NDWI (water): Single band, 16-bit
     * - RGB (visual): 3 bands, 8-bit each
     * 
     * Resolution options:
     * - Sentinel-2: 10m resolution
     * - Landsat: 30m resolution
     */
    calculateStorageRequirements() {
        const results = {
            sentinel2: this.calculateSentinel2Storage(),
            landsat: this.calculateLandsatStorage(),
            compressed: this.calculateCompressedStorage(),
            recommendations: []
        };

        return results;
    }

    /**
     * Calculate Sentinel-2 storage (10m resolution)
     */
    calculateSentinel2Storage() {
        // Sonoma County area: ~1,768 sq miles = ~4,580 sq km
        // At 10m resolution: ~45,800,000 pixels per image
        
        const sonomaCountyArea = 4580; // sq km
        const pixelsPerSqKm = 10000; // 10m = 100 pixels per km²
        const totalPixels = sonomaCountyArea * pixelsPerSqKm; // 45.8M pixels
        
        // Data per image:
        // - NDVI: 1 band × 16-bit = 2 bytes per pixel
        // - NDWI: 1 band × 16-bit = 2 bytes per pixel
        // - RGB: 3 bands × 8-bit = 3 bytes per pixel
        // Total: 7 bytes per pixel
        
        const bytesPerPixel = 7;
        const bytesPerImage = totalPixels * bytesPerPixel; // ~320 MB per image
        
        // Frequency: Sentinel-2 revisits every 5 days
        // 10 years = 3650 days / 5 = 730 images
        const imagesPerYear = 365 / 5; // 73 images/year
        const totalImages = imagesPerYear * 10; // 730 images
        
        const totalBytes = bytesPerImage * totalImages;
        
        return {
            area: sonomaCountyArea,
            pixelsPerImage: totalPixels,
            bytesPerImage: bytesPerImage,
            mbPerImage: (bytesPerImage / (1024 * 1024)).toFixed(2),
            imagesPerYear: imagesPerYear,
            totalImages: totalImages,
            totalBytes: totalBytes,
            totalGB: (totalBytes / (1024 * 1024 * 1024)).toFixed(2),
            totalTB: (totalBytes / (1024 * 1024 * 1024 * 1024)).toFixed(3)
        };
    }

    /**
     * Calculate Landsat storage (30m resolution)
     */
    calculateLandsatStorage() {
        const sonomaCountyArea = 4580; // sq km
        const pixelsPerSqKm = 1111; // 30m = ~11.1 pixels per km²
        const totalPixels = sonomaCountyArea * pixelsPerSqKm; // ~5.1M pixels
        
        const bytesPerPixel = 7; // Same as Sentinel-2
        const bytesPerImage = totalPixels * bytesPerPixel; // ~36 MB per image
        
        // Frequency: Landsat revisits every 16 days
        // 10 years = 3650 days / 16 = ~228 images
        const imagesPerYear = 365 / 16; // ~23 images/year
        const totalImages = imagesPerYear * 10; // ~228 images
        
        const totalBytes = bytesPerImage * totalImages;
        
        return {
            area: sonomaCountyArea,
            pixelsPerImage: totalPixels,
            bytesPerImage: bytesPerImage,
            mbPerImage: (bytesPerImage / (1024 * 1024)).toFixed(2),
            imagesPerYear: imagesPerYear,
            totalImages: totalImages,
            totalBytes: totalBytes,
            totalGB: (totalBytes / (1024 * 1024 * 1024)).toFixed(2),
            totalTB: (totalBytes / (1024 * 1024 * 1024 * 1024)).toFixed(3)
        };
    }

    /**
     * Calculate compressed storage (using compression)
     */
    calculateCompressedStorage() {
        const sentinel2 = this.calculateSentinel2Storage();
        const landsat = this.calculateLandsatStorage();
        
        // Compression ratios:
        // - NDVI/NDWI: Can compress to ~10% (lossless)
        // - RGB: Can compress to ~5% (JPEG-like)
        // Average: ~7.5% of original
        
        const compressionRatio = 0.075;
        
        return {
            sentinel2GB: (sentinel2.totalBytes * compressionRatio / (1024 * 1024 * 1024)).toFixed(2),
            landsatGB: (landsat.totalBytes * compressionRatio / (1024 * 1024 * 1024)).toFixed(2),
            sentinel2TB: (sentinel2.totalBytes * compressionRatio / (1024 * 1024 * 1024 * 1024)).toFixed(3),
            landsatTB: (landsat.totalBytes * compressionRatio / (1024 * 1024 * 1024 * 1024)).toFixed(3)
        };
    }

    /**
     * Calculate for entire US (70,000+ census tracts)
     */
    calculateUSStorage() {
        // US area: ~9.8 million sq km
        // At 10m resolution: ~98 billion pixels per image
        
        const usArea = 9800000; // sq km
        const pixelsPerSqKm = 10000;
        const totalPixels = usArea * pixelsPerSqKm; // 98B pixels
        
        const bytesPerPixel = 7;
        const bytesPerImage = totalPixels * bytesPerPixel; // ~686 GB per image
        
        const imagesPerYear = 73; // Sentinel-2
        const totalImages = imagesPerYear * 10; // 730 images
        
        const totalBytes = bytesPerImage * totalImages;
        
        return {
            totalTB: (totalBytes / (1024 * 1024 * 1024 * 1024)).toFixed(1),
            compressedTB: (totalBytes * 0.075 / (1024 * 1024 * 1024 * 1024)).toFixed(1),
            recommendation: 'Use cloud storage (AWS S3, Google Cloud Storage) with lifecycle policies'
        };
    }
}

// Calculate and display storage requirements
const storageCalc = new StorageCalculator();
const requirements = storageCalc.calculateStorageRequirements();
const usRequirements = storageCalc.calculateUSStorage();

console.log('=== STORAGE REQUIREMENTS FOR 10 YEARS OF SATELLITE DATA ===');
console.log('\nSonoma County (Testing Area):');
console.log('Sentinel-2 (10m):', requirements.sentinel2.totalGB, 'GB uncompressed');
console.log('Sentinel-2 (compressed):', requirements.compressed.sentinel2GB, 'GB');
console.log('Landsat (30m):', requirements.landsat.totalGB, 'GB uncompressed');
console.log('Landsat (compressed):', requirements.compressed.landsatGB, 'GB');

console.log('\nEntire US (Production):');
console.log('Uncompressed:', usRequirements.totalTB, 'TB');
console.log('Compressed:', usRequirements.compressedTB, 'TB');

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StorageCalculator, requirements, usRequirements };
}

