# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within Float MCP, please send an email to the maintainer. All security vulnerabilities will be promptly addressed.

Please do not report security vulnerabilities through public GitHub issues.

## Security Measures

### Container Security

We use several measures to ensure our Docker containers are secure:

1. **Minimal Base Images**: We use distroless images for production to minimize attack surface
2. **Non-root User**: Containers run as non-root user by default
3. **Regular Updates**: Dependabot automatically creates PRs for base image updates
4. **Vulnerability Scanning**: Trivy scans run on every push and PR

### Dependency Management

- **Automated Updates**: Dependabot monitors and updates dependencies weekly
- **Audit Checks**: npm audit runs in CI/CD pipeline
- **Minimal Dependencies**: We keep dependencies to a minimum
- **Production vs Dev**: Clear separation between production and development dependencies

### Code Security

- **Type Safety**: TypeScript provides compile-time type checking
- **Input Validation**: Zod schemas validate all API inputs
- **Environment Variables**: Sensitive data stored in environment variables, never in code
- **No Secrets in Code**: Pre-commit hooks prevent accidental secret commits

## Security Scanning

### Trivy Configuration

We use Trivy for container vulnerability scanning with the following configuration:

- **Severity Threshold**: HIGH and CRITICAL vulnerabilities block deployments
- **Ignore Unfixed**: We ignore vulnerabilities without available fixes
- **False Positives**: Documented in `.trivyignore` with justification

### Known Issues

Some vulnerabilities reported by scanners are false positives or not applicable to our use case:

1. **Base Image CVEs**: Many CVEs are in OS packages we don't use (e.g., Perl, tar utilities)
2. **Build-time Only**: Some vulnerabilities only affect build tools, not runtime
3. **Local Access Required**: Some CVEs require local/physical access which doesn't apply to containers

See `.trivyignore` for a complete list of suppressed vulnerabilities with explanations.

## Best Practices for Contributors

1. **Never commit secrets**: Use environment variables for sensitive data
2. **Validate inputs**: Use Zod schemas for all external inputs
3. **Keep dependencies updated**: Run `npm update` regularly
4. **Check for vulnerabilities**: Run `npm audit` before committing
5. **Use type safety**: Leverage TypeScript's type system
6. **Follow least privilege**: Request minimum necessary permissions

## Incident Response

In case of a security incident:

1. **Assess**: Determine the scope and impact of the vulnerability
2. **Contain**: Implement immediate fixes to prevent exploitation
3. **Communicate**: Notify affected users if necessary
4. **Remediate**: Deploy permanent fixes
5. **Review**: Conduct post-incident review to prevent recurrence

## Compliance

This project follows security best practices including:

- OWASP Top 10 awareness
- Container security best practices
- Node.js security best practices
- GitHub security best practices

## Security Updates

Security updates are released as soon as possible after discovery and verification of vulnerabilities. We recommend all users to:

- Watch this repository for security advisories
- Enable Dependabot alerts in your forks
- Keep your deployment up-to-date with the latest releases

## Contact

For security concerns, please contact the maintainer directly rather than opening a public issue.
