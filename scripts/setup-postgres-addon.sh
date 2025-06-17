#!/bin/bash

# PostgreSQL Add-on Setup Script for Azure Container Apps
# This script creates a PostgreSQL add-on for the Container Apps environment

set -e

echo "Setting up PostgreSQL Add-on for Azure Container Apps..."

# Check if required environment variables are set
if [ -z "$AZURE_ENV_NAME" ]; then
    echo "Error: AZURE_ENV_NAME environment variable is not set"
    exit 1
fi

if [ -z "$AZURE_RESOURCE_GROUP" ]; then
    echo "Error: AZURE_RESOURCE_GROUP environment variable is not set"
    exit 1
fi

# Load environment variables from azd
if [ -f ".azure/${AZURE_ENV_NAME}/.env" ]; then
    echo "Loading environment variables from .azure/${AZURE_ENV_NAME}/.env"
    export $(grep -v '^#' .azure/${AZURE_ENV_NAME}/.env | xargs)
fi

# Variables
POSTGRES_ADDON_NAME="postgres-addon"
DATABASE_NAME="bookshare"
CONTAINER_APP_ENV_NAME="${containerAppEnvironmentName}"
KEY_VAULT_NAME="${keyVaultName}"

echo "Creating PostgreSQL add-on..."
echo "- Resource Group: $AZURE_RESOURCE_GROUP"
echo "- Environment: $CONTAINER_APP_ENV_NAME"
echo "- Add-on Name: $POSTGRES_ADDON_NAME"

# Install the containerapp extension if not already installed
echo "Ensuring Azure CLI containerapp extension is installed..."
az extension add --name containerapp --upgrade --yes

# Create PostgreSQL add-on
echo "Creating PostgreSQL add-on: $POSTGRES_ADDON_NAME"
az containerapp add-on postgres create \
    --name "$POSTGRES_ADDON_NAME" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --environment "$CONTAINER_APP_ENV_NAME"

# Wait for the add-on to be ready
echo "Waiting for PostgreSQL add-on to be ready..."
sleep 30

# Get the connection string from the add-on
echo "Retrieving PostgreSQL connection information..."
POSTGRES_INFO=$(az containerapp add-on postgres show \
    --name "$POSTGRES_ADDON_NAME" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --output json)

# Extract connection details (this might need adjustment based on actual output format)
POSTGRES_HOST=$(echo $POSTGRES_INFO | jq -r '.properties.postgresHost // "postgres-addon"')
POSTGRES_PORT=$(echo $POSTGRES_INFO | jq -r '.properties.postgresPort // "5432"')
POSTGRES_USER=$(echo $POSTGRES_INFO | jq -r '.properties.postgresUser // "postgres"')
POSTGRES_PASSWORD=$(echo $POSTGRES_INFO | jq -r '.properties.postgresPassword // ""')

# Construct database URL
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${DATABASE_NAME}"

echo "PostgreSQL connection details:"
echo "- Host: $POSTGRES_HOST"
echo "- Port: $POSTGRES_PORT"
echo "- User: $POSTGRES_USER"
echo "- Database: $DATABASE_NAME"

# Update the Key Vault secret with the actual database URL
echo "Updating Key Vault secret with PostgreSQL connection string..."
az keyvault secret set \
    --vault-name "$KEY_VAULT_NAME" \
    --name "database-url" \
    --value "$DATABASE_URL"

echo "PostgreSQL add-on setup completed successfully!"
echo "Database URL has been updated in Key Vault: $KEY_VAULT_NAME"
echo ""
echo "Next steps:"
echo "1. Deploy your container app with 'azd deploy' or 'azd up'"
echo "2. The application will automatically use the PostgreSQL add-on"
echo ""
echo "To connect manually:"
echo "psql '$DATABASE_URL'"
