#!/usr/bin/env bash
# MDMS + Mindsetu AI — Local Testing Launcher
# Usage: ./start.sh

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=================================================="
echo " Starting MDMS + Mindsetu AI Local Server..."
echo " Prototype testing portal will be available below:"
echo "=================================================="

npm --prefix frontend run dev
