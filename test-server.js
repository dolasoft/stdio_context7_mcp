#!/usr/bin/env node

/**
 * Simple test script for the MCP server
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing MCP Server...\n');

// Test 1: Server starts without errors
console.log('1️⃣ Testing server startup...');
const serverPath = join(__dirname, 'dist', 'server.js');
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let serverStarted = false;
let testResults = [];

server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('📤 Server:', output.trim());
  
  if (output.includes('Server started successfully')) {
    serverStarted = true;
    testResults.push('✅ Server starts successfully');
  }
});

server.stderr.on('data', (data) => {
  const error = data.toString();
  console.error('❌ Server Error:', error.trim());
  testResults.push('❌ Server has errors');
});

// Test 2: Server responds to MCP messages
setTimeout(() => {
  if (serverStarted) {
    console.log('\n2️⃣ Testing MCP protocol...');
    
    // Send initialize message
    const initMessage = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' }
      }
    };
    
    console.log('📤 Sending initialize...');
    server.stdin.write(JSON.stringify(initMessage) + '\n');
    
    // Send tools/list message
    setTimeout(() => {
      const toolsMessage = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      };
      
      console.log('📤 Sending tools/list...');
      server.stdin.write(JSON.stringify(toolsMessage) + '\n');
      
      // Test resolve-library-id
      setTimeout(() => {
        const resolveMessage = {
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {
            name: 'resolve-library-id',
            arguments: { libraryName: 'react' }
          }
        };
        
        console.log('📤 Sending resolve-library-id...');
        server.stdin.write(JSON.stringify(resolveMessage) + '\n');
        
        // Close after testing
        setTimeout(() => {
          console.log('\n3️⃣ Testing graceful shutdown...');
          server.kill('SIGTERM');
        }, 2000);
      }, 1000);
    }, 1000);
  } else {
    console.log('❌ Server failed to start');
    server.kill();
  }
}, 2000);

// Handle server exit
server.on('close', (code) => {
  console.log(`\n📊 Test Results:`);
  testResults.forEach(result => console.log(result));
  console.log(`\n🏁 Server exited with code ${code}`);
  
  if (code === 0) {
    console.log('✅ All tests passed!');
  } else {
    console.log('❌ Some tests failed');
  }
  
  process.exit(code);
});

// Handle process exit
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted');
  server.kill();
  process.exit(0);
});
