import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    guests: { type: String, required: true },
    status: { type: String, default: 'pending', enum: ['pending', 'confirmed', 'cancelled'] },
  },
  { timestamps: true }
);

export default mongoose.model('Reservation', reservationSchema);