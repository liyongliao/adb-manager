@echo off
REM ADB Manager Build Script for Windows
REM This script builds the application for all platforms

echo 🚀 Starting ADB Manager build process...

REM Clean previous builds
echo 🧹 Cleaning previous builds...
if exist "release" rmdir /s /q "release"
if exist "dist" rmdir /s /q "dist"
if exist "dist-electron" rmdir /s /q "dist-electron"

REM Install dependencies
echo 📦 Installing dependencies...
call npm ci

REM Build for all platforms
echo 🏗️ Building for all platforms...
call npm run build:all

echo ✅ Build completed successfully!
echo 📁 Release files are in the 'release\' directory
pause
