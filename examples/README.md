# MCP Client Configuration Examples

This directory contains example configurations for different MCP clients.

## Available Examples

### `claude-desktop.json` (Recommended)
Docker-based configuration for Claude Desktop with API key support. This is the recommended approach for most users.

### `cursor.json` (Recommended)
Docker-based configuration for Cursor IDE. This is the recommended approach for Cursor users.

### `nodejs.json`
Node.js-based configuration for users who prefer to run the server directly without Docker.

### `docker.json`
Generic Docker-based configuration for any MCP client.

## Usage

1. Copy the appropriate configuration file to your MCP client's config location
2. Update the paths and settings as needed
3. Restart your MCP client

## Configuration Locations

- **Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Cursor**: Settings → Cursor Settings → MCP
- **VS Code**: MCP extension settings

For more details, see the main [README.md](../README.md).
