#!/bin/bash
# Build the React app and deploy built files for GitHub Pages

set -e

cd "$(dirname "$0")"

echo "Building softball app..."
npm run build

# Clean old build artifacts from the deploy location
rm -rf assets 2>/dev/null || true

# Copy built assets
cp -r dist/assets assets

# Replace index.html with the production build
cp dist/index.html index.html

echo ""
echo "Deployed! To restore dev index.html, run:"
echo "  git checkout index.html"
