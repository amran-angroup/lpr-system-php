# Deploying Laravel Application to Render with Docker

This guide explains how to deploy your Laravel application to Render using Docker.

## Prerequisites

1. A Render account (sign up at [render.com](https://render.com))
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. A Render PostgreSQL database (recommended for production)

## Step 1: Prepare Your Environment Variables

Before deploying, you'll need to set up the following environment variables in Render:

### Required Environment Variables

- `APP_NAME` - Your application name
- `APP_ENV` - Set to `production`
- `APP_KEY` - Laravel application key (will be generated if not set)
- `APP_DEBUG` - Set to `false` for production
- `APP_URL` - Your Render service URL (e.g., `https://your-app.onrender.com`)

### Database Configuration (PostgreSQL recommended)

- `DB_CONNECTION` - Set to `pgsql`
- `DB_HOST` - Your Render database host
- `DB_PORT` - Usually `5432`
- `DB_DATABASE` - Your database name
- `DB_USERNAME` - Your database username
- `DB_PASSWORD` - Your database password

### Additional Configuration

- `LOG_CHANNEL` - Set to `stderr` (for Render logs)
- `LOG_LEVEL` - Set to `error` or `warning` for production
- `SESSION_DRIVER` - Set to `database` or `redis` (if using Redis)
- `CACHE_DRIVER` - Set to `database` or `redis` (if using Redis)

## Step 2: Deploy to Render

### Option A: Using render.yaml (Recommended)

1. Push your code to your Git repository
2. In Render dashboard, click "New" → "Blueprint"
3. Connect your repository
4. Render will automatically detect the `render.yaml` file
5. Review the configuration and click "Apply"

### Option B: Manual Setup

1. In Render dashboard, click "New" → "Web Service"
2. Connect your Git repository
3. Configure the service:
   - **Name**: Your service name
   - **Environment**: Docker
   - **Region**: Choose your preferred region
   - **Branch**: `main` or your production branch
   - **Root Directory**: Leave empty (or specify if your app is in a subdirectory)
   - **Dockerfile Path**: `./Dockerfile`
   - **Docker Context**: `.`
   - **Plan**: Choose based on your needs (Starter is fine for small apps)
4. Add environment variables (see Step 1)
5. Click "Create Web Service"

## Step 3: Set Up Database

1. In Render dashboard, click "New" → "PostgreSQL"
2. Configure:
   - **Name**: Your database name
   - **Database**: Your database name
   - **User**: Your database user
   - **Plan**: Choose based on your needs
3. After creation, copy the **Internal Database URL**
4. In your Web Service settings, add the database environment variables:
   - Parse the connection string and set `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
   - Or use `DB_URL` if your Laravel version supports it

## Step 4: Configure Build and Deploy

The Dockerfile handles:
- Building frontend assets (React/Vite)
- Installing PHP dependencies
- Setting up Nginx and PHP-FPM
- Running migrations (via entrypoint script)
- Caching configuration, routes, and views

### Build Settings

- **Build Command**: Leave empty (handled by Dockerfile)
- **Start Command**: Leave empty (handled by Dockerfile)

## Step 5: Post-Deployment

After deployment:

1. **Run Migrations**: The entrypoint script runs migrations automatically, but you can also run them manually:
   ```bash
   php artisan migrate --force
   ```

2. **Create Storage Link** (if needed):
   ```bash
   php artisan storage:link
   ```

3. **Seed Database** (if needed):
   ```bash
   php artisan db:seed --force
   ```

## Troubleshooting

### Build Fails

- Check that all required files are present (package.json, composer.json, etc.)
- Verify Node.js and PHP versions in Dockerfile match your requirements
- Check build logs in Render dashboard

### Application Not Starting

- Check environment variables are set correctly
- Verify database connection settings
- Check application logs in Render dashboard
- Ensure `APP_KEY` is set

### Database Connection Issues

- Verify database environment variables
- Check that database is in the same region as your web service
- Ensure database is not paused (free tier databases pause after inactivity)

### Static Assets Not Loading

- Verify `npm run build` completed successfully
- Check that `public/build` directory exists
- Ensure Vite manifest is generated correctly

## Environment-Specific Notes

### Production Optimizations

The Dockerfile includes:
- Opcache enabled for PHP
- Production Composer install (no dev dependencies)
- Optimized autoloader
- Cached configuration, routes, and views
- Gzip compression in Nginx

## Local Testing

Before deploying, test the Docker image locally:

```bash
# Build the image
docker build -t lpr-system-php .

# Run the container
docker run -p 8000:8000 \
  -e APP_ENV=local \
  -e APP_DEBUG=true \
  -e DB_CONNECTION=sqlite \
  lpr-system-php
```

Visit `http://localhost:8000` to test.

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Laravel Deployment Documentation](https://laravel.com/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

