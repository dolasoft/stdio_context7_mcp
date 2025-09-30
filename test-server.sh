#!/bin/bash
# Test script for STDIO Context7 MCP Server

echo "=== Testing STDIO Context7 MCP Server ==="
echo ""

echo "1. Testing server initialization..."
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' | node dist/index.js 2>/dev/null | jq .
echo ""

echo "2. Testing tools/list..."
(
  echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'
  echo '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
) | node dist/index.js 2>/dev/null | tail -1 | jq .
echo ""

echo "3. Testing resolve-library-id (react)..."
(
  echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'
  echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"resolve-library-id","arguments":{"libraryName":"react"}}}'
) | node dist/index.js 2>/dev/null | tail -1 | jq .
echo ""

echo "4. Testing get-library-docs (React)..."
(
  echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'
  echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get-library-docs","arguments":{"context7CompatibleLibraryID":"/facebook/react","tokens":1000}}}'
) | node dist/index.js 2>/dev/null | tail -1 | jq .
echo ""

echo "=== Tests Complete ==="
