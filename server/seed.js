import dotenv from 'dotenv';
import connectDB from './config/db.js';
import MenuItem from './models/MenuItem.js';
import { menuItems } from './menuItems.js';

dotenv.config();

const seed = async () => {
  await connectDB();
  try {
    await MenuItem.deleteMany({});
    await MenuItem.insertMany(menuItems);
    console.log(`Seeded ${menuItems.length} menu items`);
  } catch (error) {
    console.error(`Seed error: ${error.message}`);
  } finally {
    process.exit(0);
  }
};

seed();