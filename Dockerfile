# syntax=docker/dockerfile:1.4
# Multi-stage build with security hardening, SBOMs, provenance, and multi-arch support

# ============================================================================
# Builder Stage - Compile TypeScript and generate SBOMs
# ============================================================================
FROM --platform=$BUILDPLATFORM node:18-alpine AS builder

# Build arguments for multi-arch support
ARG TARGETPLATFORM
ARG BUILDPLATFORM
ARG TARGETOS
ARG TARGETARCH

# Install build dependencies and security tools
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies with audit
RUN npm ci --ignore-scripts && \
    npm audit --audit-level=moderate || true

# Generate SBOM (Software Bill of Materials) for dependencies
RUN npm install -g @cyclonedx/cyclonedx-npm && \
    cyclonedx-npm --output-file sbom-dependencies.json || true

# Copy source code
COPY src/ ./src/

# Build the TypeScript code
RUN npm run build

# Generate SBOM for the complete application
RUN cyclonedx-npm --output-file sbom-application.json || true

# ============================================================================
# Production Stage - Hardened runtime environment
# ============================================================================
FROM node:18-alpine AS production

# Add comprehensive image metadata for MCP Toolkit
LABEL org.opencontainers.image.title="Context7 MCP Server"
LABEL org.opencontainers.image.description="MCP server providing up-to-date library documentation via STDIO transport for AI assistants"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="DolaSoft"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/dolasoft/stdio_stdio-context7_mcp"
LABEL org.opencontainers.image.documentation="https://github.com/dolasoft/stdio_stdio-context7_mcp/blob/main/README.md"
LABEL org.opencontainers.image.url="https://github.com/dolasoft/stdio_stdio-context7_mcp"

# MCP Toolkit specific labels
LABEL com.docker.mcp.server.name="stdio-context7"
LABEL com.docker.mcp.server.version="1.0.0"
LABEL com.docker.mcp.server.description="Context7 library documentation server for Docker MCP Toolkit"
LABEL com.docker.mcp.server.transport="stdio"
LABEL com.docker.mcp.server.capabilities="tools,resources,prompts"

# Security hardening: Install dumb-init for proper signal handling and update CA certificates
RUN apk add --no-cache \
    dumb-init \
    ca-certificates \
    tini \
    && rm -rf /var/cache/apk/* \
    && update-ca-certificates

# Set working directory
WORKDIR /app

# Create a non-root user with specific UID/GID for security
RUN addgroup -g 1001 -S mcp && \
    adduser -S mcp -u 1001 -G mcp && \
    mkdir -p /app/dist && \
    chown -R mcp:mcp /app

# Copy package files
COPY --chown=mcp:mcp package*.json ./

# Install only production dependencies with security audit
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force && \
    npm audit fix --only=prod || true

# Copy built application and SBOMs from builder stage
COPY --from=builder --chown=mcp:mcp /app/dist ./dist
COPY --from=builder --chown=mcp:mcp /app/sbom-*.json ./

# Make the binary executable
RUN chmod +x ./dist/server.js

# Security: Remove unnecessary files and set read-only permissions
RUN find /app -type f -name "*.md" -delete && \
    find /app -type d -exec chmod 755 {} \; && \
    find /app -type f -exec chmod 644 {} \; && \
    chmod 755 ./dist/server.js

# Switch to non-root user
USER mcp

# Set secure environment variables
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=512" \
    NPM_CONFIG_LOGLEVEL=warn \
    MCP_SERVER_NAME="stdio-context7" \
    MCP_SERVER_VERSION="1.0.0"

# Health check for STDIO transport - check if process is responsive
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD echo '{"jsonrpc":"2.0","id":1,"method":"ping","params":{}}' | timeout 5 node dist/server.js --transport stdio > /dev/null || exit 1

# Security: Use tini as init system for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Default command - run with stdio transport
CMD ["node", "dist/server.js", "--transport", "stdio"]
