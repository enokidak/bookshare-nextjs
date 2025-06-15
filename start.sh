#!/bin/sh

# Initialize database if it doesn't exist
if [ ! -f "/app/prisma/dev.db" ]; then
    echo "Initializing database..."
    npx prisma migrate deploy
fi

# Start the application
exec node server.js
