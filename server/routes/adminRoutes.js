import express from 'express';
import Admin from '../models/Admin.js';
import MenuItem from '../models/MenuItem.js';
import Reservation from '../models/Reservation.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import { requireAdmin, signToken, cookieOptions, TOKEN_NAME } from '../middleware/auth.js';

const router = express.Router();

const MENU_CATEGORIES = ['coffee', 'tea', 'food', 'dessert', 'beverage', 'bakes', 'cold'];
const RESERVATION_STATUSES = ['pending', 'confirmed', 'cancelled'];
const REVIEW_STATUSES = ['pending', 'approved', 'rejected'];

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const admin = await Admin.findOne({ username: String(username).trim().toLowerCase() });
    const ok = admin && (await admin.comparePassword(String(password)));

    if (!ok) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    res.cookie(TOKEN_NAME, signToken(admin), cookieOptions);
    return res.json({ id: admin._id, username: admin.username, name: admin.name || '' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie(TOKEN_NAME, { ...cookieOptions, maxAge: undefined });
  res.json({ ok: true });
});

router.get('/me', requireAdmin, (req, res) => {
  res.json({ id: req.admin.id, username: req.admin.username });
});

router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [
      menuTotal,
      menuAvailable,
      resTotal,
      resPending,
      resConfirmed,
      resCancelled,
      orderTotal,
      orderPlaced,
      revenueAgg,
      reviewTotal,
      reviewPending,
      reviewApproved,
    ] = await Promise.all([
      MenuItem.countDocuments(),
      MenuItem.countDocuments({ available: true }),
      Reservation.countDocuments(),
      Reservation.countDocuments({ status: 'pending' }),
      Reservation.countDocuments({ status: 'confirmed' }),
      Reservation.countDocuments({ status: 'cancelled' }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'placed' }),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Review.countDocuments(),
      Review.countDocuments({ status: 'pending' }),
      Review.countDocuments({ status: 'approved' }),
    ]);
    const categories = await MenuItem.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);

    res.json({
      menu: { total: menuTotal, available: menuAvailable, categories },
      reservations: { total: resTotal, pending: resPending, confirmed: resConfirmed, cancelled: resCancelled },
      orders: { total: orderTotal, placed: orderPlaced, revenue: revenueAgg[0]?.total || 0 },
      reviews: { total: reviewTotal, pending: reviewPending, approved: reviewApproved },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/menu', requireAdmin, async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/menu', requireAdmin, async (req, res) => {
  try {
    const { name, description, price, category, image, available } = req.body || {};
    if (!name || !String(name).trim() || price == null) {
      return res.status(400).json({ message: 'Name and price are required' });
    }
    if (!MENU_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: `Category must be one of: ${MENU_CATEGORIES.join(', ')}` });
    }
    if (Number(price) < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }
    const item = await MenuItem.create({
      name: String(name).trim(),
      description: description == null ? '' : String(description).trim(),
      price: Number(price),
      category,
      image: image == null ? '' : String(image).trim(),
      available: available == null ? true : Boolean(available),
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/menu/:id', requireAdmin, async (req, res) => {
  try {
    const { name, description, price, category, image, available } = req.body || {};
    const patch = {};
    if (name != null) {
      if (!String(name).trim()) return res.status(400).json({ message: 'Name cannot be empty' });
      patch.name = String(name).trim();
    }
    if (description != null) patch.description = String(description).trim();
    if (price != null) {
      if (Number(price) < 0) return res.status(400).json({ message: 'Price cannot be negative' });
      patch.price = Number(price);
    }
    if (category != null) {
      if (!MENU_CATEGORIES.includes(category)) {
        return res.status(400).json({ message: `Category must be one of: ${MENU_CATEGORIES.join(', ')}` });
      }
      patch.category = category;
    }
    if (image != null) patch.image = String(image).trim();
    if (available != null) patch.available = Boolean(available);

    const item = await MenuItem.findByIdAndUpdate(req.params.id, patch, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/menu/:id', requireAdmin, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ ok: true, id: req.params.id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/reservations', requireAdmin, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status && RESERVATION_STATUSES.includes(req.query.status)) filter.status = req.query.status;
    const reservations = await Reservation.find(filter).sort({ createdAt: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/reservations/:id', requireAdmin, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    res.json(reservation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/reservations/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!RESERVATION_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${RESERVATION_STATUSES.join(', ')}` });
    }
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    res.json(reservation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/reviews', requireAdmin, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status && REVIEW_STATUSES.includes(req.query.status)) filter.status = req.query.status;
    const reviews = await Review.find(filter).populate('menuItem', 'name').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/reviews/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!REVIEW_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${REVIEW_STATUSES.join(', ')}` });
    }
    const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/reviews/:id', requireAdmin, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ ok: true, id: req.params.id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;