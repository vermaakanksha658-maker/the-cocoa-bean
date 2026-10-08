import dotenv from 'dotenv';
import connectDB from './config/db.js';
import MenuItem from './models/MenuItem.js';

dotenv.config();

const items = [
  {
    name: 'Signature Latte',
    desc: 'Double espresso, velvet steamed milk, cocoa dust',
    price: 320,
    image: 'https://images.unsplash.com/photo-1573074699584-303c79998c3a?fm=jpg&q=80&w=700&auto=format&fit=crop',
    category: 'coffee',
  },
  {
    name: 'Hand-Poured Pour Over',
    desc: 'Single-origin beans, slow dripped to perfection',
    price: 290,
    image: 'https://images.unsplash.com/photo-1561522983-385a76fbb4cb?fm=jpg&q=80&w=700&auto=format&fit=crop',
    category: 'coffee',
  },
  {
    name: 'Golden Mocha',
    desc: 'Dark chocolate, espresso and silky foam art',
    price: 340,
    image: 'https://images.unsplash.com/photo-1757839462651-e457481ede49?fm=jpg&q=80&w=700&auto=format&fit=crop',
    category: 'coffee',
  },
  {
    name: 'Butter Croissant',
    desc: 'Flaky, 24-layer, baked fresh every sunrise',
    price: 180,
    image: 'https://images.unsplash.com/photo-1714801172470-bf71c2ac1884?fm=jpg&q=80&w=700&auto=format&fit=crop',
    category: 'bakes',
  },
  {
    name: 'Petit Desserts',
    desc: 'Tarts, cheesecakes & pastries from our oven',
    price: 210,
    image: 'https://images.unsplash.com/photo-1747829581661-25b6c86db988?fm=jpg&q=80&w=700&auto=format&fit=crop',
    category: 'bakes',
  },
  {
    name: 'Cocoa Bean & Me',
    desc: 'Slow reading corner: iced coffee with a good book',
    price: 360,
    image: 'https://images.unsplash.com/photo-1755882941433-935ff9b7ad0e?fm=jpg&q=80&w=700&auto=format&fit=crop',
    category: 'cold',
  },
];

const seed = async () => {
  await connectDB();
  try {
    await MenuItem.deleteMany({});
    await MenuItem.insertMany(items);
    console.log(`Seeded ${items.length} menu items`);
  } catch (error) {
    console.error(`Seed error: ${error.message}`);
  } finally {
    process.exit(0);
  }
};

seed();