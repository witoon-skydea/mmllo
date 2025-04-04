const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const { authenticateToken } = require('../middleware/auth');

// All card routes require authentication
router.use(authenticateToken);

// Card routes
router.get('/:id', cardController.getCard);
router.post('/list/:listId', cardController.createCard);
router.put('/:id', cardController.updateCard);
router.delete('/:id', cardController.deleteCard);
router.patch('/:id/move', cardController.moveCardInList);
router.patch('/:id/move-to-list', cardController.moveCardToList);
router.post('/:id/comments', cardController.addComment);

module.exports = router;
