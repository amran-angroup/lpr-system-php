#!/bin/sh
# Wait for PHP-FPM socket to be ready before starting nginx

SOCKET_PATH="/var/run/php-fpm.sock"
MAX_ATTEMPTS=30
ATTEMPT=0

echo "Waiting for PHP-FPM socket at $SOCKET_PATH..."

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if [ -S "$SOCKET_PATH" ]; then
        echo "PHP-FPM socket is ready!"
        exit 0
    fi
    ATTEMPT=$((ATTEMPT + 1))
    sleep 1
done

echo "Warning: PHP-FPM socket not found after $MAX_ATTEMPTS attempts, starting nginx anyway..."
exit 0

