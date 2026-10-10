import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true },
    category: {
      type: String,
      required: true,
      enum: ['coffee', 'tea', 'food', 'dessert', 'beverage', 'bakes', 'cold'],
    },
    image: { type: String, default: '' },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('MenuItem', menuItemSchema);
