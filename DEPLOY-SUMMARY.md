# Quick Deployment Summary for empty.rocks/tv

## ✅ Configuration Complete

Your empty.tv app is now configured to work with both `empty.rocks/tv` and `www.empty.rocks/tv`. Here's what was done:

### Changes Made:

- **Vite Config**: Added `base: "/tv/"` for subdirectory deployment
- **Router**: Updated to `createWebHistory("/tv/")`
- **HTML**: All asset paths now include `/tv/` prefix
- **Domain**: Updated meta tags for `empty.rocks/tv` (works with both www and non-www)
- **Server Config**: Created `.htaccess` for proper routing and domain handling

## 🚀 Quick Deploy Steps

### 1. Build for Production

```bash
cd empty.tv
npm run build
```

### 2. Upload to Server

Upload the `dist/` folder contents to your server's `/tv/` directory on `empty.rocks` (works with both www.empty.rocks and empty.rocks)

### 3. Server Structure

```
www.empty.rocks/ OR empty.rocks/
└── tv/
    ├── index.html
    ├── assets/
    ├── .htaccess (handles both domains)
    └── ...
```

## 🌐 Live URLs (Both Work)

- **Home**: `http://empty.rocks/tv/` OR `http://www.empty.rocks/tv/`
- **Movies**: `http://empty.rocks/tv/movies` OR `http://www.empty.rocks/tv/movies`
- **TV Shows**: `http://empty.rocks/tv/tv-shows` OR `http://www.empty.rocks/tv/tv-shows`
- **Search**: `http://empty.rocks/tv/search` OR `http://www.empty.rocks/tv/search`

## 🔧 Server Requirements

- **Apache**: Ensure mod_rewrite is enabled (`.htaccess` handles routing for both domains)
- **Nginx**: Add the config from `DEPLOYMENT.md`
- **Domain**: Configure both `empty.rocks` and `www.empty.rocks` to point to same server

## ✨ What Works Now

- ✅ All routes work under `/tv/` path on both domains
- ✅ Page refresh doesn't break routing
- ✅ Assets load from correct paths
- ✅ SEO meta tags updated for both domain variants
- ✅ Service worker configured for new path
- ✅ Automatic redirect from non-www to www (optional)

## 🆘 Quick Troubleshooting

- **404 on refresh**: Check server routing config
- **Assets not loading**: Verify `/tv/` prefix in paths
- **Routing broken**: Confirm base path in vite.config.js

**Ready to deploy!** 🎉
