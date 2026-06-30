import { query } from '../config/database.js';
import redisClient from '../config/redis.js';
import { streamChatCompletion, detectLanguage, parseRequestedLanguage } from './groqService.js';
import { v4 as uuidv4 } from 'uuid';

export const createConversation = async (userId, title, locale = 'en') => {
  // Ensure user exists before creating conversation (auto-register)
  await query(
    'INSERT IGNORE INTO users (id) VALUES (?)',
    [userId]
  );
  const id = uuidv4();
  await query(
    'INSERT INTO conversations (id, user_id, title, locale) VALUES (?, ?, ?, ?)',
    [id, userId, title, locale]
  );
  const result = await query('SELECT * FROM conversations WHERE id = ?', [id]);
  return result.rows[0];
};

export const getConversation = async (conversationId) => {
  const result = await query(
    'SELECT * FROM conversations WHERE id = ?',
    [conversationId]
  );
  return result.rows[0];
};

export const getConversationMessages = async (conversationId, limit = 50) => {
  const result = await query(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT ?',
    [conversationId, limit]
  );
  return result.rows;
};

export const saveMessage = async (conversationId, role, content, model = null, tokensUsed = null, latencyMs = null) => {
  const id = uuidv4();
  await query(
    'INSERT INTO messages (id, conversation_id, role, content, model, tokens_used, latency_ms) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, conversationId, role, content, model, tokensUsed, latencyMs]
  );
  const result = await query('SELECT * FROM messages WHERE id = ?', [id]);
  return result.rows[0];
};

export const getConversationsByUser = async (userId, limit = 20) => {
  const result = await query(
    'SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT ?',
    [userId, limit]
  );
  return result.rows;
};

export const updateConversationTitle = async (conversationId, title) => {
  await query(
    'UPDATE conversations SET title = ?, updated_at = NOW() WHERE id = ?',
    [title, conversationId]
  );
};

export const updateMessageFeedback = async (messageId, feedback) => {
  await query(
    'UPDATE messages SET feedback = ? WHERE id = ?',
    [feedback, messageId]
  );
};

export const deleteConversation = async (conversationId) => {
  await query('DELETE FROM conversations WHERE id = ?', [conversationId]);
};

export const getCachedTranslation = async (textHash, targetLang) => {
  try {
    if (!redisClient.isReady) return null;
    const key = `tr:${textHash}:${targetLang}`;
    const cached = await redisClient.get(key);
    return cached;
  } catch (err) {
    return null;
  }
};

export const setCachedTranslation = async (textHash, targetLang, translation) => {
  try {
    if (!redisClient.isReady) return;
    const key = `tr:${textHash}:${targetLang}`;
    await redisClient.setEx(key, 604800, translation); // 7 days TTL
  } catch (err) {
    // silently fail
  }
};

export const streamChat = async (conversationId, userMessage, aiConfig, res) => {
  const startTime = Date.now();

  // Determine target language based on priority rules
  let targetLocale = 'en';
  let userRequested = false;

  // Rule 1: Check for explicit language requests in the current message first (highest priority)
  const explicitRequest = parseRequestedLanguage ? parseRequestedLanguage(userMessage) : null;
  if (explicitRequest) {
    targetLocale = explicitRequest.code;
    userRequested = true;
  } 
  // Rule 2: If no explicit request, check if a specific response language is forced in settings
  else if (aiConfig && aiConfig.autoDetectLanguage === false && aiConfig.chatLanguage && aiConfig.chatLanguage !== 'auto') {
    targetLocale = aiConfig.chatLanguage;
  } 
  // Rule 3: Otherwise (Auto Detect), detect the language of the current message
  else {
    targetLocale = await detectLanguage(userMessage);
  }

  // Save user message
  await saveMessage(conversationId, 'user', userMessage);

  // Get conversation history
  const history = await getConversationMessages(conversationId);
  const messages = history.map(m => ({
    role: m.role,
    content: m.content,
  }));

  // Stream response with target language and user requested status
  const stream = await streamChatCompletion(messages, targetLocale, aiConfig, userRequested);

  let fullResponse = '';
  let tokenCount = 0;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      fullResponse += content;
      tokenCount++;
      res.write(`data: ${JSON.stringify({ type: 'token', content })}\n\n`);
    }
  }

  const latencyMs = Date.now() - startTime;

  // Save assistant message
  const modelUsed = aiConfig?.model || 'llama-3.3-70b-versatile';
  await saveMessage(conversationId, 'assistant', fullResponse, modelUsed, tokenCount, latencyMs);

  // Update conversation locale and timestamp
  await query(
    'UPDATE conversations SET locale = ?, updated_at = NOW() WHERE id = ?',
    [detectedLocale, conversationId]
  );

  res.write(`data: ${JSON.stringify({ type: 'done', latencyMs, tokensUsed: tokenCount })}\n\n`);
  res.end();
};

export default {
  createConversation,
  getConversation,
  getConversationMessages,
  saveMessage,
  getConversationsByUser,
  updateConversationTitle,
  updateMessageFeedback,
  streamChat,
  deleteConversation,
};
