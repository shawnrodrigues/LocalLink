# Security Policy

## Overview

This application is designed for **trusted local network environments only**. It is intended for personal use, home networks, small offices, or development teams that have complete control over their network infrastructure.

## ⚠️ Important Security Considerations

### Network Isolation

- **NOT for Internet Exposure**: This application should **NEVER** be exposed to the public internet without proper authentication and security measures
- **Trusted Networks Only**: Use only on networks where you trust all connected users
- **No Built-in Authentication**: By default, there is no user authentication - anyone with network access can use the application

### Current Security Limitations

1. **No Authentication**: No user login or password protection
2. **No Authorization**: All users have equal access to all files
3. **No Encryption**: Data transmitted over HTTP (not HTTPS)
4. **No Input Validation**: Limited validation on uploaded file types
5. **No Rate Limiting**: No protection against abuse or DOS attacks
6. **No Audit Logging**: User actions are not logged
7. **Directory Traversal**: Basic protection, but not hardened

## Recommended Security Practices

### For Home/Personal Use

1. **Firewall Configuration**
   - Only allow connections from your local network (192.168.x.x, 10.x.x.x)
   - Block external access on your router
   - Use Windows Firewall / iptables to restrict port 3308

2. **Network Segmentation**
   - Use a separate VLAN for guest devices
   - Keep sensitive devices on a trusted network segment

3. **Regular Maintenance**
   - Regularly delete unnecessary files from the uploads directory
   - Keep Node.js and dependencies updated: `npm audit` and `npm update`
   - Monitor disk usage to prevent storage exhaustion

### For Production/Team Use

If you need to use this in a production environment, consider implementing:

1. **Authentication Layer**
   - Add express-session and passport.js for user authentication
   - Implement JWT tokens for API access
   - Use environment variables for credentials

2. **HTTPS/TLS**
   - Generate SSL certificates (self-signed or Let's Encrypt)
   - Configure Express to use HTTPS
   - Enforce secure WebSocket connections (wss://)

3. **Input Validation & Sanitization**
   - Validate file types and extensions
   - Sanitize filenames to prevent injection attacks
   - Implement file type restrictions based on MIME types

4. **Rate Limiting**
   - Add express-rate-limit middleware
   - Limit upload frequency per IP
   - Implement WebSocket connection limits

5. **Security Headers**
   - Add helmet.js middleware for security headers
   - Implement CORS policies
   - Add CSP (Content Security Policy)

6. **Audit Logging**
   - Log all file uploads, downloads, and deletions
   - Log authentication attempts
   - Monitor for suspicious activity

## Reporting Security Vulnerabilities

If you discover a security vulnerability in this project:

1. **Do NOT** open a public GitHub issue
2. Email the maintainer directly (if provided)
3. Provide detailed information about the vulnerability
4. Allow reasonable time for a fix before public disclosure

## Security Updates

This project does not have a regular security update schedule. Users are responsible for:

- Keeping dependencies updated
- Monitoring for security advisories
- Implementing additional security measures as needed

## Disclaimer

This software is provided "as is" without warranty of any kind. The authors are not responsible for any security incidents, data loss, or damages resulting from the use of this software. Users assume all risks associated with deploying and using this application.

## Security Checklist Before Deployment

- [ ] Application is only accessible on local network
- [ ] Firewall rules are configured to block external access
- [ ] All users on the network are trusted
- [ ] Regular backups are configured
- [ ] Dependencies are up to date (`npm audit`)
- [ ] Sensitive files are not uploaded to the application
- [ ] Disk space monitoring is in place
- [ ] You understand this is NOT a production-grade security solution

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Remember: Security is a process, not a product. Stay vigilant and keep your systems updated!**
