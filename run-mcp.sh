#!/bin/bash
# Simple wrapper for MCP server with cleanup

# Clean up any existing containers
docker ps -q --filter ancestor=stdio-context7-mcp:test | xargs -r docker stop
docker ps -aq --filter ancestor=stdio-context7-mcp:test | xargs -r docker rm

# Run with timeout
timeout 300 docker run -i --rm stdio-context7-mcp:test "$@"
