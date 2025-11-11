
import { PROXY_CONFIG } from '../background/proxy-config.js';

// API Configuration
//const API_BASE_URL = `http://localhost:8081/api`;
const API_BASE_URL = `http://140.235.130.166:8081/api`;

console.log('[Popup] API URL:', API_BASE_URL);

// DOM Elements
const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const loading = document.getElementById('loading');

// Tab switching
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Forms
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const verifyForm = document.getElementById('verifyForm');
const backToRegisterBtn = document.getElementById('back-to-register');

// Dashboard elements
const toggleProxyBtn = document.getElementById('toggle-proxy');
const proxyStatusEl = document.getElementById('proxy-status');
const proxyServerEl = document.getElementById('proxy-server');
const logoutBtn = document.getElementById('logout-btn');

// Proxy mode elements
const modeAll = document.getElementById('mode-all');
const modeWhitelist = document.getElementById('mode-whitelist');
const whitelistSection = document.getElementById('url-whitelist-section');
const addUrlBtn = document.getElementById('add-url-btn');
const addUrlForm = document.getElementById('add-url-form');
const urlInput = document.getElementById('url-input');
const saveUrlBtn = document.getElementById('save-url-btn');
const cancelUrlBtn = document.getElementById('cancel-url-btn');
const urlList = document.getElementById('url-list');

// Error messages
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const verifyError = document.getElementById('verify-error');

// Subscription elements
const subscriptionSection = document.getElementById('subscription-section');
const subscriptionActive = document.getElementById('subscription-active');
const subscriptionInactive = document.getElementById('subscription-inactive');
const subscriptionEndDate = document.getElementById('subscription-end-date');
const subscriptionDaysLeft = document.getElementById('subscription-days-left');
const buySubscriptionBtn = document.getElementById('buy-subscription-btn');
const extendSubscriptionBtn = document.getElementById('extend-subscription-btn');
const planOptions = document.querySelectorAll('.plan-option');

// Store email for verification
let pendingVerificationEmail = null;
let selectedPeriod = 3; // Default: 3 months

const AUTH_STATE_KEY = 'auth_flow_state';
const TTL_MS = 5 * 60 * 1000;

async function loadAuthState() {
    const res = await chrome.storage.session.get(AUTH_STATE_KEY);
    const state = res[AUTH_STATE_KEY];
    if (!state) return null;
    if (state.expiresAt && Date.now() > state.expiresAt) {
        await chrome.storage.session.remove(AUTH_STATE_KEY);
        return null;
    }
    return state;
}

async function saveAuthState(partial) {
    const res = await chrome.storage.session.get(AUTH_STATE_KEY);
    const prev = res[AUTH_STATE_KEY] || {};
    const state = { ...prev, ...partial, expiresAt: Date.now() + TTL_MS };
    await chrome.storage.session.set({ [AUTH_STATE_KEY]: state });
    try { await chrome.runtime.sendMessage({ action: 'authState:scheduleExpire', when: state.expiresAt }); } catch (e) {}
}

async function clearAuthState() {
    await chrome.storage.session.remove(AUTH_STATE_KEY);
    try { await chrome.runtime.sendMessage({ action: 'authState:clear' }); } catch (e) {}
}

async function tryRestoreAuthState() {
    const token = await getToken();
    if (token) return;
    const state = await loadAuthState();
    if (state && state.step === 'verify' && state.email) {
        pendingVerificationEmail = state.email;
        document.getElementById('verify-email-display').textContent = state.email;
        switchTab('verify');
    }
}

/**
 * Initialize popup
 */
async function init() {
    console.log('[Popup] Initializing...');
    
    // Check if user is authenticated
    const token = await getToken();
    
    if (token) {
        // Verify token
        const isValid = await verifyToken(token);
        if (isValid) {
            await showDashboard();
        } else {
            // Token invalid, clear and show auth
            await clearToken();
            showAuth();
        }
    } else {
        showAuth();
    }
    
    await tryRestoreAuthState();
    
    // Setup event listeners
    setupEventListeners();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Register form
    registerForm.addEventListener('submit', handleRegister);
    
    // Verify form
    verifyForm.addEventListener('submit', handleVerifyEmail);
    backToRegisterBtn.addEventListener('click', async () => { await clearAuthState(); switchTab('register'); });
    
    // Toggle proxy
    toggleProxyBtn.addEventListener('click', handleToggleProxy);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Proxy mode selection
    modeAll.addEventListener('change', handleModeChange);
    modeWhitelist.addEventListener('change', handleModeChange);
    
    // URL whitelist management
    addUrlBtn.addEventListener('click', showAddUrlForm);
    saveUrlBtn.addEventListener('click', handleAddUrl);
    cancelUrlBtn.addEventListener('click', hideAddUrlForm);
    
    // Subscription management
    buySubscriptionBtn.addEventListener('click', handleBuySubscription);
    extendSubscriptionBtn.addEventListener('click', handleBuySubscription);
    
    // Plan selection
    planOptions.forEach(option => {
        option.addEventListener('click', () => {
            selectedPeriod = parseInt(option.dataset.period);
            applySelectedPeriodVisual();
        });
    });
    applySelectedPeriodVisual();
}

function applySelectedPeriodVisual() {
    planOptions.forEach(opt => {
        const period = parseInt(opt.dataset.period);
        opt.classList.toggle('selected', period === selectedPeriod);
    });
}

/**
 * Switch tabs
 */
function switchTab(tabName) {
    tabBtns.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    if (tabName === 'verify') {
        // Show verify form without tab button
        document.getElementById('verify-form').classList.add('active');
    } else {
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-form`).classList.add('active');
    }
    
    // Clear errors
    hideError(loginError);
    hideError(registerError);
    hideError(verifyError);
}

/**
 * Handle login
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    hideError(loginError);
    showLoading();
    
    try {
        console.log('[Popup] Вход:', email);
        console.log('[Popup] API URL:', `${API_BASE_URL}/auth/login`);
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        console.log('[Popup] Response status:', response.status);
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('[Popup] Не JSON ответ:', text);
            throw new Error(`Сервер вернул ${response.status}: ${text.substring(0, 100)}`);
        }
        
        const data = await response.json();
        console.log('[Popup] Response data:', data);
        
        if (response.ok) {
            // Save token
            await saveToken(data.token);
            await saveUser(data.user);
            
            // Show dashboard
            await showDashboard();
            
            // Reset form
            loginForm.reset();
        } else {
            showError(loginError, data.error || 'Ошибка входа');
        }
    } catch (error) {
        console.error('[Popup] Login error:', error);
        showError(loginError, 'Не удалось подключиться к серверу');
    } finally {
        hideLoading();
    }
}

/**
 * Handle register
 */
async function handleRegister(e) {
    e.preventDefault();
    
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;
    
    hideError(registerError);
    
    // Validate passwords match
    if (password !== passwordConfirm) {
        showError(registerError, 'Пароли не совпадают');
        return;
    }
    
    // Validate password length
    if (password.length < 8) {
        showError(registerError, 'Пароль должен содержать минимум 8 символов');
        return;
    }
    
    showLoading();
    
    try {
        console.log('[Popup] Регистрация:', email);
        console.log('[Popup] API URL:', `${API_BASE_URL}/auth/register`);
        
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        console.log('[Popup] Response status:', response.status);
        console.log('[Popup] Response headers:', [...response.headers.entries()]);
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('[Popup] Не JSON ответ:', text);
            throw new Error(`Сервер вернул ${response.status}: ${text.substring(0, 100)}`);
        }
        
        const data = await response.json();
        console.log('[Popup] Response data:', data);
        
        if (response.ok) {
            pendingVerificationEmail = email;
            document.getElementById('verify-email-display').textContent = email;
            await saveAuthState({ step: 'verify', email });
            registerForm.reset();
            switchTab('verify');
        } else {
            showError(registerError, data.error || 'Ошибка регистрации');
        }
    } catch (error) {
        console.error('[Popup] Register error:', error);
        showError(registerError, 'Не удалось подключиться к серверу');
    } finally {
        hideLoading();
    }
}

/**
 * Handle email verification
 */
async function handleVerifyEmail(e) {
    e.preventDefault();
    
    const code = document.getElementById('verify-code').value;
    
    if (!pendingVerificationEmail) {
        showError(verifyError, 'Email не найден. Пожалуйста, зарегистрируйтесь снова.');
        return;
    }
    
    hideError(verifyError);
    showLoading();
    
    try {
        console.log('[Popup] Верификация email:', pendingVerificationEmail);
        
        const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: pendingVerificationEmail, 
                code: code 
            })
        });
        
        const data = await response.json();
        console.log('[Popup] Verification response:', data);
        
        if (response.ok) {
            await saveToken(data.token);
            await saveUser(data.user);
            
            pendingVerificationEmail = null;
            await clearAuthState();
            
            await showDashboard();
            
            verifyForm.reset();
        } else {
            showError(verifyError, data.error || 'Неверный код. Проверьте код из письма.');
        }
    } catch (error) {
        console.error('[Popup] Verification error:', error);
        showError(verifyError, 'Не удалось подключиться к серверу');
    } finally {
        hideLoading();
    }
}

/**
 * Handle toggle proxy
 */
async function handleToggleProxy() {
    try {
        // Send message to background script
        const response = await chrome.runtime.sendMessage({ action: 'toggleProxy' });
        
        if (response.success) {
            updateProxyStatus(response.enabled);
        } else {
            alert('Ошибка подключения: ' + (response.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('[Popup] Toggle proxy error:', error);
        alert('Ошибка: ' + error.message);
    }
}

/**
 * Handle logout
 */
async function handleLogout() {
    await clearToken();
    await clearUser();
    showAuth();
}

/**
 * Verify token
 */
async function verifyToken(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        return response.ok;
    } catch (error) {
        console.error('[Popup] Token verification error:', error);
        return false;
    }
}

/**
 * Show/hide views
 */
function showAuth() {
    authView.classList.remove('hidden');
    dashboardView.classList.add('hidden');
}

async function showDashboard() {
    authView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    
    // Load proxy status
    const proxyEnabled = await getProxyStatus();
    updateProxyStatus(proxyEnabled);
    
    // Update proxy info
    proxyServerEl.textContent = PROXY_CONFIG.host;
    
    // Load proxy mode and whitelist
    await loadProxyMode();
    
    // Try to fetch server whitelist for this user and sync local state
    try {
        const serverUrls = await fetchServerWhitelist();
        if (serverUrls && Array.isArray(serverUrls)) {
            await chrome.storage.local.set({ urlWhitelist: serverUrls });
            await loadUrlWhitelist();
            try {
                await chrome.runtime.sendMessage({ action: 'updateWhitelist', urls: serverUrls });
            } catch (err) {
                console.error('[Popup] Error sending updateWhitelist after server sync:', err);
            }
        } else {
            await loadUrlWhitelist();
        }
    } catch (e) {
        console.warn('[Popup] Failed to sync whitelist from server, using local cache', e);
        await loadUrlWhitelist();
    }
    
    // Load subscription info
    await loadSubscription();
}

/**
 * Update proxy status UI
 */
function updateProxyStatus(enabled) {
    const statusIndicator = proxyStatusEl.querySelector('.status-indicator');
    const statusText = proxyStatusEl.querySelector('span:last-child');
    const toggleIcon = toggleProxyBtn.querySelector('svg path');
    const toggleText = toggleProxyBtn.querySelector('span');
    
    if (enabled) {
        statusIndicator.classList.remove('off');
        statusIndicator.classList.add('on');
        statusText.textContent = 'Включен';
        
        toggleProxyBtn.classList.add('active');
        toggleText.textContent = 'Отключиться';
        toggleIcon.setAttribute('d', 'M8 12h8');
    } else {
        statusIndicator.classList.remove('on');
        statusIndicator.classList.add('off');
        statusText.textContent = 'Выключен';
        
        toggleProxyBtn.classList.remove('active');
        toggleText.textContent = 'Подключиться';
        toggleIcon.setAttribute('d', 'M8 12h8');
    }
}

/**
 * Error handling
 */
function showError(element, message) {
    element.textContent = message;
    element.classList.add('show');
}

function hideError(element) {
    element.classList.remove('show');
    element.textContent = '';
}

/**
 * Loading state
 */
function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

/**
 * Storage helpers
 */
async function saveToken(token) {
    return chrome.storage.local.set({ jwtToken: token });
}

async function getToken() {
    const result = await chrome.storage.local.get('jwtToken');
    return result.jwtToken;
}

async function clearToken() {
    return chrome.storage.local.remove('jwtToken');
}

async function saveUser(user) {
    return chrome.storage.local.set({ user: user });
}

async function getUser() {
    const result = await chrome.storage.local.get('user');
    return result.user;
}

async function clearUser() {
    return chrome.storage.local.remove('user');
}

async function getProxyStatus() {
    const result = await chrome.storage.local.get('proxyEnabled');
    return result.proxyEnabled || false;
}

/**
 * Proxy Mode & Whitelist Management
 */

// Get proxy mode
async function getProxyMode() {
    const result = await chrome.storage.local.get('proxyMode');
    return result.proxyMode || 'all';
}

// Save proxy mode
async function saveProxyMode(mode) {
    await chrome.storage.local.set({ proxyMode: mode });
    // Notify background script to update proxy config
    try {
        await chrome.runtime.sendMessage({ action: 'updateProxyMode', mode });
    } catch (error) {
        console.error('[Popup] Error sending updateProxyMode message:', error);
    }
}

// Get URL whitelist
async function getUrlWhitelist() {
    const result = await chrome.storage.local.get('urlWhitelist');
    return result.urlWhitelist || [];
}

// Save URL whitelist
async function saveUrlWhitelist(urls) {
    await chrome.storage.local.set({ urlWhitelist: urls });
    // Push changes to backend
    await pushServerWhitelist(urls);
}

// Fetch user's whitelist from backend
async function fetchServerWhitelist() {
    try {
        const token = await getToken();
        if (!token) return null;
        const response = await fetch(`${API_BASE_URL}/whitelist`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            console.warn('[Popup] Failed to fetch server whitelist:', response.status);
            return null;
        }
        const data = await response.json();
        if (data && Array.isArray(data.urls)) {
            return data.urls;
        }
        return [];
    } catch (e) {
        console.error('[Popup] fetchServerWhitelist error:', e);
        return null;
    }
}

// Push user's whitelist to backend
async function pushServerWhitelist(urls) {
    try {
        const token = await getToken();
        if (!token) return false;
        const response = await fetch(`${API_BASE_URL}/whitelist`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ urls })
        });
        if (!response.ok) {
            const text = await response.text();
            console.warn('[Popup] Failed to push server whitelist:', response.status, text);
            return false;
        }
        return true;
    } catch (e) {
        console.error('[Popup] pushServerWhitelist error:', e);
        return false;
    }
}

// Handle mode change
async function handleModeChange(e) {
    const mode = e.target.value;
    await saveProxyMode(mode);
    
    // Show/hide whitelist section
    if (mode === 'whitelist') {
        whitelistSection.classList.remove('hidden');
        await loadUrlWhitelist();
    } else {
        whitelistSection.classList.add('hidden');
    }
}

// Load proxy mode
async function loadProxyMode() {
    const mode = await getProxyMode();
    
    if (mode === 'all') {
        modeAll.checked = true;
        whitelistSection.classList.add('hidden');
    } else {
        modeWhitelist.checked = true;
        whitelistSection.classList.remove('hidden');
        // Try to fetch server whitelist for this user and sync local state
        try {
            const serverUrls = await fetchServerWhitelist();
            if (serverUrls && Array.isArray(serverUrls)) {
                await chrome.storage.local.set({ urlWhitelist: serverUrls });
                await loadUrlWhitelist();
                try {
                    await chrome.runtime.sendMessage({ action: 'updateWhitelist', urls: serverUrls });
                } catch (err) {
                    console.error('[Popup] Error sending updateWhitelist after server sync:', err);
                }
            } else {
                await loadUrlWhitelist();
            }
        } catch (e) {
            console.warn('[Popup] Failed to sync whitelist from server, using local cache', e);
            await loadUrlWhitelist();
        }
    }
}

// Show add URL form
function showAddUrlForm() {
    addUrlForm.classList.remove('hidden');
    urlInput.focus();
}

// Hide add URL form
function hideAddUrlForm() {
    addUrlForm.classList.add('hidden');
    urlInput.value = '';
}

// Normalize URL - extract domain from full URL
function normalizeUrl(url) {
    url = url.trim();
    
    // If it's a wildcard pattern, return as is
    if (url.startsWith('*.')) {
        return url.toLowerCase();
    }
    
    // If it's a full URL with protocol, extract domain
    if (url.startsWith('http://') || url.startsWith('https://')) {
        try {
            const urlObj = new URL(url);
            let hostname = urlObj.hostname.toLowerCase();
            return hostname;
        } catch (e) {
            // If URL parsing fails, try to extract manually
            const match = url.match(/https?:\/\/([^\/]+)/);
            if (match) {
                let hostname = match[1].toLowerCase();
                return hostname;
            }
        }
    }
    
    // Remove trailing slash and path
    url = url.replace(/\/.*$/, '').toLowerCase();
    
    return url;
}

// Handle add URL
async function handleAddUrl() {
    const url = urlInput.value.trim();
    
    if (!url) {
        alert('Введите URL');
        return;
    }
    
    // Validate URL format
    if (!isValidUrlPattern(url)) {
        alert('Неверный формат URL. Примеры:\n- example.com\n- *.example.com\n- https://example.com/*');
        return;
    }
    
    // Normalize URL - extract domain
    const normalizedUrl = normalizeUrl(url);
    
    if (!normalizedUrl) {
        alert('Не удалось извлечь домен из URL');
        return;
    }
    
    // Get current whitelist
    const whitelist = await getUrlWhitelist();
    
    // Check if already exists (normalized)
    if (whitelist.some(w => normalizeUrl(w) === normalizedUrl)) {
        alert('Этот домен уже добавлен');
        return;
    }
    
    // Get related domains for popular sites
    const relatedDomains = getRelatedDomains(normalizedUrl);
    
    // Add normalized URL
    whitelist.push(normalizedUrl);
    
    // Add related domains if any
    if (relatedDomains.length > 0) {
        // Don't normalize when checking - wildcards should be preserved
        for (const domain of relatedDomains) {
            if (!whitelist.includes(domain)) {
                whitelist.push(domain);
            }
        }
        
        // Show info about added domains
        const addedDomains = [normalizedUrl, ...relatedDomains].join(', ');
        console.log('[Popup] Добавлены домены:', addedDomains);
    }
    
    await saveUrlWhitelist(whitelist);
    
    // Update UI
    hideAddUrlForm();
    await loadUrlWhitelist();
    
    // ALWAYS notify background to update whitelist, regardless of proxy state
    // This ensures PAC script is regenerated when whitelist changes
    try {
        await chrome.runtime.sendMessage({ action: 'updateWhitelist', urls: whitelist });
    } catch (error) {
        console.error('[Popup] Error sending updateWhitelist message:', error);
    }
}

// Get related domains for popular sites
function getRelatedDomains(domain) {
    const relatedDomainsMap = {
        'youtube.com': [
            '*.youtube.com',
            'googlevideo.com',
            '*.googlevideo.com',
            'ytimg.com',
            '*.ytimg.com',
            'googleapis.com',
            '*.googleapis.com'
        ],
        'google.com': [
            '*.google.com',
            'googleapis.com',
            '*.googleapis.com',
            'gstatic.com',
            '*.gstatic.com'
        ],
        'github.com': [
            '*.github.com',
            'githubusercontent.com',
            '*.githubusercontent.com'
        ]
    };
    
    // Strip www. prefix for lookup
    let lookupDomain = domain;
    if (domain.startsWith('www.')) {
        lookupDomain = domain.slice(4);
    }
    
    // Check exact match
    if (relatedDomainsMap[lookupDomain]) {
        return relatedDomainsMap[lookupDomain];
    }
    
    // Check if domain is a subdomain of known domains
    for (const [mainDomain, related] of Object.entries(relatedDomainsMap)) {
        if (lookupDomain.endsWith('.' + mainDomain) || lookupDomain === mainDomain) {
            return related;
        }
    }
    
    return [];
}

// Validate URL pattern
function isValidUrlPattern(url) {
    // Allow:
    // - example.com
    // - *.example.com
    // - https://example.com
    // - https://example.com/*
    const pattern = /^(\*\.)?([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$|^https?:\/\/(\*\.)?([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/;
    return pattern.test(url);
}

// Load and display URL whitelist
async function loadUrlWhitelist() {
    const whitelist = await getUrlWhitelist();
    
    if (whitelist.length === 0) {
        urlList.innerHTML = '<div class="empty-state">Нет добавленных сайтов</div>';
        return;
    }
    
    urlList.innerHTML = whitelist.map(url => `
        <div class="url-item">
            <span class="url-item-text">${url}</span>
            <button class="url-item-remove" data-url="${url}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
    `).join('');
    
    // Add click handlers for remove buttons
    const removeButtons = urlList.querySelectorAll('.url-item-remove');
    removeButtons.forEach(btn => {
        btn.addEventListener('click', () => handleRemoveUrl(btn.dataset.url));
    });
}

// Handle remove URL
async function handleRemoveUrl(url) {
    if (!confirm(`Удалить "${url}" из списка?`)) {
        return;
    }
    
    const whitelist = await getUrlWhitelist();
    const filtered = whitelist.filter(u => u !== url);
    await saveUrlWhitelist(filtered);
    await loadUrlWhitelist();
    
    // Notify background to update whitelist
    try {
        await chrome.runtime.sendMessage({ action: 'updateWhitelist', urls: filtered });
    } catch (error) {
        console.error('[Popup] Error sending updateWhitelist message:', error);
    }
}

/**
 * Load subscription information
 */
async function loadSubscription() {
    try {
        const token = await getToken();
        if (!token) return;
        
        const response = await fetch(`${API_BASE_URL}/billing/subscription`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            console.error('[Popup] Failed to load subscription:', response.status);
            showNoSubscription();
            return;
        }
        
        const data = await response.json();
        
        if (data.has_active && data.subscription) {
            showActiveSubscription(data.subscription, data.days_remaining);
        } else {
            showNoSubscription();
        }
        
        // Load pricing
        await loadPricing();
    } catch (error) {
        console.error('[Popup] Error loading subscription:', error);
        showNoSubscription();
    }
}

/**
 * Load pricing information
 */
async function loadPricing() {
    try {
        const response = await fetch(`${API_BASE_URL}/billing/pricing`);
        
        if (!response.ok) {
            console.error('[Popup] Failed to load pricing:', response.status);
            return;
        }
        
        const data = await response.json();
        
        // Update prices in UI
        if (data.plans) {
            data.plans.forEach(plan => {
                const priceEl = document.getElementById(`price-${plan.period}`);
                if (priceEl) {
                    priceEl.textContent = `${plan.price.toFixed(2)} ₽`;
                }
            });
        }
    } catch (error) {
        console.error('[Popup] Error loading pricing:', error);
    }
}

/**
 * Show active subscription
 */
function showActiveSubscription(subscription, daysRemaining) {
    subscriptionActive.classList.remove('hidden');
    subscriptionInactive.classList.add('hidden');
    
    // Format end date
    const endDate = new Date(subscription.end_date);
    const formattedDate = endDate.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    subscriptionEndDate.textContent = formattedDate;
    subscriptionDaysLeft.textContent = daysRemaining;
}

/**
 * Show no subscription state
 */
function showNoSubscription() {
    subscriptionActive.classList.add('hidden');
    subscriptionInactive.classList.remove('hidden');
    applySelectedPeriodVisual();
}

/**
 * Handle buy/extend subscription
 */
async function handleBuySubscription() {
    try {
        const token = await getToken();
        if (!token) {
            alert('Необходима авторизация');
            return;
        }
        
        showLoading();
        
        console.log('[Popup] Создание платежа...');
        console.log('[Popup] URL:', `${API_BASE_URL}/billing/payment`);
        console.log('[Popup] Token (first 20 chars):', token.substring(0, 20) + '...');
        console.log('[Popup] Period:', selectedPeriod);
        
        // Create payment
        const response = await fetch(`${API_BASE_URL}/billing/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                period: selectedPeriod
            })
        }).catch(err => {
            console.error('[Popup] Fetch error (network):', err);
            console.error('[Popup] Error name:', err.name);
            console.error('[Popup] Error message:', err.message);
            throw err;
        });
        
        hideLoading();
        
        console.log('[Popup] Response status:', response.status);
        console.log('[Popup] Response headers:', [...response.headers.entries()]);
        console.log('[Popup] Response type:', response.type);
        
        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            console.log('[Popup] Error response content-type:', contentType);
            
            let errorMessage = 'Unknown error';
            if (contentType && contentType.includes('application/json')) {
                try {
                    const error = await response.json();
                    errorMessage = error.error || 'Unknown error';
                } catch (e) {
                    console.error('[Popup] Failed to parse error JSON:', e);
                    const text = await response.text();
                    console.error('[Popup] Error response text:', text);
                    errorMessage = text.substring(0, 200);
                }
            } else {
                const text = await response.text();
                console.error('[Popup] Error response text:', text);
                errorMessage = text.substring(0, 200);
            }
            
            alert('Ошибка создания платежа: ' + errorMessage);
            return;
        }
        
        const payment = await response.json();
        
        console.log('[Popup] Payment created:', payment);
        
        // Open payment URL in new tab
        if (payment.confirmation_url) {
            chrome.tabs.create({ url: payment.confirmation_url });
            
            // Show success message
            alert(`Платеж создан!\nСумма: ${payment.amount} ₽\nПериод: ${payment.period} мес.\n\nСтраница оплаты откроется в новой вкладке.`);
        } else {
            alert('Ошибка: не получена ссылка на оплату');
        }
    } catch (error) {
        hideLoading();
        console.error('[Popup] Error creating payment:', error);
        alert('Ошибка при создании платежа: ' + error.message);
    }
}

// Initialize when popup opens
document.addEventListener('DOMContentLoaded', init);
