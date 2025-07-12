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

- **Main Component**: `App.tsx` provides authentication flow and routing
- **Authentication**: Apple Sign-In protects access to the drawing canvas
- **Drawing Component**: `DrawCanvas.tsx` integrates Excalidraw for authenticated users
- **Styling**: CSS modules for component-specific styles
- **Build System**: Vite for fast development and optimized production builds

## Authentication

The app includes Apple Sign-In authentication to protect access to OpenAI API features. Users must authenticate before accessing the drawing canvas.

### Authentication Flow
- **Login Page**: Displays Apple Sign-In button when user is not authenticated
- **Protected Route**: Main app (Excalidraw canvas) only accessible after authentication
- **Logout**: Users can sign out from the header bar
- **Persistence**: Authentication state persists using localStorage

### Components
- `LoginPage.tsx` - Apple Sign-In interface
- `DrawCanvas.tsx` - Protected main application component
- `AuthContext.tsx` - Authentication state management
- `useAuth.ts` - Authentication hook

**Note**: You'll need to configure your Apple Developer account and update the `clientId` in `LoginPage.tsx` with your actual App Bundle ID for production use.

## Testing Strategy

The project follows a **separate test directory structure** (similar to Java conventions) for clean organization.

### Test Organization
```
tests/
├── setup.js             # Test configuration and mocks
├── unit/                # Unit tests (isolated component testing)
│   ├── components/      # Component tests
│   ├── hooks/           # Hook tests
│   └── App.test.tsx     # Main app unit tests
├── integration/         # Integration tests (component interaction)
│   └── App.integration.test.tsx
└── e2e/                # End-to-end tests (full user workflows)
    └── drawscale.spec.js
```

**Important**: Always place tests in the `tests/` directory, never co-located with source files.

### Unit Tests
- **Location**: `tests/unit/`
- **Framework**: Vitest + React Testing Library
- **Purpose**: Test individual components, hooks, and functions in isolation
- **Mocking**: External dependencies are mocked (e.g., Excalidraw, Apple Sign-In)

### Integration Tests
- **Location**: `tests/integration/`
- **Framework**: Vitest + React Testing Library
- **Purpose**: Test component interactions and authentication flows
- **Approach**: Tests real component integration with minimal mocking

### End-to-End Tests
- **Location**: `tests/e2e/`
- **Framework**: Playwright
- **Purpose**: Test complete user workflows and application behavior
- **Coverage**: Cross-browser testing (Chrome, Firefox, Safari)

### Test Configuration
- **Vitest Config**: `vitest.config.js` - Unit/Integration test setup
- **Playwright Config**: `playwright.config.js` - E2E test setup  
- **Test Setup**: `tests/setup.js` - Mocks for canvas and browser APIs

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