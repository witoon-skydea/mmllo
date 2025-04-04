const db = require('../config/db');

class List {
  // Find a list by ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM lists WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Find all lists for a board
  static findByBoard(boardId) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM lists WHERE board_id = ? ORDER BY position ASC',
        [boardId],
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

  // Create a new list
  static create(listData) {
    const { title, board_id, position } = listData;
    
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO lists (title, board_id, position) VALUES (?, ?, ?)',
        [title, board_id, position],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              title,
              board_id,
              position,
            });
          }
        }
      );
    });
  }

  // Update a list
  static update(id, listData) {
    const { title } = listData;
    
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE lists SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, id],
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

  // Delete a list
  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM lists WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, changes: this.changes });
        }
      });
    });
  }

  // Update list positions
  static updatePositions(updates) {
    // Begin a transaction
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        let success = true;
        
        updates.forEach(({ id, position }) => {
          db.run(
            'UPDATE lists SET position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [position, id],
            function(err) {
              if (err) {
                success = false;
                console.error('Error updating list position:', err);
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
          reject(new Error('Failed to update list positions'));
        }
      });
    });
  }

  // Move a list to a new position
  static async move(listId, newPosition) {
    try {
      // Get the list to verify it exists and get its board_id
      const list = await this.findById(listId);
      
      if (!list) {
        throw new Error('List not found');
      }
      
      const boardId = list.board_id;
      const oldPosition = list.position;
      
      // Get all lists for this board
      const listsInBoard = await this.findByBoard(boardId);
      
      // Adjust positions
      const updates = listsInBoard.map(l => {
        const pos = l.id === parseInt(listId) 
          ? newPosition
          : l.position < oldPosition && l.position >= newPosition
            ? l.position + 1
            : l.position > oldPosition && l.position <= newPosition
              ? l.position - 1
              : l.position;
        
        return { id: l.id, position: pos };
      });
      
      // Update all positions
      return await this.updatePositions(updates);
    } catch (error) {
      console.error('Error moving list:', error);
      throw error;
    }
  }

  // Get the next position for a new list in a board
  static async getNextPosition(boardId) {
    try {
      const lists = await this.findByBoard(boardId);
      return lists.length > 0 
        ? Math.max(...lists.map(list => list.position)) + 1 
        : 0;
    } catch (error) {
      console.error('Error getting next position:', error);
      throw error;
    }
  }
}

module.exports = List;
