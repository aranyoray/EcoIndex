/**
 * Time Slider Component for Historical Data Visualization
 * Allows users to scrub through 10 years of historical data
 */

class TimeSlider {
    constructor(options = {}) {
        this.startYear = options.startYear || 2015;
        this.endYear = options.endYear || 2024;
        this.currentYear = options.currentYear || this.endYear;
        this.onChange = options.onChange || (() => {});
        this.container = options.container || document.body;

        this.isPlaying = false;
        this.playInterval = null;
        this.playSpeed = options.playSpeed || 1000; // ms per year

        this.historicalData = new Map(); // Store data by year
        this.init();
    }

    /**
     * Initialize the time slider UI
     */
    init() {
        this.createUI();
        this.attachEventListeners();
    }

    /**
     * Create the time slider UI elements
     */
    createUI() {
        const sliderContainer = document.createElement('div');
        sliderContainer.id = 'time-slider-container';
        sliderContainer.style.cssText = `
            position: absolute;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(26, 26, 46, 0.95);
            padding: 20px 30px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            z-index: 1000;
            min-width: 600px;
            backdrop-filter: blur(10px);
        `;

        sliderContainer.innerHTML = `
            <div style="margin-bottom: 15px; text-align: center;">
                <h3 style="margin: 0 0 10px 0; color: #fff; font-size: 16px;">
                    📅 Historical Data: <span id="current-year-display" style="color: #667eea;">${this.currentYear}</span>
                </h3>
                <p style="margin: 0; font-size: 12px; color: #aaa;">
                    Electricity demand and climate data from ${this.startYear} to ${this.endYear}
                </p>
            </div>

            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                <span style="color: #aaa; font-size: 14px;">${this.startYear}</span>
                <input type="range" id="year-slider"
                       min="${this.startYear}"
                       max="${this.endYear}"
                       value="${this.currentYear}"
                       step="1"
                       style="flex: 1; height: 6px; border-radius: 3px; background: linear-gradient(to right, #4575b4, #667eea, #d73027); outline: none; -webkit-appearance: none;">
                <span style="color: #aaa; font-size: 14px;">${this.endYear}</span>
            </div>

            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="play-pause-btn" style="padding: 8px 16px; background: #667eea; border: none; border-radius: 6px; color: white; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 5px;">
                    <span id="play-icon">▶</span>
                    <span id="play-text">Play</span>
                </button>
                <button id="reset-btn" style="padding: 8px 16px; background: #444; border: none; border-radius: 6px; color: white; cursor: pointer; font-size: 14px;">
                    ↻ Reset
                </button>
                <button id="compare-btn" style="padding: 8px 16px; background: #444; border: none; border-radius: 6px; color: white; cursor: pointer; font-size: 14px;">
                    📊 Compare Years
                </button>
            </div>

            <div id="year-stats" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #444; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; font-size: 12px;">
                <div style="text-align: center;">
                    <div style="color: #aaa;">Avg Demand</div>
                    <div style="color: #667eea; font-weight: bold; font-size: 16px;" id="stat-demand">--</div>
                    <div style="color: #888; font-size: 10px;">MW</div>
                </div>
                <div style="text-align: center;">
                    <div style="color: #aaa;">Avg Temp</div>
                    <div style="color: #fc8d59; font-weight: bold; font-size: 16px;" id="stat-temp">--</div>
                    <div style="color: #888; font-size: 10px;">°C</div>
                </div>
                <div style="text-align: center;">
                    <div style="color: #aaa;">Evap Power</div>
                    <div style="color: #d73027; font-weight: bold; font-size: 16px;" id="stat-power">--</div>
                    <div style="color: #888; font-size: 10px;">W/m²</div>
                </div>
            </div>
        `;

        // Add CSS for the slider thumb
        const style = document.createElement('style');
        style.textContent = `
            #year-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #667eea;
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(102, 126, 234, 0.5);
            }

            #year-slider::-moz-range-thumb {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #667eea;
                cursor: pointer;
                border: none;
                box-shadow: 0 2px 8px rgba(102, 126, 234, 0.5);
            }

            #play-pause-btn:hover, #reset-btn:hover, #compare-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                transition: all 0.2s ease;
            }
        `;
        document.head.appendChild(style);

        this.container.appendChild(sliderContainer);
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const slider = document.getElementById('year-slider');
        const playPauseBtn = document.getElementById('play-pause-btn');
        const resetBtn = document.getElementById('reset-btn');
        const compareBtn = document.getElementById('compare-btn');

        // Slider change
        slider.addEventListener('input', (e) => {
            this.currentYear = parseInt(e.target.value);
            this.updateDisplay();
            this.onChange(this.currentYear);
        });

        // Play/Pause
        playPauseBtn.addEventListener('click', () => {
            this.togglePlayPause();
        });

        // Reset
        resetBtn.addEventListener('click', () => {
            this.reset();
        });

        // Compare years
        compareBtn.addEventListener('click', () => {
            this.showComparisonModal();
        });
    }

    /**
     * Update the display with current year
     */
    updateDisplay() {
        document.getElementById('current-year-display').textContent = this.currentYear;
        document.getElementById('year-slider').value = this.currentYear;

        // Update stats if data is available
        this.updateStats();
    }

    /**
     * Update statistics display
     */
    updateStats() {
        const data = this.historicalData.get(this.currentYear);

        if (data) {
            document.getElementById('stat-demand').textContent =
                data.avgDemand ? data.avgDemand.toFixed(0) : '--';
            document.getElementById('stat-temp').textContent =
                data.avgTemp ? data.avgTemp.toFixed(1) : '--';
            document.getElementById('stat-power').textContent =
                data.avgPower ? data.avgPower.toFixed(1) : '--';
        }
    }

    /**
     * Toggle play/pause animation
     */
    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    /**
     * Start playing through years
     */
    play() {
        this.isPlaying = true;
        document.getElementById('play-icon').textContent = '⏸';
        document.getElementById('play-text').textContent = 'Pause';

        this.playInterval = setInterval(() => {
            if (this.currentYear >= this.endYear) {
                this.currentYear = this.startYear;
            } else {
                this.currentYear++;
            }

            this.updateDisplay();
            this.onChange(this.currentYear);
        }, this.playSpeed);
    }

    /**
     * Pause animation
     */
    pause() {
        this.isPlaying = false;
        document.getElementById('play-icon').textContent = '▶';
        document.getElementById('play-text').textContent = 'Play';

        if (this.playInterval) {
            clearInterval(this.playInterval);
            this.playInterval = null;
        }
    }

    /**
     * Reset to current year
     */
    reset() {
        this.pause();
        this.currentYear = this.endYear;
        this.updateDisplay();
        this.onChange(this.currentYear);
    }

    /**
     * Store historical data for a year
     */
    setYearData(year, data) {
        this.historicalData.set(year, data);
        if (year === this.currentYear) {
            this.updateStats();
        }
    }

    /**
     * Get data for a specific year
     */
    getYearData(year) {
        return this.historicalData.get(year);
    }

    /**
     * Show comparison modal for multiple years
     */
    showComparisonModal() {
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
            max-height: 80vh;
            overflow-y: auto;
            color: #eee;
        `;

        // Create comparison table
        let tableHTML = `
            <h2 style="margin-bottom: 20px; color: #667eea;">Year-over-Year Comparison</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="border-bottom: 2px solid #667eea;">
                        <th style="padding: 10px; text-align: left; color: #aaa;">Year</th>
                        <th style="padding: 10px; text-align: right; color: #aaa;">Demand (MW)</th>
                        <th style="padding: 10px; text-align: right; color: #aaa;">Temp (°C)</th>
                        <th style="padding: 10px; text-align: right; color: #aaa;">Power (W/m²)</th>
                        <th style="padding: 10px; text-align: right; color: #aaa;">Change %</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let prevDemand = null;
        for (let year = this.startYear; year <= this.endYear; year++) {
            const data = this.historicalData.get(year);
            if (data) {
                const change = prevDemand ? ((data.avgDemand - prevDemand) / prevDemand * 100) : 0;
                const changeColor = change > 0 ? '#fc8d59' : '#91bfdb';
                const changeSymbol = change > 0 ? '↑' : '↓';

                tableHTML += `
                    <tr style="border-bottom: 1px solid #333;">
                        <td style="padding: 10px; font-weight: bold;">${year}</td>
                        <td style="padding: 10px; text-align: right;">${data.avgDemand ? data.avgDemand.toFixed(0) : '--'}</td>
                        <td style="padding: 10px; text-align: right;">${data.avgTemp ? data.avgTemp.toFixed(1) : '--'}</td>
                        <td style="padding: 10px; text-align: right;">${data.avgPower ? data.avgPower.toFixed(1) : '--'}</td>
                        <td style="padding: 10px; text-align: right; color: ${changeColor};">
                            ${prevDemand ? `${changeSymbol} ${Math.abs(change).toFixed(1)}%` : '--'}
                        </td>
                    </tr>
                `;
                prevDemand = data.avgDemand;
            }
        }

        tableHTML += `
                </tbody>
            </table>
            <div style="margin-top: 20px; text-align: center;">
                <button id="close-comparison" style="padding: 10px 24px; background: #667eea; border: none; border-radius: 6px; color: white; cursor: pointer; font-weight: bold;">
                    Close
                </button>
            </div>
        `;

        modal.innerHTML = tableHTML;

        const overlay = document.createElement('div');
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

        document.getElementById('close-comparison').onclick = () => {
            document.body.removeChild(modal);
            document.body.removeChild(overlay);
        };

        overlay.onclick = () => {
            document.body.removeChild(modal);
            document.body.removeChild(overlay);
        };
    }

    /**
     * Destroy the slider
     */
    destroy() {
        this.pause();
        const container = document.getElementById('time-slider-container');
        if (container) {
            container.remove();
        }
    }
}

// Global instance
let timeSlider = null;

/**
 * Initialize time slider
 */
function initTimeSlider(options = {}) {
    if (timeSlider) {
        timeSlider.destroy();
    }

    timeSlider = new TimeSlider({
        startYear: 2015,
        endYear: 2024,
        currentYear: 2024,
        container: document.body,
        onChange: (year) => {
            console.log(`Year changed to: ${year}`);
            // This will be hooked up to update the map
            if (window.updateMapForYear) {
                window.updateMapForYear(year);
            }
        },
        ...options
    });

    return timeSlider;
}
