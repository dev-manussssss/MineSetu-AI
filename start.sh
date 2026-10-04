#!/usr/bin/env bash
# MineSetu AI — Local Prototype Launcher
# Usage: ./start.sh

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=================================================="
echo " Starting MineSetu AI Prototype Server..."
echo " Prototype Portal URL: http://localhost:5173"
echo "=================================================="

npm --prefix frontend run dev -- --open
