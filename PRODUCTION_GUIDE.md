# Teqwa Frontend - Production Deployment Guide

This guide covers deploying the Teqwa frontend to production.

## Prerequisites

- Node.js 18.x or higher
- Build tools (npm/yarn)
- Static hosting service or web server

## Build for Production

### Local Build

```bash
npm install
npm run build
```

This creates a `dist/` directory with optimized production files.

### Environment Variables

Create a `.env.production` file:

```env
VITE_API_URL=https://api.yourdomain.com
```

**Important**: Environment variables must be prefixed with `VITE_` to be accessible in the frontend code.

Build with production environment:

```bash
npm run build -- --mode production
```

## Deployment Options

### Option 1: Static Hosting (Recommended)

#### Netlify

1. Connect your Git repository
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Environment variables:
   - `VITE_API_URL`: Your backend API URL
4. Deploy automatically on push

#### Vercel

1. Import your Git repository
2. Framework preset: Vite
3. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Environment variables:
   - `VITE_API_URL`: Your backend API URL

#### GitHub Pages

1. Install `gh-pages`:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add to `package.json`:
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://yourusername.github.io/teqwa-frontend"
   }
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

### Option 2: AWS S3 + CloudFront

#### 1. Build and Upload to S3

```bash
npm run build
aws s3 sync dist/ s3://your-frontend-bucket --delete
```

#### 2. Configure CloudFront

1. Create CloudFront distribution
2. Origin: Your S3 bucket
3. Default root object: `index.html`
4. Error pages: Set 404 and 403 to `/index.html` (for SPA routing)

#### 3. Set Custom Domain

1. Add alternate domain names (CNAMEs)
2. Add SSL certificate (ACM)
3. Update DNS records

### Option 3: Traditional Web Server (Nginx)

#### 1. Build Locally

```bash
npm run build
```

#### 2. Copy to Server

```bash
scp -r dist/* user@server:/var/www/teqwa-frontend/
```

#### 3. Configure Nginx

Create `/etc/nginx/sites-available/teqwa-frontend`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/teqwa-frontend;
    index index.html;

    # SPA routing - redirect all routes to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

Enable and test:

```bash
sudo ln -s /etc/nginx/sites-available/teqwa-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. Set Up SSL

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Option 4: Docker

#### Build Docker Image

```bash
docker build -t teqwa-frontend .
```

#### Run Container

```bash
docker run -d \
  -p 80:80 \
  -e VITE_API_URL=https://api.yourdomain.com \
  teqwa-frontend
```

Or use docker-compose:

```bash
docker compose up -d
```

## Environment Variables

### Development

```env
VITE_API_URL=http://localhost:8000
```

### Production

```env
VITE_API_URL=https://api.yourdomain.com
```

## Build Optimization

The production build includes:

- Code splitting
- Tree shaking
- Minification
- Asset optimization
- Source maps (optional)

### Disable Source Maps (Smaller Build)

Edit `vite.config.js`:

```js
export default defineConfig({
  build: {
    sourcemap: false, // Disable source maps
  },
});
```

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Set proper CORS headers (backend)
- [ ] Configure security headers (Nginx)
- [ ] Use environment variables for API URL
- [ ] Review and remove console.logs
- [ ] Set up CSP headers (if needed)
- [ ] Configure CDN caching properly

## Performance Optimization

### CDN Configuration

- Enable gzip/brotli compression
- Set cache headers for static assets
- Use CDN edge locations
- Enable HTTP/2

### Nginx Compression

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

## Monitoring

### Error Tracking

Consider integrating:
- Sentry
- LogRocket
- Google Analytics

### Performance Monitoring

- Google PageSpeed Insights
- Lighthouse
- Web Vitals

## Troubleshooting

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 404 Errors on Routes

Ensure your web server is configured to redirect all routes to `index.html` (SPA routing).

### API Calls Failing

- Check `VITE_API_URL` is set correctly
- Verify CORS is configured on backend
- Check browser console for errors
- Verify API endpoint is accessible

### Assets Not Loading

- Check base path configuration in `vite.config.js`
- Verify asset paths are relative
- Check CDN/hosting configuration

## Updates and Maintenance

### Update Dependencies

```bash
npm update
npm audit fix
```

### Rebuild and Deploy

```bash
npm run build
# Deploy dist/ directory to your hosting
```

## Related Documentation

- [Backend API Documentation](https://github.com/your-org/teqwa-backend)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
