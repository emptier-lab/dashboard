# Deployment Guide for empty.rocks/tv

This guide explains how to deploy the empty.tv application to work with both `empty.rocks/tv` and `www.empty.rocks/tv`.

## Configuration Changes Made

### 1. Vite Configuration

- Added `base: "/tv/"` to `vite.config.js`
- This ensures all assets are served from the correct subdirectory

### 2. Router Configuration

- Updated Vue Router to use `createWebHistory("/tv/")`
- All routes will now work correctly under the `/tv/` path

### 3. HTML Updates

- Updated all asset paths in `index.html` to include `/tv/` prefix
- Updated meta tags with the new domain `empty.rocks/tv`
- Updated service worker registration path

### 4. Apache Configuration

- Created `.htaccess` file for proper client-side routing
- Configured redirects to handle Vue Router history mode
- Added security headers and caching rules

## Deployment Steps

### For Development

```bash
# Install dependencies
npm install

# Run development server (will work on localhost:3000/tv/)
npm run dev
```

### For Production Build

```bash
# Build for empty.rocks/tv
npm run build:rocks

# Or use the regular build (same result with current config)
npm run build
```

### Server Setup

#### Option 1: Apache Server

1. Upload the `dist/` folder contents to your server's `/tv/` directory
2. The `.htaccess` file will handle routing automatically
3. Ensure Apache mod_rewrite is enabled

#### Option 2: Nginx Server

Add this configuration to your Nginx server block:

```nginx
location /tv/ {
    alias /path/to/your/dist/;
    try_files $uri $uri/ /tv/index.html;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Option 3: Static File Hosting (Netlify/Vercel)

1. Deploy the `dist/` folder
2. Configure redirects for SPA routing:

**Netlify (\_redirects file):**

```
/tv/* /tv/index.html 200
```

**Vercel (vercel.json):**

```json
{
  "rewrites": [{ "source": "/tv/(.*)", "destination": "/tv/index.html" }]
}
```

## File Structure After Build

```
dist/
├── tv/
│   ├── index.html
│   ├── assets/
│   │   ├── index.[hash].js
│   │   ├── index.[hash].css
│   │   └── ...
│   ├── favicon.ico
│   ├── .htaccess
│   └── ...
```

## URLs After Deployment (Both Work)

- **Home:** `http://empty.rocks/tv/` OR `http://www.empty.rocks/tv/`
- **Movies:** `http://empty.rocks/tv/movies` OR `http://www.empty.rocks/tv/movies`
- **TV Shows:** `http://empty.rocks/tv/tv-shows` OR `http://www.empty.rocks/tv/tv-shows`
- **Search:** `http://empty.rocks/tv/search` OR `http://www.empty.rocks/tv/search`
- **Movie Detail:** `http://empty.rocks/tv/movie/123` OR `http://www.empty.rocks/tv/movie/123`
- **TV Detail:** `http://empty.rocks/tv/tv/456` OR `http://www.empty.rocks/tv/tv/456`

## Troubleshooting

### 404 Errors on Page Refresh

- Ensure your server is configured to serve `index.html` for all routes under `/tv/`
- Check that the `.htaccess` file is uploaded and working (for Apache)

### Assets Not Loading

- Verify all asset paths include the `/tv/` prefix
- Check browser developer tools for 404 errors
- Ensure the `base` path in `vite.config.js` is correct

### Routing Issues

- Confirm Vue Router is using the correct base path: `createWebHistory("/tv/")`
- Check that all router-link `to` attributes are relative (start with `/`)

## Testing

### Local Testing

```bash
# Build and preview
npm run build:rocks
npm run preview:rocks
```

### Production Testing

1. Navigate to `http://empty.rocks/tv/` OR `http://www.empty.rocks/tv/`
2. Test navigation between different pages
3. Refresh the page on different routes to ensure server-side routing works
4. Check browser developer tools for any 404 errors
5. Test that both www and non-www versions work correctly

## Environment Variables

If using environment variables, make sure to set:

```
VITE_APP_BASE_URL=/tv/
VITE_APP_API_URL=https://api.themoviedb.org/3
```

## Security Considerations

The `.htaccess` file includes:

- XSS protection headers
- Content type sniffing protection
- Frame options to prevent clickjacking
- Referrer policy configuration

## Performance Optimizations

- Gzip compression enabled for text assets
- Browser caching configured for static assets
- Asset versioning for cache busting
- Code splitting implemented via Vite

## Support

For issues specific to the empty.rocks domain deployment, check:

1. Server logs for 404 or 500 errors
2. Browser developer tools for asset loading issues
3. Network tab to verify correct asset paths
4. Verify both www.empty.rocks and empty.rocks point to the same server
5. Check .htaccess redirect rules if using Apache

## Rollback Plan

To revert to the original configuration:

1. Remove `base: "/tv/"` from `vite.config.js`
2. Change router history to `createWebHistory()`
3. Update asset paths in `index.html` to remove `/tv/` prefix
4. Rebuild and redeploy
