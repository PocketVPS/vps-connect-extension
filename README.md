# 🚀 VPS Connect

Chrome extension for easy one-click connection to your VPS server with JWT authentication.

## ✨ Features

- 🔐 JWT Authentication
- 🚀 One-click server connection
- 🎯 Selective routing (all sites or selected sites only)
- 📋 Whitelist management with wildcard support
- 🔔 Visual status indicator

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PocketVPS/vps-connect-extension.git
   cd vps-connect-extension
   ```
   OR
   Download the latest release from [Releases](https://github.com/PocketVPS/vps-connect-extension/releases)

2. **Install in browser**
   - Open your browser and go to `browser://extensions`
   - Enable **Developer mode** (toggle in top right corner)
   - Click **Load unpacked**
   - Select the `vps-connect-extension` folder

3. **Configure VPS server**
   - Edit `background/proxy-config.js`
   - Update `host` and `port` to match your VPS server

## 🚀 Usage

1. Click the VPS Connect icon in your browser toolbar
2. Register or login with your credentials
3. Click "Подключиться" (Connect) to activate
4. Choose connection mode:
   - **Все сайты** (All Sites) - route all traffic through your server
   - **Выбранные сайты** (Selected Sites) - route only selected URLs
5. Add URLs to your list as needed (e.g., `youtube.com`, `*.google.com`)

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.
