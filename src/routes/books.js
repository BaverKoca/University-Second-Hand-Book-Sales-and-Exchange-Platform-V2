const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { auth } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Validation middleware
const bookValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('condition').isIn(['good', 'medium', 'poor']).withMessage('Invalid condition'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('isExchangeable').optional().isBoolean().withMessage('isExchangeable must be boolean'),
  body('notes').optional().trim()
];

// Create a new book listing
router.post('/', auth, bookValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, author, subject, isbn, condition, price, isExchangeable, notes } = req.body;
    const bookId = uuidv4();

    const sql = `INSERT INTO books (id, title, author, subject, isbn, condition, price, isExchangeable, notes, sellerId)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [bookId, title, author, subject, isbn, condition, price, isExchangeable, notes, req.user.id], (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error creating book listing' });
      }
      res.status(201).json({ id: bookId, message: 'Book listing created successfully' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all books with filters
router.get('/', async (req, res) => {
  try {
    const { title, author, subject, faculty, department, condition } = req.query;
    let sql = 'SELECT b.*, u.faculty, u.department FROM books b JOIN users u ON b.sellerId = u.id WHERE 1=1';
    const params = [];

    if (title) {
      sql += ' AND b.title LIKE ?';
      params.push(`%${title}%`);
    }
    if (author) {
      sql += ' AND b.author LIKE ?';
      params.push(`%${author}%`);
    }
    if (subject) {
      sql += ' AND b.subject LIKE ?';
      params.push(`%${subject}%`);
    }
    if (faculty) {
      sql += ' AND u.faculty = ?';
      params.push(faculty);
    }
    if (department) {
      sql += ' AND u.department = ?';
      params.push(department);
    }
    if (condition) {
      sql += ' AND b.condition = ?';
      params.push(condition);
    }

    db.all(sql, params, (err, books) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      res.json(books);
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get book by ID
router.get('/:id', async (req, res) => {
  try {
    const sql = `SELECT b.*, u.faculty, u.department, u.firstName, u.lastName 
                 FROM books b 
                 JOIN users u ON b.sellerId = u.id 
                 WHERE b.id = ?`;
    
    db.get(sql, [req.params.id], (err, book) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.json(book);
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update book listing
router.put('/:id', auth, bookValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, author, subject, isbn, condition, price, isExchangeable, notes } = req.body;

    // Check if user owns the book
    db.get('SELECT sellerId FROM books WHERE id = ?', [req.params.id], (err, book) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      if (book.sellerId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this book' });
      }

      const sql = `UPDATE books 
                   SET title = ?, author = ?, subject = ?, isbn = ?, condition = ?, 
                       price = ?, isExchangeable = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP
                   WHERE id = ?`;
      
      db.run(sql, [title, author, subject, isbn, condition, price, isExchangeable, notes, req.params.id], (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error updating book listing' });
        }
        res.json({ message: 'Book listing updated successfully' });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete book listing
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user owns the book
    db.get('SELECT sellerId FROM books WHERE id = ?', [req.params.id], (err, book) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      if (book.sellerId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to delete this book' });
      }

      db.run('DELETE FROM books WHERE id = ?', [req.params.id], (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error deleting book listing' });
        }
        res.json({ message: 'Book listing deleted successfully' });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add book to favorites
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const bookId = req.params.id;
    const userId = req.user.id;

    // Check if book exists
    db.get('SELECT id FROM books WHERE id = ?', [bookId], (err, book) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }

      // Add to favorites
      db.run('INSERT INTO favorites (userId, bookId) VALUES (?, ?)', [userId, bookId], (err) => {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ message: 'Book already in favorites' });
          }
          return res.status(500).json({ message: 'Error adding to favorites' });
        }
        res.json({ message: 'Book added to favorites' });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove book from favorites
router.delete('/:id/favorite', auth, async (req, res) => {
  try {
    const bookId = req.params.id;
    const userId = req.user.id;

    db.run('DELETE FROM favorites WHERE userId = ? AND bookId = ?', [userId, bookId], (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error removing from favorites' });
      }
      res.json({ message: 'Book removed from favorites' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 