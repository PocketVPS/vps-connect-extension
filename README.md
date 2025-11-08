# 🐾 Proxy Pet - Chrome Extension

A secure and user-friendly Chrome extension for managing proxy connections with JWT authentication.

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=google-chrome&logoColor=white)](https://github.com/yourusername/proxy-pet-extension)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/proxy-pet-extension/releases)

## ✨ Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 🚀 **One-Click Toggle** - Enable/disable proxy with a single click
- 🎯 **Selective Proxying** - Choose between "All sites" or "Selected sites only" modes
- 📋 **Whitelist Management** - Easy-to-use interface for managing proxied URLs
- 🔔 **Status Badge** - Visual indicator showing proxy status (ON/OFF)
- 🌐 **Wildcard Support** - Support for domain wildcards (*.example.com)
- 🔒 **Secure Storage** - Credentials stored securely in Chrome's encrypted storage
- 🎨 **Modern UI** - Clean and intuitive user interface

## 📸 Screenshots

### Login Screen
![Login Screen](screenshots/login.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Whitelist Management
![Whitelist](screenshots/whitelist.png)

## 🚀 Quick Start

### Installation

1. **Download the extension**
   ```bash
   git clone https://github.com/yourusername/proxy-pet-extension.git
   cd proxy-pet-extension
   ```

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `proxy-pet-extension` folder

3. **Configure your proxy server**
   - Edit `background/proxy-config.js`
   - Update the `host` and `port` to match your proxy server
   ```javascript
   export const PROXY_CONFIG = {
     host: "your-proxy-server.com",
     port: 8080,
     // ... other settings
   };
   ```

### Usage

1. **Register/Login**
   - Click the Proxy Pet icon in your Chrome toolbar
   - Register a new account or login with existing credentials

2. **Enable Proxy**
   - Click the "Enable Proxy" button in the dashboard
   - The badge will turn green showing "ON"

3. **Choose Proxy Mode**
   - **All Sites**: Proxy all traffic (except bypass list)
   - **Selected Sites Only**: Only proxy whitelisted URLs

4. **Manage Whitelist** (for Selected Sites mode)
   - Click "Add URL" button
   - Enter domain (e.g., `youtube.com`, `*.google.com`)
   - Click "Save"

## 🔧 Configuration

### Proxy Server Settings

Edit `background/proxy-config.js`:

```javascript
export const PROXY_CONFIG = {
  // Your proxy server address
  host: "your-proxy-server.com",
  
  // Proxy server port
  port: 8080,
  
  // Proxy scheme: "http", "https", "socks4", "socks5"
  scheme: "http",
  
  // Auth API server (for JWT authentication)
  authAPI: {
    host: "your-auth-server.com",
    port: 8081,
    baseURL: "http://your-auth-server.com:8081"
  },
  
  // Addresses that bypass the proxy
  bypassList: [
    "localhost",
    "127.0.0.1",
    "*.local",
    "192.168.*",
    "10.*",
    "172.16.*"
  ]
};
```

### Whitelist Patterns

The extension supports various URL patterns:

- **Exact domain**: `example.com` (matches example.com and all subdomains)
- **Subdomain wildcard**: `*.example.com` (matches all subdomains)
- **Specific subdomain**: `www.example.com` (matches only www.example.com)

## 🏗️ Architecture

```
proxy-pet-extension/
├── background/
│   ├── auth-api.js         # JWT authentication API client
│   ├── proxy-config.js     # Proxy server configuration
│   ├── proxy-manager.js    # Proxy management logic
│   └── service-worker.js   # Background service worker
├── popup/
│   ├── popup.html          # Extension popup UI
│   ├── popup.css           # Popup styles
│   └── popup.js            # Popup logic
├── icons/                  # Extension icons
├── manifest.json           # Extension manifest
└── README.md              # This file
```

## 🔐 Security

- **JWT Tokens**: All proxy requests require valid JWT authentication
- **Secure Storage**: Credentials stored in Chrome's encrypted storage
- **HTTPS Support**: Full support for HTTPS connections via CONNECT method
- **Token Verification**: Automatic token validation on startup

## 🛠️ Development

### Prerequisites

- Chrome/Chromium browser (latest version)
- A proxy server with JWT authentication support
- Basic knowledge of JavaScript and Chrome Extensions

### Building from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/proxy-pet-extension.git
cd proxy-pet-extension

# No build step required - pure JavaScript
# Just load the extension in Chrome as described above
```

### Testing

1. Load the extension in Chrome (Developer mode)
2. Open Chrome DevTools (F12)
3. Check the Console for logs
4. Test proxy functionality with different websites

## 📋 Requirements

- **Chrome**: Version 88 or higher (Manifest V3 support)
- **Proxy Server**: HTTP/HTTPS/SOCKS proxy with JWT authentication
- **Auth API**: Backend API for user registration and authentication

## 🐛 Troubleshooting

### Proxy not working

1. Check proxy server configuration in `proxy-config.js`
2. Verify proxy server is running and accessible
3. Check Chrome DevTools console for errors
4. Ensure you're logged in with valid credentials

### Authentication errors

1. Verify Auth API URL in `proxy-config.js`
2. Check that Auth API server is running
3. Try logging out and logging in again
4. Check network connectivity

### Extension not loading

1. Ensure you're using Chrome 88 or higher
2. Check that all files are present
3. Look for errors in `chrome://extensions/`
4. Try reloading the extension

## 📄 Permissions

This extension requires the following permissions:

- **proxy**: To configure Chrome's proxy settings
- **storage**: To save user preferences and authentication tokens
- **webRequest**: To add JWT tokens to proxy requests
- **webRequestAuthProvider**: To handle proxy authentication
- **host_permissions** (`<all_urls>`): To intercept and modify requests

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chrome Extensions team for the powerful API
- All contributors and users of this project

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/proxy-pet-extension/issues)
- **Email**: support@proxy-pet.example.com
- **Documentation**: [Wiki](https://github.com/yourusername/proxy-pet-extension/wiki)

## 🗺️ Roadmap

- [ ] Firefox extension support
- [ ] Advanced proxy rules
- [ ] Traffic statistics
- [ ] Multiple proxy profiles
- [ ] Import/export settings
- [ ] Dark mode

---

Made with ❤️ and JavaScript
