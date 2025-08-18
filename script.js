// Global test function for debugging
window.testSearch = function(term) {
    console.log('Testing search with term:', term);
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    searchInput.value = term;
    searchInput.dispatchEvent(new Event('input'));
    
    // Trigger search
    if (window.hkCompanyFinder) {
        window.hkCompanyFinder.performSearch();
    }
};

// HK Company Finder - Main JavaScript
class HKCompanyFinder {
    constructor() {
        this.companies = [];
        this.filteredCompanies = [];
        this.currentSearch = '';
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.showWelcomeSection();
        console.log('HK Company Finder initialized');
        
        // Make instance globally accessible for testing
        window.hkCompanyFinder = this;
    }
    
    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        searchInput.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        searchBtn.addEventListener('click', () => {
            this.performSearch();
        });
        
        // Filters
        const sourceFilter = document.getElementById('sourceFilter');
        const sortBy = document.getElementById('sortBy');
        
        sourceFilter.addEventListener('change', () => {
            this.applyFilters();
        });
        
        sortBy.addEventListener('change', () => {
            this.applyFilters();
        });
        
        // Retry button
        const retryBtn = document.getElementById('retryBtn');
        retryBtn.addEventListener('click', () => {
            this.performSearch();
        });
        
        // Modal functionality
        const modalClose = document.getElementById('modalClose');
        const privacyLink = document.getElementById('privacyLink');
        const termsLink = document.getElementById('termsLink');
        const privacyModalClose = document.getElementById('privacyModalClose');
        const termsModalClose = document.getElementById('termsModalClose');
        
        modalClose.addEventListener('click', () => {
            this.closeModal('companyModal');
        });
        
        privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.openModal('privacyModal');
        });
        
        termsLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.openModal('termsModal');
        });
        
        privacyModalClose.addEventListener('click', () => {
            this.closeModal('privacyModal');
        });
        
        termsModalClose.addEventListener('click', () => {
            this.closeModal('termsModal');
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }
    
    handleSearchInput(value) {
        this.currentSearch = value.trim();
        const searchBtn = document.getElementById('searchBtn');
        
        if (this.currentSearch.length >= 2) {
            searchBtn.disabled = false;
            searchBtn.style.opacity = '1';
        } else {
            searchBtn.disabled = true;
            searchBtn.style.opacity = '0.6';
        }
    }
    
    async performSearch() {
        if (this.currentSearch.length < 2) {
            return;
        }
        
        console.log('Starting search for:', this.currentSearch);
        this.isLoading = true;
        this.showLoadingSection();
        
        try {
            // Search both local and foreign companies simultaneously
            console.log('Searching local companies...');
            const localResults = await this.searchLocalCompanies(this.currentSearch);
            console.log('Local results:', localResults);
            
            console.log('Searching foreign companies...');
            const foreignResults = await this.searchForeignCompanies(this.currentSearch);
            console.log('Foreign results:', foreignResults);
            
            // Merge and deduplicate results
            this.companies = this.mergeAndDeduplicate(localResults, foreignResults);
            this.filteredCompanies = [...this.companies];
            
            console.log('Total merged results:', this.companies.length);
            this.displayResults();
            
        } catch (error) {
            console.error('Search error:', error);
            this.showError(error.message);
        } finally {
            this.isLoading = false;
        }
    }
    
    async searchLocalCompanies(query) {
        const url = this.buildSearchURL('local', query);
        console.log('Local API URL:', url);
        return await this.fetchCompaniesWithFallback(url, 'local', query);
    }
    
    async searchForeignCompanies(query) {
        const url = this.buildSearchURL('foreign', query);
        console.log('Foreign API URL:', url);
        return await this.fetchCompaniesWithFallback(url, 'foreign', query);
    }
    
    async fetchCompaniesWithFallback(url, source, query) {
        const corsProxies = [
            'https://cors-anywhere.herokuapp.com/',
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            'https://thingproxy.freeboard.io/fetch/'
        ];
        
        // Try each proxy until one works
        for (let i = 0; i < corsProxies.length; i++) {
            try {
                const baseURL = 'https://data.cr.gov.hk/cr/api/api/v1/api_builder/json';
                const fieldName = source === 'local' ? 'Comp_name' : 'Corp_name_full';
                
                const params = new URLSearchParams({
                    'query[0][key1]': fieldName,
                    'query[0][key2]': 'begins_with',
                    'query[0][key3]': query,
                    'format': 'json'
                });
                
                const targetURL = `${baseURL}/${source}/search?${params.toString()}`;
                const proxyURL = corsProxies[i] + targetURL + `&_t=${Date.now()}`;
                
                console.log(`Trying proxy ${i + 1}/${corsProxies.length}: ${corsProxies[i]}`);
                console.log(`Full URL: ${proxyURL}`);
                
                const result = await this.fetchCompanies(proxyURL, source);
                if (result.length > 0 || i === corsProxies.length - 1) {
                    console.log(`Proxy ${i + 1} successful or last attempt`);
                    return result;
                }
            } catch (error) {
                console.log(`Proxy ${i + 1} failed:`, error.message);
                if (i === corsProxies.length - 1) {
                    console.error(`All proxies failed for ${source} companies`);
                    return [];
                }
            }
        }
        
        return [];
    }
    
    buildSearchURL(source, query) {
        const baseURL = 'https://data.cr.gov.hk/cr/api/api/v1/api_builder/json';
        const fieldName = source === 'local' ? 'Comp_name' : 'Corp_name_full';
        
        const params = new URLSearchParams({
            'query[0][key1]': fieldName,
            'query[0][key2]': 'begins_with',
            'query[0][key3]': query,
            'format': 'json'
        });
        
        const targetURL = `${baseURL}/${source}/search?${params.toString()}`;
        console.log(`Original target URL: ${targetURL}`);
        
        // Use CORS proxy to bypass CORS restrictions
        // Try multiple proxy services for better reliability
        const corsProxies = [
            'https://cors-anywhere.herokuapp.com/',
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            'https://thingproxy.freeboard.io/fetch/'
        ];
        
        // Add cache-busting parameter to avoid browser caching issues
        const cacheBuster = `&_t=${Date.now()}`;
        const finalURL = corsProxies[0] + targetURL + cacheBuster;
        console.log(`Final URL with CORS proxy: ${finalURL}`);
        
        return finalURL;
    }
    
    async fetchCompanies(url, source) {
        try {
            console.log(`Fetching ${source} companies from:`, url);
            const response = await fetch(url);
            
            console.log(`${source} API response status:`, response.status);
            console.log(`${source} API response headers:`, response.headers);
            
            if (!response.ok) {
                if (response.status === 400 || response.status === 404) {
                    // No results found, return empty array
                    console.log(`${source} API returned ${response.status} - no results found`);
                    return [];
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`${source} API raw response:`, data);
            return this.parseCompanyData(data, source);
            
        } catch (error) {
            console.error(`Error fetching ${source} companies:`, error);
            
            // Check if it's a CORS error
            if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
                console.error(`${source}: CORS error detected. This is likely due to the API not allowing cross-origin requests.`);
                // Return empty array but don't throw - let the other API call continue
                return [];
            }
            
            // Return empty array on error to continue with other results
            return [];
        }
    }
    
    parseCompanyData(data, source) {
        let companies = [];
        
        if (Array.isArray(data)) {
            // Direct array response
            console.log(`${source}: Direct array response with ${data.length} items`);
            companies = data;
        } else if (data && typeof data === 'object') {
            // Check for error response
            if (data.status && data.status !== 200) {
                if (data.status === 400 || data.status === 404) {
                    console.log(`${source}: API returned error status ${data.status}`);
                    return [];
                }
                throw new Error(data.message || `API Error: ${data.status}`);
            }
            
            // Find the data array
            const dataKey = this.findDataKey(data);
            console.log(`${source}: Using data key '${dataKey}'`);
            companies = data[dataKey] || [];
            console.log(`${source}: Found ${companies.length} companies in data key '${dataKey}'`);
        }
        
        const mappedCompanies = companies.map(company => this.mapToCompanyRecord(company, source));
        console.log(`${source}: Mapped ${mappedCompanies.length} companies to records`);
        return mappedCompanies;
    }
    
    findDataKey(data) {
        const possibleKeys = ['data', 'Data', 'results', 'Results', 'companies', 'Companies', 'items', 'Items'];
        const foundKey = possibleKeys.find(key => data[key] && Array.isArray(data[key]));
        console.log(`Available keys in response:`, Object.keys(data));
        console.log(`Found data key:`, foundKey);
        return foundKey || 'data';
    }
    
    mapToCompanyRecord(company, source) {
        // Extract company name
        let name = '';
        if (source === 'foreign') {
            name = this.extractValue(company, ['Corporate_Name', 'corporate_name', 'CORPORATE_NAME']);
        } else {
            name = this.extractValue(company, [
                'English_Company_Name', 'english_company_name', 'English_company_name',
                'Chinese_Company_Name', 'chinese_company_name', 'Chinese_company_name',
                'Comp_name', 'COMP_NAME', 'company_name', 'Company_Name', 'compName'
            ]);
        }
        
        // Extract company number/BRN
        const number = this.extractValue(company, [
            'Brn', 'BRN', 'CR_NO', 'cr_no', 'Company_No', 'companyNo', 'COMP_NO'
        ]);
        
        // Extract address
        let address = '';
        if (source === 'foreign') {
            address = this.extractValue(company, [
                'Principal_Place_of_Business_in_H.K.', 'principal_place_of_business_in_h.k.',
                'Principal_Place_of_Business_in_HK', 'principal_place_of_business_in_hk'
            ]);
        } else {
            address = this.extractAddress(company);
        }
        
        // Extract additional fields
        const additionalFields = this.extractAdditionalFields(company, source);
        
        const record = {
            id: `${source}_${number || name}_${Date.now()}`,
            name: name,
            number: number || null,
            address: address || null,
            source: source,
            ...additionalFields
        };
        
        console.log(`Mapped company record:`, record);
        return record;
    }
    
    extractValue(company, keys) {
        for (const key of keys) {
            if (company[key] && typeof company[key] === 'string' && company[key].trim()) {
                return company[key].trim();
            }
        }
        return '';
    }
    
    extractAddress(company) {
        // Try specific address keys first
        const specificAddressKeys = [
            'Address_of_Registered_Office', 'address_of_registered_office', 'Address_of_Registered_office',
            'Reg_office_address', 'PPB_address', 'Address', 'address', 
            'Registered_Office_Address', 'Principal_Place_of_Business'
        ];
        
        const specificAddress = this.extractValue(company, specificAddressKeys);
        if (specificAddress) {
            return specificAddress;
        }
        
        // Fallback: join any keys containing "addr"
        const addressLines = Object.entries(company)
            .filter(([key, value]) => 
                key.toLowerCase().includes('addr') && 
                typeof value === 'string' && 
                value.trim()
            )
            .map(([key, value]) => value.trim());
        
        return addressLines.length > 0 ? addressLines.join(', ') : '';
    }
    
    extractAdditionalFields(company, source) {
        if (source === 'local') {
            return {
                chineseName: this.extractValue(company, ['Chinese_Company_Name', 'chinese_company_name']),
                englishName: this.extractValue(company, ['English_Company_Name', 'english_company_name']),
                companyType: this.extractValue(company, ['Company_Type', 'company_type']),
                incorporationDate: this.extractValue(company, ['Date_of_Incorporation', 'date_of_incorporation']),
                placeOfIncorporation: 'Hong Kong',
                redomiciliationDate: this.extractValue(company, ['Re-domiciliation_Date', 're_domiciliation_date'])
            };
        } else {
            return {
                companyType: this.extractValue(company, ['Company_Type', 'company_type']),
                registrationDate: this.extractValue(company, ['Date_of_Registration', 'date_of_registration']),
                placeOfIncorporation: this.extractValue(company, ['Place_of_Incorporation', 'place_of_incorporation']),
                approvedBusinessName: this.extractValue(company, ['Approved_name_for_carrying_on_business_in_H.K._Corporate', 'approved_name_for_carrying_on_business_in_hk_corporate']),
                otherCorporateNames: this.extractValue(company, ['Other_Corporate_Name_s', 'other_corporate_names'])
            };
        }
    }
    
    mergeAndDeduplicate(localCompanies, foreignCompanies) {
        const allCompanies = [...localCompanies, ...foreignCompanies];
        const seen = new Set();
        const deduplicated = [];
        
        for (const company of allCompanies) {
            let key;
            if (company.number) {
                // Use BRN for deduplication if available
                key = `${company.number}_${company.source}`;
            } else {
                // Use normalized name + address + source for deduplication
                const normalizedName = company.name.toLowerCase().trim();
                const normalizedAddress = (company.address || '').toLowerCase().trim();
                key = `${normalizedName}_${normalizedAddress}_${company.source}`;
            }
            
            if (!seen.has(key)) {
                seen.add(key);
                deduplicated.push(company);
            }
        }
        
        console.log(`Deduplication: ${allCompanies.length} total, ${deduplicated.length} unique`);
        return deduplicated;
    }
    
    displayResults() {
        this.hideAllSections();
        
        if (this.companies.length === 0) {
            console.log('No results found, showing no results section');
            this.showNoResults();
            return;
        }
        
        console.log(`Displaying ${this.companies.length} results`);
        this.showResultsSection();
        this.updateResultsCount();
        this.renderCompanyCards();
        this.applyFilters();
    }
    
    renderCompanyCards() {
        const container = document.getElementById('resultsContainer');
        container.innerHTML = '';
        
        this.companies.forEach(company => {
            const card = this.createCompanyCard(company);
            container.appendChild(card);
        });
    }
    
    createCompanyCard(company) {
        const card = document.createElement('div');
        card.className = 'company-card';
        card.addEventListener('click', () => {
            this.showCompanyDetails(company);
        });
        
        card.innerHTML = `
            <div class="company-header">
                <div>
                    <div class="company-name">${this.escapeHtml(company.name)}</div>
                    ${company.chineseName ? `<div class="company-name" style="font-size: 1rem; color: #64748b;">${this.escapeHtml(company.chineseName)}</div>` : ''}
                </div>
                <span class="company-source ${company.source}">${company.source}</span>
            </div>
            <div class="company-details">
                ${company.number ? `
                    <div class="company-detail">
                        <i class="fas fa-hashtag"></i>
                        <span><strong>Business Number:</strong> ${this.escapeHtml(company.number)}</span>
                    </div>
                ` : ''}
                ${company.address ? `
                    <div class="company-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <span><strong>Address:</strong> ${this.escapeHtml(company.address)}</span>
                    </div>
                ` : ''}
                ${company.companyType ? `
                    <div class="company-detail">
                        <i class="fas fa-building"></i>
                        <span><strong>Type:</strong> ${this.escapeHtml(company.companyType)}</span>
                    </div>
                ` : ''}
                ${company.incorporationDate ? `
                    <div class="company-detail">
                        <i class="fas fa-calendar"></i>
                        <span><strong>Incorporation Date:</strong> ${this.escapeHtml(company.incorporationDate)}</span>
                    </div>
                ` : ''}
                ${company.registrationDate ? `
                    <div class="company-detail">
                        <i class="fas fa-calendar-check"></i>
                        <span><strong>Registration Date:</strong> ${this.escapeHtml(company.registrationDate)}</span>
                    </div>
                ` : ''}
            </div>
        `;
        
        return card;
    }
    
    showCompanyDetails(company) {
        const modal = document.getElementById('companyModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = company.name;
        
        let detailsHtml = `
            <div class="company-detail-modal">
                <div class="detail-row">
                    <span class="detail-label">Company Name:</span>
                    <span class="detail-value">${this.escapeHtml(company.name)}</span>
                </div>
        `;
        
        if (company.chineseName) {
            detailsHtml += `
                <div class="detail-row">
                    <span class="detail-label">Chinese Name:</span>
                    <span class="detail-value">${this.escapeHtml(company.chineseName)}</span>
                </div>
            `;
        }
        
        if (company.englishName) {
            detailsHtml += `
                <div class="detail-row">
                    <span class="detail-label">English Name:</span>
                    <span class="detail-value">${this.escapeHtml(company.englishName)}</span>
                </div>
            `;
        }
        
        if (company.number) {
            detailsHtml += `
                <div class="detail-row">
                    <span class="detail-label">Business Number:</span>
                    <span class="detail-value">${this.escapeHtml(company.number)}</span>
                </div>
            `;
        }
        
        if (company.address) {
            detailsHtml += `
                <div class="detail-row">
                    <span class="detail-label">Address:</span>
                    <span class="detail-value">${this.escapeHtml(company.address)}</span>
                </div>
            `;
        }
        
        if (company.companyType) {
            detailsHtml += `
                <div class="detail-row">
                    <span class="detail-label">Company Type:</span>
                    <span class="detail-value">${this.escapeHtml(company.companyType)}</span>
                </div>
            `;
        }
        
        if (company.incorporationDate) {
            detailsHtml += `
                <div class="detail-row">
                    <span class="detail-label">Incorporation Date:</span>
                    <span class="detail-value">${this.escapeHtml(company.incorporationDate)}</span>
                </div>
            `;
        }
        
        if (company.registrationDate) {
            detailsHtml += `
                <div class="detail-row">
                    <span class="detail-label">Registration Date:</span>
                    <span class="detail-value">${this.escapeHtml(company.registrationDate)}</span>
                </div>
            `;
        }
        
        if (company.placeOfIncorporation) {
            detailsHtml += `
                <div class="detail-row">
                    <span class="detail-label">Place of Incorporation:</span>
                    <span class="detail-value">${this.escapeHtml(company.placeOfIncorporation)}</span>
                </div>
            `;
        }
        
        if (company.redomiciliationDate) {
            detailsHtml += `
                <div class="detail-row">
                    <span class="detail-label">Re-domiciliation Date:</span>
                    <span class="detail-value">${this.escapeHtml(company.redomiciliationDate)}</span>
                </div>
            `;
        }
        
        if (company.approvedBusinessName) {
            detailsHtml += `
                <div class="detail-row">
                    <span class="detail-label">Approved Business Name:</span>
                    <span class="detail-value">${this.escapeHtml(company.approvedBusinessName)}</span>
                </div>
            `;
        }
        
        if (company.otherCorporateNames) {
            detailsHtml += `
                <div class="detail-row">
                    <span class="detail-label">Other Corporate Names:</span>
                    <span class="detail-value">${this.escapeHtml(company.otherCorporateNames)}</span>
                </div>
            `;
        }
        
        detailsHtml += `
                <div class="detail-row">
                    <span class="detail-label">Source:</span>
                    <span class="detail-value">${company.source.charAt(0).toUpperCase() + company.source.slice(1)} Companies</span>
                </div>
            </div>
        `;
        
        modalBody.innerHTML = detailsHtml;
        this.openModal('companyModal');
    }
    
    applyFilters() {
        const sourceFilter = document.getElementById('sourceFilter').value;
        const sortBy = document.getElementById('sortBy').value;
        
        // Filter by source
        this.filteredCompanies = this.companies.filter(company => {
            if (sourceFilter === 'all') return true;
            return company.source === sourceFilter;
        });
        
        // Sort results
        this.filteredCompanies.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'number':
                    if (!a.number && !b.number) return 0;
                    if (!a.number) return 1;
                    if (!b.number) return -1;
                    return a.number.localeCompare(b.number);
                case 'source':
                    return a.source.localeCompare(b.source);
                default:
                    return 0;
            }
        });
        
        this.renderFilteredResults();
    }
    
    renderFilteredResults() {
        const container = document.getElementById('resultsContainer');
        container.innerHTML = '';
        
        this.filteredCompanies.forEach(company => {
            const card = this.createCompanyCard(company);
            container.appendChild(card);
        });
        
        this.updateResultsCount();
    }
    
    updateResultsCount() {
        const countElement = document.getElementById('resultsCount');
        countElement.textContent = this.filteredCompanies.length;
    }
    
    // UI State Management
    showLoadingSection() {
        this.hideAllSections();
        document.getElementById('loadingSection').style.display = 'block';
    }
    
    showResultsSection() {
        this.hideAllSections();
        document.getElementById('resultsSection').style.display = 'block';
    }
    
    showNoResults() {
        this.hideAllSections();
        document.getElementById('noResults').style.display = 'block';
    }
    
    showError(message) {
        this.hideAllSections();
        document.getElementById('errorSection').style.display = 'block';
        
        // Check if it's a CORS-related error
        if (message.includes('Failed to fetch') || message.includes('CORS')) {
            const errorMessage = document.getElementById('errorMessage');
            errorMessage.innerHTML = `
                <p><strong>CORS Error Detected</strong></p>
                <p>The Hong Kong Companies Registry APIs don't allow direct access from web browsers due to CORS restrictions.</p>
                <p><strong>Solution:</strong> Visit <a href="https://cors-anywhere.herokuapp.com/corsdemo" target="_blank" style="color: #667eea;">this link</a> and click "Request temporary access" to enable the proxy service, then try searching again.</p>
                <p><em>Note: This is a temporary solution. For production use, consider deploying to a server that can handle CORS or use a backend proxy.</em></p>
            `;
        } else {
            document.getElementById('errorMessage').textContent = message;
        }
    }
    
    showWelcomeSection() {
        this.hideAllSections();
        document.getElementById('welcomeSection').style.display = 'block';
    }
    
    hideAllSections() {
        const sections = [
            'loadingSection',
            'resultsSection',
            'noResults',
            'errorSection',
            'welcomeSection'
        ];
        
        sections.forEach(sectionId => {
            document.getElementById(sectionId).style.display = 'none';
        });
    }
    
    // Modal Management
    openModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Utility functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HKCompanyFinder();
});
