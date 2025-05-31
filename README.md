<!-- @format -->

# QR Code Authentication Monorepo

This is a monorepo containing all components of the QR Code Authentication system.

## Project Structure

```
qrcode-auth-monorepo/
├── packages/
│   ├── server/
│   │   ├── mcp/             # MCP Server (@server/mcp)
│   │   ├── proxy/           # Proxy Server (@server/proxy)
│   │   └── qrcode/          # Main QR Code Server (@server/qrcode)
│   └── client/
│       └── qrcode/          # Frontend Application (@client/qrcode)
├── package.json
├── pnpm-workspace.yaml
├── commitlint.config.js
├── .husky/                 # Git hooks configuration
└── README.md
```

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## Getting Started

### Install Dependencies

```bash
# Install all dependencies for all packages
pnpm install
```

This will also set up Git hooks automatically via Husky.

### Development

```bash
# Run all packages in development mode (parallel)
pnpm dev

# Run a specific package
pnpm --filter @client/qrcode dev
pnpm --filter @server/mcp dev
pnpm --filter @server/proxy dev
pnpm --filter @server/qrcode dev
```

### Build

```bash
# Build all packages
pnpm build

# Build a specific package
pnpm --filter @client/qrcode build
```

### Linting and Formatting

```bash
# Lint all packages
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Check formatting
pnpm format:check
```

### Testing

```bash
# Run tests for all packages
pnpm test

# Run tests for a specific package
pnpm --filter @server/proxy test
```

### Type Checking

```bash
# Type check all packages
pnpm typecheck
```

### Clean

```bash
# Clean all build artifacts and node_modules
pnpm clean
```

## Code Quality & Git Hooks

This monorepo uses several tools to maintain code quality:

### Husky Git Hooks

- **pre-commit**: Runs type checking and lint-staged
- **commit-msg**: Validates commit messages using commitlint

### Lint-staged

Automatically runs linting and formatting on staged files before commit:

- TypeScript files: ESLint + Prettier
- Different configurations for each package

### Commitlint

Enforces conventional commit message format:

```
type(scope): description

# Examples:
feat(client/qrcode): add qr code scanning functionality
fix(server/mcp): resolve authentication timeout issue
docs(monorepo): update setup instructions
```

**Available types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`

**Available scopes**: `server/mcp`, `server/proxy`, `server/qrcode`, `client/qrcode`, `monorepo`, `deps`, `config`

## Package Information

### @server/mcp

MCP (Model Context Protocol) Server for QR Code Authentication

### @server/proxy

Proxy server component for handling authentication requests

### @server/qrcode

Main QR code generation and authentication server

### @client/qrcode

React-based frontend application for QR code authentication

## Useful Commands

```bash
# Add a dependency to a specific package
pnpm --filter @client/qrcode add react-query

# Add a dev dependency to a specific package
pnpm --filter @server/mcp add -D @types/express

# Add a dependency to the root workspace
pnpm add -w eslint

# Run a command in a specific package
pnpm --filter @client/qrcode exec -- ls -la

# Update dependencies
pnpm update

# Check for outdated dependencies
pnpm outdated

# Test lint-staged configuration
pnpm lint-staged

# Test commitlint configuration
echo "feat(client/qrcode): test message" | pnpm commitlint
```

## License

MIT
