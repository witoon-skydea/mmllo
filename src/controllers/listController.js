const List = require('../models/List');
const Card = require('../models/Card');

// Get all lists for a board
const getBoardLists = async (req, res) => {
  try {
    const boardId = parseInt(req.params.boardId);
    
    const lists = await List.findByBoard(boardId);
    
    // Get cards for each list
    const listsWithCards = await Promise.all(lists.map(async (list) => {
      const cards = await Card.findByList(list.id);
      
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
    
    res.status(200).json({ lists: listsWithCards });
  } catch (error) {
    console.error('Get board lists error:', error);
    res.status(500).json({ error: 'Server error while fetching lists' });
  }
};

// Create a new list
const createList = async (req, res) => {
  try {
    const boardId = parseInt(req.params.boardId);
    const { title } = req.body;
    
    // Validate inputs
    if (!title) {
      return res.status(400).json({ error: 'List title is required' });
    }
    
    // Get the next position
    const position = await List.getNextPosition(boardId);
    
    // Create the list
    const newList = await List.create({
      title,
      board_id: boardId,
      position
    });
    
    res.status(201).json({
      message: 'List created successfully',
      list: newList
    });
  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({ error: 'Server error while creating list' });
  }
};

// Update a list
const updateList = async (req, res) => {
  try {
    const listId = parseInt(req.params.id);
    const { title } = req.body;
    
    // Validate inputs
    if (!title) {
      return res.status(400).json({ error: 'List title is required' });
    }
    
    // Update the list
    const result = await List.update(listId, { title });
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'List not found or no changes made' });
    }
    
    // Get the updated list
    const updatedList = await List.findById(listId);
    
    res.status(200).json({
      message: 'List updated successfully',
      list: updatedList
    });
  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({ error: 'Server error while updating list' });
  }
};

// Delete a list
const deleteList = async (req, res) => {
  try {
    const listId = parseInt(req.params.id);
    
    // Delete the list
    const result = await List.delete(listId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'List not found' });
    }
    
    res.status(200).json({
      message: 'List deleted successfully',
      listId
    });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ error: 'Server error while deleting list' });
  }
};

// Move a list to a new position
const moveList = async (req, res) => {
  try {
    const listId = parseInt(req.params.id);
    const { position } = req.body;
    
    // Validate inputs
    if (typeof position !== 'number' || position < 0) {
      return res.status(400).json({ error: 'Valid position is required' });
    }
    
    // Move the list
    await List.move(listId, position);
    
    res.status(200).json({
      message: 'List moved successfully',
      listId,
      position
    });
  } catch (error) {
    console.error('Move list error:', error);
    res.status(500).json({ error: 'Server error while moving list' });
  }
};

module.exports = {
  getBoardLists,
  createList,
  updateList,
  deleteList,
  moveList
};
