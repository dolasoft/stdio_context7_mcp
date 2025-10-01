# STDIO Context7 MCP Server

> Alternative Context7 MCP server built specifically for seamless integration with Cursor and other MCP-compatible AI assistants

An alternative implementation of the Context7 MCP server, designed from the ground up to work seamlessly with **Cursor** and other MCP-compatible AI assistants. This server provides up-to-date library documentation and code examples directly through STDIO transport.

## 🎯 Purpose

This is an **alternative MCP server** to the original Context7, built with the specific purpose of:
- **Seamless Cursor Integration**: Optimized for the Cursor IDE experience
- **Enhanced STDIO Transport**: Direct, efficient communication via standard input/output
- **Developer-First Design**: Built by developers, for developers using Cursor
- **Production-Ready Security**: Enterprise-grade Docker image with SBOMs, provenance, and signing support

## ✨ Features

- 🤖 **Cursor Optimized**: Purpose-built for seamless Cursor integration
- 🔍 **Library Resolution**: Resolve library names to Context7-compatible IDs
- 📚 **Documentation Retrieval**: Fetch up-to-date documentation and code examples
- 🎯 **Topic Filtering**: Focus on specific topics within libraries
- ⚡ **STDIO Transport**: Fast, local integration with MCP clients (HTTP/SSE planned)
- 🐳 **Production Docker**: Multi-arch with SBOMs, provenance, and security hardening
- 🔐 **Enterprise Security**: Non-root user, minimal attack surface, signed images
- 🌍 **Multi-Architecture**: Supports amd64, arm64, and arm/v7 platforms

## Installation

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Docker (optional, for containerized deployment)

### Local Installation

```bash
# Clone the repository
git clone https://github.com/dolasoft/stdio_context7_mcp.git
cd STDIO_Context7_MCP

# Install dependencies
npm install

# Build the project
npm run build
```

### Docker Installation

```bash
# Build the Docker image
docker build -t stdio-context7-mcp .
```

## Usage

### Running Locally

```bash
# Start the server
npm start

# Start with API key
node dist/src/server.js --api-key YOUR_API_KEY

# Development mode (auto-rebuild)
npm run dev
```

### Running with Docker

```bash
# Run the container (stdio mode)
docker run -i dolasoft/stdio-context7-mcp:latest

# Run with API key
docker run -i dolasoft/stdio-context7-mcp:latest --api-key YOUR_API_KEY
```

### CLI Arguments

- `--transport <stdio|http|sse>`: Transport protocol to use (default: stdio)
- `--api-key <key>`: Context7 API key for authentication (optional, get one at [context7.com/dashboard](https://context7.com/dashboard) for higher rate limits)

**Note**: Currently only `stdio` transport is implemented. `http` and `sse` transports are planned for future releases.

## MCP Client Configuration

> **📁 Configuration Examples**: See the [`examples/`](./examples/) directory for ready-to-use configuration files for different MCP clients.

### 🎯 Cursor (Recommended)

This server is **optimized for Cursor**. Add to your MCP configuration:

**Using Node.js:**
```json
{
  "mcpServers": {
    "stdio-context7": {
      "command": "node",
      "args": [
        "/path/to/STDIO_Context7_MCP/dist/src/server.js",
        "--transport",
        "stdio"
      ]
    }
  }
}
```

**Using Docker (Production-Ready):**
```json
{
  "mcpServers": {
    "stdio-context7": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--stop-timeout",
        "10",
        "dolasoft/stdio-context7-mcp:latest"
      ]
    }
  }
}
```

**Add this rule to your `CLAUDE.md` for automatic usage:**
```markdown
## Context7 Integration

Always use the stdio-context7 MCP server when you need:
- Library documentation and API references
- Code examples for frameworks and libraries
- Up-to-date installation and configuration instructions
- Best practices for popular development tools

Use the `resolve-library-id` tool first to find the correct library ID,
then use `get-library-docs` to fetch the documentation.
```

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "stdio-context7": {
      "command": "node",
      "args": [
        "/path/to/STDIO_Context7_MCP/dist/src/server.js",
        "--api-key",
        "YOUR_API_KEY"
      ]
    }
  }
}
```

### Cursor

Go to Settings → Cursor Settings → MCP → Add new global MCP server:

```json
{
  "mcpServers": {
    "stdio-context7": {
      "command": "node",
      "args": ["/path/to/STDIO_Context7_MCP/dist/src/server.js"]
    }
  }
}
```

### VS Code with Copilot

Add to your VS Code MCP settings:

```json
{
  "mcpServers": {
    "stdio-context7": {
      "command": "node",
      "args": ["/path/to/STDIO_Context7_MCP/dist/src/server.js"]
    }
  }
}
```

### Docker in MCP Clients

```json
{
  "mcpServers": {
    "stdio-context7": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--stop-timeout",
        "10",
        "dolasoft/stdio-context7-mcp:latest"
      ]
    }
  }
}
```

## Available Tools

### 1. resolve-library-id

Resolves a general library name into a Context7-compatible library ID.

**Parameters:**
- `libraryName` (required): The name of the library to search for

**Example:**
```typescript
{
  "libraryName": "react"
}
```

**Response:**
```
Found library: React
Library ID: /facebook/react
Description: A JavaScript library for building user interfaces
```

### 2. get-library-docs

Fetches documentation for a library using a Context7-compatible library ID.

**Parameters:**
- `context7CompatibleLibraryID` (required): Exact library ID (e.g., `/mongodb/docs`)
- `topic` (optional): Focus docs on a specific topic (e.g., "routing", "hooks")
- `tokens` (optional): Max tokens to return (default: 5000, minimum: 1000)

**Example:**
```typescript
{
  "context7CompatibleLibraryID": "/facebook/react",
  "topic": "hooks",
  "tokens": 3000
}
```

**Response:**
```markdown
# React Documentation

A JavaScript library for building user interfaces

## Topic: hooks

This section focuses on hooks in React.

## Getting Started

Here you would find comprehensive documentation and examples for React.
```

## Using with AI Assistants

### In Cursor or Claude Desktop

Simply mention the library in your prompt and ask the AI to use context7:

```
Create a Next.js middleware that checks for a valid JWT. use context7
```

Or reference a specific library ID:

```
Implement authentication with Supabase. use library /supabase/supabase
```

### Adding a Rule (Recommended)

Add a rule to your MCP client to automatically use Context7:

**For Cursor** (in Cursor Settings → Rules):
```
Always use context7 when I need code generation, setup or configuration steps,
or library/API documentation. This means you should automatically use the
Context7 MCP tools without me having to explicitly ask.
```

**For Claude Code** (in CLAUDE.md):
```markdown
Use context7 MCP tools for all library documentation and code examples.
```

**For Windsurf** (in .windsurfrules):
```
Use context7 for fetching library documentation and examples.
```

## Supported Libraries

This server uses the **real Context7 API** and supports **all libraries** available in the Context7 ecosystem. Simply use the `resolve-library-id` tool to find any library, including:

- **React** (`/facebook/react`) - UI library
- **Next.js** (`/vercel/next.js`) - React framework
- **Express** (`/expressjs/express`) - Node.js web framework
- **MongoDB** (`/mongodb/docs`) - Database documentation
- **Supabase** (`/supabase/supabase`) - Backend platform
- **And thousands more...**

The server fetches up-to-date documentation directly from Context7's live API.

## Development

### Project Structure

```
STDIO_Context7_MCP/
├── src/                   # Source code
│   ├── config/           # Configuration management
│   ├── constants/        # Application constants
│   ├── handlers/         # MCP request handlers
│   ├── server/           # Server initialization
│   ├── services/         # Business logic services
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── server.ts         # Main entry point
├── examples/              # MCP client configuration examples
│   ├── with-api-key.json
│   ├── without-api-key.json
│   └── README.md
├── tests/                 # Test suite
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── setup.ts          # Test setup
├── dist/                  # Compiled output
│   └── src/              # Compiled TypeScript
├── coverage/              # Test coverage reports
├── package.json           # Project configuration
├── tsconfig.json          # TypeScript config
├── tsconfig.test.json     # Test TypeScript config
├── vitest.config.ts       # Vitest configuration
├── eslint.config.js       # ESLint configuration
├── Dockerfile             # Docker image definition
├── build-docker.sh        # Docker build script
├── run-mcp.sh            # MCP runner script
└── README.md             # This file
```

### Building

```bash
# Compile TypeScript
npm run build

# Watch mode
npm run dev
```

### Testing

```bash
# Build and run
npm run dev

# Test with MCP inspector (if available)
npx @modelcontextprotocol/inspector node dist/index.js
```

## Docker Deployment

### Security Features

This MCP server Docker image is built with enterprise-grade security features:

- **SBOMs (Software Bill of Materials)**: Automatically generates CycloneDX SBOMs for vulnerability scanning
- **Provenance Attestations**: Build provenance metadata for supply chain security verification
- **Image Signing Support**: Compatible with Cosign for cryptographic signing
- **Multi-Architecture Support**: Builds for `linux/amd64`, `linux/arm64`, `linux/arm/v7`
- **Security Hardening**: Non-root user (UID 1001), minimal Alpine Linux base, updated CA certificates

### Quick Start

#### Using the Build Script

```bash
# Build with default settings (multi-arch)
./build-docker.sh

# Build for single platform (faster for testing)
PLATFORMS=linux/amd64 ./build-docker.sh

# Build and push to registry
REGISTRY=docker.io/yourusername IMAGE_NAME=stdio-context7-mcp ./build-docker.sh
```

#### Manual Build

```bash
# Single architecture (local testing)
docker build -t stdio-context7-mcp:latest .
docker run -i stdio-context7-mcp:latest

# Multi-architecture build with security features
docker buildx create --name mcp-builder --use
docker buildx build \
  --platform linux/amd64,linux/arm64,linux/arm/v7 \
  --tag yourusername/stdio-context7-mcp:1.0.0 \
  --provenance=true \
  --sbom=true \
  --push \
  .
```

### Security Best Practices

```bash
# Vulnerability scanning
trivy image --severity HIGH,CRITICAL stdio-context7-mcp:latest

# Run with security hardening
docker run -i \
  --read-only \
  --security-opt=no-new-privileges:true \
  --cap-drop=ALL \
  --network=none \
  stdio-context7-mcp:latest
```

### Image Signing (Optional)

```bash
# Install Cosign
brew install cosign  # macOS
# or download from GitHub releases

# Generate keys
cosign generate-key-pair

# Sign image
cosign sign --key cosign.key yourusername/stdio-context7-mcp:1.0.0

# Verify signature
cosign verify --key cosign.pub yourusername/stdio-context7-mcp:1.0.0
```

## Troubleshooting

### Server Not Responding

1. Check that the server is running: `ps aux | grep node`
2. Verify the path in your MCP client configuration
3. Check logs in your MCP client
4. Ensure Node.js version is >= 18.0.0

### Library Not Found

1. Use `resolve-library-id` first to find the correct library ID
2. Check the list of supported libraries in this README
3. Ensure the library ID format is correct (e.g., `/org/repo`)

### Docker Issues

1. Ensure Docker is running: `docker ps`
2. Check container logs: `docker logs <container-id>`
3. Verify the image was built: `docker images | grep stdio-context7`

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests and build: `npm run build`
5. Commit your changes: `git commit -am 'Add new feature'`
6. Push to the branch: `git push origin feature/your-feature`
7. Submit a pull request

## Roadmap

- [x] Real Context7 API integration ✅
- [x] Caching mechanism for better performance ✅
- [ ] HTTP/SSE transport support
- [ ] Version-specific documentation
- [ ] Search functionality across libraries
- [ ] Rate limiting and quota management
- [ ] Offline fallback mode

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Inspired by [Context7](https://github.com/upstash/context7) by Upstash
- Built with [Model Context Protocol](https://modelcontextprotocol.io/)
- Powered by the [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

## Support

- 📖 Documentation: This README contains all necessary information
- 🐛 Issues: Report bugs in the issue tracker
- 💬 Discussions: Join the community discussions

---

Made with ❤️ for the MCP community
