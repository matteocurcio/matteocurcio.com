import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import { Client } from 'ssh2';

const requiredEnv = [
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD_HASH',
  'SESSION_SECRET',
  'QNAP_HOST',
  'QNAP_USERNAME',
  'QNAP_PASSWORD'
];

const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length) {
  // eslint-disable-next-line no-console
  console.error(`Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const PORT = Number(process.env.PORT || 8787);
const app = express();
app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    name: 'qnap-admin.sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

const loginAttempts = new Map();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;

function now() {
  return Date.now();
}

function shQuote(input) {
  return `'${String(input).replace(/'/g, `'"'"'`)}'`;
}

function validUsername(username) {
  return /^[a-z][a-z0-9._-]{1,30}$/i.test(username);
}

function validPassword(password) {
  return typeof password === 'string' && password.length >= 10;
}

function runSsh(command) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let stdout = '';
    let stderr = '';

    conn
      .on('ready', () => {
        conn.exec(command, (err, stream) => {
          if (err) {
            conn.end();
            reject(err);
            return;
          }

          stream
            .on('close', (code) => {
              conn.end();
              if (code === 0) {
                resolve({ stdout, stderr, code });
              } else {
                const error = new Error(`SSH command failed with code ${code}`);
                error.stdout = stdout;
                error.stderr = stderr;
                error.code = code;
                reject(error);
              }
            })
            .on('data', (data) => {
              stdout += data.toString();
            });

          stream.stderr.on('data', (data) => {
            stderr += data.toString();
          });
        });
      })
      .on('error', (err) => {
        reject(err);
      })
      .connect({
        host: process.env.QNAP_HOST,
        port: Number(process.env.QNAP_PORT || 22),
        username: process.env.QNAP_USERNAME,
        password: process.env.QNAP_PASSWORD,
        readyTimeout: 20000
      });
  });
}

function authRequired(req, res, next) {
  if (!req.session?.authenticated) {
    res.redirect('/login');
    return;
  }
  next();
}

function loginPage(error = '') {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>QNAP User Admin</title>
  <style>
    body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f4f4ef;color:#181818;display:grid;place-items:center;height:100vh;margin:0}
    .card{width:min(420px,92vw);background:#fff;border:1px solid #ddd;border-radius:12px;padding:24px}
    h1{margin:0 0 8px;font-size:1.2rem}
    p{margin:0 0 16px;color:#555}
    label{display:block;font-size:.9rem;margin:12px 0 6px}
    input{width:100%;box-sizing:border-box;padding:10px;border:1px solid #ccc;border-radius:8px}
    button{margin-top:16px;width:100%;padding:10px;border:0;border-radius:8px;background:#111;color:#fff;cursor:pointer}
    .err{background:#fef0ef;border:1px solid #f0c6c4;color:#9f2f2a;padding:8px;border-radius:8px;margin-bottom:12px;${error ? '' : 'display:none;'}}
  </style>
</head>
<body>
  <form class="card" method="post" action="/login">
    <h1>QNAP User Admin</h1>
    <p>Restricted backend for client account provisioning.</p>
    <div class="err">${error}</div>
    <label>Username</label>
    <input name="username" autocomplete="username" required />
    <label>Password</label>
    <input type="password" name="password" autocomplete="current-password" required />
    <button type="submit">Sign In</button>
  </form>
</body>
</html>`;
}

function dashboardPage() {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>QNAP User Admin</title>
  <style>
    body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f4f4ef;color:#181818;margin:24px}
    h1{font-size:1.4rem;margin:0 0 16px}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:16px}
    .card{background:#fff;border:1px solid #ddd;border-radius:12px;padding:16px}
    label{display:block;font-size:.85rem;margin:10px 0 6px;color:#444}
    input{width:100%;box-sizing:border-box;padding:9px;border:1px solid #cfcfcf;border-radius:8px}
    button{margin-top:12px;padding:10px 12px;border:0;border-radius:8px;background:#111;color:#fff;cursor:pointer}
    .secondary{background:#333}
    .danger{background:#8f2323}
    .toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
    .small{font-size:.85rem;color:#666}
    .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre-wrap;font-size:.8rem;background:#fcfcfc;border:1px solid #ececec;border-radius:8px;padding:10px;max-height:220px;overflow:auto}
    ul{margin:8px 0 0;padding-left:18px}
  </style>
</head>
<body>
  <div class="toolbar">
    <h1>QNAP User Admin</h1>
    <form method="post" action="/logout"><button class="secondary" type="submit">Logout</button></form>
  </div>

  <div class="grid">
    <section class="card">
      <h2>Create User + Provision</h2>
      <p class="small">Creates QNAP user, then runs isolated share provisioning.</p>
      <label>Username</label><input id="createUsername" />
      <label>Password</label><input id="createPassword" type="password" />
      <button onclick="createUser()">Create</button>
    </section>

    <section class="card">
      <h2>Reset Password</h2>
      <label>Username</label><input id="resetUsername" />
      <label>New Password</label><input id="resetPassword" type="password" />
      <button onclick="resetPassword()">Reset</button>
    </section>

    <section class="card">
      <h2>Delete User</h2>
      <p class="small">Deletes user share, remote folder, and user account.</p>
      <label>Username</label><input id="deleteUsername" />
      <button class="danger" onclick="deleteUser()">Delete</button>
    </section>

    <section class="card">
      <h2>Re-run Provisioning</h2>
      <label>Username</label><input id="provUsername" />
      <button onclick="provisionUser()">Run</button>
    </section>

    <section class="card">
      <h2>Users</h2>
      <button onclick="loadUsers()">Refresh Users</button>
      <ul id="userList"></ul>
    </section>

    <section class="card">
      <h2>Execution Log</h2>
      <div id="log" class="mono">ready</div>
    </section>
  </div>

  <script>
    const log = document.getElementById('log');
    const userList = document.getElementById('userList');

    function writeLog(data) {
      const out = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      log.textContent = out;
    }

    async function api(path, payload) {
      const r = await fetch(path, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Request failed');
      return data;
    }

    async function createUser() {
      try {
        const username = document.getElementById('createUsername').value.trim();
        const password = document.getElementById('createPassword').value;
        const data = await api('/api/users/create', { username, password });
        writeLog(data);
        await loadUsers();
      } catch (e) { writeLog(String(e.message || e)); }
    }

    async function resetPassword() {
      try {
        const username = document.getElementById('resetUsername').value.trim();
        const password = document.getElementById('resetPassword').value;
        const data = await api('/api/users/password', { username, password });
        writeLog(data);
      } catch (e) { writeLog(String(e.message || e)); }
    }

    async function deleteUser() {
      try {
        const username = document.getElementById('deleteUsername').value.trim();
        const data = await api('/api/users/delete', { username });
        writeLog(data);
        await loadUsers();
      } catch (e) { writeLog(String(e.message || e)); }
    }

    async function provisionUser() {
      try {
        const username = document.getElementById('provUsername').value.trim();
        const data = await api('/api/users/provision', { username });
        writeLog(data);
      } catch (e) { writeLog(String(e.message || e)); }
    }

    async function loadUsers() {
      try {
        const r = await fetch('/api/users/list');
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'list failed');
        userList.innerHTML = data.users.map((u) => '<li>' + u + '</li>').join('');
      } catch (e) {
        writeLog(String(e.message || e));
      }
    }

    loadUsers();
  </script>
</body>
</html>`;
}

function sanitizeError(err) {
  const payload = {
    message: err?.message || 'unknown error',
    stderr: err?.stderr ? String(err.stderr).trim() : '',
    stdout: err?.stdout ? String(err.stdout).trim() : ''
  };
  return payload;
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/login', (req, res) => {
  if (req.session?.authenticated) {
    res.redirect('/');
    return;
  }
  res.status(200).send(loginPage(''));
});

app.post('/login', async (req, res) => {
  const ip = req.ip || 'unknown';
  const bucket = loginAttempts.get(ip) || { count: 0, ts: now() };

  if (now() - bucket.ts > WINDOW_MS) {
    bucket.count = 0;
    bucket.ts = now();
  }

  if (bucket.count >= MAX_ATTEMPTS) {
    res.status(429).send(loginPage('Too many attempts. Try again later.'));
    return;
  }

  const { username = '', password = '' } = req.body;
  const usernameOk = username === process.env.ADMIN_USERNAME;
  const passwordOk = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);

  if (!usernameOk || !passwordOk) {
    bucket.count += 1;
    loginAttempts.set(ip, bucket);
    res.status(401).send(loginPage('Invalid credentials'));
    return;
  }

  loginAttempts.delete(ip);
  req.session.authenticated = true;
  req.session.user = username;
  res.redirect('/');
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.get('/', authRequired, (_req, res) => {
  res.status(200).send(dashboardPage());
});

app.get('/api/users/list', authRequired, async (_req, res) => {
  try {
    const cmd = "awk -F: '$3>=1000 && $1!~/(nobody|guest)/{print $1}' /etc/passwd | sort";
    const out = await runSsh(cmd);
    const users = out.stdout
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((u) => u !== 'admin');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list users', detail: sanitizeError(err) });
  }
});

app.post('/api/users/create', authRequired, async (req, res) => {
  const { username = '', password = '' } = req.body;
  if (!validUsername(username)) {
    res.status(400).json({ error: 'Invalid username. Use letters/numbers/._- and start with a letter.' });
    return;
  }
  if (!validPassword(password)) {
    res.status(400).json({ error: 'Password must be at least 10 characters.' });
    return;
  }

  const qUser = shQuote(username);
  const qPass = shQuote(password);
  const qHome = shQuote(`/share/homes/${username}`);
  const qScript = shQuote('/share/CACHEDEV1_DATA/remote/provision_isolated_user.sh');

  const cmd = [
    'set -e',
    `if id -u ${qUser} >/dev/null 2>&1; then echo "User already exists" >&2; exit 11; fi`,
    `adduser -D -h ${qHome} -s /bin/sh -G everyone -p ${qPass} ${qUser}`,
    `if [ ! -x ${qScript} ]; then echo "Provision script missing: /share/CACHEDEV1_DATA/remote/provision_isolated_user.sh" >&2; exit 12; fi`,
    `/share/CACHEDEV1_DATA/remote/provision_isolated_user.sh ${qUser}`
  ].join('\n');

  try {
    const out = await runSsh(cmd);
    res.json({ ok: true, action: 'create', username, stdout: out.stdout.trim(), stderr: out.stderr.trim() });
  } catch (err) {
    res.status(500).json({ error: 'Create/provision failed', detail: sanitizeError(err) });
  }
});

app.post('/api/users/password', authRequired, async (req, res) => {
  const { username = '', password = '' } = req.body;
  if (!validUsername(username)) {
    res.status(400).json({ error: 'Invalid username.' });
    return;
  }
  if (!validPassword(password)) {
    res.status(400).json({ error: 'Password must be at least 10 characters.' });
    return;
  }

  const qPair = shQuote(`${username}:${password}`);
  const qUser = shQuote(username);
  const cmd = [
    'set -e',
    `id -u ${qUser} >/dev/null 2>&1`,
    `echo ${qPair} | chpasswd`
  ].join('\n');

  try {
    const out = await runSsh(cmd);
    res.json({ ok: true, action: 'password_reset', username, stdout: out.stdout.trim(), stderr: out.stderr.trim() });
  } catch (err) {
    res.status(500).json({ error: 'Password reset failed', detail: sanitizeError(err) });
  }
});

app.post('/api/users/provision', authRequired, async (req, res) => {
  const { username = '' } = req.body;
  if (!validUsername(username)) {
    res.status(400).json({ error: 'Invalid username.' });
    return;
  }

  const qUser = shQuote(username);
  const qScript = shQuote('/share/CACHEDEV1_DATA/remote/provision_isolated_user.sh');
  const cmd = [
    'set -e',
    `id -u ${qUser} >/dev/null 2>&1`,
    `if [ ! -x ${qScript} ]; then echo "Provision script missing" >&2; exit 12; fi`,
    `/share/CACHEDEV1_DATA/remote/provision_isolated_user.sh ${qUser}`
  ].join('\n');

  try {
    const out = await runSsh(cmd);
    res.json({ ok: true, action: 'provision', username, stdout: out.stdout.trim(), stderr: out.stderr.trim() });
  } catch (err) {
    res.status(500).json({ error: 'Provisioning failed', detail: sanitizeError(err) });
  }
});

app.post('/api/users/delete', authRequired, async (req, res) => {
  const { username = '' } = req.body;
  if (!validUsername(username)) {
    res.status(400).json({ error: 'Invalid username.' });
    return;
  }
  if (username.toLowerCase() === 'admin') {
    res.status(400).json({ error: 'Refusing to delete admin user.' });
    return;
  }

  const qUser = shQuote(username);
  const qFolder = shQuote(`/share/CACHEDEV1_DATA/remote/${username}`);

  const cmd = [
    'set -e',
    `if grep -q '^\\[${username}\\]' /etc/config/smb.conf; then /sbin/delshare ${qUser}; fi`,
    `rm -rf ${qFolder}`,
    `if id -u ${qUser} >/dev/null 2>&1; then deluser ${qUser}; fi`,
    '/etc/init.d/smb.sh restart >/dev/null 2>&1 || true'
  ].join('\n');

  try {
    const out = await runSsh(cmd);
    res.json({ ok: true, action: 'delete', username, stdout: out.stdout.trim(), stderr: out.stderr.trim() });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed', detail: sanitizeError(err) });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`QNAP admin panel running on http://localhost:${PORT}`);
});
