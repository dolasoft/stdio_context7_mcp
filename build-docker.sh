#!/bin/bash
# Docker build script with security features, SBOM generation, provenance, and multi-arch support

set -e

# Configuration
IMAGE_NAME="${IMAGE_NAME:-stdio-context7-mcp}"
REGISTRY="${REGISTRY:-docker.io/yourusername}"
VERSION="${VERSION:-1.0.0}"
PLATFORMS="${PLATFORMS:-linux/amd64,linux/arm64,linux/arm/v7}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Building MCP Server with Security Features${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if Docker Buildx is available
if ! docker buildx version > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker Buildx is not available${NC}"
    echo "Please install Docker Desktop or enable Buildx"
    exit 1
fi

# Create or use existing buildx builder
BUILDER_NAME="mcp-builder"
if ! docker buildx inspect ${BUILDER_NAME} > /dev/null 2>&1; then
    echo -e "${YELLOW}Creating new buildx builder: ${BUILDER_NAME}${NC}"
    docker buildx create --name ${BUILDER_NAME} --driver docker-container --bootstrap
fi

echo -e "${YELLOW}Using builder: ${BUILDER_NAME}${NC}"
docker buildx use ${BUILDER_NAME}

# Build with multi-arch support, provenance, and SBOM
echo -e "${GREEN}Building multi-architecture images...${NC}"
echo -e "Platforms: ${PLATFORMS}"
echo -e "Image: ${REGISTRY}/${IMAGE_NAME}:${VERSION}"

docker buildx build \
    --platform ${PLATFORMS} \
    --build-arg VERSION=${VERSION} \
    --tag ${REGISTRY}/${IMAGE_NAME}:${VERSION} \
    --tag ${REGISTRY}/${IMAGE_NAME}:latest \
    --provenance=true \
    --sbom=true \
    --output type=image,push=false \
    --progress=plain \
    .

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Build completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Image built: ${REGISTRY}/${IMAGE_NAME}:${VERSION}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Test the image locally:"
echo -e "   ${GREEN}docker run -i ${REGISTRY}/${IMAGE_NAME}:${VERSION}${NC}"
echo ""
echo "2. Push to registry (requires authentication):"
echo -e "   ${GREEN}docker buildx build --platform ${PLATFORMS} --push --tag ${REGISTRY}/${IMAGE_NAME}:${VERSION} .${NC}"
echo ""
echo "3. Sign the image (optional, requires cosign):"
echo -e "   ${GREEN}cosign sign ${REGISTRY}/${IMAGE_NAME}:${VERSION}${NC}"
echo ""
echo -e "${YELLOW}To build for a single platform (faster for testing):${NC}"
echo -e "   ${GREEN}PLATFORMS=linux/amd64 ./build-docker.sh${NC}"
