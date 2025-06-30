const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 4000;
const SECRET = 'elizi_secret_key';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// SQLite DB
const db = new sqlite3.Database('./elizi.db', (err) => {
  if (err) console.error('DB error:', err);
});

// DB INIT
const initDb = () => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS portfolios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    price REAL,
    address TEXT,
    mapUrl TEXT,
    images TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    comment TEXT,
    approved INTEGER DEFAULT 0
  )`);
};
initDb();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Admin user oluştur (ilk kurulum için)
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], function(err) {
    if (err) return res.status(400).json({ error: 'Kullanıcı adı mevcut.' });
    res.json({ id: this.lastID });
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Kullanıcı bulunamadı.' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Şifre yanlış.' });
    const token = jwt.sign({ username: user.username, id: user.id }, SECRET, { expiresIn: '1d' });
    res.json({ token });
  });
});

// Portföy CRUD
app.get('/api/portfolios', (req, res) => {
  db.all('SELECT * FROM portfolios', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    rows.forEach(r => r.images = r.images ? JSON.parse(r.images) : []);
    res.json(rows);
  });
});

app.post('/api/portfolios', authenticateToken, upload.array('images', 10), (req, res) => {
  const { title, description, price, address, mapUrl } = req.body;
  const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
  db.run('INSERT INTO portfolios (title, description, price, address, mapUrl, images) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description, price, address, mapUrl, JSON.stringify(images)],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.put('/api/portfolios/:id', authenticateToken, upload.array('images', 10), (req, res) => {
  const { title, description, price, address, mapUrl } = req.body;
  const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
  db.run('UPDATE portfolios SET title=?, description=?, price=?, address=?, mapUrl=?, images=? WHERE id=?',
    [title, description, price, address, mapUrl, JSON.stringify(images), req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

app.delete('/api/portfolios/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM portfolios WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// Yorumlar
app.get('/api/reviews', (req, res) => {
  db.all('SELECT * FROM reviews WHERE approved=1', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/reviews', (req, res) => {
  const { name, comment } = req.body;
  db.run('INSERT INTO reviews (name, comment, approved) VALUES (?, ?, 0)', [name, comment], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// Yorum onaylama (admin)
app.put('/api/reviews/:id/approve', authenticateToken, (req, res) => {
  db.run('UPDATE reviews SET approved=1 WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ approved: this.changes });
  });
});

// Yorum silme (admin)
app.delete('/api/reviews/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM reviews WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 