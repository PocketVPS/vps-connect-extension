# 🚀 How to Publish to GitHub

This guide will help you publish the Proxy Pet extension to GitHub.

## Prerequisites

- GitHub account
- Git installed on your computer
- Repository already initialized (✅ Done!)

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Fill in the repository details:
   - **Repository name**: `proxy-pet-extension`
   - **Description**: `🐾 Secure Chrome extension for managing proxy connections with JWT authentication`
   - **Visibility**: ✅ **Public** (so users can download)
   - **DO NOT** initialize with README (we already have one)
3. Click **Create repository**

## Step 2: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
cd /Users/igor/GolandProjects/proxy-pet-extension

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/proxy-pet-extension.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Configure Repository Settings

### Add Topics (for discoverability)

1. Go to your repository on GitHub
2. Click the ⚙️ icon next to "About"
3. Add topics:
   - `chrome-extension`
   - `proxy`
   - `jwt-authentication`
   - `javascript`
   - `proxy-manager`
   - `browser-extension`
4. Click **Save changes**

### Update Repository Description

In the "About" section, add:
- **Description**: `🐾 Secure Chrome extension for managing proxy connections with JWT authentication`
- **Website**: Your proxy server URL (optional)

### Enable Issues

1. Go to **Settings** → **General**
2. Scroll to **Features**
3. Ensure **Issues** is checked ✅

## Step 4: Create First Release

1. Go to your repository
2. Click **Releases** (right sidebar)
3. Click **Create a new release**
4. Fill in:
   - **Tag version**: `v1.0.0`
   - **Release title**: `🎉 Proxy Pet v1.0.0 - Initial Release`
   - **Description**:
     ```markdown
     ## 🐾 Proxy Pet v1.0.0
     
     First public release of Proxy Pet Chrome Extension!
     
     ### ✨ Features
     - 🔐 JWT authentication
     - 🚀 One-click proxy toggle
     - 🎯 Selective proxying (All sites / Selected sites)
     - 📋 Whitelist management with wildcards
     - 🔔 Visual status badge
     - 🌐 Full HTTPS support
     
     ### 📦 Installation
     
     1. Download the source code (ZIP)
     2. Extract to a folder
     3. Open Chrome → `chrome://extensions/`
     4. Enable "Developer mode"
     5. Click "Load unpacked"
     6. Select the extracted folder
     
     See [INSTALL.md](INSTALL.md) for detailed instructions.
     
     ### 📝 Configuration
     
     Edit `background/proxy-config.js` with your proxy server details.
     
     ### 🐛 Known Issues
     
     None yet! Please report any issues you find.
     ```
5. Click **Publish release**

## Step 5: Add Screenshots (Optional but Recommended)

1. Take screenshots of:
   - Login screen
   - Dashboard with proxy enabled
   - Whitelist management
2. Save them in the `screenshots/` folder:
   ```bash
   screenshots/
   ├── login.png
   ├── dashboard.png
   └── whitelist.png
   ```
3. Commit and push:
   ```bash
   git add screenshots/
   git commit -m "Add screenshots"
   git push
   ```

## Step 6: Update README with Your Info

Replace placeholders in README.md:

```bash
# Find and replace:
# yourusername → your actual GitHub username
# support@proxy-pet.example.com → your email (or remove)
```

Then commit:
```bash
git add README.md
git commit -m "Update README with actual links"
git push
```

## Step 7: Share Your Extension

Now users can download your extension:

### Download Link
```
https://github.com/YOUR_USERNAME/proxy-pet-extension/releases/latest
```

### Clone Link
```
git clone https://github.com/YOUR_USERNAME/proxy-pet-extension.git
```

## Quick Commands Reference

```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub
git push

# Pull latest changes
git pull

# Create new branch
git checkout -b feature-name

# Switch branch
git checkout main
```

## Updating the Extension

When you make changes:

```bash
# 1. Make your changes to the code

# 2. Update CHANGELOG.md with changes

# 3. Commit changes
git add .
git commit -m "Description of changes"
git push

# 4. Create new release on GitHub
# - Go to Releases → Create new release
# - Tag: v1.0.1, v1.1.0, etc.
# - Describe changes
```

## Security Checklist

Before publishing, verify:

- ✅ No hardcoded passwords or secrets
- ✅ No private API keys
- ✅ `.gitignore` includes sensitive files
- ✅ Only public proxy server IP (which is fine)
- ✅ JWT tokens are generated dynamically
- ✅ Documentation doesn't reveal sensitive info

## What's Public vs Private

### ✅ Public (Safe to share):
- Extension source code
- Proxy server IP address (it's public anyway)
- API endpoints structure
- Documentation

### ❌ Private (Keep on your VPS):
- Backend Go code (business logic)
- JWT secret keys
- Database credentials
- Subscription/billing logic
- User data

## Next Steps

1. **Promote your extension**:
   - Share on Reddit (r/chrome, r/selfhosted)
   - Post on Twitter/X
   - Add to Chrome Extension lists

2. **Monitor issues**:
   - Check GitHub Issues regularly
   - Respond to user questions
   - Fix bugs promptly

3. **Plan updates**:
   - Add new features
   - Improve UI/UX
   - Add more documentation

## Need Help?

- GitHub Docs: https://docs.github.com/
- Git Basics: https://git-scm.com/book/en/v2
- Markdown Guide: https://www.markdownguide.org/

---

Good luck with your extension! 🚀
