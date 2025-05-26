const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { auth } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Send a message
router.post('/', [
  auth,
  body('receiverId').notEmpty().withMessage('Receiver ID is required'),
  body('bookId').notEmpty().withMessage('Book ID is required'),
  body('content').trim().notEmpty().withMessage('Message content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { receiverId, bookId, content } = req.body;
    const senderId = req.user.id;

    // Check if receiver exists
    db.get('SELECT id FROM users WHERE id = ?', [receiverId], (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      if (!user) {
        return res.status(404).json({ message: 'Receiver not found' });
      }

      // Check if book exists
      db.get('SELECT id FROM books WHERE id = ?', [bookId], (err, book) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' });
        }
        if (!book) {
          return res.status(404).json({ message: 'Book not found' });
        }

        const messageId = uuidv4();
        const sql = 'INSERT INTO messages (id, senderId, receiverId, bookId, content) VALUES (?, ?, ?, ?, ?)';

        db.run(sql, [messageId, senderId, receiverId, bookId, content], (err) => {
          if (err) {
            return res.status(500).json({ message: 'Error sending message' });
          }
          res.status(201).json({ id: messageId, message: 'Message sent successfully' });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get conversation history for a specific book
router.get('/book/:bookId', auth, async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    const sql = `
      SELECT m.*, 
             u1.firstName as senderFirstName, u1.lastName as senderLastName,
             u2.firstName as receiverFirstName, u2.lastName as receiverLastName
      FROM messages m
      JOIN users u1 ON m.senderId = u1.id
      JOIN users u2 ON m.receiverId = u2.id
      WHERE m.bookId = ? AND (m.senderId = ? OR m.receiverId = ?)
      ORDER BY m.createdAt ASC
    `;

    db.all(sql, [bookId, userId, userId], (err, messages) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      res.json(messages);
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all conversations for the current user
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT DISTINCT 
        b.id as bookId, b.title as bookTitle,
        CASE 
          WHEN m.senderId = ? THEN m.receiverId
          ELSE m.senderId
        END as otherUserId,
        u.firstName, u.lastName,
        (
          SELECT content 
          FROM messages 
          WHERE (senderId = ? AND receiverId = otherUserId) 
             OR (senderId = otherUserId AND receiverId = ?)
          ORDER BY createdAt DESC 
          LIMIT 1
        ) as lastMessage,
        (
          SELECT createdAt 
          FROM messages 
          WHERE (senderId = ? AND receiverId = otherUserId) 
             OR (senderId = otherUserId AND receiverId = ?)
          ORDER BY createdAt DESC 
          LIMIT 1
        ) as lastMessageTime
      FROM messages m
      JOIN books b ON m.bookId = b.id
      JOIN users u ON (
        CASE 
          WHEN m.senderId = ? THEN m.receiverId
          ELSE m.senderId
        END = u.id
      )
      WHERE m.senderId = ? OR m.receiverId = ?
      GROUP BY b.id, otherUserId
      ORDER BY lastMessageTime DESC
    `;

    db.all(sql, [
      userId, userId, userId, userId, userId, userId, userId, userId
    ], (err, conversations) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      res.json(conversations);
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 