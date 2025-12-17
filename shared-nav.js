/**
 * Shared Navigation Component for EvaEnergy Suite
 * Provides consistent navigation across all 4 pages
 */

const EVA_PAGES = {
    demand: {
        file: 'eva-demand.html',
        title: 'EvaDemand',
        icon: '⚡',
        description: 'Energy demand analysis by location'
    },
    supply: {
        file: 'eva-supply.html',
        title: 'EvaSupply',
        icon: '🔋',
        description: 'Energy supply & generation capacity'
    },
    deficit: {
        file: 'eva-deficit.html',
        title: 'EvaDeficit',
        icon: '📊',
        description: 'Supply-demand gap analysis'
    },
    price: {
        file: 'eva-price.html',
        title: 'EvaPrice',
        icon: '💰',
        description: 'Energy price predictions'
    }
};

/**
 * Initialize shared navigation
 */
function initSharedNavigation(currentPage) {
    const navHTML = `
        <div class="eva-nav" style="
            position: absolute;
            top: 100px;
            right: 20px;
            z-index: 1000;
            background: rgba(26, 26, 46, 0.95);
            padding: 15px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
            min-width: 200px;
        ">
            <h3 style="margin: 0 0 15px 0; color: #667eea; font-size: 14px; border-bottom: 2px solid #667eea; padding-bottom: 8px;">
                EvaEnergy Suite
            </h3>
            ${Object.entries(EVA_PAGES).map(([key, page]) => `
                <a href="${page.file}"
                   class="nav-link ${currentPage === key ? 'active' : ''}"
                   style="
                       display: flex;
                       align-items: center;
                       gap: 10px;
                       padding: 10px 12px;
                       margin-bottom: 8px;
                       border-radius: 8px;
                       text-decoration: none;
                       color: ${currentPage === key ? '#fff' : '#aaa'};
                       background: ${currentPage === key ? '#667eea' : 'transparent'};
                       border: 1px solid ${currentPage === key ? '#667eea' : '#333'};
                       transition: all 0.3s ease;
                       font-size: 13px;
                   "
                   onmouseover="this.style.background='#667eea'; this.style.color='#fff';"
                   onmouseout="this.style.background='${currentPage === key ? '#667eea' : 'transparent'}'; this.style.color='${currentPage === key ? '#fff' : '#aaa'}';">
                    <span style="font-size: 18px;">${page.icon}</span>
                    <div style="flex: 1;">
                        <div style="font-weight: bold;">${page.title}</div>
                        <div style="font-size: 10px; opacity: 0.8;">${page.description}</div>
                    </div>
                </a>
            `).join('')}
        </div>

        <style>
            .nav-link:hover {
                transform: translateX(-3px);
            }
        </style>
    `;

    // Add to body
    const navContainer = document.createElement('div');
    navContainer.innerHTML = navHTML;
    document.body.appendChild(navContainer.firstElementChild);
}

/**
 * Get current page identifier from URL
 */
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('demand')) return 'demand';
    if (path.includes('supply')) return 'supply';
    if (path.includes('deficit')) return 'deficit';
    if (path.includes('price')) return 'price';
    return 'demand'; // default
}
