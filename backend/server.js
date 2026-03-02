const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'new_secret_key_to_force_logout_123';

app.use(cors({ origin: 'https://fin-tracker-test-ruddy.vercel.app' }));
app.use(express.json());

// Signup route
app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id';

        try {
            const result = await db.query(sql, [username, email, hashedPassword]);
            res.status(201).json({ message: 'User registered successfully', userId: result.rows[0].id });
        } catch (dbErr) {
            // Postgres unique constraint violation
            if (dbErr.code === '23505') {
                return res.status(400).json({ error: 'Username or email already exists' });
            }
            console.error(dbErr);
            return res.status(500).json({ error: 'Database error', details: dbErr.message || dbErr });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const sql = 'SELECT * FROM users WHERE email = $1';
        const result = await db.query(sql, [email]);
        const user = result.rows[0];

        if (!user) return res.status(400).json({ error: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

        const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
    }
});

// Get user profile route (protected)
app.get('/api/user', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, async (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Invalid token' });

        try {
            const sql = 'SELECT id, username, email FROM users WHERE id = $1';
            const result = await db.query(sql, [decoded.id]);
            const user = result.rows[0];

            if (!user) return res.status(404).json({ error: 'User not found' });
            res.json(user);
        } catch (dbErr) {
            console.error(dbErr);
            return res.status(500).json({ error: 'Database error' });
        }
    });
});

app.get('/', (req, res) => res.send('Finance Tracker Backend API is running!'));

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
