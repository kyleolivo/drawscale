# Scripts Directory

This directory contains utility scripts for the DrawScale project.

## Pre-Push Hook Installation

### `install-pre-push-hook.sh`

This script installs a git pre-push hook that automatically validates your code before pushing to the repository.

#### What it does

The pre-push hook runs the following validation checks:

1. **ESLint** - Code linting to ensure code quality and consistency
2. **Unit Tests** - Runs all unit tests using Vitest
3. **E2E Tests** - Runs end-to-end tests using Playwright in headless mode

#### Installation

Run the installation script from the project root:

```bash
./scripts/install-pre-push-hook.sh
```

#### Usage

Once installed, the hook will automatically run every time you push to the repository:

```bash
git push origin main
```

If any validation fails, the push will be blocked until the issues are resolved.

#### Skipping the hook

To skip the pre-push hook for a specific push (not recommended for production code):

```bash
git push --no-verify
```

#### Uninstalling

To remove the pre-push hook:

```bash
rm .git/hooks/pre-push
```

## Validation Commands

The pre-push hook uses these npm scripts (defined in `package.json`):

- `npm run lint` - Runs ESLint on all TypeScript/JavaScript files
- `npm run test:run` - Runs unit tests in headless mode (no UI)
- `npm run test:e2e` - Runs E2E tests in headless mode

All commands are configured to run without requiring user input, making them suitable for automated execution in CI/CD pipelines and git hooks. 