#!/bin/sh
set -e

echo "Starting application initialization..."

# Extract database connection info from DATABASE_URL or POSTGRES_URL
DB_URL="${DATABASE_URL:-$POSTGRES_URL}"
if [ -n "$DB_URL" ]; then
    # Parse DATABASE_URL to extract host, port, and user
    # postgresql://user:password@host:port/database
    DB_HOST=$(echo "$DB_URL" | sed -n 's|.*://[^:]*:[^@]*@\([^:]*\):.*|\1|p')
    DB_PORT=$(echo "$DB_URL" | sed -n 's|.*://[^:]*:[^@]*@[^:]*:\([0-9]*\)/.*|\1|p')
    DB_USER=$(echo "$DB_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')
    
    # Set defaults if extraction fails
    DB_HOST="${DB_HOST:-postgres-addon}"
    DB_PORT="${DB_PORT:-5432}"
    DB_USER="${DB_USER:-postgres}"
else
    # Fallback to environment variables or defaults
    DB_HOST="${DB_HOST:-postgres-addon}"
    DB_PORT="${DB_PORT:-5432}"
    DB_USER="${DB_USER:-postgres}"
fi

echo "Database connection details:"
echo "- Host: $DB_HOST"
echo "- Port: $DB_PORT"
echo "- User: $DB_USER"

# Wait for database to be ready
echo "Waiting for database to be ready..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
  echo "Waiting for postgres at $DB_HOST:$DB_PORT with user $DB_USER..."
  sleep 2
done

echo "Database is ready!"

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Generate Prisma client (if needed)
echo "Generating Prisma client..."
npx prisma generate

# Start the application
echo "Starting Next.js application..."
exec "$@"
