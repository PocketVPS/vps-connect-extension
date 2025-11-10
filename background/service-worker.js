
import { proxyManager } from './proxy-manager.js';
import { PROXY_CONFIG } from './proxy-config.js';
import { getJWTToken, isAuthenticated } from './auth-api.js';

console.log('[Service Worker] VPS Connect запущен');

let jwtTokenCache = null;

(async () => {
  jwtTokenCache = await getJWTToken();
  console.log('[Service Worker] JWT токен загружен в кеш:', jwtTokenCache ? 'Да' : 'Нет');
})();

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.jwtToken) {
    jwtTokenCache = changes.jwtToken.newValue;
    console.log('[Service Worker] JWT токен обновлен в кеше');
  }
});

chrome.webRequest.onAuthRequired.addListener(
  function(details) {
    console.log('[Service Worker] 🔐 Запрос авторизации сервера (407)');
    console.log('[Service Worker] URL:', details.url);
    console.log('[Service Worker] isProxy:', details.isProxy);
    console.log('[Service Worker] Realm:', details.realm);
    console.log('[Service Worker] Scheme:', details.scheme);
    
    if (!details.isProxy) {
      console.log('[Service Worker] Не запрос к серверу, пропускаем');
      return {};
    }
    
    if (jwtTokenCache) {
      console.log('[Service Worker] ✅ Предоставляем JWT токен для авторизации');
      console.log('[Service Worker] Token (first 20 chars):', jwtTokenCache.substring(0, 20) + '...');
      return {
        authCredentials: {
          username: 'Bearer',
          password: jwtTokenCache
        }
      };
    } else {
      console.error('[Service Worker] ❌ JWT токен отсутствует, отменяем запрос');
      return { cancel: true };
    }
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    try {
      const url = new URL(details.url);
      const isAuthAPI = url.hostname === '140.235.130.166' && url.port === '8081';
      
      if (isAuthAPI) {
        console.log('[Service Worker] Пропускаю Auth API запрос:', details.url);
        return { requestHeaders: details.requestHeaders };
      }
    } catch (e) {
      console.log('[Service Worker] Не удалось распарсить URL (возможно CONNECT):', details.url);
    }
    
    const hasProxyAuth = details.requestHeaders.some(
      header => header.name.toLowerCase() === 'proxy-authorization'
    );
    
    if (hasProxyAuth) {
      console.log('[Service Worker] Proxy-Authorization уже есть, пропускаю');
      return { requestHeaders: details.requestHeaders };
    }
    
    if (jwtTokenCache) {
      console.log('[Service Worker] 📤 Добавляю JWT токен к запросу:', details.method, details.url);
      
      details.requestHeaders.push({
        name: 'Proxy-Authorization',
        value: `Bearer ${jwtTokenCache}`
      });
      
      console.log('[Service Worker] ✅ JWT токен добавлен');
    } else {
      console.warn('[Service Worker] ⚠️ JWT токен отсутствует для запроса:', details.url);
    }
    
    return { requestHeaders: details.requestHeaders };
  },
  { urls: ["<all_urls>"] },
  ["requestHeaders", "extraHeaders"]
);

chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Service Worker] Расширение установлено:', details.reason);
  
  if (details.reason === 'install') {
    console.log('[Service Worker] Первая установка расширения');
    
    
  } else if (details.reason === 'update') {
    console.log('[Service Worker] Расширение обновлено');
  }
});

chrome.runtime.onStartup.addListener(() => {
  console.log('[Service Worker] Браузер запущен');
});

chrome.action.onClicked.addListener(async () => {
  console.log('[Service Worker] Клик на иконку расширения');
  
  try {
    const newState = await proxyManager.toggleProxy();
    console.log('[Service Worker] Новое состояние прокси:', newState);
  } catch (error) {
    console.error('[Service Worker] Ошибка при toggle:', error);
  }
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Service Worker] Получено сообщение:', request);
  
  (async () => {
    try {
      switch (request.action) {
        case 'getStatus':
          const status = proxyManager.getStatus();
          sendResponse({ success: true, data: status });
          break;
          
        case 'toggleProxy':
          const isAuth = await isAuthenticated();
          
          if (!isAuth) {
            sendResponse({ success: false, error: 'Требуется авторизация' });
            break;
          }
          
          const newState = await proxyManager.toggleProxy();
          sendResponse({ success: true, enabled: newState });
          break;
          
        case 'toggle':
          const toggleState = await proxyManager.toggleProxy();
          sendResponse({ success: true, enabled: toggleState });
          break;
          
        case 'enable':
          const isAuthEnable = await isAuthenticated();
          
          if (!isAuthEnable) {
            sendResponse({ success: false, error: 'Требуется авторизация' });
            break;
          }
          
          await proxyManager.enableProxy();
          sendResponse({ success: true, enabled: true });
          break;
          
        case 'disable':
          await proxyManager.disableProxy();
          sendResponse({ success: true, enabled: false });
          break;
          
        case 'updateProxyMode':
          await proxyManager.updateProxyMode(request.mode);
          sendResponse({ success: true });
          break;
          
        case 'updateWhitelist':
          await proxyManager.updateWhitelist(request.urls);
          sendResponse({ success: true });
          break;
          
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('[Service Worker] Ошибка обработки сообщения:', error);
      sendResponse({ success: false, error: error.message });
    }
  })();
  
  return true;
});

chrome.proxy.onProxyError.addListener((details) => {
  console.error('[Service Worker] ❌ Ошибка прокси:', details);
  console.error('[Service Worker] Fatal:', details.fatal);
  console.error('[Service Worker] Error:', details.error);
  console.error('[Service Worker] Details:', details.details);
  
  // proxyManager.disableProxy();
});


setInterval(() => {
  chrome.proxy.settings.get({}, (config) => {
    const mode = config.value.mode;
    
    const actuallyEnabled = (mode === 'fixed_servers' || mode === 'pac_script');
    
    if (actuallyEnabled !== proxyManager.isEnabled) {
      console.warn('[Service Worker] Рассинхронизация состояния! Исправляю...');
      proxyManager.isEnabled = actuallyEnabled;
      proxyManager.updateBadge(actuallyEnabled);
    }
  });
}, 30000);

console.log('[Service Worker] Инициализация завершена');
