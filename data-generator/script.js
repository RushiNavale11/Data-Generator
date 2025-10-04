// DOM Elements
const dataTypeSelect = document.getElementById('data-type');
const recordsCountInput = document.getElementById('records-count');
const formatSelect = document.getElementById('format');
const generateBtn = document.getElementById('generate-btn');
const generateCustomBtn = document.getElementById('generate-custom-btn');
const previewArea = document.getElementById('preview');
const copyBtn = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');
const recordCountDisplay = document.getElementById('record-count');
const dataSizeDisplay = document.getElementById('data-size');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');
const customSchemaTextarea = document.getElementById('custom-schema');
const localeSelect = document.getElementById('locale');
const seedInput = document.getElementById('seed');
const toast = document.getElementById('toast');

// Data generators
const dataGenerators = {
    personal: (count) => generatePersonalData(count),
    financial: (count) => generateFinancialData(count),
    business: (count) => generateBusinessData(count),
    geographic: (count) => generateGeographicData(count),
    internet: (count) => generateInternetData(count)
};

// Sample data pools
const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const companies = ['TechCorp', 'Global Solutions', 'Innovate Inc', 'Data Systems', 'Future Enterprises'];
const domains = ['example.com', 'test.org', 'demo.net', 'sample.io', 'mockup.co'];
const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas'];
const countries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Japan'];

// Initialize app
function initApp() {
    // Load history from localStorage
    loadHistory();
    
    // Set up event listeners
    generateBtn.addEventListener('click', generateData);
    generateCustomBtn.addEventListener('click', generateCustomData);
    copyBtn.addEventListener('click', copyToClipboard);
    downloadBtn.addEventListener('click', downloadData);
    clearHistoryBtn.addEventListener('click', clearHistory);
    
    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Generate initial sample data
    generateData();
}

// Switch between tabs
function switchTab(tabId) {
    tabs.forEach(tab => {
        if (tab.getAttribute('data-tab') === tabId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    tabContents.forEach(content => {
        if (content.id === `${tabId}-tab`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// Generate data based on selected options
function generateData() {
    const dataType = dataTypeSelect.value;
    const count = parseInt(recordsCountInput.value);
    const format = formatSelect.value;
    
    if (isNaN(count) || count < 1) {
        showToast('Please enter a valid number of records', 'error');
        return;
    }
    
    const data = dataGenerators[dataType](count);
    displayData(data, format);
    addToHistory(dataType, count, format);
}

// Generate custom data based on schema
function generateCustomData() {
    const count = parseInt(recordsCountInput.value);
    const format = formatSelect.value;
    const schemaText = customSchemaTextarea.value;
    
    if (isNaN(count) || count < 1) {
        showToast('Please enter a valid number of records', 'error');
        return;
    }
    
    let schema;
    try {
        schema = JSON.parse(schemaText);
    } catch (e) {
        showToast('Invalid JSON schema', 'error');
        return;
    }
    
    const data = generateFromSchema(schema, count);
    displayData(data, format);
    addToHistory('custom', count, format);
}

// Display data in the preview area
function displayData(data, format) {
    let output;
    
    switch (format) {
        case 'json':
            output = JSON.stringify(data, null, 2);
            break;
        case 'csv':
            output = convertToCSV(data);
            break;
        case 'xml':
            output = convertToXML(data);
            break;
        case 'sql':
            output = convertToSQL(data);
            break;
        default:
            output = JSON.stringify(data, null, 2);
    }
    
    previewArea.textContent = output;
    updateStats(data, output);
}

// Update statistics
function updateStats(data, output) {
    const recordCount = Array.isArray(data) ? data.length : 1;
    const dataSize = (new Blob([output]).size / 1024).toFixed(2);
    
    recordCountDisplay.textContent = `${recordCount} record${recordCount !== 1 ? 's' : ''}`;
    dataSizeDisplay.textContent = `${dataSize} KB`;
}

// Copy data to clipboard
function copyToClipboard() {
    const text = previewArea.textContent;
    navigator.clipboard.writeText(text).then(() => {
        showToast('Data copied to clipboard!');
    }).catch(err => {
        showToast('Failed to copy data', 'error');
        console.error('Copy failed:', err);
    });
}

// Download data as file
function downloadData() {
    const text = previewArea.textContent;
    const format = formatSelect.value;
    const dataType = dataTypeSelect.value;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `${dataType}_data.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Data downloaded!');
}

// Show toast notification
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = 'toast';
    
    if (type === 'error') {
        toast.style.backgroundColor = '#e63946';
    } else if (type === 'success') {
        toast.style.backgroundColor = '#4cc9f0';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Add generation to history
function addToHistory(dataType, count, format) {
    const history = getHistory();
    const timestamp = new Date().toLocaleString();
    
    history.unshift({
        dataType,
        count,
        format,
        timestamp
    });
    
    // Keep only last 10 items
    if (history.length > 10) {
        history.pop();
    }
    
    localStorage.setItem('dataGeneratorHistory', JSON.stringify(history));
    renderHistory();
}

// Get history from localStorage
function getHistory() {
    const historyJson = localStorage.getItem('dataGeneratorHistory');
    return historyJson ? JSON.parse(historyJson) : [];
}

// Load and render history
function loadHistory() {
    renderHistory();
}

// Render history list
function renderHistory() {
    const history = getHistory();
    historyList.innerHTML = '';
    
    if (history.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--gray);">No history yet</p>';
        return;
    }
    
    history.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div><strong>${item.dataType}</strong> - ${item.count} records</div>
            <div style="font-size: 0.8rem; color: var(--gray);">${item.timestamp}</div>
        `;
        
        historyItem.addEventListener('click', () => {
            // For simplicity, just switch to basic tab and set values
            switchTab('basic');
            dataTypeSelect.value = item.dataType;
            recordsCountInput.value = item.count;
            formatSelect.value = item.format;
            generateData();
        });
        
        historyList.appendChild(historyItem);
    });
}

// Clear history
function clearHistory() {
    localStorage.removeItem('dataGeneratorHistory');
    renderHistory();
    showToast('History cleared');
}

// Data generation functions
function generatePersonalData(count) {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push({
            id: i + 1,
            firstName: getRandomElement(firstNames),
            lastName: getRandomElement(lastNames),
            email: generateEmail(),
            phone: generatePhoneNumber(),
            age: getRandomInt(18, 80),
            address: generateAddress()
        });
    }
    return data;
}

function generateFinancialData(count) {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push({
            id: i + 1,
            accountNumber: generateAccountNumber(),
            balance: getRandomInt(100, 100000),
            currency: 'USD',
            transactionDate: generateDate(),
            transactionAmount: getRandomInt(-5000, 5000),
            category: getRandomElement(['Food', 'Transport', 'Entertainment', 'Utilities', 'Shopping'])
        });
    }
    return data;
}

function generateBusinessData(count) {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push({
            id: i + 1,
            company: getRandomElement(companies),
            employeeCount: getRandomInt(10, 10000),
            revenue: getRandomInt(100000, 10000000),
            industry: getRandomElement(['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing']),
            founded: getRandomInt(1980, 2020)
        });
    }
    return data;
}

function generateGeographicData(count) {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push({
            id: i + 1,
            city: getRandomElement(cities),
            country: getRandomElement(countries),
            latitude: (Math.random() * 180 - 90).toFixed(6),
            longitude: (Math.random() * 360 - 180).toFixed(6),
            population: getRandomInt(10000, 10000000)
        });
    }
    return data;
}

function generateInternetData(count) {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push({
            id: i + 1,
            ip: generateIP(),
            userAgent: generateUserAgent(),
            browser: getRandomElement(['Chrome', 'Firefox', 'Safari', 'Edge']),
            os: getRandomElement(['Windows', 'macOS', 'Linux', 'iOS', 'Android']),
            visitDate: generateDate()
        });
    }
    return data;
}

function generateFromSchema(schema, count) {
    const data = [];
    for (let i = 0; i < count; i++) {
        const item = {};
        for (const [key, value] of Object.entries(schema)) {
            item[key] = generateField(value);
        }
        data.push(item);
    }
    return data;
}

// Helper functions
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateEmail() {
    const name = getRandomElement(firstNames).toLowerCase();
    const domain = getRandomElement(domains);
    return `${name}${getRandomInt(1, 999)}@${domain}`;
}

function generatePhoneNumber() {
    return `(${getRandomInt(200, 999)}) ${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`;
}

function generateAddress() {
    return `${getRandomInt(1, 9999)} ${getRandomElement(['Main', 'Oak', 'Maple', 'Cedar', 'Pine'])} St`;
}

function generateAccountNumber() {
    return 'XXXX' + getRandomInt(1000, 9999) + getRandomInt(1000, 9999);
}

function generateDate() {
    const start = new Date(2020, 0, 1);
    const end = new Date();
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
}

function generateIP() {
    return `${getRandomInt(1, 255)}.${getRandomInt(0, 255)}.${getRandomInt(0, 255)}.${getRandomInt(1, 255)}`;
}

function generateUserAgent() {
    const browsers = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
    ];
    return getRandomElement(browsers);
}

function generateField(fieldSpec) {
    if (fieldSpec.includes('|')) {
        const [type, params] = fieldSpec.split('|');
        switch (type) {
            case 'number':
                const [min, max] = params.split(',').map(Number);
                return getRandomInt(min, max);
            case 'string':
                return params;
            default:
                return 'Unknown';
        }
    }
    
    switch (fieldSpec) {
        case 'firstName':
            return getRandomElement(firstNames);
        case 'lastName':
            return getRandomElement(lastNames);
        case 'email':
            return generateEmail();
        case 'phone':
            return generatePhoneNumber();
        case 'date':
            return generateDate();
        default:
            return 'Unknown';
    }
}

// Format conversion functions
function convertToCSV(data) {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        });
        csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
}

function convertToXML(data) {
    if (!data.length) return '<?xml version="1.0" encoding="UTF-8"?>\n<data></data>';
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<data>\n';
    
    for (const item of data) {
        xml += '  <record>\n';
        for (const [key, value] of Object.entries(item)) {
            xml += `    <${key}>${value}</${key}>\n`;
        }
        xml += '  </record>\n';
    }
    
    xml += '</data>';
    return xml;
}

function convertToSQL(data) {
    if (!data.length) return '';
    
    const tableName = 'generated_data';
    const columns = Object.keys(data[0]);
    let sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES\n`;
    
    const values = data.map(item => {
        const valueList = columns.map(col => {
            const value = item[col];
            return typeof value === 'string' ? `'${value}'` : value;
        });
        return `  (${valueList.join(', ')})`;
    });
    
    sql += values.join(',\n') + ';';
    return sql;
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', initApp);