const db = require('../config/db');

class Board {
  // Find a board by ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM boards WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Find all boards for a user (including boards they are a member of)
  static findByUser(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT b.* FROM boards b
        LEFT JOIN board_members bm ON b.id = bm.board_id
        WHERE b.owner_id = ? OR bm.user_id = ?
        GROUP BY b.id
        ORDER BY b.is_starred DESC, b.created_at DESC
      `;
      
      db.all(query, [userId, userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Create a new board
  static create(boardData) {
    const { title, description, owner_id, background = '#0079bf' } = boardData;
    
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO boards (title, description, owner_id, background) VALUES (?, ?, ?, ?)',
        [title, description, owner_id, background],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              title,
              description,
              owner_id,
              background,
              is_starred: 0,
            });
          }
        }
      );
    });
  }

  // Update a board
  static update(id, boardData) {
    const { title, description, background, is_starred } = boardData;
    
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE boards SET title = ?, description = ?, background = ?, is_starred = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, description, background, is_starred ? 1 : 0, id],
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

  // Delete a board
  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM boards WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, changes: this.changes });
        }
      });
    });
  }

  // Toggle star status
  static toggleStar(id, starStatus) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE boards SET is_starred = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [starStatus ? 1 : 0, id],
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

  // Get all board members
  static getBoardMembers(boardId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT u.id, u.username, u.email, bm.role
        FROM users u
        JOIN board_members bm ON u.id = bm.user_id
        WHERE bm.board_id = ?
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

  // Add a member to the board
  static addMember(boardId, userId, role = 'member') {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO board_members (board_id, user_id, role) VALUES (?, ?, ?)',
        [boardId, userId, role],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              board_id: boardId,
              user_id: userId,
              role,
            });
          }
        }
      );
    });
  }

  // Update a member's role
  static updateMemberRole(boardId, userId, role) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE board_members SET role = ? WHERE board_id = ? AND user_id = ?',
        [role, boardId, userId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes });
          }
        }
      );
    });
  }

  // Remove a member from the board
  static removeMember(boardId, userId) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM board_members WHERE board_id = ? AND user_id = ?',
        [boardId, userId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes });
          }
        }
      );
    });
  }

  // Check if user has access to a board
  static async checkAccess(boardId, userId) {
    try {
      const board = await this.findById(boardId);
      if (!board) {
        return false;
      }

      // If user is the owner, they have access
      if (board.owner_id === userId) {
        return true;
      }

      // Check if user is a member
      return new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM board_members WHERE board_id = ? AND user_id = ?',
          [boardId, userId],
          (err, row) => {
            if (err) {
              reject(err);
            } else {
              resolve(!!row); // Convert to boolean
            }
          }
        );
      });
    } catch (error) {
      console.error('Error checking board access:', error);
      return false;
    }
  }
}

module.exports = Board;
