import mongoose from 'mongoose';

await mongoose.connect('mongodb://127.0.0.1:27017/cafe_service');
const users = await mongoose.connection.db.collection('users').find({}, { projection: { name: 1, email: 1, emailVerified: 1, createdAt: 1 } }).toArray();
console.log('ALL USERS:');
users.forEach((u) => console.log(`- ${u.name} | ${u.email} | verified=${u.emailVerified} | created=${u.createdAt}`));
process.exit(0);
