import mongoose from 'mongoose';

await mongoose.connect('mongodb://127.0.0.1:27017/cafe_service');
const u = await mongoose.connection.db.collection('users').findOneAndUpdate(
  { email: 'cafesiteworks@gmail.com' },
  { $set: { name: 'Cafe Site Works', emailVerified: true } },
  { returnDocument: 'after' }
);
console.log('updated:', u.name, '| verified:', u.emailVerified);

const old = await mongoose.connection.db.collection('users').deleteMany({ email: /example\.com$/ });
console.log('old test users removed:', old.deletedCount);
process.exit(0);
