import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const run = async () => {
  const username = (process.env.ADMIN_USERNAME || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.error('Set ADMIN_USERNAME and ADMIN_PASSWORD (env or server/.env) first.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  const existing = await Admin.findOne({ username });
  if (existing) {
    existing.passwordHash = await bcrypt.hash(password, 10);
    await existing.save();
    console.log(`Updated password for admin: ${username}`);
  } else {
    await Admin.create({ username, passwordHash: await bcrypt.hash(password, 10) });
    console.log(`Created admin: ${username}`);
  }
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});