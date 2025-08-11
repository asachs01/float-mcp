# Float MCP Documentation

This directory contains the documentation for the Float MCP Server, built with [Docusaurus](https://docusaurus.io/).

## Structure

- `website/` - Docusaurus website source code
- `*.md` files - Source documentation (organized and used by the website)

## Development

### Prerequisites

- Node.js 22.0.0 or higher
- npm or yarn

### Getting Started

1. **Install dependencies**
   ```bash
   npm run docs:install
   ```

2. **Start the development server**
   ```bash
   npm run docs:dev
   ```

   This starts a local development server and opens the documentation site in your browser at `http://localhost:3000`.

3. **Build the documentation**
   ```bash
   npm run docs:build
   ```

   This command generates static content into the `website/build` directory.

4. **Serve the built documentation**
   ```bash
   npm run docs:serve
   ```

   This serves the built documentation locally for testing.

## Deployment

The documentation is automatically deployed to GitHub Pages when changes are pushed to the main branch. The deployment is handled by the GitHub Actions workflow in `.github/workflows/docs-deploy.yml`.

### Manual Deployment

To deploy manually:

```bash
npm run docs:deploy
```

## Adding Documentation

1. Add new markdown files to the appropriate directory:
   - `website/docs/` - Main documentation
   - `website/docs/api/` - API reference
   - `website/docs/guides/` - User guides
   - `website/docs/testing/` - Testing documentation
   - `website/docs/contributing/` - Contributing guides

2. Update the sidebar configuration in `website/sidebars.ts` if needed

3. Follow the Docusaurus documentation format with proper frontmatter:

   ```markdown
   ---
   id: my-doc
   title: My Document
   sidebar_label: My Doc
   ---

   # My Document

   Content goes here...
   ```

## Configuration

The main configuration is in `website/docusaurus.config.ts`. Key configuration areas:

- **Site metadata** - Title, tagline, URL, etc.
- **Navigation** - Navbar and footer configuration
- **Themes and plugins** - Docusaurus features and styling
- **Deployment settings** - GitHub Pages configuration

## Live Site

The documentation is available at: https://asachs01.github.io/float-mcp/

## Contributing

When contributing to documentation:

1. Follow the existing structure and naming conventions
2. Test your changes locally with `npm run docs:dev`
3. Build and verify with `npm run docs:build`
4. Submit a pull request with your changes

For more detailed information about Docusaurus, visit the [official documentation](https://docusaurus.io/docs).