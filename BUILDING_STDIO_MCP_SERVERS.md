# Building Production-Ready STDIO MCP Servers

> **Universal Guide**: Complete reference for building Model Context Protocol servers with STDIO transport, enterprise security features, and Docker deployment

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Project Setup](#project-setup)
4. [Server Implementation](#server-implementation)
5. [Tool Development](#tool-development)
6. [Docker Implementation](#docker-implementation)
7. [Build & Deploy](#build--deploy)
8. [MCP Client Configuration](#mcp-client-configuration)
9. [Security Best Practices](#security-best-practices)
10. [Testing & Debugging](#testing--debugging)
11. [Complete Example](#complete-example)

---

## Introduction

### What is MCP?

**Model Context Protocol (MCP)** is an open standard by Anthropic that enables AI applications to connect to external data sources and tools. It provides a standardized way for AI assistants like Claude to interact with custom services.

### What is STDIO Transport?

**STDIO (Standard Input/Output)** transport allows MCP servers to communicate through stdin/stdout streams. This is ideal for:

- **Local integrations** with Claude Code, Claude Desktop, Cursor, VS Code
- **Simple deployment** without network configuration
- **Better security** (no exposed ports)
- **Docker compatibility** (simple `docker run -i` command)

### When to Use STDIO vs HTTP

| Use STDIO When | Use HTTP When |
|----------------|---------------|
| Local development | Remote server deployment |
| Claude Code/Desktop | Web-based integrations |
| Single-user tools | Multi-user services |
| Docker containers | Microservices architecture |
| No network needed | Need REST API access |

---

## Prerequisites

### Required Software

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **TypeScript**: >= 5.0.0
- **Docker**: >= 24.0.0 (optional, for containerization)
- **Docker Buildx**: For multi-arch builds

### Required Knowledge

- TypeScript/JavaScript basics
- Async/await patterns
- Docker fundamentals (optional)
- MCP protocol basics (will be covered)

### Install Prerequisites

```bash
# Check Node.js version
node --version  # Should be >= 18.0.0

# Check npm version
npm --version

# Install TypeScript globally (optional)
npm install -g typescript

# Check Docker (optional)
docker --version
docker buildx version
```

---

## Project Setup

### 1. Initialize Project

```bash
# Create project directory
mkdir my-stdio-mcp-server
cd my-stdio-mcp-server

# Initialize npm project
npm init -y
```

### 2. Install Dependencies

```bash
# Install runtime dependencies
npm install @modelcontextprotocol/sdk zod

# Install development dependencies
npm install --save-dev typescript @types/node
```

### 3. Create package.json

Update your `package.json` with the following configuration:

```json
{
  "name": "my-stdio-mcp-server",
  "version": "1.0.0",
  "description": "STDIO MCP Server with enterprise security features",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "my-mcp-server": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc && chmod +x dist/index.js",
    "start": "node dist/index.js",
    "dev": "npm run build && npm start",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [
    "mcp",
    "model-context-protocol",
    "stdio",
    "llm",
    "ai"
  ],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.18.2",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@types/node": "^24.6.0",
    "typescript": "^5.9.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**Key configurations**:
- `"type": "module"`: Enable ES modules
- `"bin"`: Makes your server executable as CLI tool
- `"build"`: Compiles TypeScript and makes output executable

### 4. Create tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Why these settings**:
- `"module": "Node16"`: Proper ES module support
- `"strict": true`: Maximum type safety
- `"sourceMap": true`: Better debugging experience

### 5. Create Project Structure

```bash
mkdir -p src
touch src/index.ts
```

Your project structure should look like:

```
my-stdio-mcp-server/
├── src/
│   └── index.ts          # Main server implementation
├── package.json
├── tsconfig.json
├── .gitignore
├── .dockerignore         # If using Docker
├── Dockerfile            # If using Docker
└── build-docker.sh       # If using Docker
```

### 6. Create .gitignore

```gitignore
# Dependencies
node_modules/
package-lock.json

# Build output
dist/

# Logs
*.log
npm-debug.log*

# Environment variables
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/
```

### 7. Create .dockerignore (if using Docker)

```dockerignore
node_modules
dist
npm-debug.log
.git
.gitignore
README.md
.env
.DS_Store
*.md
.vscode
.idea
```

---

## Server Implementation

### Complete Server Template

Create `src/index.ts` with the following template:

```typescript
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// ============================================================================
// CLI Argument Parsing
// ============================================================================

const args = process.argv.slice(2);
let apiKey = "";
let transport = "stdio";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--api-key" && args[i + 1]) {
    apiKey = args[i + 1];
    i++;
  } else if (args[i] === "--transport" && args[i + 1]) {
    transport = args[i + 1];
    i++;
  }
}

// ============================================================================
// Server Configuration
// ============================================================================

const server = new Server(
  {
    name: "my-stdio-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ============================================================================
// Tool Schemas (Define your tools here)
// ============================================================================

// Example: Simple greeting tool
const GreetingSchema = z.object({
  name: z.string().describe("Name of the person to greet"),
});

// Example: Data processing tool
const ProcessDataSchema = z.object({
  data: z.string().describe("Data to process"),
  operation: z.enum(["uppercase", "lowercase", "reverse"]).describe("Operation to perform"),
});

// ============================================================================
// Tool Listing Handler
// ============================================================================

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "greeting",
        description: "Returns a personalized greeting message",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Name of the person to greet",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "process-data",
        description: "Processes data with specified operation",
        inputSchema: {
          type: "object",
          properties: {
            data: {
              type: "string",
              description: "Data to process",
            },
            operation: {
              type: "string",
              enum: ["uppercase", "lowercase", "reverse"],
              description: "Operation to perform",
            },
          },
          required: ["data", "operation"],
        },
      },
    ],
  };
});

// ============================================================================
// Tool Execution Handler
// ============================================================================

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "greeting") {
      const parsed = GreetingSchema.parse(args);

      return {
        content: [
          {
            type: "text",
            text: `Hello, ${parsed.name}! Welcome to the MCP server.`,
          },
        ],
      };
    }

    else if (name === "process-data") {
      const parsed = ProcessDataSchema.parse(args);
      let result = "";

      switch (parsed.operation) {
        case "uppercase":
          result = parsed.data.toUpperCase();
          break;
        case "lowercase":
          result = parsed.data.toLowerCase();
          break;
        case "reverse":
          result = parsed.data.split("").reverse().join("");
          break;
      }

      return {
        content: [
          {
            type: "text",
            text: `Operation: ${parsed.operation}\nInput: ${parsed.data}\nResult: ${result}`,
          },
        ],
      };
    }

    else {
      return {
        content: [
          {
            type: "text",
            text: `Unknown tool: ${name}`,
          },
        ],
        isError: true,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// ============================================================================
// Server Startup
// ============================================================================

async function main() {
  if (transport === "stdio") {
    const stdio = new StdioServerTransport();
    await server.connect(stdio);
    console.error("MCP Server running on stdio transport");
  } else {
    console.error(`Transport "${transport}" is not supported yet. Only stdio is supported.`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
```

### Key Implementation Patterns

#### 1. Shebang Line

```typescript
#!/usr/bin/env node
```

**Why**: Makes the file executable as a CLI tool. Essential for MCP clients to run your server directly.

#### 2. CLI Argument Parsing

```typescript
const args = process.argv.slice(2);
let apiKey = "";
let transport = "stdio";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--api-key" && args[i + 1]) {
    apiKey = args[i + 1];
    i++;
  }
}
```

**Why**: Allows configuration without environment variables. Common pattern for MCP servers.

#### 3. Server Initialization

```typescript
const server = new Server(
  {
    name: "my-stdio-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);
```

**Why**: Declares server identity and capabilities to MCP clients.

#### 4. Error Handling

```typescript
try {
  // Tool logic
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return {
    content: [{ type: "text", text: `Error: ${errorMessage}` }],
    isError: true,
  };
}
```

**Why**: Proper error handling prevents server crashes and provides useful feedback.

#### 5. Console.error for Logging

```typescript
console.error("MCP Server running on stdio transport");
```

**Why**: `console.log` goes to stdout (used for MCP protocol). Use `console.error` for logging.

---

## Tool Development

### Tool Development Pattern

Each tool requires three components:

1. **Zod Schema** - Input validation
2. **Tool Definition** - Description and JSON schema
3. **Tool Handler** - Execution logic

### Example: Creating a New Tool

Let's create a tool that calculates statistics from an array of numbers.

#### Step 1: Define Zod Schema

```typescript
const StatisticsSchema = z.object({
  numbers: z.array(z.number()).describe("Array of numbers to analyze"),
  operations: z.array(z.enum(["mean", "median", "mode", "sum"]))
    .describe("Statistics to calculate"),
});
```

#### Step 2: Add Tool Definition

In `ListToolsRequestSchema` handler:

```typescript
{
  name: "calculate-statistics",
  description: "Calculates statistics (mean, median, mode, sum) from an array of numbers",
  inputSchema: {
    type: "object",
    properties: {
      numbers: {
        type: "array",
        items: { type: "number" },
        description: "Array of numbers to analyze",
      },
      operations: {
        type: "array",
        items: {
          type: "string",
          enum: ["mean", "median", "mode", "sum"],
        },
        description: "Statistics to calculate",
      },
    },
    required: ["numbers", "operations"],
  },
}
```

#### Step 3: Implement Tool Handler

In `CallToolRequestSchema` handler:

```typescript
else if (name === "calculate-statistics") {
  const parsed = StatisticsSchema.parse(args);
  const results: Record<string, number> = {};

  if (parsed.operations.includes("sum")) {
    results.sum = parsed.numbers.reduce((a, b) => a + b, 0);
  }

  if (parsed.operations.includes("mean")) {
    results.mean = parsed.numbers.reduce((a, b) => a + b, 0) / parsed.numbers.length;
  }

  if (parsed.operations.includes("median")) {
    const sorted = [...parsed.numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    results.median = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  if (parsed.operations.includes("mode")) {
    const frequency = new Map<number, number>();
    parsed.numbers.forEach(num => {
      frequency.set(num, (frequency.get(num) || 0) + 1);
    });
    const maxFreq = Math.max(...frequency.values());
    results.mode = [...frequency.entries()]
      .find(([_, freq]) => freq === maxFreq)?.[0] || 0;
  }

  return {
    content: [
      {
        type: "text",
        text: `Statistics Results:\n${JSON.stringify(results, null, 2)}`,
      },
    ],
  };
}
```

### Tool Best Practices

1. **Clear Descriptions**: Make tool descriptions actionable and specific
2. **Validate Everything**: Use Zod schemas for type safety
3. **Handle Errors Gracefully**: Return useful error messages
4. **Return Structured Data**: Format output clearly
5. **Document Parameters**: Describe what each parameter does
6. **Use Enums**: For predefined options, use enums instead of free text

### Complex Tool Example: API Integration

```typescript
// Schema
const FetchWebsiteSchema = z.object({
  url: z.string().url().describe("URL to fetch"),
  method: z.enum(["GET", "POST"]).default("GET"),
  headers: z.record(z.string()).optional().describe("HTTP headers"),
});

// Handler
else if (name === "fetch-website") {
  const parsed = FetchWebsiteSchema.parse(args);

  try {
    const response = await fetch(parsed.url, {
      method: parsed.method,
      headers: parsed.headers,
    });

    const text = await response.text();

    return {
      content: [
        {
          type: "text",
          text: `Status: ${response.status}\n\nContent:\n${text.slice(0, 1000)}...`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Failed to fetch: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
      isError: true,
    };
  }
}
```

---

## Docker Implementation

### Complete Dockerfile

Create `Dockerfile` with enterprise security features:

```dockerfile
# syntax=docker/dockerfile:1.4
# Multi-stage build with security hardening, SBOMs, provenance, and multi-arch support

# ============================================================================
# Builder Stage - Compile TypeScript and generate SBOMs
# ============================================================================
FROM --platform=$BUILDPLATFORM node:18-alpine AS builder

# Build arguments for multi-arch support
ARG TARGETPLATFORM
ARG BUILDPLATFORM
ARG TARGETOS
ARG TARGETARCH

# Install build dependencies and security tools
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies with audit
RUN npm ci --ignore-scripts && \
    npm audit --audit-level=moderate || true

# Generate SBOM (Software Bill of Materials) for dependencies
RUN npm install -g @cyclonedx/cyclonedx-npm && \
    cyclonedx-npm --output-file sbom-dependencies.json || true

# Copy source code
COPY src/ ./src/

# Build the TypeScript code
RUN npm run build

# Generate SBOM for the complete application
RUN cyclonedx-npm --output-file sbom-application.json || true

# ============================================================================
# Production Stage - Hardened runtime environment
# ============================================================================
FROM node:18-alpine AS production

# Add image metadata and labels for provenance
LABEL org.opencontainers.image.title="My STDIO MCP Server"
LABEL org.opencontainers.image.description="MCP server providing tools via STDIO transport"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="YourCompany"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/yourusername/my-stdio-mcp-server"
LABEL org.opencontainers.image.documentation="https://github.com/yourusername/my-stdio-mcp-server/blob/main/README.md"

# Security hardening: Install dumb-init for proper signal handling and update CA certificates
RUN apk add --no-cache \
    dumb-init \
    ca-certificates \
    tini \
    && rm -rf /var/cache/apk/* \
    && update-ca-certificates

# Set working directory
WORKDIR /app

# Create a non-root user with specific UID/GID for security
RUN addgroup -g 1001 -S mcp && \
    adduser -S mcp -u 1001 -G mcp && \
    mkdir -p /app/dist && \
    chown -R mcp:mcp /app

# Copy package files
COPY --chown=mcp:mcp package*.json ./

# Install only production dependencies with security audit
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force && \
    npm audit fix --only=prod || true

# Copy built application and SBOMs from builder stage
COPY --from=builder --chown=mcp:mcp /app/dist ./dist
COPY --from=builder --chown=mcp:mcp /app/sbom-*.json ./

# Make the binary executable
RUN chmod +x ./dist/index.js

# Security: Remove unnecessary files and set read-only permissions
RUN find /app -type f -name "*.md" -delete && \
    find /app -type d -exec chmod 755 {} \; && \
    find /app -type f -exec chmod 644 {} \; && \
    chmod 755 ./dist/index.js

# Switch to non-root user
USER mcp

# Set secure environment variables
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=512" \
    NPM_CONFIG_LOGLEVEL=warn

# Security: Use tini as init system for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Default command - run with stdio transport
CMD ["node", "dist/index.js", "--transport", "stdio"]
```

### Dockerfile Security Features Explained

#### 1. Multi-Stage Build

```dockerfile
FROM --platform=$BUILDPLATFORM node:18-alpine AS builder
# ... build steps ...
FROM node:18-alpine AS production
```

**Benefits**:
- Smaller final image (~70% reduction)
- Dev dependencies not included in production
- Faster deployments
- Reduced attack surface

#### 2. SBOM Generation

```dockerfile
RUN npm install -g @cyclonedx/cyclonedx-npm && \
    cyclonedx-npm --output-file sbom-application.json || true
```

**Benefits**:
- Complete inventory of all dependencies
- Vulnerability scanning
- Supply chain security
- Compliance requirements

#### 3. Multi-Architecture Support

```dockerfile
ARG TARGETPLATFORM
ARG BUILDPLATFORM
FROM --platform=$BUILDPLATFORM node:18-alpine AS builder
```

**Benefits**:
- Works on Intel, ARM, Raspberry Pi
- Single image for all platforms
- Better performance (native vs emulated)

#### 4. Non-Root User

```dockerfile
RUN addgroup -g 1001 -S mcp && \
    adduser -S mcp -u 1001 -G mcp
USER mcp
```

**Benefits**:
- Limits damage from exploits
- Security best practice
- Container escape protection

#### 5. Tini Init System

```dockerfile
ENTRYPOINT ["/sbin/tini", "--"]
```

**Benefits**:
- Proper signal handling
- Zombie process reaping
- Graceful shutdown

#### 6. Provenance Labels

```dockerfile
LABEL org.opencontainers.image.source="https://github.com/..."
LABEL org.opencontainers.image.version="1.0.0"
```

**Benefits**:
- Build traceability
- Supply chain verification
- Compliance documentation

---

## Build & Deploy

### Build Script

Create `build-docker.sh`:

```bash
#!/bin/bash
# Docker build script with security features, SBOM generation, provenance, and multi-arch support

set -e

# Configuration
IMAGE_NAME="${IMAGE_NAME:-my-stdio-mcp-server}"
REGISTRY="${REGISTRY:-docker.io/yourusername}"
VERSION="${VERSION:-1.0.0}"
PLATFORMS="${PLATFORMS:-linux/amd64,linux/arm64,linux/arm/v7}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Building MCP Server with Security Features${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if Docker Buildx is available
if ! docker buildx version > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker Buildx is not available${NC}"
    echo "Please install Docker Desktop or enable Buildx"
    exit 1
fi

# Create or use existing buildx builder
BUILDER_NAME="mcp-builder"
if ! docker buildx inspect ${BUILDER_NAME} > /dev/null 2>&1; then
    echo -e "${YELLOW}Creating new buildx builder: ${BUILDER_NAME}${NC}"
    docker buildx create --name ${BUILDER_NAME} --driver docker-container --bootstrap
fi

echo -e "${YELLOW}Using builder: ${BUILDER_NAME}${NC}"
docker buildx use ${BUILDER_NAME}

# Build with multi-arch support, provenance, and SBOM
echo -e "${GREEN}Building multi-architecture images...${NC}"
echo -e "Platforms: ${PLATFORMS}"
echo -e "Image: ${REGISTRY}/${IMAGE_NAME}:${VERSION}"

docker buildx build \
    --platform ${PLATFORMS} \
    --build-arg VERSION=${VERSION} \
    --tag ${REGISTRY}/${IMAGE_NAME}:${VERSION} \
    --tag ${REGISTRY}/${IMAGE_NAME}:latest \
    --provenance=true \
    --sbom=true \
    --output type=image,push=false \
    --progress=plain \
    .

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Build completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Image built: ${REGISTRY}/${IMAGE_NAME}:${VERSION}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Test the image locally:"
echo -e "   ${GREEN}docker run -i ${REGISTRY}/${IMAGE_NAME}:${VERSION}${NC}"
echo ""
echo "2. Push to registry (requires authentication):"
echo -e "   ${GREEN}docker buildx build --platform ${PLATFORMS} --push --tag ${REGISTRY}/${IMAGE_NAME}:${VERSION} .${NC}"
echo ""
echo "3. Sign the image (optional, requires cosign):"
echo -e "   ${GREEN}cosign sign ${REGISTRY}/${IMAGE_NAME}:${VERSION}${NC}"
echo ""
echo -e "${YELLOW}To build for a single platform (faster for testing):${NC}"
echo -e "   ${GREEN}PLATFORMS=linux/amd64 ./build-docker.sh${NC}"
```

Make it executable:

```bash
chmod +x build-docker.sh
```

### Building Locally (Without Docker)

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Test locally
npm start
```

### Building with Docker

#### Single Architecture (Local Testing)

```bash
docker build -t my-mcp-server:latest .
```

#### Multi-Architecture (Production)

```bash
# Use the build script
./build-docker.sh

# Or manually with buildx
docker buildx build \
  --platform linux/amd64,linux/arm64,linux/arm/v7 \
  --tag yourusername/my-mcp-server:1.0.0 \
  --provenance=true \
  --sbom=true \
  --push \
  .
```

### Publishing to Docker Hub

```bash
# 1. Login to Docker Hub
docker login

# 2. Build and push (using build script)
REGISTRY=docker.io/yourusername IMAGE_NAME=my-mcp-server VERSION=1.0.0 ./build-docker.sh

# 3. Push the built image
docker buildx build \
  --platform linux/amd64,linux/arm64,linux/arm/v7 \
  --tag yourusername/my-mcp-server:1.0.0 \
  --tag yourusername/my-mcp-server:latest \
  --provenance=true \
  --sbom=true \
  --push \
  .
```

### Image Signing with Cosign

```bash
# 1. Install Cosign
# macOS
brew install cosign

# Linux
wget https://github.com/sigstore/cosign/releases/download/v2.0.0/cosign-linux-amd64
chmod +x cosign-linux-amd64
sudo mv cosign-linux-amd64 /usr/local/bin/cosign

# 2. Generate key pair (first time only)
cosign generate-key-pair

# 3. Sign the image
cosign sign --key cosign.key yourusername/my-mcp-server:1.0.0

# 4. Verify signature
cosign verify --key cosign.pub yourusername/my-mcp-server:1.0.0
```

---

## MCP Client Configuration

### Claude Code (Recommended)

Claude Code is optimized for STDIO MCP servers. Add to your MCP configuration file:

**Location**: `~/.config/claude/mcp.json` (Linux/macOS) or `%APPDATA%\claude\mcp.json` (Windows)

#### Using Node.js (Local Development)

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "node",
      "args": [
        "/absolute/path/to/my-stdio-mcp-server/dist/index.js",
        "--transport",
        "stdio"
      ]
    }
  }
}
```

#### Using Docker (Production)

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "yourusername/my-mcp-server:latest"
      ]
    }
  }
}
```

#### With API Key

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "node",
      "args": [
        "/absolute/path/to/my-stdio-mcp-server/dist/index.js",
        "--api-key",
        "your-api-key-here"
      ]
    }
  }
}
```

#### Auto-Usage Rule (CLAUDE.md)

Create `CLAUDE.md` in your project root:

```markdown
## MCP Server Integration

Always use the my-mcp-server MCP server when you need:
- [Describe what your server does]
- [List specific use cases]
- [Mention key tools available]

Use the available tools without me having to explicitly ask.
```

### Claude Desktop

**Location**: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "node",
      "args": [
        "/absolute/path/to/my-stdio-mcp-server/dist/index.js"
      ]
    }
  }
}
```

### Cursor

**Location**: Settings → Cursor Settings → MCP → Add new global MCP server

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/my-stdio-mcp-server/dist/index.js"]
    }
  }
}
```

### VS Code with Copilot

Add to your VS Code MCP settings:

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/my-stdio-mcp-server/dist/index.js"]
    }
  }
}
```

### Using npx (Alternative)

If you publish to npm:

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "npx",
      "args": ["-y", "my-mcp-server"]
    }
  }
}
```

---

## Security Best Practices

### 1. SBOM Management

#### View SBOM

```bash
# Extract from running container
docker run --rm yourusername/my-mcp-server:latest cat sbom-application.json | jq

# Copy from image
docker create --name temp yourusername/my-mcp-server:latest
docker cp temp:/app/sbom-application.json ./
docker rm temp
```

#### Vulnerability Scanning

```bash
# Using Grype
grype yourusername/my-mcp-server:latest

# Using Trivy
trivy image yourusername/my-mcp-server:latest

# Using Snyk
snyk container test yourusername/my-mcp-server:latest
```

### 2. Regular Updates

```bash
# Update dependencies
npm update
npm audit fix

# Rebuild with latest patches
docker build --no-cache -t my-mcp-server:latest .
```

### 3. Runtime Security

```bash
# Run with additional security options
docker run -i \
  --read-only \
  --security-opt=no-new-privileges:true \
  --cap-drop=ALL \
  --network=none \
  yourusername/my-mcp-server:latest
```

### 4. Image Verification

```bash
# Verify signature before using
cosign verify --key cosign.pub yourusername/my-mcp-server:1.0.0

# Check provenance
docker buildx imagetools inspect yourusername/my-mcp-server:1.0.0 --format "{{json .Provenance}}"
```

### 5. Security Checklist

- [ ] Non-root user configured in Dockerfile
- [ ] SBOM generation enabled
- [ ] Multi-arch support implemented
- [ ] Provenance labels added
- [ ] Image signed with Cosign
- [ ] Dependencies audited (`npm audit`)
- [ ] Vulnerability scanning integrated in CI/CD
- [ ] Read-only filesystem where possible
- [ ] Minimal base image (Alpine)
- [ ] No secrets in image or environment variables
- [ ] Regular security updates scheduled

---

## Testing & Debugging

### Local Testing

#### 1. Build and Run

```bash
# Build
npm run build

# Run
npm start

# Or combined
npm run dev
```

#### 2. Test with MCP Inspector

The MCP Inspector is a debugging tool for MCP servers:

```bash
# Install globally
npm install -g @modelcontextprotocol/inspector

# Run with inspector
npx @modelcontextprotocol/inspector node dist/index.js
```

This opens a web UI where you can:
- View available tools
- Test tool calls
- Inspect request/response data
- Debug schema validation

### Docker Testing

```bash
# Build
docker build -t my-mcp-server:test .

# Run interactively
docker run -i my-mcp-server:test

# Test with inspector
docker run -p 3000:3000 my-mcp-server:test
```

### Manual STDIO Testing

You can manually test the STDIO protocol:

```bash
# Start server
npm start

# In another terminal, send JSON-RPC messages
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npm start
```

### Common Issues

#### Issue: "Module not found"

```bash
# Solution: Check tsconfig.json module settings
# Ensure: "module": "Node16", "moduleResolution": "Node16"
npm run build
```

#### Issue: "Permission denied"

```bash
# Solution: Make output executable
chmod +x dist/index.js
```

#### Issue: "Cannot find package"

```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Docker build fails on multi-arch

```bash
# Solution: Setup buildx properly
docker buildx rm mcp-builder
docker buildx create --name mcp-builder --use
docker buildx inspect --bootstrap
```

### Debugging Tips

1. **Use console.error for logging** (console.log interferes with STDIO)
2. **Check MCP client logs** for error messages
3. **Validate JSON schemas** using online validators
4. **Test tools independently** before integration
5. **Use TypeScript strict mode** to catch errors early

---

## Complete Example

Let's build a complete STDIO MCP server from scratch.

### Step 1: Initialize Project

```bash
# Create directory
mkdir weather-mcp-server
cd weather-mcp-server

# Initialize npm
npm init -y

# Install dependencies
npm install @modelcontextprotocol/sdk zod
npm install --save-dev typescript @types/node
```

### Step 2: Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 3: Update package.json

```json
{
  "name": "weather-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "weather-mcp": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc && chmod +x dist/index.js",
    "start": "node dist/index.js",
    "dev": "npm run build && npm start"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.18.2",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@types/node": "^24.6.0",
    "typescript": "^5.9.2"
  }
}
```

### Step 4: Create Server

Create `src/index.ts`:

```typescript
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Weather data (simulated)
const weatherDatabase: Record<string, { temp: number; condition: string; humidity: number }> = {
  "new york": { temp: 22, condition: "Sunny", humidity: 60 },
  "london": { temp: 15, condition: "Cloudy", humidity: 75 },
  "tokyo": { temp: 25, condition: "Rainy", humidity: 80 },
};

const server = new Server(
  { name: "weather-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Schemas
const GetWeatherSchema = z.object({
  city: z.string().describe("City name to get weather for"),
});

const CompareWeatherSchema = z.object({
  city1: z.string().describe("First city"),
  city2: z.string().describe("Second city"),
});

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get-weather",
        description: "Get current weather for a city",
        inputSchema: {
          type: "object",
          properties: {
            city: { type: "string", description: "City name" },
          },
          required: ["city"],
        },
      },
      {
        name: "compare-weather",
        description: "Compare weather between two cities",
        inputSchema: {
          type: "object",
          properties: {
            city1: { type: "string", description: "First city" },
            city2: { type: "string", description: "Second city" },
          },
          required: ["city1", "city2"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "get-weather") {
      const { city } = GetWeatherSchema.parse(args);
      const weather = weatherDatabase[city.toLowerCase()];

      if (!weather) {
        return {
          content: [{
            type: "text",
            text: `Weather data not available for ${city}`,
          }],
          isError: true,
        };
      }

      return {
        content: [{
          type: "text",
          text: `Weather in ${city}:\nTemperature: ${weather.temp}°C\nCondition: ${weather.condition}\nHumidity: ${weather.humidity}%`,
        }],
      };
    }

    if (name === "compare-weather") {
      const { city1, city2 } = CompareWeatherSchema.parse(args);
      const w1 = weatherDatabase[city1.toLowerCase()];
      const w2 = weatherDatabase[city2.toLowerCase()];

      if (!w1 || !w2) {
        return {
          content: [{
            type: "text",
            text: `Weather data not available for one or both cities`,
          }],
          isError: true,
        };
      }

      const tempDiff = Math.abs(w1.temp - w2.temp);
      return {
        content: [{
          type: "text",
          text: `Comparison:\n${city1}: ${w1.temp}°C, ${w1.condition}\n${city2}: ${w2.temp}°C, ${w2.condition}\nTemperature difference: ${tempDiff}°C`,
        }],
      };
    }

    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const stdio = new StdioServerTransport();
  await server.connect(stdio);
  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
```

### Step 5: Build and Test

```bash
# Build
npm run build

# Expected output:
# ✓ TypeScript compilation successful
# ✓ dist/index.js created and executable

# Test run (will wait for input on stdin)
npm start
# Press Ctrl+C to exit

# Test with MCP Inspector
npx @modelcontextprotocol/inspector node dist/index.js
```

### Step 6: Create Dockerfile

Create `Dockerfile`:

```dockerfile
# syntax=docker/dockerfile:1.4
FROM --platform=$BUILDPLATFORM node:18-alpine AS builder

ARG TARGETPLATFORM
ARG BUILDPLATFORM

WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci --ignore-scripts

RUN npm install -g @cyclonedx/cyclonedx-npm && \
    cyclonedx-npm --output-file sbom.json || true

COPY src/ ./src/
RUN npm run build

FROM node:18-alpine AS production

LABEL org.opencontainers.image.title="Weather MCP Server"
LABEL org.opencontainers.image.version="1.0.0"

RUN apk add --no-cache tini ca-certificates && \
    rm -rf /var/cache/apk/*

WORKDIR /app

RUN addgroup -g 1001 -S mcp && \
    adduser -S mcp -u 1001 -G mcp && \
    chown -R mcp:mcp /app

COPY --chown=mcp:mcp package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder --chown=mcp:mcp /app/dist ./dist
COPY --from=builder --chown=mcp:mcp /app/sbom.json ./

USER mcp

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]
```

### Step 7: Build Docker Image

```bash
# Build
docker build -t weather-mcp:latest .

# Test
docker run -i weather-mcp:latest
```

### Step 8: Configure Claude Code

Create `~/.config/claude/mcp.json`:

```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": [
        "/absolute/path/to/weather-mcp-server/dist/index.js"
      ]
    }
  }
}
```

### Step 9: Test with Claude Code

```bash
# Start Claude Code
claude

# In Claude, ask:
"What's the weather in Tokyo?"
"Compare weather between London and New York"
```

---

## Conclusion

You now have a complete understanding of building production-ready STDIO MCP servers with:

✅ **TypeScript implementation** with proper type safety
✅ **STDIO transport** for local integrations
✅ **Tool development patterns** with Zod validation
✅ **Docker containerization** with security hardening
✅ **SBOM generation** for vulnerability management
✅ **Multi-architecture support** for all platforms
✅ **Image signing** with Cosign
✅ **MCP client configuration** for Claude Code, Desktop, Cursor
✅ **Testing and debugging** workflows
✅ **Complete working example**

### Next Steps

1. **Customize the template** for your specific use case
2. **Add more tools** to extend functionality
3. **Integrate external APIs** for real data
4. **Publish to Docker Hub** for easy distribution
5. **Set up CI/CD** for automated builds and security scanning
6. **Share with the community** and contribute back

### Resources

- **MCP Documentation**: https://modelcontextprotocol.io/
- **MCP TypeScript SDK**: https://github.com/modelcontextprotocol/typescript-sdk
- **Claude Code**: https://docs.anthropic.com/claude/claude-code
- **Docker Security**: https://docs.docker.com/engine/security/
- **Cosign**: https://github.com/sigstore/cosign

---

**Made with ❤️ for the MCP community**

For questions, issues, or contributions, please visit the project repository or open an issue.
