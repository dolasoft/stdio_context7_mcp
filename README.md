# STDIO Context7 MCP Server

[![npm version](https://img.shields.io/npm/v/@dolasoft/stdio-context7-mcp-server?style=flat-square&logo=npm)](https://www.npmjs.com/package/@dolasoft/stdio-context7-mcp-server)
[![Docker Image](https://img.shields.io/docker/v/dolasoft/stdio-context7-mcp?style=flat-square&logo=docker&label=docker)](https://hub.docker.com/r/dolasoft/stdio-context7-mcp)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/dolasoft/stdio_context7_mcp/docker-toolkit.yml?style=flat-square&logo=github&label=build)](https://github.com/dolasoft/stdio_context7_mcp/actions)
[![License](https://img.shields.io/github/license/dolasoft/stdio_context7_mcp?style=flat-square)](./LICENSE)
[![MCP Protocol](https://img.shields.io/badge/MCP-2024--11--05-blue?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMiA3TDEyIDEyTDIyIDdMMTIgMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yIDEyTDEyIDE3TDIyIDEyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTIgMTdMMTIgMjJMMjIgMTciIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4=)](https://modelcontextprotocol.io/)
[![Docker MCP Toolkit](https://img.shields.io/badge/Docker_MCP-Toolkit-2496ED?style=flat-square&logo=docker)](https://www.docker.com/products/docker-desktop/)
[![Claude Code](https://img.shields.io/badge/Claude-Code-orange?style=flat-square&logo=anthropic)](https://claude.ai/code)

> Alternative Context7 MCP implementation built to work with Claude Code via Docker MCP Toolkit

An alternative implementation of the Context7 MCP server, designed to work seamlessly with **Claude Code via Docker MCP Toolkit**. This version provides up-to-date library documentation and code examples through STDIO transport, addressing connectivity issues with the original Context7 server in Docker MCP environments.

## 🎯 Purpose

This is an **alternative MCP server** to the original Context7, specifically created to solve connectivity issues with Docker MCP Toolkit. Built with the specific goals of:
- **Docker MCP Toolkit Compatible**: Works reliably with Claude Code via Docker Desktop's MCP infrastructure (where the original doesn't)
- **Claude Code Optimized**: First-class support for Claude Code IDE workflows
- **Enhanced STDIO Transport**: Direct, efficient communication via standard input/output
- **Production-Ready Security**: Enterprise-grade Docker image with SBOMs, provenance, and signing support
- **Universal Compatibility**: Works with all MCP-compatible AI assistants (Claude, Cursor, Windsurf, etc.)

## ✨ Features

- 🐳 **Docker MCP Toolkit Native**: Built for Docker Desktop MCP integration
- 🤖 **Claude Code First**: Optimized for Claude Code IDE workflows
- 🔍 **Library Resolution**: Resolve library names to Context7-compatible IDs
- 📚 **Documentation Retrieval**: Fetch up-to-date documentation and code examples
- 🎯 **Topic Filtering**: Focus on specific topics within libraries
- ⚡ **STDIO Transport**: Fast, local integration with MCP clients
- 🐳 **Production Docker**: Multi-arch with SBOMs, provenance, and security hardening
- 🔐 **Enterprise Security**: Non-root user, minimal attack surface, Alpine Linux base
- 🌍 **Multi-Architecture**: Supports amd64, arm64, and arm/v7 platforms
- 🔄 **Universal Compatibility**: Works with Cursor, Windsurf, and other MCP clients

## Installation

### Prerequisites

- Node.js >= 20.8.1
- npm >= 10.0.0
- Docker (optional, for containerized deployment)

### npm Installation

```bash
npm install -g @dolasoft/stdio-context7-mcp-server
```

### Docker Installation

```bash
# Pull the official image
docker pull dolasoft/stdio-context7-mcp:latest
```

## Usage

### CLI Arguments

- `--api-key <key>`: Context7 API key for authentication (optional, get one at [context7.com/dashboard](https://context7.com/dashboard) for higher rate limits)

## MCP Client Configuration

### 🐳 Docker MCP Toolkit (Recommended)

This server is **built for Docker MCP Toolkit** and integrates seamlessly with **Claude Code**. Using Docker provides the most reliable and secure deployment option.

**For Docker Desktop MCP:**
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

### 🤖 Claude Code

This server is **optimized for Claude Code via Docker MCP Toolkit**. Add to your MCP configuration:

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

**Pro tip**: Add this to your `CLAUDE.md` for automatic Context7 usage:
```markdown
## Context7 Integration

Use the stdio-context7 MCP server for library documentation and code examples.
Always use `resolve-library-id` first, then `get-library-docs`.
```

### Other MCP Clients

For Claude Desktop, Cursor, Windsurf, or any MCP-compatible client:

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


## Supported Libraries

This server uses the **real Context7 API** and supports **all libraries** available in the Context7 ecosystem. Simply use the `resolve-library-id` tool to find any library, including:

- **React** (`/facebook/react`) - UI library
- **Next.js** (`/vercel/next.js`) - React framework
- **Express** (`/expressjs/express`) - Node.js web framework
- **MongoDB** (`/mongodb/docs`) - Database documentation
- **Supabase** (`/supabase/supabase`) - Backend platform
- **And thousands more...**

The server fetches up-to-date documentation directly from Context7's live API.


## Security

The Docker image is built with enterprise-grade security:

- **Non-root user** (UID 1001)
- **Multi-architecture**: amd64, arm64, arm/v7
- **SBOMs & Provenance**: Full supply chain transparency
- **Alpine Linux**: Minimal attack surface
- **Regular updates**: Automated security patches

## Troubleshooting

**Server not responding?**
- Verify Docker is running: `docker ps`
- Check MCP client logs for connection errors
- Ensure correct image: `docker pull dolasoft/stdio-context7-mcp:latest`

**Library not found?**
- Always use `resolve-library-id` first to find the correct library ID
- Ensure library ID format is correct (e.g., `/org/repo`)

## Contributing

Contributions welcome! Fork, create a feature branch, and submit a PR.

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Powered by [Context7 API](https://context7.com) by Upstash
- Built with [Model Context Protocol](https://modelcontextprotocol.io/)

---

Built for the MCP community and Docker MCP Toolkit
