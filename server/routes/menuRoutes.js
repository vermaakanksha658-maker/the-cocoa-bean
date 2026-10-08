import express from 'express';
import { getMenu, createMenuItem } from '../controllers/menuController.js';

const router = express.Router();

router.get('/', getMenu);
router.post('/', createMenuItem);

export default router;
