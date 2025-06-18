#!/bin/sh
set -e

echo "Starting application initialization..."

# Wait for database to be ready
echo "Waiting for database to be ready..."

# Extract database connection details from DATABASE_URL if individual env vars are not set
if [ -n "$DATABASE_URL" ] && [ -z "$DB_HOST" ]; then
  # Parse DATABASE_URL: postgresql://user:password@host:port/database
  DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
  DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
  DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
  export DB_HOST DB_PORT DB_USER
  echo "Extracted from DATABASE_URL: host=$DB_HOST, port=$DB_PORT, user=$DB_USER"
fi

until pg_isready -h "${DB_HOST:-postgres}" -p "${DB_PORT:-5432}" -U "${DB_USER:-bookshare_user}"; do
  echo "Waiting for postgres at ${DB_HOST:-postgres}:${DB_PORT:-5432} with user ${DB_USER:-bookshare_user}..."
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
