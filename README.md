# 🐾 Proxy Pet

Chrome extension for managing proxy connections with JWT authentication.

## ✨ Features

- 🔐 JWT Authentication
- 🚀 One-click proxy toggle
- 🎯 Selective proxying (all sites or whitelist only)
- 📋 Whitelist management with wildcard support
- 🔔 Visual status indicator

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/proxy-pet-extension.git
   ```

2. **Install in browser**
   - Open your browser and go to `chrome://extensions/` (Chrome) or `edge://extensions/` (Edge)
   - Enable **Developer mode** (toggle in top right corner)
   - Click **Load unpacked**
   - Select the `proxy-pet-extension` folder

3. **Configure proxy server**
   - Edit `background/proxy-config.js`
   - Update `host` and `port` to match your proxy server

## 🚀 Usage

1. Click the Proxy Pet icon in your browser toolbar
2. Register or login with your credentials
3. Click "Enable Proxy" to activate
4. Choose proxy mode:
   - **All Sites** - proxy all traffic
   - **Selected Sites Only** - proxy only whitelisted URLs
5. Add URLs to whitelist as needed (e.g., `youtube.com`, `*.google.com`)

## 🔧 Configuration

Edit `background/proxy-config.js`:

```javascript
export const PROXY_CONFIG = {
  host: "your-proxy-server.com",
  port: 8080,
  scheme: "http",
  authAPI: {
    baseURL: "http://your-auth-server.com:8081"
  }
};
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.
