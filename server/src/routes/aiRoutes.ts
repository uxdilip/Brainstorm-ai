import express from 'express';
import { getSuggestions, summarizeBoard, clusterBoardCards, searchCards } from '../controllers/aiController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.post('/suggest', getSuggestions);
router.post('/summarize', summarizeBoard);
router.post('/cluster', clusterBoardCards);
router.post('/search', searchCards);

export default router;
