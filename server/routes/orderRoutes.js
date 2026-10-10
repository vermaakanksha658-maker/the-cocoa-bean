import express from 'express';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const ORDER_STATUSES = ['placed', 'confirmed', 'completed', 'cancelled'];

router.post('/', async (req, res) => {
  try {
    const { name, phone, items } = req.body || {};
    if (!name || !String(name).trim() || !phone || !String(phone).trim()) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    const clean = [];
    for (const line of items) {
      const qty = Math.max(1, Math.min(99, Number(line.qty) || 1));
      const menu = line.menuItem ? await MenuItem.findById(line.menuItem) : null;
      if (!menu) return res.status(404).json({ message: 'One of the selected items is no longer available' });
      clean.push({ menuItem: menu._id, name: menu.name, price: menu.price, qty });
    }

    const total = clean.reduce((sum, line) => sum + line.price * line.qty, 0);
    const order = await Order.create({ name: String(name).trim(), phone: String(phone).trim(), items: clean, total });
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/', requireAdmin, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status && ORDER_STATUSES.includes(req.query.status)) filter.status = req.query.status;
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${ORDER_STATUSES.join(', ')}` });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;