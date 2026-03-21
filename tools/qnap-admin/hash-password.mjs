import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  // eslint-disable-next-line no-console
  console.error('Usage: npm run hash-password -- "your-admin-password"');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
// eslint-disable-next-line no-console
console.log(hash);
