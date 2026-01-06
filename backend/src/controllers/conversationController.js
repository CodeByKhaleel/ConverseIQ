import conversationService from '../services/conversationService.js';
import { logger } from '../utils/logger.js';

export const startSession = async (req, res) => {
  try {
    const result = await conversationService.startSession(req.body ?? {});
    res.status(201).json({
      session: result.session,
      nextQuestion: result.nextQuestion,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getNextQuestion = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await conversationService.getNextQuestion(sessionId);
    res.json({
      session: result.session,
      nextQuestion: result.nextQuestion,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId, response } = req.body ?? {};
    const result = await conversationService.recordAnswer(
      sessionId,
      questionId,
      response
    );
    res.status(201).json({
      answer: result.answer,
      session: result.session,
      nextQuestion: result.nextQuestion,
    });
  } catch (error) {
    handleError(res, error);
  }
};

function handleError(res, error) {
  logger.error('Conversation controller error:', error.message);
  const statusCode = error.message.includes('not found') ? 404 : 400;
  res.status(statusCode).json({ error: error.message });
}
