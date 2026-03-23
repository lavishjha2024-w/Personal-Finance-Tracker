const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = Number(process.env.PORT) || 5000;

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
const JWT_SECRET = process.env.JWT_SECRET || (isProduction ? undefined : 'new_secret_key_to_force_logout_123');
if (!JWT_SECRET) {
    // Fail-safe: do not crash on import, but endpoints that need JWT will error clearly.
    console.warn('[backend] Missing JWT_SECRET (set it in your hosting environment).');
}

const corsOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests without an Origin header (e.g., curl, server-to-server).
        if (!origin) return callback(null, true);

        // If CORS_ORIGINS isn't configured, allow all origins to avoid breaking deployments.
        if (corsOrigins.length === 0) return callback(null, true);

        if (corsOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204
}));
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

        if (!JWT_SECRET) {
            return res.status(500).json({ error: 'JWT_SECRET is not configured on the server' });
        }
        const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
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
    if (!JWT_SECRET) {
        return res.status(500).json({ error: 'JWT_SECRET is not configured on the server' });
    }
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
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

// Local/VM/Container hosting: run `node server.js`
// Vercel/Serverless: the file is imported, so `require.main !== module`
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
