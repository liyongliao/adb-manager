# Contributing to ADB Manager

Thank you for your interest in contributing to ADB Manager! This document provides guidelines for contributors.

## Development Workflow

### Prerequisites

- Node.js (v18 or higher)
- Git
- GitHub account

### Setup

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/adb-manager.git
cd adb-manager
```

3. Add upstream remote:
```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/adb-manager.git
```

4. Install dependencies:
```bash
npm install
```

### Creating Changes

1. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and test locally:
```bash
npm run dev
```

3. Run linting and type checking:
```bash
npm run lint
npx tsc --noEmit
```

4. Commit your changes:
```bash
git commit -m "feat: add your feature description"
```

### Pull Request Process

1. Push to your fork:
```bash
git push origin feature/your-feature-name
```

2. Create a Pull Request on GitHub

3. Wait for CI checks to pass

4. Address any feedback

## Release Process

Releases are automated through GitHub Actions:

### Automatic Releases

1. **Tag-based releases**: Push a tag starting with `v` (e.g., `v1.0.1`)
```bash
git tag v1.0.1
git push origin v1.0.1
```

2. **Manual releases**: Create a release on GitHub

### Build Artifacts

The CI/CD pipeline automatically builds for:
- macOS (x64, arm64) - DMG files
- Windows (x64, ia32) - NSIS installers  
- Linux (x64) - AppImage and DEB packages

All artifacts are uploaded to GitHub Releases.

## Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for formatting (configured in ESLint)
- Write meaningful commit messages following conventional commits

## Testing

Before submitting PRs, ensure:
- Code compiles without errors
- Linting passes
- Application builds successfully
- Manual testing of your changes

## Issues

- Bug reports: Use GitHub Issues with detailed description
- Feature requests: Use GitHub Issues with "enhancement" label
- Questions: Use GitHub Discussions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
