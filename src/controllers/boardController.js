const { getModels } = require('../models/factory');

// Get all boards for the current user
const getUserBoards = async (req, res) => {
  try {
    const { Board } = getModels();
    const userId = req.user.id;
    
    const boards = await Board.findByUser(userId);
    
    res.status(200).json({ boards });
  } catch (error) {
    console.error('Get user boards error:', error);
    res.status(500).json({ error: 'Server error while fetching boards' });
  }
};

// Get a single board with all lists and cards
const getBoard = async (req, res) => {
  try {
    const { Board, List, Card, isMongoDB } = getModels();
    const boardId = isMongoDB ? req.params.id : parseInt(req.params.id);
    
    // Get the board
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    // Get lists for the board
    const lists = await List.findByBoard(boardId);
    
    // Get cards for each list
    const listsWithCards = await Promise.all(lists.map(async (list) => {
      const listId = isMongoDB ? list._id || list.id : list.id;
      const cards = await Card.findByList(listId);
      
      // Parse labels from JSON string
      const parsedCards = cards.map(card => ({
        ...card,
        labels: card.labels ? JSON.parse(card.labels) : []
      }));
      
      return {
        ...list,
        cards: parsedCards
      };
    }));
    
    // Get board members
    const members = await Board.getBoardMembers(boardId);
    
    res.status(200).json({
      board: {
        ...board,
        lists: listsWithCards,
        members
      }
    });
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ error: 'Server error while fetching board' });
  }
};

// Create a new board
const createBoard = async (req, res) => {
  try {
    const { Board } = getModels();
    const { title, description, background } = req.body;
    const owner_id = req.user.id;
    
    // Validate inputs
    if (!title) {
      return res.status(400).json({ error: 'Board title is required' });
    }
    
    // Create the board
    const newBoard = await Board.create({
      title,
      description,
      owner_id,
      background
    });
    
    res.status(201).json({
      message: 'Board created successfully',
      board: newBoard
    });
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ error: 'Server error while creating board' });
  }
};

// Update a board
const updateBoard = async (req, res) => {
  try {
    const boardId = parseInt(req.params.id);
    const { title, description, background, is_starred } = req.body;
    
    // Validate inputs
    if (!title) {
      return res.status(400).json({ error: 'Board title is required' });
    }
    
    // Update the board
    const result = await Board.update(boardId, {
      title,
      description,
      background,
      is_starred
    });
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Board not found or no changes made' });
    }
    
    // Get the updated board
    const updatedBoard = await Board.findById(boardId);
    
    res.status(200).json({
      message: 'Board updated successfully',
      board: updatedBoard
    });
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ error: 'Server error while updating board' });
  }
};

// Delete a board
const deleteBoard = async (req, res) => {
  try {
    const boardId = parseInt(req.params.id);
    
    // Delete the board
    const result = await Board.delete(boardId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    res.status(200).json({
      message: 'Board deleted successfully',
      boardId
    });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ error: 'Server error while deleting board' });
  }
};

// Toggle star status
const toggleStar = async (req, res) => {
  try {
    const boardId = parseInt(req.params.id);
    const { is_starred } = req.body;
    
    if (typeof is_starred !== 'boolean') {
      return res.status(400).json({ error: 'Star status must be boolean' });
    }
    
    // Toggle the star status
    const result = await Board.toggleStar(boardId, is_starred);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Board not found or no changes made' });
    }
    
    res.status(200).json({
      message: `Board ${is_starred ? 'starred' : 'unstarred'} successfully`,
      boardId,
      is_starred
    });
  } catch (error) {
    console.error('Toggle star error:', error);
    res.status(500).json({ error: 'Server error while toggling star status' });
  }
};

// Add a member to the board
const addMember = async (req, res) => {
  try {
    const boardId = parseInt(req.params.id);
    const { userId, role } = req.body;
    
    // Validate inputs
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Add the member
    const result = await Board.addMember(boardId, userId, role);
    
    res.status(201).json({
      message: 'Member added successfully',
      member: {
        ...user,
        role: role || 'member'
      }
    });
  } catch (error) {
    // Handle duplicate member error
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'User is already a member of this board' });
    }
    
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Server error while adding member' });
  }
};

// Update a member's role
const updateMemberRole = async (req, res) => {
  try {
    const boardId = parseInt(req.params.boardId);
    const userId = parseInt(req.params.userId);
    const { role } = req.body;
    
    // Validate inputs
    if (!role || !['admin', 'member', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Valid role is required (admin, member, or viewer)' });
    }
    
    // Update the member's role
    const result = await Board.updateMemberRole(boardId, userId, role);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Member not found on this board' });
    }
    
    res.status(200).json({
      message: 'Member role updated successfully',
      boardId,
      userId,
      role
    });
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({ error: 'Server error while updating member role' });
  }
};

// Remove a member from the board
const removeMember = async (req, res) => {
  try {
    const boardId = parseInt(req.params.boardId);
    const userId = parseInt(req.params.userId);
    
    // Remove the member
    const result = await Board.removeMember(boardId, userId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Member not found on this board' });
    }
    
    res.status(200).json({
      message: 'Member removed successfully',
      boardId,
      userId
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Server error while removing member' });
  }
};

module.exports = {
  getUserBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  toggleStar,
  addMember,
  updateMemberRole,
  removeMember
};
