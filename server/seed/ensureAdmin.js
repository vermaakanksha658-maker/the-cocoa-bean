import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';

export async function ensureAdmin() {
  const count = await Admin.countDocuments();
  if (count > 0) return;

  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.warn(
      '[admin] No admin account exists and ADMIN_USERNAME/ADMIN_PASSWORD are not set. ' +
        'Create one via: npm run create-admin (server/), or set those env vars and restart.'
    );
    return null;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await Admin.create({ username, passwordHash });
  console.log(`[admin] Created initial admin account: ${admin.username}`);
  return admin;
}