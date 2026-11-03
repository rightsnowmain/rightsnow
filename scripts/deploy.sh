#!/usr/bin/env bash
set -e

echo "=== Deploying News Publishing System ==="

# Build production containers
docker-compose -f infrastructure/docker-compose.yml build

# Run migrations inside container
docker-compose -f infrastructure/docker-compose.yml up -d postgres
echo "Waiting for postgres..."
sleep 5

docker-compose -f infrastructure/docker-compose.yml up -d

echo "=== Deployment successful! Application is live at http://localhost:80 ==="
