const router = require('express').Router();
const { chat, getChatHistory } = require('../controllers/chatController');
router.post('/chat', chat);
router.get('/chat/history', getChatHistory); 
module.exports = router;