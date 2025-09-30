# MCP Client Configuration Examples

This directory contains example configurations for the STDIO Context7 MCP Server.

## Available Examples

### `with-api-key.json` (Recommended)
Docker-based configuration with API key support. This provides full functionality and is recommended for most users.

### `without-api-key.json`
Docker-based configuration without API key. Limited functionality but useful for testing or development.

## Configuration Options

### Environment Variables

- `CONTEXT7_API_KEY`: Your Context7 API key (required for full functionality)
- `LOG_LEVEL`: Logging level (`debug`, `info`, `warn`, `error`) - default: `info`
- `CACHE_TTL`: Cache time-to-live in seconds - default: `3600`
- `NODE_ENV`: Environment mode (`development`, `production`) - default: `production`

### Docker Image Tags

- `dolasoft/stdio-context7-mcp:latest` - Latest stable release
- `dolasoft/stdio-context7-mcp:v1.0.0` - Specific version

## Usage

1. **Choose the appropriate configuration** based on whether you have an API key
2. **Copy the configuration** to your MCP client's config location
3. **For with-api-key.json**: Set your `CONTEXT7_API_KEY` environment variable
4. **Restart your MCP client**

## Configuration Locations

- **Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Cursor**: Settings → Cursor Settings → MCP
- **VS Code**: MCP extension settings

## Getting Your API Key

1. Visit [Context7](https://context7.io) and sign up
2. Navigate to your dashboard and generate an API key
3. Add the API key to your configuration

For more details, see the main [README.md](../README.md).
