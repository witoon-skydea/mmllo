const db = require('../config/db');

class Card {
  // Find a card by ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM cards WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Find all cards for a list
  static findByList(listId) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM cards WHERE list_id = ? ORDER BY position ASC',
        [listId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  // Find all cards for a board (across all lists)
  static findByBoard(boardId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.* FROM cards c
        JOIN lists l ON c.list_id = l.id
        WHERE l.board_id = ?
        ORDER BY l.position ASC, c.position ASC
      `;
      
      db.all(query, [boardId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Create a new card
  static create(cardData) {
    const { title, description, list_id, position, due_date, labels } = cardData;
    
    // Convert labels array to JSON string if provided
    const labelsJson = labels ? JSON.stringify(labels) : null;
    
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO cards (title, description, list_id, position, due_date, labels) VALUES (?, ?, ?, ?, ?, ?)',
        [title, description, list_id, position, due_date, labelsJson],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              title,
              description,
              list_id,
              position,
              due_date,
              labels: labels || [],
            });
          }
        }
      );
    });
  }

  // Update a card
  static update(id, cardData) {
    const { title, description, due_date, labels } = cardData;
    
    // Convert labels array to JSON string if provided
    const labelsJson = labels ? JSON.stringify(labels) : null;
    
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE cards SET title = ?, description = ?, due_date = ?, labels = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, description, due_date, labelsJson, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, changes: this.changes });
          }
        }
      );
    });
  }

  // Delete a card
  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM cards WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, changes: this.changes });
        }
      });
    });
  }

  // Update card positions
  static updatePositions(updates) {
    // Begin a transaction
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        let success = true;
        
        updates.forEach(({ id, position }) => {
          db.run(
            'UPDATE cards SET position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [position, id],
            function(err) {
              if (err) {
                success = false;
                console.error('Error updating card position:', err);
              }
            }
          );
        });
        
        if (success) {
          db.run('COMMIT', (err) => {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
            } else {
              resolve({ success: true });
            }
          });
        } else {
          db.run('ROLLBACK');
          reject(new Error('Failed to update card positions'));
        }
      });
    });
  }

  // Move a card to a new position in the same list
  static async moveInList(cardId, newPosition) {
    try {
      // Get the card to verify it exists and get its list_id
      const card = await this.findById(cardId);
      
      if (!card) {
        throw new Error('Card not found');
      }
      
      const listId = card.list_id;
      const oldPosition = card.position;
      
      // Get all cards for this list
      const cardsInList = await this.findByList(listId);
      
      // Adjust positions
      const updates = cardsInList.map(c => {
        const pos = c.id === parseInt(cardId) 
          ? newPosition
          : c.position < oldPosition && c.position >= newPosition
            ? c.position + 1
            : c.position > oldPosition && c.position <= newPosition
              ? c.position - 1
              : c.position;
        
        return { id: c.id, position: pos };
      });
      
      // Update all positions
      return await this.updatePositions(updates);
    } catch (error) {
      console.error('Error moving card within list:', error);
      throw error;
    }
  }

  // Move a card to another list
  static async moveToList(cardId, newListId, newPosition) {
    try {
      // Get the card to verify it exists
      const card = await this.findById(cardId);
      
      if (!card) {
        throw new Error('Card not found');
      }
      
      const oldListId = card.list_id;
      const oldPosition = card.position;
      
      // Begin a transaction
      return new Promise((resolve, reject) => {
        db.serialize(async () => {
          try {
            db.run('BEGIN TRANSACTION');
            
            // 1. Update cards in the old list to fill the gap
            const oldListCards = await this.findByList(oldListId);
            oldListCards
              .filter(c => c.id !== parseInt(cardId) && c.position > oldPosition)
              .forEach(c => {
                db.run(
                  'UPDATE cards SET position = position - 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                  [c.id]
                );
              });
            
            // 2. Update cards in the new list to make space
            const newListCards = await this.findByList(newListId);
            newListCards
              .filter(c => c.position >= newPosition)
              .forEach(c => {
                db.run(
                  'UPDATE cards SET position = position + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                  [c.id]
                );
              });
            
            // 3. Update the card itself
            db.run(
              'UPDATE cards SET list_id = ?, position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
              [newListId, newPosition, cardId],
              function(err) {
                if (err) {
                  db.run('ROLLBACK');
                  reject(err);
                } else {
                  db.run('COMMIT', (commitErr) => {
                    if (commitErr) {
                      db.run('ROLLBACK');
                      reject(commitErr);
                    } else {
                      resolve({
                        id: cardId,
                        list_id: newListId,
                        position: newPosition
                      });
                    }
                  });
                }
              }
            );
          } catch (error) {
            db.run('ROLLBACK');
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Error moving card to another list:', error);
      throw error;
    }
  }

  // Get the next position for a new card in a list
  static async getNextPosition(listId) {
    try {
      const cards = await this.findByList(listId);
      return cards.length > 0 
        ? Math.max(...cards.map(card => card.position)) + 1 
        : 0;
    } catch (error) {
      console.error('Error getting next position:', error);
      throw error;
    }
  }

  // Add a comment to a card
  static addComment(cardId, userId, content) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO comments (card_id, user_id, content) VALUES (?, ?, ?)',
        [cardId, userId, content],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              card_id: cardId,
              user_id: userId,
              content,
            });
          }
        }
      );
    });
  }

  // Get comments for a card
  static getComments(cardId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, u.username 
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.card_id = ?
        ORDER BY c.created_at ASC
      `;
      
      db.all(query, [cardId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = Card;
