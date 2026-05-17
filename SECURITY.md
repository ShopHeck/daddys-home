# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability in DocForge, please report it responsibly.

### How to Report

1. **DO NOT** open a public GitHub issue for security vulnerabilities
2. Email security concerns to: **security@docforge.app**
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
   - Suggested fix (if any)

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 5 business days
- **Fix/Patch**: Within 30 days for critical issues

### Scope

The following are in scope:
- Authentication/authorization bypass
- SQL injection, XSS, SSRF
- Template injection / sandbox escape
- API key leakage
- Rate limiting bypass
- Data exposure between teams/users
- Privilege escalation

### Out of Scope

- Denial of service (rate limiting handles this)
- Social engineering
- Issues in third-party dependencies (report upstream)
- Issues requiring physical access

## Security Measures

DocForge implements the following security controls:

- **Template Sandboxing**: Isolated Handlebars environment with helper whitelist
- **Prototype Access Blocked**: `allowProtoPropertiesByDefault: false`
- **Request Interception**: External network requests blocked in PDF rendering
- **API Key Hashing**: SHA-256, never stored in plaintext
- **Rate Limiting**: Per-IP and per-API-key with Redis/Upstash
- **Body Size Limits**: 1MB templates, 5MB render requests
- **Security Headers**: HSTS, CSP, X-Frame-Options DENY, nosniff
- **Input Validation**: Zod schemas on all API endpoints
- **Separate Secrets**: Dedicated `INTERNAL_API_SECRET` for service auth

## Acknowledgments

We appreciate responsible disclosure and will credit reporters (with permission) in our changelog.
