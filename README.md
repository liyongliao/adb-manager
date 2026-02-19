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
git clone https://github.com/yourusername/adb-manager.git
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

### Build for Current Platform

```bash
npm run build
```

### Build for Specific Platforms

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

### Build for All Platforms

```bash
npm run build:all
```

### Using Build Scripts

For convenience, you can use the provided build scripts:

#### macOS/Linux
```bash
./build.sh
```

#### Windows
```bash
build.bat
```

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
