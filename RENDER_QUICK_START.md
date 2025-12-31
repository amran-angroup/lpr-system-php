# Quick Start: Deploy to Render

## 1. Create PostgreSQL Database

1. Go to Render Dashboard → New → PostgreSQL
2. Name it (e.g., `lpr-system-db`)
3. Note the connection details

## 2. Create Web Service

1. Go to Render Dashboard → New → Web Service
2. Connect your Git repository
3. Configure:
   - **Name**: `lpr-system-php`
   - **Environment**: `Docker`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Dockerfile Path**: `./Dockerfile`
   - **Docker Context**: `.`
   - **Plan**: Starter (or higher)

## 3. Set Environment Variables

In your Web Service settings, add these environment variables:

```
APP_NAME=LPR System
APP_ENV=production
APP_DEBUG=false
APP_URL=https://lpr-system.onrender.com
LOG_CHANNEL=stderr
LOG_LEVEL=error

DB_CONNECTION=pgsql
DB_HOST=<from-database-settings>
DB_PORT=5432
DB_DATABASE=<from-database-settings>
DB_USERNAME=<from-database-settings>
DB_PASSWORD=<from-database-settings>

SESSION_DRIVER=database
CACHE_DRIVER=database
```

**Important**: 
- Don't set `APP_KEY` - it will be auto-generated on first deploy.
- Make sure `APP_URL` uses **HTTPS** (not HTTP) - this is required for assets to load correctly.

## 4. Deploy

1. Click "Create Web Service"
2. Render will build and deploy automatically
3. First deploy may take 5-10 minutes
4. Check logs if there are any issues

## 5. Verify

1. Visit your app URL
2. Check that migrations ran (check logs)
3. Test the application

## Troubleshooting

- **Build fails**: Check Dockerfile and ensure all files are committed
- **App won't start**: Check environment variables and logs
- **Database errors**: Verify DB credentials and that database is running
- **Assets missing**: Check that `npm run build` completed in build logs
- **Mixed Content errors (HTTPS/HTTP)**: Ensure `APP_URL` is set to HTTPS (e.g., `https://lpr-system.onrender.com`). The application automatically forces HTTPS URLs in production.

