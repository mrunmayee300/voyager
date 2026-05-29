import { Router } from 'express';
import { z } from 'zod';
import * as aiService from '../services/ai.service';
import { requireAuth } from '../middleware/auth';

export const aiRouter = Router();

aiRouter.use(requireAuth);

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  tripId: z.string().optional(),
  chatId: z.string().optional(),
});

aiRouter.post('/chat', async (req, res, next) => {
  try {
    const { message, tripId, chatId } = chatSchema.parse(req.body);
    const result = await aiService.chatWithAssistant(req.user!.userId, message, {
      tripId,
      chatId,
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

aiRouter.get('/chats', async (req, res, next) => {
  try {
    const chats = await aiService.getUserChats(req.user!.userId);
    res.json(chats);
  } catch (e) {
    next(e);
  }
});

aiRouter.get('/chats/:id/messages', async (req, res, next) => {
  try {
    const messages = await aiService.getChatMessages(req.user!.userId, req.params.id);
    res.json(messages);
  } catch (e) {
    next(e);
  }
});
