# Client Portal Setup (Direct QNAP Web Interface)

This setup is for large video files.

## Architecture

- Website page: `/client` (handoff page only)
- Transfer UI: `https://files.matteocurcio.com`
- Backend: QNAP File Station
- Protection layer: Cloudflare Tunnel + Cloudflare Access

No upload proxy runs on Cloudflare Pages.

## 1) QNAP preparation

1. Create/verify shared folder: `remote`
2. Create per-user folder: `remote/user1`
3. Permissions:
   - `user1`: read/write only on `remote/user1`
   - no access to other user folders
   - guest access disabled
4. Disable unused services for user accounts (FTP/WebDAV/AFP unless required).

## 2) Publish QNAP through Cloudflare Tunnel

1. Install/enable `cloudflared` connector on your network.
2. Create tunnel in Cloudflare Zero Trust.
3. Add public hostname:
   - Hostname: `files.matteocurcio.com`
   - Service: `http://10.0.60.10:8080` (or your QNAP HTTPS/admin endpoint)
4. Test external access to `files.matteocurcio.com`.

## 3) Protect with Cloudflare Access

1. Zero Trust -> Access -> Applications -> Add application
2. Type: Self-hosted
3. Domain: `files.matteocurcio.com`
4. Policies:
   - Allow only approved emails/users
   - Optionally require OTP/MFA

## 4) Harden QNAP login surface

1. Disable direct internet exposure / port forwarding for QNAP web/SSH.
2. Keep QNAP reachable externally only through Cloudflare Tunnel.
3. Keep account lockout and strong passwords enabled.
4. Restrict admin login; use named admin account for operations.

## 5) Website integration

- `/client` links users to `https://files.matteocurcio.com`.
- Access control is enforced by Cloudflare Access + QNAP permissions.

## Validation checklist

- `user1` can upload/download inside `remote/user1`
- `user1` cannot browse other user folders
- `files.matteocurcio.com` requires Cloudflare Access login
- Large video uploads complete without Cloudflare Pages function limits
