#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Function to print headers
print_header() {
  echo "================================="
  echo "$1"
  echo "================================="
}

# Set up the backend
print_header "Setting up Backend"

cd backend

print_header "Step 1: Install Node.js Dependencies for Backend"
npm install

print_header "Step 2: Install dotenv-cli for Backend"
npm install dotenv-cli --save-dev

print_header "Step 3: Set Up PostgreSQL Database for Backend"

# Load environment variables from .env file
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
else
  echo ".env file not found in backend!"
  exit 1
fi

# Run setup permissions script as superuser
PGPASSWORD=$SUPERUSER_DB_PASS psql -U $SUPERUSER_DB_USER -d $DB_NAME -h $DB_HOST -p $DB_PORT -v db_user=$DB_USER -f build/setup_permissions.sql

print_header "Step 4: Generate Database Schema for Backend"
npm run generate-schema

print_header "Step 5: Apply Database Schema for Backend"
PGPASSWORD=$DB_PASS psql -U $DB_USER -d $DB_NAME -h $DB_HOST -p $DB_PORT -f build/schema.sql

cd ..

# Set up the frontend
print_header "Setting up Frontend"

cd frontend

print_header "Step 1: Install React.js Dependencies for Frontend"
npm install

print_header "Step 2: Install VS Code Extensions for Frontend"
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension ritwickdey.liveserver
code --install-extension humao.rest-client

cd ..

print_header "Setup Completed Successfully!"
