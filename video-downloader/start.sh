#!/bin/bash
set -e

cd "$(dirname "$0")"

# Check for yt-dlp, install if missing
if ! python3 -m yt_dlp --version &>/dev/null; then
  echo "Installing yt-dlp..."
  pip3 install yt-dlp
fi

# Open browser after a short delay
(sleep 1 && open http://localhost:8765) &

python3 server.py