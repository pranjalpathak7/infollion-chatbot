const express = require('express');
const multer = require('multer');
const chatController = require('../controllers/chatController');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware to handle multiple specific file fields
const uploadMiddleware = upload.fields([
    { name: 'document', maxCount: 1 }, // Expecting PDF/TXT
    { name: 'image', maxCount: 1 }     // Expecting PNG/JPG
]);

// Routes
router.post('/new', chatController.createNewChat);
router.post('/', uploadMiddleware, chatController.handleChatMessage);
router.get('/', chatController.getChatSessions);
router.get('/:chatId', chatController.getChatHistory);
router.put('/:chatId/rename', chatController.renameChat);
router.delete('/:chatId', chatController.deleteChat);

module.exports = router;