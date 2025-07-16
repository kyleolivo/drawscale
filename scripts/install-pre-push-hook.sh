#!/bin/bash

# Install git pre-push hook script
# This script creates a pre-push hook that validates commits before pushing

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
HOOK_DIR="$PROJECT_ROOT/.git/hooks"
PRE_PUSH_HOOK="$HOOK_DIR/pre-push"

echo "Installing git pre-push hook..."

# Create hooks directory if it doesn't exist
mkdir -p "$HOOK_DIR"

# Create the pre-push hook script
cat > "$PRE_PUSH_HOOK" << 'EOF'
#!/bin/bash

# Git pre-push hook for DrawScale
# This hook runs validation checks before allowing a push

set -e

echo "🔍 Running pre-push validation..."

# Change to project root directory
cd "$(git rev-parse --show-toplevel)"

# Run linting
echo "📝 Running ESLint..."
npm run lint

# Run unit tests
echo "🧪 Running unit tests..."
npm run test:run

echo "✅ All validation checks passed! Ready to push."
EOF

# Make the hook executable
chmod +x "$PRE_PUSH_HOOK"

echo "✅ Pre-push hook installed successfully!"
echo "📁 Hook location: $PRE_PUSH_HOOK"
echo ""
echo "The hook will now run the following checks before each push:"
echo "  • ESLint (code linting)"
echo "  • Unit tests (Vitest)"
echo ""
echo "To skip the hook for a specific push, use: git push --no-verify"
