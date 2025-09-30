# STDIO Context7 MCP Server - Development Plan

## Project Overview

Create a TypeScript-based Model Context Protocol (MCP) server inspired by Context7 that provides up-to-date library documentation and code examples for AI assistants. The server will use STDIO transport and be deployable as a Docker container for the MCP toolkit catalog.

## Architecture & Technology Stack

### Core Technologies
- **TypeScript**: Type-safe development with ES modules
- **Node.js**: Runtime environment (>= 18.0.0)
- **MCP SDK**: Official `@modelcontextprotocol/sdk` for protocol implementation
- **Zod**: Schema validation for tool inputs
- **Docker**: Containerization for deployment

### Transport Protocol
- **STDIO** (Standard Input/Output): Primary transport for local integrations
- Compatible with MCP clients: Claude Desktop, Cursor, VS Code, Windsurf, Claude Code

## Project Structure

```
STDIO_Context7_MCP/
├── src/
│   └── index.ts           # Main server implementation
├── dist/                  # Compiled JavaScript output
├── node_modules/          # Dependencies
├── package.json           # Project configuration
├── tsconfig.json          # TypeScript configuration
├── Dockerfile             # Docker image definition
├── .dockerignore          # Docker ignore patterns
├── PLAN.md               # This development plan
└── README.md             # User documentation
```

## Implementation Details

### 1. Server Initialization
- Create MCP `Server` instance with metadata:
  - Name: `stdio-context7-mcp`
  - Version: `1.0.0`
  - Capabilities: `tools`
- Configure STDIO transport using `StdioServerTransport`
- Parse CLI arguments for configuration:
  - `--api-key`: Optional API key for authentication
  - `--transport`: Transport type (default: stdio)

### 2. Tools Implementation

#### Tool 1: `resolve-library-id`
**Purpose**: Resolve a library name to a Context7-compatible library ID

**Input Schema**:
```typescript
{
  libraryName: string  // The library name to search for
}
```

**Output**: Library information including:
- Library name
- Context7-compatible library ID (e.g., `/facebook/react`)
- Description

**Implementation**:
- Maintain a library database (simulated for demo)
- Case-insensitive library name matching
- Return library details or error if not found

#### Tool 2: `get-library-docs`
**Purpose**: Fetch documentation for a specific library

**Input Schema**:
```typescript
{
  context7CompatibleLibraryID: string,  // Required: Library ID
  topic?: string,                        // Optional: Specific topic
  tokens?: number                        // Optional: Max tokens (default: 5000, min: 1000)
}
```

**Output**: Formatted documentation including:
- Library name and description
- Topic-specific content (if requested)
- Getting started guide
- Configuration info

**Implementation**:
- Validate library ID exists
- Apply token limits (minimum 1000)
- Generate formatted documentation
- Support topic filtering

### 3. Library Database

Simulated library database for demonstration:
```typescript
{
  "react": { id: "/facebook/react", name: "React", ... },
  "nextjs": { id: "/vercel/next.js", name: "Next.js", ... },
  "express": { id: "/expressjs/express", name: "Express", ... },
  "mongodb": { id: "/mongodb/docs", name: "MongoDB", ... },
  "supabase": { id: "/supabase/supabase", name: "Supabase", ... }
}
```

**Note**: In production, this would fetch from Context7 API

### 4. Error Handling
- Validate all inputs using Zod schemas
- Graceful error responses with clear messages
- Proper error logging to stderr
- Non-zero exit codes for fatal errors

## Build & Deployment

### Local Development
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run server
npm start

# Development mode
npm run dev
```

### Docker Deployment

#### Multi-stage Build Process
1. **Builder stage**:
   - Use Node.js 18 Alpine
   - Install all dependencies
   - Compile TypeScript

2. **Production stage**:
   - Use Node.js 18 Alpine
   - Install only production dependencies
   - Copy compiled code from builder
   - Create non-root user for security
   - Set executable permissions

#### Docker Commands
```bash
# Build image
docker build -t stdio-context7-mcp .

# Run container
docker run -i stdio-context7-mcp

# Run with API key
docker run -i stdio-context7-mcp --api-key YOUR_KEY
```

## Configuration for MCP Clients

### Claude Desktop
Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "stdio-context7": {
      "command": "node",
      "args": ["/path/to/STDIO_Context7_MCP/dist/index.js", "--api-key", "YOUR_KEY"]
    }
  }
}
```

### Cursor / VS Code
Add to MCP settings:
```json
{
  "mcpServers": {
    "stdio-context7": {
      "command": "node",
      "args": ["/path/to/STDIO_Context7_MCP/dist/index.js"]
    }
  }
}
```

### Docker MCP Toolkit
```json
{
  "mcpServers": {
    "stdio-context7": {
      "command": "docker",
      "args": ["run", "-i", "stdio-context7-mcp"]
    }
  }
}
```

## Features & Capabilities

### Current Features
- ✅ STDIO transport for local integration
- ✅ Library name resolution
- ✅ Documentation retrieval
- ✅ Topic-specific filtering
- ✅ Token limit control
- ✅ CLI argument support
- ✅ Docker containerization
- ✅ Non-root user security

### Future Enhancements
- 🔄 HTTP/SSE transport support
- 🔄 Real Context7 API integration
- 🔄 Caching mechanism
- 🔄 More comprehensive library database
- 🔄 Version-specific documentation
- 🔄 Search functionality
- 🔄 Rate limiting with API keys

## Security Considerations

1. **Docker Security**:
   - Non-root user (UID 1001)
   - Minimal Alpine base image
   - Production dependencies only
   - No unnecessary ports exposed

2. **Input Validation**:
   - Zod schema validation on all inputs
   - Type safety with TypeScript
   - Sanitized error messages

3. **API Key Management**:
   - Passed via CLI arguments
   - Never logged or exposed
   - Optional for basic usage

## Testing Strategy

### Manual Testing
- Test each tool with valid inputs
- Test error cases (invalid library names, IDs)
- Test CLI arguments
- Test Docker container execution

### Integration Testing
- Test with Claude Desktop
- Test with Cursor
- Test with VS Code
- Verify STDIO communication

## Publication & Distribution

### NPM Package (Optional)
- Publish to npm registry as `stdio-context7-mcp`
- Users can install via: `npm install -g stdio-context7-mcp`
- Run via: `stdio-context7-mcp --api-key YOUR_KEY`

### Docker Hub
- Push image to Docker Hub
- Tag versions appropriately
- Provide clear usage documentation

### MCP Toolkit Catalog
- Submit to official MCP toolkit catalog
- Provide Docker image reference
- Include configuration examples

## Development Timeline

1. ✅ Project setup and dependencies
2. ✅ TypeScript configuration
3. ✅ Core server implementation
4. ✅ Tool implementations
5. ✅ Build scripts and configuration
6. ✅ Docker containerization
7. ✅ Documentation
8. 🔄 Testing and validation
9. 🔄 Publication to catalogs

## References

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Context7 Original](https://github.com/upstash/context7)
- [MCP Specification](https://spec.modelcontextprotocol.io/)

## Maintenance & Support

- Monitor MCP SDK updates
- Keep dependencies up to date
- Address security vulnerabilities
- Respond to user issues
- Enhance documentation based on feedback

---

**Status**: Implementation Complete ✅
**Next Steps**: Testing and publication
