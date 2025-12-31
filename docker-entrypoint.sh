#!/bin/sh
set -e

echo "Starting Laravel application setup..."

# Wait for database to be ready (if using external database)
# This is optional - migrations will fail gracefully if DB is not ready
if [ "$DB_CONNECTION" != "sqlite" ] && [ -n "$DB_HOST" ]; then
    echo "Waiting for database connection..."
    max_attempts=30
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if php artisan migrate:status > /dev/null 2>&1; then
            echo "Database is up - executing commands"
            break
        fi
        attempt=$((attempt + 1))
        echo "Database is unavailable - sleeping (attempt $attempt/$max_attempts)"
        sleep 2
    done
fi

# Generate application key if not set
if [ -z "$APP_KEY" ]; then
    echo "Generating application key..."
    php artisan key:generate --force
fi

# Run migrations
echo "Running database migrations..."
php artisan migrate --force

# Cache configuration
echo "Caching configuration..."
php artisan config:cache

# Cache routes
echo "Caching routes..."
php artisan route:cache

# Cache views
echo "Caching views..."
php artisan view:cache

# Optimize
echo "Optimizing application..."
php artisan optimize

echo "Application setup complete!"

# Execute the main command
exec "$@"

