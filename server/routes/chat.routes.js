import express from 'express';
import { chatWithGroq } from '../services/groq.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message, history, language, context } = req.body;
    if (!message) {
      return sendError(res, 'Message is required', 400);
    }

    const reply = await chatWithGroq(message, history || [], language, context);
    return sendSuccess(res, 'Chat response generated', { reply });
  } catch (err) {
    console.error('Chat route error:', err);
    return sendError(res, 'Failed to process chat message');
  }
});

export default router;
