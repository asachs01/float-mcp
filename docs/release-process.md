# Release Process

## Steps

1. Ensure all tests and linting pass.
2. Bump the version in `package.json` (semantic versioning).
3. Update `CHANGELOG.md` with the new version and date.
4. Commit and tag the release.
5. Push to GitHub (`git push && git push --tags`).
6. Build and publish the Docker image (if applicable).
7. Announce the release.

## Notes

- Never skip tests or linting before a release.
- Always document major changes and new features. 