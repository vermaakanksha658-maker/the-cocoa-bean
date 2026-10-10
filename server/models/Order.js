import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(v) => Array.isArray(v) && v.length > 0, 'Order must contain at least one item'],
    },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, default: 'placed', enum: ['placed', 'confirmed', 'completed', 'cancelled'] },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);