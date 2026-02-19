# ADB Manager

A modern ADB (Android Debug Bridge) manager application built with Electron, React, and TypeScript. This application provides a user-friendly interface for managing Android devices connected via ADB.

## Features

- 📱 Device discovery and management
- 🔌 ADB connection management
- 🎨 Modern UI built with React and Tailwind CSS
- 🖥️ Cross-platform support (macOS, Windows, Linux)
- ⚡ Fast and responsive interface

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Desktop Framework**: Electron
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **ADB Integration**: adbkit

## Development

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/liyongliao/adb-manager.git
cd adb-manager
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

## Building

### Local Development

#### Build for Current Platform

```bash
npm run build
```

#### Build for Specific Platforms

#### macOS
```bash
npm run build:mac
```

#### Windows
```bash
npm run build:win
```

#### Linux
```bash
npm run build:linux
```

#### Build for All Platforms
```bash
npm run build:all
```

#### Using Build Scripts

For convenience, you can use the provided build scripts:

#### macOS/Linux
```bash
./build.sh
```

#### Windows
```bash
build.bat
```

### GitHub Actions CI/CD

This project uses GitHub Actions for automated building and releasing:

#### Automated Workflows

1. **CI Pipeline** (`.github/workflows/ci.yml`)
   - Runs on every push to main/develop branches
   - Performs linting, type checking, and build tests

2. **Build Pipeline** (`.github/workflows/build.yml`)
   - Builds for all platforms on push/PR
   - Uploads build artifacts

3. **Release Pipeline** (`.github/workflows/release.yml`)
   - Triggered by git tags starting with `v`
   - Builds and publishes releases automatically

#### Creating Releases

**Automatic Release (Recommended):**
```bash
# Create and push a version tag
git tag v1.0.1
git push origin v1.0.1
```

**Manual Release:**
1. Go to GitHub Releases page
2. Create a new release
3. GitHub Actions will build and upload artifacts automatically

#### Build Matrix

The CI/CD builds for:
- **macOS**: x64, arm64 (DMG)
- **Windows**: x64, ia32 (NSIS installer)
- **Linux**: x64 (AppImage, DEB)

## Release Artifacts

Built applications are placed in the `release/` directory with the following naming convention:

- **macOS**: `ADB Manager-Mac-{version}-{arch}.dmg`
- **Windows**: `ADB Manager-Windows-{version}-{arch}.exe`
- **Linux**: `ADB Manager-Linux-{version}-{arch}.AppImage` and `.deb`

## Project Structure

```
adb-manager/
├── electron/                 # Electron main process files
│   ├── main.ts              # Main electron process
│   ├── preload.ts           # Preload script
│   └── electron-env.d.ts    # TypeScript definitions
├── src/                     # React application source
│   ├── components/          # React components
│   ├── App.tsx             # Main App component
│   └── main.tsx            # React entry point
├── public/                  # Static assets
├── release/                 # Build outputs (generated)
├── package.json            # Project configuration
├── electron-builder.json5  # Electron builder configuration
└── README.md               # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Electron](https://www.electronjs.org/) for cross-platform desktop app framework
- [React](https://reactjs.org/) for the UI framework
- [Vite](https://vitejs.dev/) for the build tool
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [adbkit](https://github.com/openstf/adbkit) for ADB integration
