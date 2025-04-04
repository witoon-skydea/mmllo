const Board = require('../models/Board');

// Middleware to check if the user has access to a board
const checkBoardAccess = async (req, res, next) => {
  try {
    const boardId = parseInt(req.params.id) || parseInt(req.params.boardId);
    const userId = req.user.id;
    
    if (!boardId) {
      return res.status(400).json({ error: 'Board ID is required' });
    }

    const hasAccess = await Board.checkAccess(boardId, userId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'You do not have access to this board' });
    }
    
    next();
  } catch (error) {
    console.error('Board access check error:', error);
    return res.status(500).json({ error: 'Server error while checking board access' });
  }
};

// Middleware to check if the user is board owner
const checkBoardOwnership = async (req, res, next) => {
  try {
    const boardId = parseInt(req.params.id) || parseInt(req.params.boardId);
    const userId = req.user.id;
    
    if (!boardId) {
      return res.status(400).json({ error: 'Board ID is required' });
    }

    const board = await Board.findById(boardId);
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    if (board.owner_id !== userId) {
      return res.status(403).json({ error: 'You must be the board owner to perform this action' });
    }
    
    next();
  } catch (error) {
    console.error('Board ownership check error:', error);
    return res.status(500).json({ error: 'Server error while checking board ownership' });
  }
};

module.exports = { checkBoardAccess, checkBoardOwnership };
