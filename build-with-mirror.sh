#!/bin/bash

# ADB Manager Build Script with Mirror Support
# This script builds the application for all platforms with Chinese mirror support

set -e

echo "🚀 Starting ADB Manager build process..."

# Configure Electron mirrors for better connectivity in China
export ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
export ELECTRON_CUSTOM_DIR={{ version }}
export ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf release/
rm -rf dist/
rm -rf dist-electron/

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build for current platform first
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Building for macOS..."
    npm run build:mac
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Building for Linux..."
    npm run build:linux
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    echo "🪟 Building for Windows..."
    npm run build:win
else
    echo "❓ Unknown OS, building for all platforms..."
    npm run build:all
fi

echo "✅ Build completed successfully!"
echo "📁 Release files are in the 'release/' directory"
