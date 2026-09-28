#!/usr/bin/env bash
# Builds the React dashboard and copies it into public/react, which is COMMITTED.
# Render's buildCommand is just "npm install" and the frontend source lives in a
# separate checkout, so the compiled output has to be committed to main.
# Run this, then commit public/react, before every deploy that changes the UI.
set -euo pipefail

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="${FRONTEND_DIR:-$BACKEND_DIR/../axiom-dashboard-react}"

if [ ! -f "$FRONTEND_DIR/package.json" ]; then
  echo "[build] frontend not found at $FRONTEND_DIR (set FRONTEND_DIR)" >&2
  exit 1
fi

echo "[build] building React SPA in $FRONTEND_DIR"
cd "$FRONTEND_DIR"
# Same-origin API calls: never bake a host into the bundle.
env -u VITE_API_URL npm run build

echo "[build] copying dist to $BACKEND_DIR/public/react"
rm -rf "$BACKEND_DIR/public/react"
mkdir -p "$BACKEND_DIR/public/react"
cp -r dist/* "$BACKEND_DIR/public/react/"
echo "[build] done. Commit public/react and push to deploy."
