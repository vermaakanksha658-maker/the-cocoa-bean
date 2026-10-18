import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

await mongoose.connect('mongodb://127.0.0.1:27017/cafe_service');
const col = mongoose.connection.db.collection('users');

const pw = await bcrypt.hash('password123', 10);
const docs = [
  { name: 'Slot Test', email: 'e2e21791970304235@x.com', emailVerified: false },
  { name: 'Right User', email: 'flowtest664824616@gmail.com', emailVerified: false },
  { name: 'Right User', email: 'flowtest61623749@gmail.com', emailVerified: false },
];
for (const d of docs) {
  const exists = await col.findOne({ email: d.email });
  if (exists) { console.log('already exists:', d.email); continue; }
  await col.insertOne({
    name: d.name,
    email: d.email,
    passwordHash: pw,
    phone: '',
    avatar: '',
    role: 'customer',
    emailVerified: d.emailVerified,
    verifyTokenHash: null,
    verifyTokenExpires: null,
    resetTokenHash: null,
    resetTokenExpires: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log('restored:', d.email);
}

const u = await col.find({}, { projection: { name: 1, email: 1, emailVerified: 1 } }).sort({ createdAt: 1 }).toArray();
u.forEach((x, i) => console.log(`${i + 1}. ${x.name} | ${x.email} | verified:${x.emailVerified ? 'yes' : 'no'}`));
console.log('TOTAL:', u.length);
process.exit(0);
