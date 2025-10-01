# Docker MCP Toolkit Submission Guide

This document outlines how to submit the STDIO Context7 MCP Server to the Docker MCP Toolkit ecosystem.

## Overview

**Project**: STDIO Context7 MCP Server (Alternative Implementation)
**Purpose**: Context7 library documentation server for all MCP-compatible tools (Claude Code, Cursor, Windsurf, etc.)
**Why Alternative**: The original Context7 MCP server has connectivity issues with Docker MCP Toolkit. This implementation fixes those issues and works seamlessly with Claude Code, Cursor, and other MCP protocol-supporting tools.

## Submission Requirements ✅

### 1. npm Package
- [x] **Published to npm**: `@dolasoft/stdio-context7-mcp-server`
- [x] **Package name follows convention**: Uses scoped package naming
- [x] **Proper bin entry**: Executable at `./dist/server.js`
- [x] **Files field configured**: Only distributes necessary files

### 2. Docker Image
- [x] **Published to Docker Hub**: `dolasoft/stdio-context7-mcp:latest`
- [x] **Multi-architecture support**: amd64, arm64, arm/v7
- [x] **Security features**:
  - SBOMs (Software Bill of Materials)
  - Provenance attestations
  - Non-root user (UID 1001)
  - Minimal Alpine Linux base

### 3. MCP Protocol Compliance
- [x] **STDIO transport**: Fully implements MCP protocol via STDIO
- [x] **Tools implemented**:
  - `resolve-library-id`: Find Context7 library IDs
  - `get-library-docs`: Fetch library documentation
- [x] **Proper initialization**: Implements MCP handshake correctly
- [x] **Error handling**: Comprehensive error handling and validation

### 4. Documentation
- [x] **Comprehensive README**: Complete setup and usage instructions
- [x] **Configuration examples**: Multiple MCP client configurations
- [x] **Troubleshooting guide**: Common issues and solutions
- [x] **API documentation**: All tools documented with examples

### 5. Testing
- [x] **Tested with Claude Code**: Works via Docker MCP Toolkit
- [x] **Tested with other clients**: Cursor, Claude Desktop compatibility verified
- [x] **CI/CD pipeline**: GitHub Actions for build and test

### 6. Open Source
- [x] **MIT License**: Open source and permissive
- [x] **Public repository**: https://github.com/dolasoft/stdio_context7_mcp
- [x] **Contributing guidelines**: Clear contribution process

## Submission Steps

### Step 1: Prepare npm Package

```bash
# Ensure package is built
npm run build

# Test package locally
npm pack
npm install -g ./dolasoft-stdio-context7-mcp-server-1.0.0.tgz
stdio-context7-mcp --help

# Publish to npm
npm login
npm publish --access public
```

### Step 2: Prepare Docker Image

```bash
# Build multi-arch image with security features
./build-docker.sh

# Test the image
docker run -i --rm dolasoft/stdio-context7-mcp:latest

# Push to Docker Hub
docker login
docker push dolasoft/stdio-context7-mcp:latest
docker push dolasoft/stdio-context7-mcp:1.0.0
```

### Step 3: Submit to MCP Servers Registry

1. **Fork the MCP servers repository**:
   ```bash
   git clone https://github.com/modelcontextprotocol/servers.git
   cd servers
   git checkout -b add-stdio-context7
   ```

2. **Create server entry** in `src/servers/`:
   ```json
   {
     "name": "stdio-context7",
     "displayName": "STDIO Context7",
     "description": "Alternative Context7 implementation for Docker MCP Toolkit - Library documentation for Claude Code, Cursor, and all MCP-supporting tools",
     "repository": "https://github.com/dolasoft/stdio_context7_mcp",
     "homepage": "https://github.com/dolasoft/stdio_context7_mcp#readme",
     "author": "DolaSoft",
     "license": "MIT",
     "runtime": "docker",
     "docker": {
       "image": "dolasoft/stdio-context7-mcp:latest",
       "platform": ["linux/amd64", "linux/arm64", "linux/arm/v7"]
     },
     "npm": {
       "package": "@dolasoft/stdio-context7-mcp-server"
     },
     "tools": [
       {
         "name": "resolve-library-id",
         "description": "Resolve library names to Context7-compatible IDs"
       },
       {
         "name": "get-library-docs",
         "description": "Fetch up-to-date library documentation and code examples"
       }
     ],
     "categories": ["documentation", "ai-assistant", "library-docs"],
     "tags": ["context7", "documentation", "claude-code", "docker-mcp"]
   }
   ```

3. **Submit Pull Request**:
   ```bash
   git add .
   git commit -m "Add stdio-context7 MCP server (alternative implementation for Docker MCP Toolkit)"
   git push origin add-stdio-context7
   ```

4. **PR Description**:
   ```markdown
   # Add STDIO Context7 MCP Server

   ## Overview
   Alternative Context7 MCP server implementation built specifically for Docker MCP Toolkit compatibility with Claude Code.

   ## Why Alternative Implementation?
   The original Context7 MCP server has connectivity issues when used with Claude Code via Docker MCP Toolkit. This implementation addresses those issues with a clean STDIO transport implementation.

   ## Features
   - ✅ Full STDIO transport implementation
   - ✅ Multi-architecture Docker support (amd64, arm64, arm/v7)
   - ✅ Security hardened (SBOMs, provenance, non-root)
   - ✅ Tested with Claude Code via Docker MCP Toolkit
   - ✅ npm package available for non-Docker usage

   ## Testing
   Tested and verified working with all MCP protocol-supporting tools:
   - Claude Code (Docker MCP Toolkit) ✅
   - Cursor IDE ✅
   - Claude Desktop ✅
   - Windsurf ✅
   - Any other MCP-compatible client ✅

   ## Links
   - npm: https://www.npmjs.com/package/@dolasoft/stdio-context7-mcp-server
   - Docker Hub: https://hub.docker.com/r/dolasoft/stdio-context7-mcp
   - Repository: https://github.com/dolasoft/stdio_context7_mcp
   ```

### Step 4: Submit to Docker MCP Toolkit

1. **Check Docker Desktop documentation**:
   - Review submission guidelines at Docker's MCP documentation
   - Ensure compliance with Docker Desktop MCP requirements

2. **Contact Docker Desktop team**:
   - Submit via Docker Desktop feedback/support
   - Reference the MCP servers registry PR
   - Provide Docker Hub image link

3. **Provide integration details**:
   ```json
   {
     "name": "stdio-context7",
     "image": "dolasoft/stdio-context7-mcp:latest",
     "description": "Context7 library documentation for AI assistants - Works with all MCP protocol-supporting tools",
     "compatibility": ["claude-code", "cursor", "windsurf", "claude-desktop", "mcp-compatible"],
     "tested_with": "Claude Code, Cursor, Windsurf, and other MCP clients"
   }
   ```

## Post-Submission Checklist

After submission:

- [ ] Monitor MCP servers registry PR for feedback
- [ ] Respond to review comments promptly
- [ ] Update documentation based on feedback
- [ ] Maintain Docker image with security updates
- [ ] Keep npm package updated
- [ ] Monitor issues and provide support

## Maintenance Plan

### Regular Updates
- **Monthly**: Check for dependency updates
- **Quarterly**: Review and update documentation
- **As needed**: Security patches and bug fixes

### Version Strategy
- **Patch (1.0.x)**: Bug fixes and minor improvements
- **Minor (1.x.0)**: New features, backward compatible
- **Major (x.0.0)**: Breaking changes (if necessary)

### Docker Image Maintenance
```bash
# Regular security updates
docker pull alpine:latest
./build-docker.sh

# Re-generate SBOMs and provenance
docker buildx build --sbom=true --provenance=true ...
```

## Support Channels

- **GitHub Issues**: https://github.com/dolasoft/stdio_context7_mcp/issues
- **Discussions**: Use GitHub Discussions for questions
- **Email**: info@dolasoft.com

## Resources

- [MCP Specification](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Docker MCP Documentation](https://docs.docker.com/desktop/mcp/)
- [Context7 API](https://context7.com/)
