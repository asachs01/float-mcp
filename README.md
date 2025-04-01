# Float.com MCP Integration

A Mission Control Protocol (MCP) server that interfaces with Float.com's API to manage projects and tasks using natural language.

## Features

- Project management
- Task management
- People management
- Natural language processing
- Rate limiting
- Structured logging
- Health checks

## Prerequisites

- Node.js 22.x or later
- Docker
- Float.com API key

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/float-mcp.git
   cd float-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your Float.com API key and other configuration.

## Development

Start the development server:
```bash
npm run dev
```

Run tests:
```bash
npm test
```

Lint code:
```bash
npm run lint
```

Format code:
```bash
npm run format
```

## Docker

Build the Docker image:
```bash
docker build -t float-mcp .
```

Run the container:
```bash
docker run -p 3000:3000 --env-file .env float-mcp
```

Or use docker-compose:
```bash
docker compose up
```

## Testing

The project uses Jest for testing. Run tests with:
```bash
npm test
```

For development with watch mode:
```bash
npm run test:watch
```

For coverage report:
```bash
npm run test:coverage
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Update documentation
5. Submit a pull request

## License

MIT License 