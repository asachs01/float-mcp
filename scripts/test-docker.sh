#!/bin/bash

# Docker Testing Script for Float MCP Server
# This script provides comprehensive testing for Docker deployments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TEST_API_KEY="test_key_12345"
TEST_API_URL="https://api.float.com/v3"
TIMEOUT=10

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

# Test function for MCP protocol
test_mcp_protocol() {
    local image_name=$1
    local test_name=$2
    
    print_info "Testing MCP protocol for $test_name..."
    
    # Test tools/list endpoint
    local tools_output=$(echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | \
        timeout $TIMEOUT docker run --rm -i \
        -e FLOAT_API_KEY="$TEST_API_KEY" \
        -e FLOAT_API_BASE_URL="$TEST_API_URL" \
        -e LOG_LEVEL="error" \
        $image_name node dist/index.js --mcp 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        local tool_count=$(echo "$tools_output" | jq -r '.result.tools | length' 2>/dev/null)
        if [ "$tool_count" -eq 25 ]; then
            print_success "$test_name: MCP protocol working (25 tools available)"
        else
            print_error "$test_name: Expected 25 tools, got $tool_count"
            return 1
        fi
    else
        print_error "$test_name: MCP protocol test failed"
        return 1
    fi
}

# Test Docker build stages
test_build_stages() {
    print_header "Testing Docker Build Stages"
    
    # Test base stage
    print_info "Building base stage..."
    docker build --target base -t float-mcp:base . || {
        print_error "Base stage build failed"
        return 1
    }
    print_success "Base stage build successful"
    
    # Test development stage
    print_info "Building development stage..."
    docker build --target development -t float-mcp:dev . || {
        print_error "Development stage build failed"
        return 1
    }
    print_success "Development stage build successful"
    
    # Test builder stage
    print_info "Building builder stage..."
    docker build --target builder -t float-mcp:builder . || {
        print_error "Builder stage build failed"
        return 1
    }
    print_success "Builder stage build successful"
    
    # Test production stage
    print_info "Building production stage..."
    docker build --target production -t float-mcp:prod . || {
        print_error "Production stage build failed"
        return 1
    }
    print_success "Production stage build successful"
    
    # Test testing stage
    print_info "Building testing stage..."
    docker build --target testing -t float-mcp:test . || {
        print_error "Testing stage build failed"
        return 1
    }
    print_success "Testing stage build successful"
}

# Test MCP functionality
test_mcp_functionality() {
    print_header "Testing MCP Functionality"
    
    # Test production image
    test_mcp_protocol "float-mcp:prod" "Production" || return 1
    
    # Test development image (if available)
    if docker images float-mcp:dev | grep -q float-mcp; then
        print_info "Testing development image MCP functionality..."
        # Development image uses npm run dev, so we need to test differently
        local dev_test=$(timeout $TIMEOUT docker run --rm -d \
            -e FLOAT_API_KEY="$TEST_API_KEY" \
            -e FLOAT_API_BASE_URL="$TEST_API_URL" \
            -e LOG_LEVEL="error" \
            float-mcp:dev)
        
        if [ $? -eq 0 ]; then
            sleep 2
            docker stop $dev_test >/dev/null 2>&1
            print_success "Development image starts successfully"
        else
            print_error "Development image failed to start"
            return 1
        fi
    fi
}

# Test Docker Compose configurations
test_docker_compose() {
    print_header "Testing Docker Compose Configurations"
    
    # Test production compose
    print_info "Testing production compose..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml config >/dev/null || {
        print_error "Production compose configuration invalid"
        return 1
    }
    print_success "Production compose configuration valid"
    
    # Test override compose
    print_info "Testing override compose..."
    docker-compose config >/dev/null || {
        print_error "Override compose configuration invalid"
        return 1
    }
    print_success "Override compose configuration valid"
    
    # Test testing compose
    print_info "Testing test compose..."
    docker-compose -f docker-compose.yml -f docker-compose.test.yml config >/dev/null || {
        print_error "Test compose configuration invalid"
        return 1
    }
    print_success "Test compose configuration valid"
}

# Test MCP integration with Docker Compose
test_compose_mcp() {
    print_header "Testing MCP with Docker Compose"
    
    # Test MCP through compose
    print_info "Testing MCP through Docker Compose..."
    docker-compose -f docker-compose.yml -f docker-compose.test.yml up -d --profile mcp-test float-mcp-mcp-test || {
        print_error "Failed to start MCP test service"
        return 1
    }
    
    # Wait for completion
    sleep 5
    
    # Check if the test passed
    local exit_code=$(docker-compose -f docker-compose.yml -f docker-compose.test.yml ps -q float-mcp-mcp-test | xargs docker inspect --format='{{.State.ExitCode}}')
    
    docker-compose -f docker-compose.yml -f docker-compose.test.yml down --remove-orphans
    
    if [ "$exit_code" -eq 0 ]; then
        print_success "MCP test through Docker Compose successful"
    else
        print_error "MCP test through Docker Compose failed (exit code: $exit_code)"
        return 1
    fi
}

# Performance testing
test_performance() {
    print_header "Performance Testing"
    
    print_info "Running performance tests..."
    
    # Test startup time
    local start_time=$(date +%s)
    docker run --rm -d \
        -e FLOAT_API_KEY="$TEST_API_KEY" \
        -e FLOAT_API_BASE_URL="$TEST_API_URL" \
        -e LOG_LEVEL="error" \
        --name float-mcp-perf-test \
        float-mcp:prod >/dev/null
    
    # Wait for container to be ready
    sleep 2
    
    # Test MCP response time
    local mcp_start=$(date +%s%N)
    echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | \
        docker exec -i float-mcp-perf-test node dist/index.js --mcp >/dev/null 2>&1
    local mcp_end=$(date +%s%N)
    
    docker stop float-mcp-perf-test >/dev/null 2>&1
    
    local mcp_time=$(( (mcp_end - mcp_start) / 1000000 ))
    
    if [ $mcp_time -lt 1000 ]; then
        print_success "MCP response time: ${mcp_time}ms (excellent)"
    elif [ $mcp_time -lt 3000 ]; then
        print_success "MCP response time: ${mcp_time}ms (good)"
    else
        print_warning "MCP response time: ${mcp_time}ms (slow)"
    fi
}

# Clean up function
cleanup() {
    print_info "Cleaning up test resources..."
    docker-compose -f docker-compose.yml -f docker-compose.test.yml down --remove-orphans >/dev/null 2>&1
    docker stop float-mcp-perf-test >/dev/null 2>&1
    docker rm float-mcp-perf-test >/dev/null 2>&1
    
    # Remove test images if requested
    if [ "$1" == "--clean" ]; then
        docker image rm float-mcp:base float-mcp:dev float-mcp:builder float-mcp:prod float-mcp:test >/dev/null 2>&1
        print_info "Test images removed"
    fi
}

# Main execution
main() {
    print_header "Float MCP Server Docker Testing Suite"
    
    # Check prerequisites
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        print_error "jq is not installed (required for JSON parsing)"
        exit 1
    fi
    
    # Set up trap for cleanup
    trap cleanup EXIT
    
    # Run tests
    local failed_tests=0
    
    test_build_stages || ((failed_tests++))
    test_mcp_functionality || ((failed_tests++))
    test_docker_compose || ((failed_tests++))
    test_compose_mcp || ((failed_tests++))
    test_performance || ((failed_tests++))
    
    # Summary
    print_header "Test Summary"
    
    if [ $failed_tests -eq 0 ]; then
        print_success "All tests passed! Docker deployment is ready."
        exit 0
    else
        print_error "$failed_tests test(s) failed. Please check the output above."
        exit 1
    fi
}

# Handle command line arguments
case "${1:-}" in
    --clean)
        cleanup --clean
        exit 0
        ;;
    --help)
        echo "Usage: $0 [--clean|--help]"
        echo "  --clean: Clean up test images and containers"
        echo "  --help:  Show this help message"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac