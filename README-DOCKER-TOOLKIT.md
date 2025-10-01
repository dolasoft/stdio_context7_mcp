# Context7 Docs MCP Server for Docker Toolkit

> **Context7 library documentation server optimized for Docker MCP Toolkit integration**

[![Docker Build](https://github.com/dolasoft/stdio_stdio-context7_mcp/actions/workflows/docker-toolkit.yml/badge.svg)](https://github.com/dolasoft/stdio_stdio-context7_mcp/actions/workflows/docker-toolkit.yml)
[![Security Scan](https://github.com/dolasoft/stdio_stdio-context7_mcp/actions/workflows/security.yml/badge.svg)](https://github.com/dolasoft/stdio_stdio-context7_mcp/actions/workflows/security.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An enterprise-grade MCP server providing up-to-date library documentation and code examples through the Model Context Protocol. Built specifically for seamless integration with Docker MCP Toolkit and AI assistants.

## 🎯 Purpose

This MCP server is designed for the **Docker MCP Toolkit** ecosystem, providing:

- **🔍 Library Resolution**: Find Context7-compatible library IDs
- **📚 Documentation Retrieval**: Fetch comprehensive library docs and examples  
- **🎯 Topic Filtering**: Focus on specific topics within libraries
- **⚡ STDIO Transport**: Optimized for Docker container integration
- **🔐 Enterprise Security**: Non-root, read-only, minimal attack surface
- **🌍 Multi-Architecture**: Supports amd64, arm64 platforms

## ✨ Features

### MCP Capabilities
- **Tools**: `resolve-library-id`, `get-library-docs`, `generate-example`
- **Resources**: `library-list`, `library-docs`
- **Prompts**: `generate-example`, `explain-concept`

### Security Features
- **Non-root execution** (UID 1001)
- **Read-only filesystem** with minimal tmpfs
- **Dropped capabilities** (no privileged operations)
- **SBOM generation** for vulnerability scanning
- **Provenance attestations** for supply chain security
- **Multi-architecture builds** (amd64, arm64)

### Performance Features
- **Intelligent caching** with TTL management
- **Token optimization** (1000-5000 token range)
- **Concurrent request handling**
- **Memory-efficient** (512MB limit)

## 🚀 Quick Start

### Using Docker MCP Toolkit

1. **Enable MCP Toolkit** in Docker Desktop (Settings → Beta features)
2. **Add the server** to your MCP configuration:

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
        "--name",
        "stdio-context7-mcp",
        "--security-opt",
        "no-new-privileges:true",
        "--cap-drop",
        "ALL",
        "--read-only",
        "--tmpfs",
        "/tmp:noexec,nosuid,size=100m",
        "-e",
        "CONTEXT7_API_KEY=${CONTEXT7_API_KEY}",
        "ghcr.io/dolasoft/stdio_stdio-context7_mcp:latest"
      ]
    }
  }
}
```

3. **Set your API key** (optional but recommended):
```bash
export CONTEXT7_API_KEY="your-api-key-here"
```

4. **Restart your MCP client** and start using the tools!

### Using Docker Compose

```yaml
version: '3.8'
services:
  stdio-context7-mcp:
    image: ghcr.io/dolasoft/stdio_stdio-context7_mcp:latest
    container_name: stdio-context7-mcp
    environment:
      - CONTEXT7_API_KEY=${CONTEXT7_API_KEY}
      - LOG_LEVEL=info
    stdin_open: true
    tty: true
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    read_only: true
    tmpfs:
      - /tmp:noexec,nosuid,size=100m
```

## 🛠️ Available Tools

### 1. `resolve-library-id`
Find the correct Context7-compatible library ID for any library.

**Input:**
```json
{
  "libraryName": "react"
}
```

**Output:**
```
Found library: React
Library ID: /facebook/react
Description: A JavaScript library for building user interfaces
```

### 2. `get-library-docs`
Fetch comprehensive documentation for a library.

**Input:**
```json
{
  "stdio-context7CompatibleLibraryID": "/facebook/react",
  "topic": "hooks",
  "tokens": 3000
}
```

**Output:**
```markdown
# React Documentation

## Topic: hooks

Comprehensive documentation about React hooks including useState, useEffect, and custom hooks...
```

### 3. `generate-example`
Generate practical code examples for any library and topic.

**Input:**
```json
{
  "library": "react",
  "topic": "custom hooks",
  "language": "typescript"
}
```

**Output:**
```typescript
// Custom React Hook Example
import { useState, useEffect } from 'react';

function useCustomHook(initialValue: string) {
  const [value, setValue] = useState(initialValue);
  
  useEffect(() => {
    // Custom logic here
  }, [value]);
  
  return { value, setValue };
}
```

## 📚 Available Resources

### `stdio-context7://libraries`
Complete list of available libraries in JSON format.

### `stdio-context7://docs/{libraryId}`
Direct access to library documentation (e.g., `stdio-context7://docs/facebook/react`).

## 💬 Available Prompts

### `generate-example`
Generate a practical code example for a specific library and topic.

### `explain-concept`
Explain a programming concept with examples from a specific library.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `CONTEXT7_API_KEY` | Context7 API key for higher rate limits | - | No |
| `LOG_LEVEL` | Logging level (debug, info, warn, error) | `info` | No |
| `NODE_ENV` | Node.js environment | `production` | No |
| `MCP_SERVER_NAME` | MCP server name | `stdio-context7` | No |

### Docker Labels

The image includes comprehensive labels for Docker MCP Toolkit integration:

```dockerfile
LABEL com.docker.mcp.server.name="stdio-context7"
LABEL com.docker.mcp.server.version="1.0.0"
LABEL com.docker.mcp.server.description="Context7 library documentation server"
LABEL com.docker.mcp.server.transport="stdio"
LABEL com.docker.mcp.server.capabilities="tools,resources,prompts"
```

## 🔒 Security

### Container Security
- **Non-root user** (UID 1001)
- **Read-only filesystem** with minimal tmpfs
- **Dropped capabilities** (no privileged operations)
- **Security scanning** with Trivy
- **SBOM generation** for vulnerability tracking

### Network Security
- **No exposed ports** (STDIO transport only)
- **No network access** required for basic operation
- **API key encryption** in transit

### Supply Chain Security
- **Provenance attestations** for build verification
- **SBOM generation** for dependency tracking
- **Multi-architecture builds** with verification

## 🧪 Testing

### Test MCP Protocol
```bash
# Test basic MCP communication
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{"roots":{"listChanged":true},"sampling":{}},"clientInfo":{"name":"test-client","version":"1.0.0"}}}' | \
docker run -i --rm ghcr.io/dolasoft/stdio_stdio-context7_mcp:latest
```

### Test Tools
```bash
# Test tools list
echo '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' | \
docker run -i --rm ghcr.io/dolasoft/stdio_stdio-context7_mcp:latest
```

### Test with Docker Compose
```bash
# Start the service
docker-compose up -d

# Test the service
docker-compose exec stdio-context7-mcp sh -c "echo '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\",\"params\":{}}' | node dist/server.js"
```

## 📊 Monitoring

### Health Checks
The container includes a built-in health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD echo '{"jsonrpc":"2.0","id":1,"method":"ping","params":{}}' | timeout 5 node dist/server.js --transport stdio > /dev/null || exit 1
```

### Logging
Structured JSON logging with configurable levels:

```bash
# Enable debug logging
docker run -e LOG_LEVEL=debug ghcr.io/dolasoft/stdio_stdio-context7_mcp:latest
```

### Metrics
- Request count and response times
- Cache hit/miss ratios
- Error rates and types
- Memory usage and garbage collection

## 🚀 Deployment

### Production Deployment
```bash
# Pull the latest image
docker pull ghcr.io/dolasoft/stdio_stdio-context7_mcp:latest

# Run with production settings
docker run -d \
  --name stdio-context7-mcp \
  --restart unless-stopped \
  --security-opt no-new-privileges:true \
  --cap-drop ALL \
  --read-only \
  --tmpfs /tmp:noexec,nosuid,size=100m \
  -e CONTEXT7_API_KEY=your-key \
  -e LOG_LEVEL=info \
  ghcr.io/dolasoft/stdio_stdio-context7_mcp:latest
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: stdio-context7-mcp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: stdio-context7-mcp
  template:
    metadata:
      labels:
        app: stdio-context7-mcp
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      containers:
      - name: stdio-context7-mcp
        image: ghcr.io/dolasoft/stdio_stdio-context7_mcp:latest
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
        env:
        - name: CONTEXT7_API_KEY
          valueFrom:
            secretKeyRef:
              name: stdio-context7-secret
              key: api-key
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
          requests:
            memory: "256Mi"
            cpu: "250m"
        volumeMounts:
        - name: tmp
          mountPath: /tmp
      volumes:
      - name: tmp
        emptyDir:
          sizeLimit: 100Mi
```

## 🔧 Troubleshooting

### Common Issues

**1. Container won't start**
```bash
# Check logs
docker logs stdio-context7-mcp

# Check if image exists
docker images | grep stdio_stdio-context7_mcp
```

**2. MCP client can't connect**
```bash
# Test MCP protocol directly
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | \
docker run -i --rm ghcr.io/dolasoft/stdio_stdio-context7_mcp:latest
```

**3. API key issues**
```bash
# Test without API key (limited functionality)
docker run -i --rm ghcr.io/dolasoft/stdio_stdio-context7_mcp:latest

# Test with API key
docker run -i --rm -e CONTEXT7_API_KEY=your-key ghcr.io/dolasoft/stdio_stdio-context7_mcp:latest
```

### Debug Mode
```bash
# Enable debug logging
docker run -i --rm -e LOG_LEVEL=debug ghcr.io/dolasoft/stdio_stdio-context7_mcp:latest
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Clone the repository
git clone https://github.com/dolasoft/stdio_stdio-context7_mcp.git
cd stdio_stdio-context7_mcp

# Install dependencies
npm install

# Build the project
npm run build

# Test locally
npm run dev
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Context7](https://github.com/upstash/stdio-context7) by Upstash for the inspiration
- [Model Context Protocol](https://modelcontextprotocol.io/) for the protocol specification
- [Docker MCP Toolkit](https://docs.docker.com/ai/mcp-catalog-and-toolkit/) for the integration platform

## 📞 Support

- 📖 **Documentation**: This README and inline code documentation
- 🐛 **Issues**: [GitHub Issues](https://github.com/dolasoft/stdio_stdio-context7_mcp/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/dolasoft/stdio_stdio-context7_mcp/discussions)
- 📧 **Email**: contact@dolasoft.com

---

**Made with ❤️ for the Docker MCP Toolkit community**

[![GitHub stars](https://img.shields.io/github/stars/dolasoft/stdio_stdio-context7_mcp?style=social)](https://github.com/dolasoft/stdio_stdio-context7_mcp)
[![Docker pulls](https://img.shields.io/docker/pulls/dolasoft/stdio-stdio-context7-mcp?style=social)](https://hub.docker.com/r/dolasoft/stdio-stdio-context7-mcp)
