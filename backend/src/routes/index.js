import { Router } from 'express';
import {
  getNextQuestion,
  startSession,
  submitAnswer,
} from '../controllers/conversationController.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the ConverseIQ API' });
});

router.post('/sessions', startSession);
router.get('/sessions/:sessionId/next-question', getNextQuestion);
router.post('/sessions/:sessionId/answers', submitAnswer);

export default router;
