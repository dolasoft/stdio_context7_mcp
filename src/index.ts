#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Tool name constants
const TOOL_RESOLVE_LIBRARY_ID = "resolve-library-id";
const TOOL_GET_LIBRARY_DOCS = "get-library-docs";

// Token limits for documentation
const MIN_TOKENS = 1000;
const DEFAULT_TOKENS = 5000;

// Context7 API configuration
const CONTEXT7_API_BASE = "https://context7.com/api/v1";
const CONTEXT7_MCP_URL = "https://mcp.context7.com/mcp";

// Context7 MCP server session ID for HTTP calls
let context7SessionId: string | null = null;

// Cache for resolved libraries and documentation
const libraryResolveCache = new Map<string, { id: string; name: string; description: string }>();
const docsCache = new Map<string, { docs: string; timestamp: number }>();
const DOCS_CACHE_TTL = 1000 * 60 * 60; // 1 hour

// Dynamic library resolution - no hardcoded mappings
// All resolution will be done through Context7 MCP server or direct API calls

// Parse CLI arguments
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

/**
 * Makes a direct HTTP call to Context7 MCP server
 * Returns null if call fails (fallback to direct API)
 */
async function callContext7MCP(method: string, params: any): Promise<any> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream",
    };

    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    if (context7SessionId) {
      headers["MCP-Session-Id"] = context7SessionId;
    }

    const response = await fetch(CONTEXT7_MCP_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method,
        params
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Parse SSE response
    const text = await response.text();
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.substring(6));
        
        // Extract session ID from response headers
        const sessionId = response.headers.get('MCP-Session-Id');
        if (sessionId) {
          context7SessionId = sessionId;
        }
        
        return data;
      }
    }

    throw new Error("No valid response data found");
  } catch (error) {
    console.error("Context7 MCP call failed:", error);
    return null;
  }
}

/**
 * Resolves a library name to Context7-compatible library ID
 * First tries Context7 MCP server, then falls back to direct API search
 */
async function resolveLibraryId(libraryName: string): Promise<{ id: string; name: string; description: string }> {
  // Check cache first
  const cacheKey = libraryName.toLowerCase().trim();
  const cached = libraryResolveCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Try Context7 MCP server first
  try {
    const result = await callContext7MCP("tools/call", {
      name: "resolve-library-id",
      arguments: { libraryName }
    });

    if (result && result.result && result.result.content && Array.isArray(result.result.content) && result.result.content.length > 0) {
      const text = result.result.content[0].text;
      
      // Parse the Context7 response to find the best match
      const lines = text.split('\n');
      let bestMatch = null;
      let highestTrustScore = 0;
      
      // Look for the library with the highest trust score
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('Context7-compatible library ID:')) {
          const idMatch = line.match(/Context7-compatible library ID: (.+)/);
          if (idMatch) {
            const id = idMatch[1];
            
            // Look for trust score in nearby lines
            let trustScore = 0;
            for (let j = Math.max(0, i-5); j < Math.min(lines.length, i+5); j++) {
              const trustMatch = lines[j].match(/Trust Score: ([\d.]+)/);
              if (trustMatch) {
                trustScore = parseFloat(trustMatch[1]);
                break;
              }
            }
            
            // Look for name and description
            let name = libraryName;
            let description = "No description available";
            
            for (let j = Math.max(0, i-10); j < Math.min(lines.length, i+10); j++) {
              const nameMatch = lines[j].match(/- Title: (.+)/);
              if (nameMatch) {
                name = nameMatch[1];
              }
              const descMatch = lines[j].match(/- Description: (.+)/);
              if (descMatch) {
                description = descMatch[1];
              }
            }
            
            if (trustScore > highestTrustScore) {
              highestTrustScore = trustScore;
              bestMatch = {
                id,
                name,
                description
              };
            }
          }
        }
      }
      
      if (bestMatch) {
        // Cache the result
        libraryResolveCache.set(cacheKey, bestMatch);
        return bestMatch;
      }
    }
  } catch (error) {
    console.error("Context7 MCP resolve failed, falling back to direct API:", error);
  }

  // Fallback to direct API search
  try {
    const searchUrl = new URL(`${CONTEXT7_API_BASE}/search`);
    searchUrl.searchParams.set("q", libraryName);
    searchUrl.searchParams.set("limit", "1");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const response = await fetch(searchUrl.toString(), { headers });

    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const library = {
          id: result.id || `/${result.owner}/${result.repo}`,
          name: result.name || result.repo,
          description: result.description || "No description available"
        };
        
        // Cache the result
        libraryResolveCache.set(cacheKey, library);
        return library;
      }
    }
  } catch (error) {
    console.error("Direct API search failed:", error);
  }

  // If all else fails, suggest using the full library ID format
  throw new Error(
    `Library "${libraryName}" not found. ` +
    `Please try using the full library ID format (e.g., "/facebook/react", "/vercel/next.js") or check the library name spelling. ` +
    `You can also try searching for a more specific library name.`
  );
}

/**
 * Fetches library documentation from Context7 MCP server or API with caching
 */
async function getLibraryDocs(libraryId: string, topic?: string, tokens?: number): Promise<string> {
  // Check cache first
  const cacheKey = `${libraryId}|${topic || ""}|${tokens || DEFAULT_TOKENS}`;
  const cached = docsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < DOCS_CACHE_TTL) {
    return cached.docs;
  }

  // Try Context7 MCP server first
  try {
    const result = await callContext7MCP("tools/call", {
      name: "get-library-docs",
      arguments: {
        context7CompatibleLibraryID: libraryId,
        topic,
        tokens: tokens || DEFAULT_TOKENS
      }
    });

    if (result && result.result && result.result.content && Array.isArray(result.result.content) && result.result.content.length > 0) {
      const docs = result.result.content[0].text;
      
      // Cache the result
      docsCache.set(cacheKey, { docs, timestamp: Date.now() });
      return docs;
    }
  } catch (error) {
    console.error("Context7 MCP docs failed, falling back to direct API:", error);
  }

  // Fallback to direct Context7 API
  // Parse library ID: /owner/repo format
  const match = libraryId.match(/^\/([^/]+)\/(.+)$/);
  if (!match) {
    throw new Error(`Invalid library ID format: ${libraryId}. Expected format: /owner/repo`);
  }

  const [, owner, repo] = match;
  const url = new URL(`${CONTEXT7_API_BASE}/${owner}/${repo}`);
  url.searchParams.set("type", "txt");

  if (topic) {
    url.searchParams.set("topic", topic);
  }

  if (tokens) {
    url.searchParams.set("tokens", tokens.toString());
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const response = await fetch(url.toString(), { headers });

  if (!response.ok) {
    throw new Error(`Context7 API error: ${response.status} ${response.statusText}`);
  }

  const docs = await response.text();

  // Cache the result
  docsCache.set(cacheKey, { docs, timestamp: Date.now() });

  return docs;
}

// Create the MCP server
const server = new Server(
  {
    name: "stdio-context7-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define schemas for tool inputs
const ResolveLibraryIdSchema = z.object({
  libraryName: z.string().describe("The name of the library to search for"),
});

const GetLibraryDocsSchema = z.object({
  context7CompatibleLibraryID: z
    .string()
    .describe("Exact Context7-compatible library ID (e.g., /mongodb/docs, /vercel/next.js)"),
  topic: z
    .string()
    .optional()
    .describe('Focus the docs on a specific topic (e.g., "routing", "hooks")'),
  tokens: z
    .number()
    .optional()
    .default(DEFAULT_TOKENS)
    .describe(`Max number of tokens to return. Values less than ${MIN_TOKENS} are automatically increased to ${MIN_TOKENS}.`),
});

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: TOOL_RESOLVE_LIBRARY_ID,
        description: "Resolves a general library name into a Context7-compatible library ID.",
        inputSchema: {
          type: "object",
          properties: {
            libraryName: {
              type: "string",
              description: "The name of the library to search for",
            },
          },
          required: ["libraryName"],
        },
      },
      {
        name: TOOL_GET_LIBRARY_DOCS,
        description: "Fetches documentation for a library using a Context7-compatible library ID.",
        inputSchema: {
          type: "object",
          properties: {
            context7CompatibleLibraryID: {
              type: "string",
              description: "Exact Context7-compatible library ID (e.g., /mongodb/docs, /vercel/next.js)",
            },
            topic: {
              type: "string",
              description: 'Focus the docs on a specific topic (e.g., "routing", "hooks")',
            },
            tokens: {
              type: "number",
              description: `Max number of tokens to return. Values less than ${MIN_TOKENS} are automatically increased to ${MIN_TOKENS}.`,
              default: DEFAULT_TOKENS,
            },
          },
          required: ["context7CompatibleLibraryID"],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === TOOL_RESOLVE_LIBRARY_ID) {
      const parsed = ResolveLibraryIdSchema.parse(args);

      try {
        const library = await resolveLibraryId(parsed.libraryName);

        return {
          content: [
            {
              type: "text",
              text: `Found library: ${library.name}\nLibrary ID: ${library.id}\nDescription: ${library.description}`,
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Failed to resolve library "${parsed.libraryName}": ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    } else if (name === TOOL_GET_LIBRARY_DOCS) {
      const parsed = GetLibraryDocsSchema.parse(args);
      const maxTokens = parsed.tokens && parsed.tokens >= MIN_TOKENS ? parsed.tokens : MIN_TOKENS;

      try {
        const docs = await getLibraryDocs(
          parsed.context7CompatibleLibraryID,
          parsed.topic,
          maxTokens
        );

        return {
          content: [
            {
              type: "text",
              text: docs,
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Failed to fetch documentation for "${parsed.context7CompatibleLibraryID}": ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    } else {
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

// Start the server
async function main() {
  if (transport === "stdio") {
    const stdio = new StdioServerTransport();
    await server.connect(stdio);
    console.error("STDIO Context7 MCP Server running on stdio transport");
  } else {
    console.error(`Transport "${transport}" is not supported yet. Only stdio is supported.`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
