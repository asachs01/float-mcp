#!/bin/bash

# Development Docker Helper Script for Float MCP Server
# Optimized for fast iterative development with Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.yml"
COMPOSE_DEV_FILE="docker-compose.override.yml"
SERVICE_NAME="float-mcp-dev"
PROD_SERVICE_NAME="float-mcp"

print_header() {
    echo -e "${BLUE}=======================================${NC}"
    echo -e "${BLUE} $1 ${NC}"
    echo -e "${BLUE}=======================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Check if .env file exists
check_env_file() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating a template..."
        cat > .env << EOF
# Float API Configuration
FLOAT_API_KEY=your_float_api_key_here
FLOAT_API_BASE_URL=https://api.float.com/v3

# Development Configuration
NODE_ENV=development
LOG_LEVEL=debug
LOG_FORMAT=pretty

# Optional: Custom ports
PORT=3000
EOF
        print_info "Created .env template. Please update with your actual API key."
    fi
}

# Build development image with caching
build_dev() {
    print_header "Building Development Environment"
    
    print_info "Building development image with cache optimization..."
    docker-compose build --parallel $SERVICE_NAME
    
    if [ $? -eq 0 ]; then
        print_success "Development image built successfully"
    else
        print_error "Development image build failed"
        exit 1
    fi
}

# Build production image
build_prod() {
    print_header "Building Production Environment"
    
    print_info "Building production image..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml build $PROD_SERVICE_NAME
    
    if [ $? -eq 0 ]; then
        print_success "Production image built successfully"
    else
        print_error "Production image build failed"
        exit 1
    fi
}

# Start development environment
start_dev() {
    print_header "Starting Development Environment"
    
    check_env_file
    
    print_info "Starting development container with hot reload..."
    docker-compose up -d $SERVICE_NAME
    
    if [ $? -eq 0 ]; then
        print_success "Development environment started"
        print_info "Container is running with hot reload enabled"
        print_info "Logs: docker-compose logs -f $SERVICE_NAME"
        print_info "Stop: docker-compose stop $SERVICE_NAME"
    else
        print_error "Failed to start development environment"
        exit 1
    fi
}

# Start production environment
start_prod() {
    print_header "Starting Production Environment"
    
    check_env_file
    
    print_info "Starting production container..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d $PROD_SERVICE_NAME
    
    if [ $? -eq 0 ]; then
        print_success "Production environment started"
        print_info "Container is running in production mode"
        print_info "Logs: docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f $PROD_SERVICE_NAME"
    else
        print_error "Failed to start production environment"
        exit 1
    fi
}

# Stop all services
stop_all() {
    print_header "Stopping All Services"
    
    print_info "Stopping development services..."
    docker-compose stop
    
    print_info "Stopping production services..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml stop
    
    print_success "All services stopped"
}

# Show logs
show_logs() {
    local service=${1:-$SERVICE_NAME}
    print_header "Showing Logs for $service"
    
    if docker-compose ps | grep -q $service; then
        docker-compose logs -f $service
    else
        print_error "Service $service is not running"
        exit 1
    fi
}

# Test MCP functionality
test_mcp() {
    print_header "Testing MCP Functionality"
    
    # Check if development service is running
    if docker-compose ps | grep -q $SERVICE_NAME; then
        print_info "Testing MCP on development service..."
        
        # Test tools/list
        local result=$(echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | \
            docker-compose exec -T $SERVICE_NAME node dist/index.js --mcp 2>/dev/null)
        
        if [ $? -eq 0 ]; then
            local tool_count=$(echo "$result" | jq -r '.result.tools | length' 2>/dev/null)
            if [ "$tool_count" -eq 25 ]; then
                print_success "MCP is working correctly (25 tools available)"
            else
                print_warning "MCP responded but with $tool_count tools (expected 25)"
            fi
        else
            print_error "MCP test failed"
        fi
    else
        print_error "Development service is not running. Start it first with: $0 start"
        exit 1
    fi
}

# Rebuild and restart (fast development cycle)
rebuild() {
    print_header "Rebuilding and Restarting Development Environment"
    
    print_info "Stopping current development container..."
    docker-compose stop $SERVICE_NAME
    
    print_info "Rebuilding with no cache for changed files..."
    docker-compose build --no-cache $SERVICE_NAME
    
    print_info "Starting updated container..."
    docker-compose up -d $SERVICE_NAME
    
    if [ $? -eq 0 ]; then
        print_success "Development environment rebuilt and restarted"
        print_info "New container is running with latest changes"
    else
        print_error "Failed to rebuild development environment"
        exit 1
    fi
}

# Clean up development environment
cleanup() {
    print_header "Cleaning Up Development Environment"
    
    print_info "Stopping all containers..."
    docker-compose down --remove-orphans
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml down --remove-orphans
    
    print_info "Removing development images..."
    docker image rm $(docker images -f "reference=float-mcp*" -q) 2>/dev/null || true
    
    print_info "Removing unused volumes..."
    docker volume prune -f
    
    print_success "Development environment cleaned up"
}

# Show service status
status() {
    print_header "Service Status"
    
    print_info "Development services:"
    docker-compose ps
    
    print_info "Production services:"
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps
    
    print_info "Docker images:"
    docker images | grep -E "(float-mcp|node)" | head -10
}

# Run tests
run_tests() {
    print_header "Running Tests"
    
    print_info "Running test suite..."
    docker-compose -f docker-compose.yml -f docker-compose.test.yml up --profile test
    
    if [ $? -eq 0 ]; then
        print_success "Tests passed"
    else
        print_error "Tests failed"
        exit 1
    fi
}

# Interactive shell
shell() {
    local service=${1:-$SERVICE_NAME}
    print_header "Opening Shell in $service"
    
    if docker-compose ps | grep -q $service; then
        docker-compose exec $service /bin/bash
    else
        print_error "Service $service is not running"
        exit 1
    fi
}

# Show help
show_help() {
    cat << EOF
Float MCP Server Development Helper

Usage: $0 <command> [options]

Commands:
  build-dev       Build development environment
  build-prod      Build production environment
  start           Start development environment with hot reload
  start-prod      Start production environment
  stop            Stop all services
  rebuild         Rebuild and restart development environment (fast iteration)
  logs [service]  Show logs for service (default: $SERVICE_NAME)
  test-mcp        Test MCP functionality on running service
  test            Run test suite
  status          Show status of all services
  shell [service] Open shell in running container
  cleanup         Clean up all containers, images, and volumes
  help            Show this help message

Examples:
  $0 start                    # Start development environment
  $0 rebuild                  # Quick rebuild for development
  $0 logs                     # Show development logs
  $0 test-mcp                 # Test MCP functionality
  $0 shell                    # Open shell in development container
  $0 cleanup                  # Clean up everything

Environment:
  Ensure .env file exists with FLOAT_API_KEY and other configuration.
  The script will create a template .env file if none exists.

EOF
}

# Main execution
main() {
    case "${1:-}" in
        build-dev)
            build_dev
            ;;
        build-prod)
            build_prod
            ;;
        start)
            start_dev
            ;;
        start-prod)
            start_prod
            ;;
        stop)
            stop_all
            ;;
        rebuild)
            rebuild
            ;;
        logs)
            show_logs "${2:-}"
            ;;
        test-mcp)
            test_mcp
            ;;
        test)
            run_tests
            ;;
        status)
            status
            ;;
        shell)
            shell "${2:-}"
            ;;
        cleanup)
            cleanup
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: ${1:-}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Check prerequisites
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed"
    exit 1
fi

# Run main function
main "$@"