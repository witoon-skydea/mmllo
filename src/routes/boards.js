const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const { authenticateToken } = require('../middleware/auth');
const { checkBoardAccess, checkBoardOwnership } = require('../middleware/boardAccess');

// All board routes require authentication
router.use(authenticateToken);

// Board routes
router.get('/', boardController.getUserBoards);
router.post('/', boardController.createBoard);
router.get('/:id', checkBoardAccess, boardController.getBoard);
router.put('/:id', checkBoardAccess, boardController.updateBoard);
router.delete('/:id', checkBoardOwnership, boardController.deleteBoard);
router.patch('/:id/star', checkBoardAccess, boardController.toggleStar);

// Board members routes
router.post('/:id/members', checkBoardOwnership, boardController.addMember);
router.put('/:boardId/members/:userId', checkBoardOwnership, boardController.updateMemberRole);
router.delete('/:boardId/members/:userId', checkBoardOwnership, boardController.removeMember);

module.exports = router;
