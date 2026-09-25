#!/bin/bash
# Build script for Render deployment
# Copies React SPA build into backend public folder

set -e

echo "[build] Building React SPA..."
cd /home/claude/axiom-dashboard-react
npm run build
echo "[build] React build complete"

echo "[build] Copying React build to backend..."
BACKEND_REACT_PATH="/home/claude/axiom-backend/public/react"
rm -rf "$BACKEND_REACT_PATH"
mkdir -p "$BACKEND_REACT_PATH"
cp -r dist/* "$BACKEND_REACT_PATH/"
echo "[build] React build copied to $BACKEND_REACT_PATH"

echo "[build] Ready for Render deployment"
