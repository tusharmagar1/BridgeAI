import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  createConversation,
  getConversation,
  getConversationMessages,
  getConversationsByUser,
  streamChat,
  updateMessageFeedback,
  deleteConversation,
} from '../services/chatService.js';
import { query } from '../config/database.js';

// NOTE: X-Client-Id is a lightweight ownership check tied to Issue 4's client-id generation, not real authentication. Revisit if/when proper auth is added.
const router = Router();

// Create new conversation
router.post('/conversations', async (req, res) => {
  try {
    const { userId, title = 'New Conversation' } = req.body;
    const conversation = await createConversation(userId || uuidv4(), title);
    res.json({ success: true, data: conversation });
  } catch (err) {
    console.error('Create conversation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete all conversations for a user
router.delete('/conversations', async (req, res) => {
  const clientId = req.headers['x-client-id'];
  if (!clientId) return res.status(401).json({ success: false, error: 'Unauthorized' });

  try {
    await query('DELETE FROM conversations WHERE user_id = ?', [clientId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a single conversation permanently
router.delete('/conversations/:id', async (req, res) => {
  const clientId = req.headers['x-client-id'];
  if (!clientId) return res.status(401).json({ success: false, error: 'Unauthorized' });

  try {
    const conversation = await getConversation(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }
    if (conversation.user_id !== clientId) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    await deleteConversation(req.params.id);
    res.json({ success: true, message: 'Conversation deleted permanently' });
  } catch (err) {
    console.error('Delete conversation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get user's conversations
router.get('/conversations/:userId', async (req, res) => {
  const clientId = req.headers['x-client-id'];
  if (!clientId) return res.status(401).json({ success: false, error: 'Unauthorized' });
  if (clientId !== req.params.userId) return res.status(403).json({ success: false, error: 'Forbidden' });

  try {
    const conversations = await getConversationsByUser(req.params.userId);
    res.json({ success: true, data: conversations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get conversation messages
router.get('/conversations/:id/messages', async (req, res) => {
  const clientId = req.headers['x-client-id'];
  if (!clientId) return res.status(401).json({ success: false, error: 'Unauthorized' });

  try {
    const conversation = await getConversation(req.params.id);
    if (!conversation) return res.status(404).json({ success: false, error: 'Conversation not found' });
    if (conversation.user_id !== clientId) return res.status(403).json({ success: false, error: 'Forbidden' });

    const messages = await getConversationMessages(req.params.id);
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Stream chat
router.post('/conversations/:id/chat', async (req, res) => {
  const clientId = req.headers['x-client-id'];
  if (!clientId) return res.status(401).json({ success: false, error: 'Unauthorized' });

  try {
    const conversation = await getConversation(req.params.id);
    if (!conversation) return res.status(404).json({ success: false, error: 'Conversation not found' });
    if (conversation.user_id !== clientId) return res.status(403).json({ success: false, error: 'Forbidden' });

    const { message, aiConfig } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }
    await streamChat(req.params.id, message, aiConfig, res);
  } catch (err) {
    console.error('Chat stream error:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
});

// Update message feedback
router.patch('/messages/:id/feedback', async (req, res) => {
  const clientId = req.headers['x-client-id'];
  if (!clientId) return res.status(401).json({ success: false, error: 'Unauthorized' });

  try {
    const msgResult = await query('SELECT conversation_id FROM messages WHERE id = ?', [req.params.id]);
    if (!msgResult.rows.length) return res.status(404).json({ success: false, error: 'Message not found' });
    
    const conversation = await getConversation(msgResult.rows[0].conversation_id);
    if (!conversation || conversation.user_id !== clientId) return res.status(403).json({ success: false, error: 'Forbidden' });

    const { feedback } = req.body;
    await updateMessageFeedback(req.params.id, feedback);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
