#!/usr/bin/env node

/**
 * Simple MCP Client for testing the Context7 MCP Server
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Start the MCP server
const serverPath = join(__dirname, 'dist', 'server.js');
console.log('🚀 Starting MCP server:', serverPath);

const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Test messages
const testMessages = [
  // Initialize
  {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  },
  // List tools
  {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  },
  // Resolve library
  {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'resolve-library-id',
      arguments: {
        libraryName: 'react'
      }
    }
  },
  // Get library docs
  {
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'get-library-docs',
      arguments: {
        context7CompatibleLibraryID: '/facebook/react',
        topic: 'hooks',
        tokens: 2000
      }
    }
  }
];

let messageIndex = 0;

// Handle server output
server.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    try {
      const response = JSON.parse(line);
      console.log('📥 Server Response:', JSON.stringify(response, null, 2));
      
      // Send next message after a short delay
      if (messageIndex < testMessages.length) {
        setTimeout(() => {
          const message = testMessages[messageIndex++];
          console.log('📤 Sending:', JSON.stringify(message, null, 2));
          server.stdin.write(JSON.stringify(message) + '\n');
        }, 1000);
      } else {
        // All messages sent, close server
        setTimeout(() => {
          console.log('✅ Test completed, closing server...');
          server.kill();
        }, 2000);
      }
    } catch (error) {
      console.log('📄 Raw output:', line);
    }
  }
});

// Handle server errors
server.stderr.on('data', (data) => {
  console.error('❌ Server error:', data.toString());
});

// Handle server exit
server.on('close', (code) => {
  console.log(`🏁 Server exited with code ${code}`);
  process.exit(code);
});

// Send first message
setTimeout(() => {
  const message = testMessages[messageIndex++];
  console.log('📤 Sending:', JSON.stringify(message, null, 2));
  server.stdin.write(JSON.stringify(message) + '\n');
}, 1000);

// Handle process exit
process.on('SIGINT', () => {
  console.log('\n🛑 Interrupted, closing server...');
  server.kill();
  process.exit(0);
});
