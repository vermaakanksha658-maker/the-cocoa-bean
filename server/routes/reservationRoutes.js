import express from 'express';
import Reservation from '../models/Reservation.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const SLOTS = [];
for (let h = 11; h <= 21; h++) {
  SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}

router.get('/slots', async (req, res) => {
  try {
    const date = String(req.query.date || '');
    const filter = date ? { date, status: { $ne: 'cancelled' } } : { date: { $exists: false } };
    const taken = (await Reservation.find(filter).select('time -_id').lean()).map((r) => r.time);
    res.json({ date, slots: SLOTS, taken: [...new Set(taken)] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { date, time } = req.body || {};
    if (date && time) {
      const clash = await Reservation.findOne({ date, time, status: { $ne: 'cancelled' } });
      if (clash) {
        return res
          .status(409)
          .json({ message: 'Just missed it — that time slot was just booked. Please pick another time.' });
      }
    }
    const reservation = await Reservation.create({ ...req.body, status: 'pending' });
    res.status(201).json(reservation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/', requireAdmin, async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;