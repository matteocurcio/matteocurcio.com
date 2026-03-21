# QNAP User Admin Backend

Small password-protected admin app to manage QNAP users and isolate each user to a dedicated folder/share.

## What it does

- Admin login (username + bcrypt-hashed password)
- Create user + auto-provision QNAP isolation
- Reset user password
- Delete user (share + remote folder + user account)
- List users
- Re-run provisioning for an existing user

## Prerequisites on QNAP

- `cloudflared` tunnel already running (for external access)
- Script exists and is executable:
  - `/share/CACHEDEV1_DATA/remote/provision_isolated_user.sh`
- SSH enabled for the QNAP admin account used by this backend

## Setup

1. Install dependencies

```bash
cd tools/qnap-admin
npm install
```

2. Generate admin password hash

```bash
npm run hash-password -- "YOUR_ADMIN_PANEL_PASSWORD"
```

3. Create env file

```bash
cp .env.example .env
```

Then edit `.env`:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`
- `SESSION_SECRET`
- `QNAP_HOST`, `QNAP_PORT`, `QNAP_USERNAME`, `QNAP_PASSWORD`

4. Run backend

```bash
npm start
```

Open:

- `http://localhost:8787`

## Security notes

- Run this behind Cloudflare Access if exposed externally.
- Rotate QNAP admin password and backend session secret periodically.
- Prefer a dedicated QNAP automation account instead of full `admin` where possible.
- Set `COOKIE_SECURE=true` if serving this panel over HTTPS.

## Operational flow for new clients

1. Create user in admin backend (username + password)
2. Backend runs:
   - `adduser ...`
   - `/share/CACHEDEV1_DATA/remote/provision_isolated_user.sh <username>`
3. User is isolated to their own share/folder.

## Limitation

This backend executes SSH commands on QNAP; availability depends on QNAP SSH and admin credentials.
