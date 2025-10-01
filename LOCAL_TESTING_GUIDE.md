# Local Testing Guide for STDIO Context7 MCP Server

This guide explains how to test your MCP server locally with Claude Desktop using Docker containers.

## Prerequisites

- Docker installed and running
- Claude Desktop installed
- Context7 API key (optional, for full functionality)

## Quick Start

### 1. Build the Docker Image

```bash
# Build the MCP server Docker image
./build-docker.sh

# Or build for a single platform (faster for testing)
PLATFORMS=linux/amd64 ./build-docker.sh
```

### 2. Test the Docker Image Directly

```bash
# Test basic MCP protocol communication
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{"roots":{"listChanged":true},"sampling":{}},"clientInfo":{"name":"test-client","version":"1.0.0"}}}' | docker run -i --rm stdio-context7-mcp:latest
```

Expected output:
```json
{"result":{"protocolVersion":"2024-11-05","capabilities":{"tools":{}},"serverInfo":{"name":"stdio-context7-mcp","version":"1.0.0"}},"jsonrpc":"2.0","id":1}
```

### 3. Configure Claude Desktop

#### Option A: With API Key (Recommended)

1. Copy the configuration:
```bash
cp examples/local-test-config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

2. Set your Context7 API key:
```bash
export CONTEXT7_API_KEY="your-api-key-here"
```

#### Option B: Without API Key (Limited functionality)

1. Copy the configuration:
```bash
cp examples/without-api-key.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

2. Update the image name in the config:
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
        "stdio-context7-mcp:latest"
      ]
    }
  }
}
```

### 4. Restart Claude Desktop

1. Quit Claude Desktop completely
2. Restart Claude Desktop
3. The MCP server should now be available in Claude

## Testing the MCP Server

### Available Tools

Your MCP server provides the following tools:

1. **resolve-library-id**: Resolve library names to Context7-compatible IDs
2. **get-library-docs**: Fetch documentation for specific libraries

### Test Commands in Claude

Try these commands in Claude Desktop:

1. **Resolve a library ID:**
   - "Resolve the library ID for 'react'"
   - "Find the Context7 ID for 'next.js'"

2. **Get library documentation:**
   - "Get documentation for React hooks"
   - "Show me Next.js routing documentation"

### Debugging

#### Check Docker Container Logs

```bash
# Run with debug logging
docker run -i --rm \
  -e LOG_LEVEL=debug \
  -e NODE_ENV=development \
  stdio-context7-mcp:latest
```

#### Test MCP Protocol Manually

```bash
# Initialize the server
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{"roots":{"listChanged":true},"sampling":{}},"clientInfo":{"name":"test-client","version":"1.0.0"}}}' | docker run -i --rm stdio-context7-mcp:latest

# List available tools
echo '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' | docker run -i --rm stdio-context7-mcp:latest
```

## Configuration Options

### Environment Variables

- `CONTEXT7_API_KEY`: Your Context7 API key (required for full functionality)
- `LOG_LEVEL`: Logging level (`debug`, `info`, `warn`, `error`) - default: `info`
- `CACHE_TTL`: Cache time-to-live in seconds - default: `3600`
- `NODE_ENV`: Environment mode (`development`, `production`) - default: `production`

### Docker Image Tags

- `stdio-context7-mcp:latest` - Latest built image
- `stdio-context7-mcp:test` - Test image (if available)

## Troubleshooting

### Common Issues

1. **"Unable to find image" error**
   - Make sure you've built the image: `./build-docker.sh`
   - Check available images: `docker images | grep stdio-context7`

2. **MCP server not appearing in Claude**
   - Restart Claude Desktop completely
   - Check the configuration file path: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Verify JSON syntax is valid

3. **API key not working**
   - Ensure the environment variable is set: `echo $CONTEXT7_API_KEY`
   - Check if the API key is valid by testing the Context7 API directly

4. **Docker permission issues**
   - Make sure Docker is running
   - Check if you have permission to run Docker containers

### Debug Commands

```bash
# Check if the image exists
docker images | grep stdio-context7

# Test the container manually
docker run -i --rm stdio-context7-mcp:latest

# Check container logs
docker logs $(docker ps -q --filter ancestor=stdio-context7-mcp:latest)

# Remove old containers
docker ps -aq --filter ancestor=stdio-context7-mcp:latest | xargs -r docker rm
```

## Development Workflow

### Making Changes

1. Make your code changes
2. Rebuild the Docker image: `./build-docker.sh`
3. Restart Claude Desktop
4. Test your changes

### Faster Development

For faster iteration during development:

```bash
# Build for your platform only
PLATFORMS=linux/amd64 ./build-docker.sh

# Use the test image for quick testing
docker tag stdio-context7-mcp:latest stdio-context7-mcp:test
```

## Next Steps

- Test with different libraries and documentation requests
- Monitor performance and caching behavior
- Consider adding more tools or improving existing ones
- Set up automated testing for the MCP server

## Support

If you encounter issues:

1. Check the logs with debug level enabled
2. Verify your Docker and Claude Desktop installations
3. Test the MCP protocol manually using the commands above
4. Check the [main README](README.md) for additional information
