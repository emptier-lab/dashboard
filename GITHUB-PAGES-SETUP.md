# GitHub Pages Setup Guide for empty.tv

This guide will help you deploy your empty.tv app to GitHub Pages.

## 🚀 Quick Setup

### 1. Enable GitHub Pages
1. Go to your repository on GitHub: `https://github.com/emptier-lab/empty.tv`
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. The workflow will automatically deploy when you push to main

### 2. Your Live URLs
After deployment, your app will be available at:
- **Main URL**: `https://emptier-lab.github.io/empty.tv/`
- **All routes work**: `/movies`, `/tv-shows`, `/search`, etc.

## 🔧 What's Already Configured

### ✅ GitHub Actions Workflow
- Auto-deploys on every push to `main` branch
- Builds with Node.js 18
- Uses official GitHub Pages actions
- Located at `.github/workflows/deploy.yml`

### ✅ SPA Routing
- Custom 404.html handles client-side routing
- Index.html includes SPA routing script
- All Vue Router routes work with page refresh

### ✅ Base Path Configuration
- Vite config automatically uses `/empty.tv/` for production
- Router configured for GitHub Pages path
- Assets load from correct subdirectory

### ✅ Build Scripts
```bash
npm run build:pages    # Build for GitHub Pages
npm run preview:pages  # Preview GitHub Pages build locally
```

## 📁 File Structure

```
empty.tv/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Auto-deployment workflow
├── public/
│   ├── 404.html               # SPA routing for GitHub Pages
│   └── _config.yml            # GitHub Pages config
├── src/
└── dist/                      # Built files (auto-generated)
```

## 🔄 Deployment Process

### Automatic Deployment
1. Push code to `main` branch
2. GitHub Actions automatically:
   - Installs dependencies (`npm ci`)
   - Builds the app (`npm run build`)
   - Deploys to GitHub Pages
3. Site updates in 1-2 minutes

### Manual Deployment (if needed)
```bash
# Build locally
npm run build:pages

# The dist/ folder contains your built app
# GitHub Actions handles the actual deployment
```

## 🌐 URLs After Deployment

### Main Pages
- **Home**: `https://emptier-lab.github.io/empty.tv/`
- **Movies**: `https://emptier-lab.github.io/empty.tv/movies`
- **TV Shows**: `https://emptier-lab.github.io/empty.tv/tv-shows`
- **Search**: `https://emptier-lab.github.io/empty.tv/search`
- **Favorites**: `https://emptier-lab.github.io/empty.tv/favorites`

### Detail Pages
- **Movie**: `https://emptier-lab.github.io/empty.tv/movie/123`
- **TV Show**: `https://emptier-lab.github.io/empty.tv/tv/456`
- **Person**: `https://emptier-lab.github.io/empty.tv/person/789`

## 🐛 Troubleshooting

### Build Fails
```bash
# Check your dependencies
npm install

# Test build locally
npm run build:pages

# Check for errors in package.json
```

### 404 Errors
- GitHub Pages is enabled in repository settings
- Workflow has `pages: write` permissions
- Check Actions tab for deployment status

### Assets Not Loading
- Verify base path in `vite.config.js` is `/empty.tv/`
- Check if assets are using relative paths
- Clear browser cache

### Routing Issues
- 404.html is present in public/ folder
- SPA routing script is in index.html
- Router uses correct base path

## 🔒 Permissions Setup

The workflow needs these permissions (already configured):
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

## 📊 Monitoring Deployment

### Check Deployment Status
1. Go to **Actions** tab in your repository
2. Look for "Deploy to GitHub Pages" workflow
3. Green checkmark = successful deployment
4. Red X = deployment failed (click for details)

### Deployment Logs
- Click on failed workflow to see error details
- Check build logs for npm/Vite errors
- Verify all dependencies are in package.json

## 🎯 Performance Optimization

### Already Configured
- ✅ Asset compression and minification
- ✅ Code splitting with Vite
- ✅ Efficient caching headers
- ✅ Modern browser optimizations

### GitHub Pages Limits
- **File size**: Max 100MB per file
- **Repository size**: Max 1GB
- **Bandwidth**: 100GB/month soft limit
- **Builds**: 10 per hour

## 🔄 Updating Your Site

### Push Updates
```bash
git add .
git commit -m "Update site"
git push origin main
```

### The workflow automatically:
1. Detects the push
2. Builds the updated code
3. Deploys to GitHub Pages
4. Site updates within 2-3 minutes

## 📱 Custom Domain (Optional)

If you want to use your own domain:

1. Add CNAME file to public/ folder:
```
your-domain.com
```

2. Configure DNS:
```
CNAME record: www -> emptier-lab.github.io
A records: @ -> GitHub Pages IPs
```

3. Enable HTTPS in Pages settings

## ✨ Features Working

- ✅ All Vue.js functionality
- ✅ Vue Router with history mode
- ✅ Vuetify components and theming
- ✅ Movie/TV show browsing
- ✅ Video player with multiple sources
- ✅ Search functionality
- ✅ Favorites and watchlist
- ✅ Responsive design
- ✅ SEO meta tags

## 🆘 Support

### Common Issues
1. **Site not updating**: Check Actions tab for failed builds
2. **404 on routes**: Verify 404.html and SPA routing script
3. **Assets 404**: Check base path configuration
4. **Build errors**: Run `npm run build:pages` locally first

### Getting Help
- Check GitHub Actions logs for specific errors
- Test builds locally with `npm run build:pages`
- Verify all files are committed and pushed

---

🎉 **Your empty.tv app is now live on GitHub Pages!**

Visit: `https://emptier-lab.github.io/empty.tv/`
