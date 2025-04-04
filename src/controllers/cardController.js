const Card = require('../models/Card');

// Get a single card with comments
const getCard = async (req, res) => {
  try {
    const cardId = parseInt(req.params.id);
    
    // Get the card
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    // Parse labels from JSON string
    const parsedCard = {
      ...card,
      labels: card.labels ? JSON.parse(card.labels) : []
    };
    
    // Get comments for the card
    const comments = await Card.getComments(cardId);
    
    res.status(200).json({
      card: {
        ...parsedCard,
        comments
      }
    });
  } catch (error) {
    console.error('Get card error:', error);
    res.status(500).json({ error: 'Server error while fetching card' });
  }
};

// Create a new card
const createCard = async (req, res) => {
  try {
    const listId = parseInt(req.params.listId);
    const { title, description, due_date, labels } = req.body;
    
    // Validate inputs
    if (!title) {
      return res.status(400).json({ error: 'Card title is required' });
    }
    
    // Get the next position
    const position = await Card.getNextPosition(listId);
    
    // Create the card
    const newCard = await Card.create({
      title,
      description,
      list_id: listId,
      position,
      due_date,
      labels
    });
    
    // Parse labels from JSON for response
    const parsedCard = {
      ...newCard,
      labels: newCard.labels || []
    };
    
    res.status(201).json({
      message: 'Card created successfully',
      card: parsedCard
    });
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ error: 'Server error while creating card' });
  }
};

// Update a card
const updateCard = async (req, res) => {
  try {
    const cardId = parseInt(req.params.id);
    const { title, description, due_date, labels } = req.body;
    
    // Validate inputs
    if (!title) {
      return res.status(400).json({ error: 'Card title is required' });
    }
    
    // Update the card
    const result = await Card.update(cardId, {
      title,
      description,
      due_date,
      labels
    });
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Card not found or no changes made' });
    }
    
    // Get the updated card
    const updatedCard = await Card.findById(cardId);
    
    // Parse labels from JSON for response
    const parsedCard = {
      ...updatedCard,
      labels: updatedCard.labels ? JSON.parse(updatedCard.labels) : []
    };
    
    res.status(200).json({
      message: 'Card updated successfully',
      card: parsedCard
    });
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ error: 'Server error while updating card' });
  }
};

// Delete a card
const deleteCard = async (req, res) => {
  try {
    const cardId = parseInt(req.params.id);
    
    // Delete the card
    const result = await Card.delete(cardId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    res.status(200).json({
      message: 'Card deleted successfully',
      cardId
    });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ error: 'Server error while deleting card' });
  }
};

// Move a card to a new position in the same list
const moveCardInList = async (req, res) => {
  try {
    const cardId = parseInt(req.params.id);
    const { position } = req.body;
    
    // Validate inputs
    if (typeof position !== 'number' || position < 0) {
      return res.status(400).json({ error: 'Valid position is required' });
    }
    
    // Move the card
    await Card.moveInList(cardId, position);
    
    res.status(200).json({
      message: 'Card moved successfully',
      cardId,
      position
    });
  } catch (error) {
    console.error('Move card error:', error);
    res.status(500).json({ error: 'Server error while moving card' });
  }
};

// Move a card to another list
const moveCardToList = async (req, res) => {
  try {
    const cardId = parseInt(req.params.id);
    const { listId, position } = req.body;
    
    // Validate inputs
    if (!listId) {
      return res.status(400).json({ error: 'List ID is required' });
    }
    
    if (typeof position !== 'number' || position < 0) {
      return res.status(400).json({ error: 'Valid position is required' });
    }
    
    // Move the card
    const result = await Card.moveToList(cardId, listId, position);
    
    res.status(200).json({
      message: 'Card moved to another list successfully',
      cardId,
      listId,
      position
    });
  } catch (error) {
    console.error('Move card to list error:', error);
    res.status(500).json({ error: 'Server error while moving card' });
  }
};

// Add a comment to a card
const addComment = async (req, res) => {
  try {
    const cardId = parseInt(req.params.id);
    const userId = req.user.id;
    const { content } = req.body;
    
    // Validate inputs
    if (!content) {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    // Add the comment
    const newComment = await Card.addComment(cardId, userId, content);
    
    // Get user details for the response
    const comment = await db.get(
      `SELECT c.*, u.username FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [newComment.id]
    );
    
    res.status(201).json({
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Server error while adding comment' });
  }
};

module.exports = {
  getCard,
  createCard,
  updateCard,
  deleteCard,
  moveCardInList,
  moveCardToList,
  addComment
};
