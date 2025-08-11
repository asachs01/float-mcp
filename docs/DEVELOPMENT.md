# Documentation Development Guide

This guide covers the development workflow for maintaining and improving the Float MCP documentation.

## Quick Start

### Working in Main Repository

For simple documentation updates:

```bash
# Install docs dependencies
npm run docs:install

# Start development server
npm run docs:dev

# Make your changes, then build and test
npm run docs:build

# Test the built site
npm run docs:serve
```

### Working with Worktrees (Recommended for major changes)

For major documentation restructuring or when working on docs alongside code changes:

```bash
# Create a new docs branch and worktree
git checkout -b docs/your-feature-name
git worktree add ../float-mcp-docs docs/your-feature-name

# Switch to the docs worktree
cd ../float-mcp-docs

# Install dependencies and start development
cd docs/website && npm install && npm start

# Work on your changes...

# When ready, commit and push
git add .
git commit -s -m "docs: your changes"
git push -u origin docs/your-feature-name

# Create PR from the docs branch to main
gh pr create --title "docs: your feature" --body "Description of changes"

# After PR is merged, clean up
cd ../float-mcp
git worktree remove ../float-mcp-docs
git branch -d docs/your-feature-name
```

## Documentation Structure

```
docs/
├── README.md                           # This guide
├── website/                           # Docusaurus site
│   ├── docs/                         # Documentation content
│   │   ├── intro.md                  # Getting started page
│   │   ├── api/                      # API reference
│   │   ├── guides/                   # User guides
│   │   ├── testing/                  # Testing documentation
│   │   └── contributing/             # Contributing guides
│   ├── blog/                         # Blog posts (optional)
│   ├── src/                          # React components and pages
│   ├── static/                       # Static assets
│   ├── docusaurus.config.ts          # Site configuration
│   ├── sidebars.ts                   # Navigation structure
│   └── package.json                  # Dependencies
└── *.md                              # Source documentation files
```

## Development Commands

From project root:

- `npm run docs:install` - Install documentation dependencies
- `npm run docs:dev` - Start development server at http://localhost:3000
- `npm run docs:build` - Build static site for production
- `npm run docs:serve` - Serve built site locally
- `npm run docs:deploy` - Deploy to GitHub Pages (manual)

From docs/website directory:

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run serve` - Serve built site
- `npm run deploy` - Deploy to GitHub Pages

## Adding New Documentation

1. **Create the markdown file** in the appropriate directory:
   - `docs/website/docs/` for main documentation
   - `docs/website/docs/api/` for API reference
   - `docs/website/docs/guides/` for user guides

2. **Add frontmatter** if needed:
   ```markdown
   ---
   id: my-doc-id
   title: My Document Title
   sidebar_label: Short Label
   ---
   ```

3. **Update navigation** in `docs/website/sidebars.ts` if needed

4. **Test locally** with `npm run docs:dev`

5. **Build and verify** with `npm run docs:build`

## Deployment

### Automatic Deployment

- Documentation is automatically deployed to GitHub Pages when changes are pushed to the `main` branch
- The deployment workflow is in `.github/workflows/docs-deploy.yml`
- Live site: https://asachs01.github.io/float-mcp/

### Manual Deployment

```bash
npm run docs:deploy
```

## Tips for Documentation

1. **Use descriptive titles** and organize content logically
2. **Include code examples** where appropriate
3. **Keep navigation simple** - avoid deeply nested structures
4. **Test all links** before committing
5. **Use consistent formatting** and follow existing patterns
6. **Include screenshots** for UI-related documentation

## Troubleshooting

### Build Failures

- **MDX parsing errors**: Check for special characters like `<`, `>`, `{`, `}` in markdown
- **Broken links**: Ensure all internal links use correct paths
- **Missing dependencies**: Run `npm run docs:install`

### Common Issues

- **404 on GitHub Pages**: Check that `baseUrl` in `docusaurus.config.ts` is set to `/float-mcp/`
- **Images not loading**: Ensure images are in `docs/website/static/img/`
- **Navigation not updating**: Check `docs/website/sidebars.ts` configuration

## Contributing

When contributing documentation:

1. Follow the existing structure and naming conventions
2. Test changes locally before submitting PR
3. Include descriptive commit messages
4. Update this guide if you change the workflow

For more information about Docusaurus, see the [official documentation](https://docusaurus.io/docs).