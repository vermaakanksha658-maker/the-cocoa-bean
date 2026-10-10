import express from 'express';
import { getMenu, createMenuItem } from '../controllers/menuController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getMenu);
router.post('/', requireAdmin, createMenuItem);

export default router;
