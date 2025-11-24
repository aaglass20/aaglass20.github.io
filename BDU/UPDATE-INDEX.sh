#!/bin/bash
# Quick script to update the BDU search index
# Run from anywhere: ./UPDATE-INDEX.sh or bash UPDATE-INDEX.sh

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "🔄 Updating BDU Search Index..."
echo ""

python3 scripts/update-search-index.py

echo ""
echo "✅ Search index updated!"
echo ""
echo "📝 Files modified:"
git status --short | grep -E '\.(html|json)$'
echo ""
