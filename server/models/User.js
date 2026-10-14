import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true, default: '' },
    passwordHash: { type: String, default: null },
    googleId: { type: String, sparse: true, unique: true },
    avatar: { type: String, default: '' },
    role: { type: String, default: 'customer', enum: ['customer'] },
    emailVerified: { type: Boolean, default: false },
    verifyTokenHash: { type: String, default: null },
    verifyTokenExpires: { type: Date, default: null },
    resetTokenHash: { type: String, default: null },
    resetTokenExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function (password) {
  if (!this.passwordHash) return Promise.resolve(false);
  return bcrypt.compare(String(password), this.passwordHash);
};

userSchema.methods.setPassword = async function (password) {
  this.passwordHash = await bcrypt.hash(String(password), 10);
};

userSchema.methods.createToken = function (minutes) {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const expires = new Date(Date.now() + minutes * 60 * 1000);
  return { token, hash, expires };
};

userSchema.methods.publicProfile = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    phone: this.phone,
    avatar: this.avatar,
    emailVerified: this.emailVerified,
    hasPassword: Boolean(this.passwordHash),
    role: this.role,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('User', userSchema);
