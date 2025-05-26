const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../data/bookstore.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to SQLite database');
  
  // Create tables if they don't exist
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      faculty TEXT NOT NULL,
      department TEXT NOT NULL,
      phoneNumber TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Books table
    db.run(`CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      subject TEXT NOT NULL,
      isbn TEXT,
      condition TEXT NOT NULL,
      notes TEXT,
      price REAL,
      isExchangeable BOOLEAN DEFAULT 0,
      sellerId TEXT NOT NULL,
      status TEXT DEFAULT 'available',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sellerId) REFERENCES users(id)
    )`);

    // Favorites table
    db.run(`CREATE TABLE IF NOT EXISTS favorites (
      userId TEXT NOT NULL,
      bookId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (userId, bookId),
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (bookId) REFERENCES books(id)
    )`);

    // Messages table
    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      senderId TEXT NOT NULL,
      receiverId TEXT NOT NULL,
      bookId TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (senderId) REFERENCES users(id),
      FOREIGN KEY (receiverId) REFERENCES users(id),
      FOREIGN KEY (bookId) REFERENCES books(id)
    )`);

    // Transactions table
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      buyerId TEXT NOT NULL,
      sellerId TEXT NOT NULL,
      bookId TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (buyerId) REFERENCES users(id),
      FOREIGN KEY (sellerId) REFERENCES users(id),
      FOREIGN KEY (bookId) REFERENCES books(id)
    )`);
  });
});

module.exports = db; 