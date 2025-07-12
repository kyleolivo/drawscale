# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DrawScale is a system design interview preparation tool built with React and Excalidraw. It provides an interactive canvas for creating system design diagrams during interview preparation.

## Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Excalidraw** - Drawing/diagramming library
- **ESLint** - Code linting

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Run unit and integration tests
npm run test

# Run unit tests with UI
npm run test:ui

# Run unit tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug

# Run all tests (unit + E2E)
npm run test:all
```

## Project Structure

```
drawscale/
├── src/
│   ├── App.jsx         # Main app component with Excalidraw integration
│   ├── App.css         # App-specific styles
│   ├── main.jsx        # React entry point
│   └── index.css       # Global styles
├── index.html          # HTML entry point
├── vite.config.js      # Vite configuration
└── package.json        # Project dependencies and scripts
```

## Architecture

- **Main Component**: `App.jsx` integrates Excalidraw and provides the main UI
- **Styling**: CSS modules for component-specific styles
- **Build System**: Vite for fast development and optimized production builds

## Testing Strategy

The project includes comprehensive testing at multiple levels:

### Unit Tests
- **Location**: `src/App.test.jsx`
- **Framework**: Vitest + React Testing Library
- **Purpose**: Test component rendering, structure, and basic functionality
- **Mocking**: Excalidraw is mocked to test App component in isolation

### Integration Tests
- **Location**: `src/App.integration.test.jsx`
- **Framework**: Vitest + React Testing Library
- **Purpose**: Test actual Excalidraw integration and canvas rendering
- **Approach**: Tests real component integration without mocking

### End-to-End Tests
- **Location**: `e2e/drawscale.spec.js`
- **Framework**: Playwright
- **Purpose**: Test complete user workflows and application behavior
- **Coverage**: Cross-browser testing (Chrome, Firefox, Safari)

### Test Configuration
- **Vitest Config**: `vitest.config.js` - Unit/Integration test setup
- **Playwright Config**: `playwright.config.js` - E2E test setup  
- **Test Setup**: `src/test/setup.js` - Mocks for canvas and browser APIs

## Git Configuration

The repository includes a comprehensive .gitignore file configured for Node.js projects, including:
- Node modules and package manager files
- Environment variables
- Build outputs
- Testing and coverage reports
- Framework-specific files (Next.js, Nuxt, Vue, Svelte, Gatsby)

## Coding practices

- Any written code should be clean and clear to a human reader. 
- For any code you create, make sure you create or update associated tests. 
- Code should be well-composed and easy for a human to reason about, so think clearly about single responsibility and the length of functions, classes, and files. 