import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    guests: { type: String, required: true },
    occasion: { type: String, trim: true, default: '' },
    status: { type: String, default: 'pending', enum: ['pending', 'confirmed', 'cancelled'] },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Reservation', reservationSchema);