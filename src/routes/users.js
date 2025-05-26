const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { auth } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    db.get('SELECT id, firstName, lastName, email, faculty, department, phoneNumber FROM users WHERE id = ?', 
      [req.user.id], 
      (err, user) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' });
        }
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', [
  auth,
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('faculty').optional().trim().notEmpty(),
  body('department').optional().trim().notEmpty(),
  body('phoneNumber').optional().matches(/^\+?[\d\s-]+$/).withMessage('Invalid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, faculty, department, phoneNumber } = req.body;

    const updates = [];
    const params = [];

    if (firstName) {
      updates.push('firstName = ?');
      params.push(firstName);
    }
    if (lastName) {
      updates.push('lastName = ?');
      params.push(lastName);
    }
    if (faculty) {
      updates.push('faculty = ?');
      params.push(faculty);
    }
    if (department) {
      updates.push('department = ?');
      params.push(department);
    }
    if (phoneNumber) {
      updates.push('phoneNumber = ?');
      params.push(phoneNumber);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No valid updates provided' });
    }

    updates.push('updatedAt = CURRENT_TIMESTAMP');
    params.push(req.user.id);

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

    db.run(sql, params, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating profile' });
      }
      res.json({ message: 'Profile updated successfully' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/password', [
  auth,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Get current user
    db.get('SELECT password FROM users WHERE id = ?', [req.user.id], async (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      db.run('UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedPassword, req.user.id],
        (err) => {
          if (err) {
            return res.status(500).json({ message: 'Error updating password' });
          }
          res.json({ message: 'Password updated successfully' });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's favorite books
router.get('/favorites', auth, async (req, res) => {
  try {
    const sql = `
      SELECT b.*, u.faculty, u.department, u.firstName, u.lastName
      FROM favorites f
      JOIN books b ON f.bookId = b.id
      JOIN users u ON b.sellerId = u.id
      WHERE f.userId = ?
    `;

    db.all(sql, [req.user.id], (err, books) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      res.json(books);
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's book listings
router.get('/books', auth, async (req, res) => {
  try {
    const sql = 'SELECT * FROM books WHERE sellerId = ?';
    
    db.all(sql, [req.user.id], (err, books) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      res.json(books);
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 