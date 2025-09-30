# STDIO Context7 MCP Server

> Production-ready MCP server providing up-to-date library documentation via Context7 API

## Overview

This MCP server provides seamless access to Context7's comprehensive library documentation and code examples directly through the Model Context Protocol. It's designed for AI assistants and code editors that need up-to-date, accurate documentation for thousands of libraries.

## Features

- 🤖 **Real Context7 API Integration** - Direct access to live documentation
- 🔍 **Library Resolution** - Resolve library names to Context7-compatible IDs  
- 📚 **Documentation Retrieval** - Fetch up-to-date docs with topic filtering
- ⚡ **STDIO Transport** - Fast, local integration with MCP clients
- 🐳 **Docker Ready** - Multi-arch container with security hardening
- 🔐 **Enterprise Security** - SBOMs, provenance, non-root user
- 🌍 **Multi-Architecture** - Supports amd64, arm64, and arm/v7

## Quick Start

### Docker (Recommended)

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
        "yourusername/stdio-context7-mcp:latest"
      ]
    }
  }
}
```

### Node.js

```json
{
  "mcpServers": {
    "stdio-context7": {
      "command": "node",
      "args": [
        "/path/to/STDIO_Context7_MCP/dist/server.js"
      ]
    }
  }
}
```

## Available Tools

### 1. resolve-library-id
Resolves a library name to a Context7-compatible library ID.

**Parameters:**
- `libraryName` (required): The name of the library to search for

**Example:**
```json
{
  "libraryName": "react"
}
```

### 2. get-library-docs
Fetches documentation for a library using a Context7-compatible library ID.

**Parameters:**
- `context7CompatibleLibraryID` (required): Exact library ID (e.g., `/facebook/react`)
- `topic` (optional): Focus docs on a specific topic (e.g., "hooks", "routing")
- `tokens` (optional): Max tokens to return (default: 5000, minimum: 1000)

**Example:**
```json
{
  "context7CompatibleLibraryID": "/facebook/react",
  "topic": "hooks",
  "tokens": 3000
}
```

## Supported Libraries

This server supports **all libraries** available in the Context7 ecosystem, including:

- **React** (`/facebook/react`) - UI library
- **Next.js** (`/vercel/next.js`) - React framework  
- **Express** (`/expressjs/express`) - Node.js web framework
- **MongoDB** (`/mongodb/docs`) - Database documentation
- **Supabase** (`/supabase/supabase`) - Backend platform
- **And thousands more...**

## Docker Image

**Image:** `yourusername/stdio-context7-mcp:latest`

**Features:**
- Multi-architecture support (linux/amd64, linux/arm64, linux/arm/v7)
- Security hardened with non-root user
- SBOMs and provenance attestations
- Minimal attack surface

**Size:** ~150MB (production optimized)

## Configuration

### Environment Variables

- `CONTEXT7_API_KEY` (optional): API key for higher rate limits
- `INACTIVITY_TIMEOUT_MS` (optional): Server timeout in milliseconds (default: 5 minutes)

### Docker Environment

```bash
docker run -i --rm \
  -e CONTEXT7_API_KEY=your_key \
  -e INACTIVITY_TIMEOUT_MS=300000 \
  yourusername/stdio-context7-mcp:latest
```

## Development

### Prerequisites

- Node.js >= 18.0.0
- Docker (for containerized deployment)

### Local Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Lint code
npm run lint

# Build project
npm run build

# Start server
npm start
```

### CI/CD

The project includes GitHub Actions for:
- Automated testing on Node.js 18, 20, 21
- ESLint code quality checks
- Multi-arch Docker builds
- Automated publishing to Docker Hub

## Security

- **Non-root user** (UID 1001) for runtime security
- **SBOMs** (Software Bill of Materials) for vulnerability scanning
- **Provenance attestations** for supply chain security
- **Minimal Alpine Linux** base image
- **Regular security updates** via automated builds

## License

MIT License - see [LICENSE](LICENSE) file for details

## Support

- 📖 **Documentation**: [README.md](README.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/STDIO_Context7_MCP/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/STDIO_Context7_MCP/discussions)

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

**Made with ❤️ for the MCP community**
