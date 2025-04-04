const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');
const { authenticateToken } = require('../middleware/auth');
const { checkBoardAccess } = require('../middleware/boardAccess');

// All list routes require authentication
router.use(authenticateToken);

// List routes
router.get('/board/:boardId', checkBoardAccess, listController.getBoardLists);
router.post('/board/:boardId', checkBoardAccess, listController.createList);
router.put('/:id', listController.updateList);
router.delete('/:id', listController.deleteList);
router.patch('/:id/move', listController.moveList);

module.exports = router;
