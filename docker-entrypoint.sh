#!/bin/sh
set -e

echo "Starting application initialization..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
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
