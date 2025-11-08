# Installation Guide

## Prerequisites

Before installing Proxy Pet extension, ensure you have:

1. **Google Chrome** (version 88 or higher)
2. **A proxy server** with JWT authentication support
3. **Auth API server** for user registration and login

## Step-by-Step Installation

### 1. Download the Extension

#### Option A: Clone from GitHub
```bash
git clone https://github.com/yourusername/proxy-pet-extension.git
cd proxy-pet-extension
```

#### Option B: Download ZIP
1. Go to the [Releases page](https://github.com/yourusername/proxy-pet-extension/releases)
2. Download the latest release ZIP file
3. Extract the ZIP file to a folder

### 2. Configure Proxy Server

Edit the `background/proxy-config.js` file with your proxy server details:

```javascript
export const PROXY_CONFIG = {
  // Replace with your proxy server address
  host: "your-proxy-server.com",
  
  // Replace with your proxy server port
  port: 8080,
  
  // Proxy scheme (usually "http")
  scheme: "http",
  
  // Auth API configuration
  authAPI: {
    host: "your-auth-server.com",
    port: 8081,
    baseURL: "http://your-auth-server.com:8081"
  },
  
  // Add any local addresses you want to bypass
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

### 3. Load Extension in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle switch in the top right corner)
4. Click **Load unpacked** button
5. Select the `proxy-pet-extension` folder
6. The extension should now appear in your extensions list

### 4. Pin the Extension (Optional)

1. Click the **Extensions** icon (puzzle piece) in Chrome toolbar
2. Find **Proxy Pet** in the list
3. Click the **pin** icon to keep it visible in the toolbar

## First Time Setup

### 1. Register an Account

1. Click the Proxy Pet icon in your Chrome toolbar
2. Click the **Register** tab
3. Enter your email and password
4. Click **Register**
5. You'll be automatically logged in

### 2. Enable Proxy

1. In the dashboard, click **Enable Proxy**
2. The badge will turn green showing "ON"
3. Your traffic is now routed through the proxy

### 3. Choose Proxy Mode

#### All Sites Mode (Default)
- All websites will be proxied (except those in bypass list)
- Best for general browsing

#### Selected Sites Only Mode
- Only whitelisted websites will be proxied
- Best for specific use cases (e.g., only YouTube)

To switch modes:
1. Select your preferred mode in the dashboard
2. If using "Selected Sites Only", add URLs to the whitelist

### 4. Add URLs to Whitelist (Optional)

If using "Selected Sites Only" mode:

1. Click **Add URL** button
2. Enter a domain:
   - `youtube.com` - Matches youtube.com and all subdomains
   - `*.google.com` - Matches all Google subdomains
   - `www.example.com` - Matches only www.example.com
3. Click **Save**
4. The URL will appear in your whitelist

## Verification

To verify the extension is working:

1. **Check Badge**: Should show "ON" in green
2. **Visit a website**: Try opening any website
3. **Check DevTools**: 
   - Press F12 to open DevTools
   - Go to Console tab
   - Look for Proxy Pet logs
4. **Check IP**: Visit https://whatismyipaddress.com/
   - Your IP should match your proxy server's IP

## Troubleshooting

### Extension doesn't load

**Problem**: Extension fails to load in Chrome

**Solutions**:
- Ensure you're using Chrome 88 or higher
- Check that all files are present in the folder
- Look for errors in `chrome://extensions/`
- Try reloading the extension

### Can't connect to proxy

**Problem**: "Failed to connect to proxy server" error

**Solutions**:
- Verify proxy server is running
- Check `host` and `port` in `proxy-config.js`
- Ensure firewall allows connections to proxy port
- Test proxy server with curl:
  ```bash
  curl -x http://your-proxy:8080 http://example.com
  ```

### Authentication fails

**Problem**: "Authentication required" or "Invalid credentials"

**Solutions**:
- Verify Auth API URL in `proxy-config.js`
- Check that Auth API server is running
- Try logging out and logging in again
- Clear extension storage:
  1. Go to `chrome://extensions/`
  2. Find Proxy Pet
  3. Click "Details"
  4. Click "Clear storage"

### Whitelist not working

**Problem**: Sites in whitelist are not being proxied

**Solutions**:
- Ensure "Selected Sites Only" mode is selected
- Check URL format (no http://, no trailing slash)
- Try using wildcard: `*.example.com`
- Check Console for PAC script errors

## Updating the Extension

### Manual Update

1. Download the latest version
2. Extract to the same folder (overwrite files)
3. Go to `chrome://extensions/`
4. Click the **Reload** button on Proxy Pet extension

### Auto-Update (when published to Chrome Web Store)

Extensions installed from Chrome Web Store update automatically.

## Uninstallation

1. Go to `chrome://extensions/`
2. Find **Proxy Pet**
3. Click **Remove**
4. Confirm removal

Your settings and credentials will be deleted automatically.

## Security Notes

- Never share your JWT token
- Use HTTPS for Auth API in production
- Keep your proxy server credentials secure
- Regularly update the extension

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Search [GitHub Issues](https://github.com/yourusername/proxy-pet-extension/issues)
3. Create a new issue with:
   - Chrome version
   - Extension version
   - Error messages from Console
   - Steps to reproduce

## Next Steps

- Read the [User Guide](USER_GUIDE.md) for advanced features
- Check out [Configuration Options](README.md#configuration)
- Join our community for support

---

Need help? [Open an issue](https://github.com/yourusername/proxy-pet-extension/issues) on GitHub.
