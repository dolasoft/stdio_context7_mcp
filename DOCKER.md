# Docker Deployment Guide

## Security Features

This MCP server Docker image is built with enterprise-grade security features:

### ✅ SBOMs (Software Bill of Materials)
- Automatically generates CycloneDX SBOMs for dependencies and application
- SBOMs are embedded in the image for vulnerability scanning
- Helps track all components and their versions

### ✅ Provenance Attestations
- Build provenance metadata is attached to the image
- Verifies the build process and source integrity
- Enables supply chain security verification

### ✅ Image Signing Support
- Compatible with Cosign for cryptographic signing
- Verifies image authenticity and integrity
- Prevents tampering and unauthorized modifications

### ✅ Multi-Architecture Support
- Builds for multiple platforms: `linux/amd64`, `linux/arm64`, `linux/arm/v7`
- Optimized for cloud, edge, and IoT deployments
- Single manifest supports all architectures

### ✅ Security Hardening
- Non-root user (UID 1001) for runtime security
- Minimal Alpine Linux base image
- Updated CA certificates
- Tini init system for proper signal handling
- Read-only file permissions where possible
- No unnecessary packages or files

## Quick Start

### Using the Build Script

```bash
# Build with default settings (multi-arch)
./build-docker.sh

# Build for single platform (faster for testing)
PLATFORMS=linux/amd64 ./build-docker.sh

# Build and push to registry
REGISTRY=docker.io/yourusername IMAGE_NAME=stdio-context7-mcp ./build-docker.sh
```

### Manual Build

#### Single Architecture (Local Testing)

```bash
# Build for your current platform
docker build -t stdio-context7-mcp:latest .

# Run the container
docker run -i stdio-context7-mcp:latest
```

#### Multi-Architecture Build

```bash
# Enable Docker Buildx
docker buildx create --name mcp-builder --use

# Build for multiple platforms with SBOM and provenance
docker buildx build \
  --platform linux/amd64,linux/arm64,linux/arm/v7 \
  --tag yourusername/stdio-context7-mcp:1.0.0 \
  --provenance=true \
  --sbom=true \
  --push \
  .
```

## Build Arguments

The Dockerfile accepts standard build arguments for multi-arch:

- `TARGETPLATFORM` - Target platform (e.g., linux/amd64)
- `BUILDPLATFORM` - Build platform
- `TARGETOS` - Target OS
- `TARGETARCH` - Target architecture

## Image Labels (Provenance Metadata)

The image includes OCI-compliant labels:

```dockerfile
org.opencontainers.image.title="STDIO Context7 MCP Server"
org.opencontainers.image.description="MCP server providing up-to-date library documentation"
org.opencontainers.image.version="1.0.0"
org.opencontainers.image.vendor="DolaSoft"
org.opencontainers.image.licenses="MIT"
org.opencontainers.image.source="<your-repo-url>"
```

View labels:
```bash
docker inspect stdio-context7-mcp:latest | jq '.[0].Config.Labels'
```

## SBOM (Software Bill of Materials)

The image contains SBOMs in CycloneDX format:

### View SBOM in Container

```bash
docker run --rm stdio-context7-mcp:latest cat sbom-application.json | jq
```

### Extract SBOM from Image

```bash
# Run container and copy SBOM
docker create --name temp stdio-context7-mcp:latest
docker cp temp:/app/sbom-application.json ./
docker rm temp
```

### Scan for Vulnerabilities

```bash
# Using Grype
grype stdio-context7-mcp:latest

# Using Trivy
trivy image stdio-context7-mcp:latest

# Using Snyk
snyk container test stdio-context7-mcp:latest
```

## Image Signing with Cosign

### Prerequisites

Install Cosign:
```bash
# macOS
brew install cosign

# Linux
wget https://github.com/sigstore/cosign/releases/download/v2.0.0/cosign-linux-amd64
chmod +x cosign-linux-amd64
sudo mv cosign-linux-amd64 /usr/local/bin/cosign
```

### Generate Key Pair

```bash
# Generate signing keys
cosign generate-key-pair

# This creates:
# - cosign.key (private key - keep secure!)
# - cosign.pub (public key - share this)
```

### Sign the Image

```bash
# Sign with your private key
cosign sign --key cosign.key yourusername/stdio-context7-mcp:1.0.0

# Sign with keyless (uses OIDC)
cosign sign yourusername/stdio-context7-mcp:1.0.0
```

### Verify Signature

```bash
# Verify with public key
cosign verify --key cosign.pub yourusername/stdio-context7-mcp:1.0.0

# View signature details
cosign triangulate yourusername/stdio-context7-mcp:1.0.0
```

## Publishing to Docker Hub

### 1. Authenticate

```bash
docker login
# Enter your Docker Hub username and password
```

### 2. Tag the Image

```bash
docker tag stdio-context7-mcp:latest yourusername/stdio-context7-mcp:1.0.0
docker tag stdio-context7-mcp:latest yourusername/stdio-context7-mcp:latest
```

### 3. Push Multi-Arch Image

```bash
# Build and push with buildx
docker buildx build \
  --platform linux/amd64,linux/arm64,linux/arm/v7 \
  --tag yourusername/stdio-context7-mcp:1.0.0 \
  --tag yourusername/stdio-context7-mcp:latest \
  --provenance=true \
  --sbom=true \
  --push \
  .
```

## Using in MCP Clients

### Claude Desktop

```json
{
  "mcpServers": {
    "stdio-context7": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "yourusername/stdio-context7-mcp:latest"
      ]
    }
  }
}
```

### With API Key

```json
{
  "mcpServers": {
    "stdio-context7": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "yourusername/stdio-context7-mcp:latest",
        "--api-key",
        "YOUR_API_KEY"
      ]
    }
  }
}
```

### Docker Compose

```yaml
version: '3.8'

services:
  mcp-server:
    image: yourusername/stdio-context7-mcp:latest
    stdin_open: true
    tty: true
    environment:
      - NODE_ENV=production
    command: ["--transport", "stdio", "--api-key", "${API_KEY}"]
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
```

## Security Best Practices

### 1. Regular Updates

```bash
# Rebuild regularly to get security patches
docker build --no-cache -t stdio-context7-mcp:latest .
```

### 2. Vulnerability Scanning

```bash
# Scan before deployment
trivy image --severity HIGH,CRITICAL stdio-context7-mcp:latest
```

### 3. Runtime Security

```bash
# Run with additional security options
docker run -i \
  --read-only \
  --security-opt=no-new-privileges:true \
  --cap-drop=ALL \
  stdio-context7-mcp:latest
```

### 4. Network Isolation

```bash
# For STDIO, no network needed
docker run -i \
  --network=none \
  stdio-context7-mcp:latest
```

## Troubleshooting

### Build Fails on Multi-Arch

```bash
# Check buildx is properly set up
docker buildx ls

# Recreate builder
docker buildx rm mcp-builder
docker buildx create --name mcp-builder --use
docker buildx inspect --bootstrap
```

### SBOM Generation Fails

The build will continue even if SBOM generation fails. Check logs:

```bash
docker buildx build --progress=plain . 2>&1 | grep -i sbom
```

### Container Won't Start

```bash
# Check logs
docker logs <container-id>

# Run with debug
docker run -i stdio-context7-mcp:latest --help

# Run interactive shell (debugging)
docker run -it --entrypoint /bin/sh stdio-context7-mcp:latest
```

## Performance Optimization

### Layer Caching

The Dockerfile is optimized for layer caching:
1. Base image layers
2. Package installation
3. Dependency installation
4. Source code compilation

### Multi-Stage Build Benefits

- **Builder stage**: ~500MB (includes dev dependencies)
- **Production stage**: ~150MB (minimal runtime)
- **Size reduction**: ~70% smaller final image

### Benchmarks

| Platform | Build Time | Image Size |
|----------|------------|------------|
| linux/amd64 | 2-3 min | ~150 MB |
| linux/arm64 | 3-4 min | ~145 MB |
| linux/arm/v7 | 4-5 min | ~140 MB |

## CI/CD Integration

### GitHub Actions

```yaml
name: Build and Push Docker Image

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          platforms: linux/amd64,linux/arm64,linux/arm/v7
          push: true
          tags: |
            yourusername/stdio-context7-mcp:latest
            yourusername/stdio-context7-mcp:${{ github.ref_name }}
          provenance: true
          sbom: true

      - name: Sign image
        run: |
          cosign sign --key env://COSIGN_KEY \
            yourusername/stdio-context7-mcp:${{ github.ref_name }}
        env:
          COSIGN_KEY: ${{ secrets.COSIGN_PRIVATE_KEY }}
```

## Support

For issues or questions:
- GitHub Issues: [Report a bug]
- Documentation: [README.md](./README.md)
- Security: Report security issues privately

---

**Security Notice**: Always verify image signatures and scan for vulnerabilities before deploying to production.
