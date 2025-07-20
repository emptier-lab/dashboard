# 🌐 DNS Setup Guide for empty.rocks Custom Domain

## Current Status
✅ **GitHub Pages**: Working at `https://emptier-lab.github.io/dashboard/tv/`
⚠️ **Custom Domain**: Not configured yet (CNAME temporarily removed)

## Step-by-Step DNS Configuration

### Step 1: Configure DNS Records

You need to set up DNS records with your domain registrar (where you bought `empty.rocks`):

#### Option A: Using CNAME (Recommended)
```
Type: CNAME
Name: empty.rocks (or @)
Value: emptier-lab.github.io
TTL: 3600 (1 hour)
```

#### Option B: Using A Records (Alternative)
```
Type: A
Name: empty.rocks (or @)
Value: 185.199.108.153
TTL: 3600

Type: A
Name: empty.rocks (or @)
Value: 185.199.109.153
TTL: 3600

Type: A
Name: empty.rocks (or @)
Value: 185.199.110.153
TTL: 3600

Type: A
Name: empty.rocks (or @)
Value: 185.199.111.153
TTL: 3600
```

#### WWW Subdomain (Optional but Recommended)
```
Type: CNAME
Name: www
Value: empty.rocks
TTL: 3600
```

### Step 2: Verify DNS Propagation

Wait 5-60 minutes for DNS to propagate, then test:

```bash
# Check if DNS is working
nslookup empty.rocks
dig empty.rocks

# Should return GitHub Pages IPs or CNAME
```

Online tools:
- https://dnschecker.org/
- https://whatsmydns.net/

### Step 3: Re-enable Custom Domain in GitHub

Once DNS is working:

1. **Create CNAME file**:
   ```bash
   echo "empty.rocks" > CNAME
   git add CNAME
   git commit -m "Add CNAME for custom domain"
   git push origin main
   ```

2. **Or manually in GitHub**:
   - Go to repository Settings → Pages
   - Enter `empty.rocks` in Custom domain field
   - Enable "Enforce HTTPS"

### Step 4: Test Everything

After DNS propagates and CNAME is added:

✅ Test these URLs:
- `https://empty.rocks/` → Should redirect to `https://empty.rocks/tv/`
- `https://www.empty.rocks/` → Should redirect to `https://empty.rocks/tv/`
- `https://empty.rocks/empty.tv/` → Should redirect to `https://empty.rocks/tv/`
- `https://empty.rocks/tv/` → Should load the app
- `https://empty.rocks/test-redirects.html` → Should load test suite

## DNS Provider Instructions

### Cloudflare
1. Go to DNS tab
2. Add CNAME record: `empty.rocks` → `emptier-lab.github.io`
3. Set proxy status to "DNS only" (gray cloud)
4. Save

### Namecheap
1. Go to Advanced DNS
2. Add CNAME Record: Host `@`, Value `emptier-lab.github.io`
3. Save changes

### GoDaddy
1. Go to DNS Management
2. Add CNAME: Name `@`, Points to `emptier-lab.github.io`
3. Save

### Route 53 (AWS)
1. Create CNAME record
2. Name: `empty.rocks`
3. Value: `emptier-lab.github.io`
4. Save record set

## Troubleshooting

### Issue: "Domain does not resolve"
**Solution**: DNS not propagated yet
- Wait longer (up to 24 hours)
- Clear DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)

### Issue: "Not served by GitHub Pages"
**Solutions**:
1. Check DNS points to correct GitHub Pages IPs
2. Verify CNAME file contains exactly: `empty.rocks`
3. Ensure no extra spaces or characters in CNAME

### Issue: SSL Certificate Error
**Solutions**:
1. Wait for GitHub to provision SSL (can take up to 24 hours)
2. Remove and re-add custom domain in GitHub settings
3. Ensure "Enforce HTTPS" is enabled

### Issue: 404 Not Found
**Solutions**:
1. Check repository is public
2. Verify GitHub Pages is enabled in repository settings
3. Ensure CNAME file is in root directory

### Issue: Redirect Loops
**Solutions**:
1. Check DNS doesn't have conflicting records
2. Verify no server-side redirects from hosting provider
3. Clear browser cache and cookies

## Current Working URLs (Before Custom Domain)

While setting up DNS, you can test everything at:
- **Main App**: https://emptier-lab.github.io/dashboard/tv/
- **Test Suite**: https://emptier-lab.github.io/dashboard/test-redirects.html
- **Redirects**: https://emptier-lab.github.io/dashboard/ → /tv/

## Security Notes

✅ **HTTPS Enforcement**: All configurations force HTTPS
✅ **Security Headers**: CSP, XSS protection, frame options set
✅ **Mixed Content**: No HTTP resources detected
✅ **Asset Security**: All assets served over HTTPS

## After Custom Domain Setup

Once `empty.rocks` is working:
1. All redirects will work perfectly
2. HTTPS will be automatically enforced
3. No changes needed to application code
4. All existing bookmarks will redirect properly

## Quick Commands

```bash
# Test DNS resolution
nslookup empty.rocks

# Test HTTPS
curl -I https://empty.rocks/

# Add CNAME when ready
echo "empty.rocks" > CNAME
git add CNAME
git commit -m "Enable custom domain"
git push origin main
```

---

**Need Help?**
1. Check DNS propagation first
2. Verify GitHub Pages settings
3. Test on the working GitHub Pages URL first
4. Contact your DNS provider if records aren't updating
