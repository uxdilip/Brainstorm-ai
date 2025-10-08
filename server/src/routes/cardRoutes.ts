import express from 'express';
import { createCard, updateCard, moveCard, deleteCard } from '../controllers/cardController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createCard);
router.put('/:id', updateCard);
router.put('/:id/move', moveCard);
router.delete('/:id', deleteCard);

export default router;
