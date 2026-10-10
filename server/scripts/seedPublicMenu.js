import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import MenuItem from '../models/MenuItem.js';
import { menuItems } from '../menuItems.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// The menu served by /api/menu. Run repeatedly - items already present
// (matched case-insensitively by name) are skipped.
const ITEMS = menuItems;

const escaped = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  let created = 0;
  let skipped = 0;
  const existingAll = await MenuItem.find().select('name');
  const names = new Set(existingAll.map((i) => i.name.trim().toLowerCase()));

  for (const item of ITEMS) {
    const key = item.name.trim().toLowerCase();
    if (names.has(key)) {
      skipped += 1;
      continue;
    }
    const dup = await MenuItem.countDocuments({ name: { $regex: `^${escaped(item.name)}$`, $options: 'i' } });
    if (dup > 0) {
      skipped += 1;
      continue;
    }
    await MenuItem.create(item);
    names.add(key);
    created += 1;
    console.log(`created: ${item.name} | ${item.category} | ${item.price}`);
  }

  const total = await MenuItem.countDocuments();
  console.log(`done: created=${created} skipped=${skipped} totalMenuItems=${total}`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});