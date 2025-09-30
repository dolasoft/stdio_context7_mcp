/**
 * MCP Server Request Handlers
 * Clean, modular handlers for different MCP request types
 */

import { z } from 'zod';
import { LibraryService } from '../services/library-service.js';
import { logger } from '../utils/logger.js';
import { updateActivity } from '../server/initialization.js';
import { 
  TOOL_RESOLVE_LIBRARY_ID, 
  TOOL_GET_LIBRARY_DOCS, 
  MIN_TOKENS, 
  DEFAULT_TOKENS 
} from '../constants';

// Request schemas
const ResolveLibraryIdSchema = z.object({
  libraryName: z.string().min(1, 'Library name is required'),
});

const GetLibraryDocsSchema = z.object({
  context7CompatibleLibraryID: z.string().min(1, 'Library ID is required'),
  topic: z.string().optional(),
  tokens: z.number().min(MIN_TOKENS).optional().default(DEFAULT_TOKENS),
});

// Tool definitions
export const TOOL_DEFINITIONS = {
  [TOOL_RESOLVE_LIBRARY_ID]: {
    name: TOOL_RESOLVE_LIBRARY_ID,
    description: 'Resolves a general library name into a Context7-compatible library ID.',
    inputSchema: {
      type: 'object',
      properties: {
        libraryName: {
          type: 'string',
          description: 'The name of the library to search for',
        },
      },
      required: ['libraryName'],
    },
  },
  [TOOL_GET_LIBRARY_DOCS]: {
    name: TOOL_GET_LIBRARY_DOCS,
    description: 'Fetches documentation for a library using a Context7-compatible library ID.',
    inputSchema: {
      type: 'object',
      properties: {
        context7CompatibleLibraryID: {
          type: 'string',
          description: 'Exact Context7-compatible library ID (e.g., /mongodb/docs, /vercel/next.js)',
        },
        topic: {
          type: 'string',
          description: 'Focus the docs on a specific topic (e.g., "routing", "hooks")',
        },
        tokens: {
          type: 'number',
          description: `Max number of tokens to return. Values less than ${MIN_TOKENS} are automatically increased to ${MIN_TOKENS}.`,
          default: DEFAULT_TOKENS,
        },
      },
      required: ['context7CompatibleLibraryID'],
    },
  },
};

/**
 * Handler for listing available tools
 */
export function createListToolsHandler() {
  return async () => {
    logger.debug('Tools list requested');
    
    return {
      tools: Object.values(TOOL_DEFINITIONS),
    };
  };
}

/**
 * Handler for resolving library IDs
 */
export function createResolveLibraryHandler(libraryService: LibraryService) {
  return async (args: unknown) => {
    updateActivity(); // Track activity
    const parsed = ResolveLibraryIdSchema.parse(args);
    
    try {
      const library = await libraryService.resolveLibrary(parsed.libraryName);

      return {
        content: [
          {
            type: 'text',
            text: `Found library: ${library.name}\nLibrary ID: ${library.id}\nDescription: ${library.description}`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Library resolution failed', { 
        libraryName: parsed.libraryName, 
        error: errorMessage 
      });
      
      return {
        content: [
          {
            type: 'text',
            text: `Failed to resolve library "${parsed.libraryName}": ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  };
}

/**
 * Handler for getting library documentation
 */
export function createGetLibraryDocsHandler(libraryService: LibraryService) {
  return async (args: unknown) => {
    updateActivity(); // Track activity
    const parsed = GetLibraryDocsSchema.parse(args);
    const maxTokens = parsed.tokens && parsed.tokens >= MIN_TOKENS ? parsed.tokens : MIN_TOKENS;

    try {
      const docs = await libraryService.getLibraryDocs(
        parsed.context7CompatibleLibraryID,
        parsed.topic,
        maxTokens
      );

      return {
        content: [
          {
            type: 'text',
            text: docs,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Documentation retrieval failed', { 
        libraryId: parsed.context7CompatibleLibraryID, 
        error: errorMessage 
      });
      
      return {
        content: [
          {
            type: 'text',
            text: `Failed to retrieve documentation for "${parsed.context7CompatibleLibraryID}": ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  };
}

/**
 * Main tool execution handler
 */
export function createToolExecutionHandler(libraryService: LibraryService) {
  const resolveLibraryHandler = createResolveLibraryHandler(libraryService);
  const getLibraryDocsHandler = createGetLibraryDocsHandler(libraryService);

  return async (request: { params: { name: string; arguments?: unknown } }) => {
    const { name, arguments: args = {} } = request.params;
    
    logger.debug('Tool call requested', { tool: name, args });

    switch (name) {
      case TOOL_RESOLVE_LIBRARY_ID:
        return await resolveLibraryHandler(args);
      
      case TOOL_GET_LIBRARY_DOCS:
        return await getLibraryDocsHandler(args);
      
      default:
        logger.warn('Unknown tool requested', { tool: name });
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  };
}
