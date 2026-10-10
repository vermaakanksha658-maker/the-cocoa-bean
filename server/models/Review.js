import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: '' },
    status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  },
  { timestamps: true }
);

export default mongoose.model('Review', reviewSchema);