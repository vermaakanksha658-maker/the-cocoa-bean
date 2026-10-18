import mongoose from 'mongoose';

await mongoose.connect('mongodb://127.0.0.1:27017/cafe_service');
const r = await mongoose.connection.db.collection('users').updateMany(
  { emailVerified: true, $or: [{ verifyTokenHash: { $exists: true, $ne: null } }, { verifyTokenExpires: { $exists: true, $ne: null } }] },
  { $set: { verifyTokenHash: null, verifyTokenExpires: null } }
);
console.log('stale verify tokens cleared for verified users:', r.modifiedCount);
process.exit(0);
