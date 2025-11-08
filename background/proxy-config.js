/**
 * Proxy Server Configuration
 * 
 * Configure your proxy server settings here.
 * For local development, use "127.0.0.1"
 * For production, use your VPS IP address
 */

export const PROXY_CONFIG = {
  // Proxy server address
  host: "140.235.130.166",
  
  // Proxy server port
  port: 8080,
  
  // Proxy scheme: "http", "https", "socks4", "socks5"
  scheme: "http",
  
  // JWT Authentication
  auth: {
    enabled: true,
    type: "jwt"
  },
  
  // Auth API server configuration
  authAPI: {
    host: "140.235.130.166",
    port: 8081,
    baseURL: "http://140.235.130.166:8081"
  },
  
  // Bypass list - addresses that will NOT be proxied
  // Chrome will connect to them directly
  bypassList: [
    "localhost",
    "127.0.0.1",
    "*.local",
    "192.168.*",
    "10.*",
    "172.16.*",
    "<local>",  // Chrome special notation for local addresses
    "140.235.130.166:8081"  // Auth API - do not proxy!
  ],
  
  // Auto-enable proxy on browser startup
  // IMPORTANT: Should be false to prevent proxy from enabling without authentication
  autoEnable: false,
  
  // Show badge with status
  showBadge: true
};
