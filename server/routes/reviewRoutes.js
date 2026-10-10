import express from 'express';
import Review from '../models/Review.js';
import MenuItem from '../models/MenuItem.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const filter = { status: 'approved' };
    if (req.query.menuId) filter.menuItem = req.query.menuId;
    const limit = Math.min(50, Number(req.query.limit) || 50);
    const reviews = await Review.find(filter).sort({ createdAt: -1 }).limit(limit);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { menuItem, name, rating, comment } = req.body || {};
    if (!menuItem) return res.status(400).json({ message: 'Menu item is required' });
    const item = await MenuItem.findById(menuItem);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    const stars = Math.round(Number(rating));
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Your name is required' });
    }
    const review = await Review.create({
      menuItem: item._id,
      name: String(name).trim(),
      rating: stars,
      comment: comment == null ? '' : String(comment).trim(),
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;