const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL;


const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('❌ JWT_SECRET is missing in environment variables');
}


const corsOrigins = FRONTEND_URL
    ? FRONTEND_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
    : true;

app.use(cors({
    origin: corsOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());


app.get('/', (req, res) => {
    res.send('🚀 Finance Tracker Backend is running');
});


app.get('/api/test-db', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({ success: true, time: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'DB connection failed', details: err.message });
    }
});


app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;

    console.log("📥 Signup request:", { username, email });

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO public.pft_users (username, email, password)
            VALUES ($1, $2, $3)
            RETURNING id
        `;

        const result = await db.query(sql, [username, email, hashedPassword]);

        return res.status(201).json({
            message: 'User registered successfully',
            userId: result.rows[0].id
        });

    } catch (err) {
        console.error("❌ Signup error:", err);

        // Unique constraint error
        if (err.code === '23505') {
            return res.status(400).json({
                error: 'Username or email already exists'
            });
        }

        return res.status(500).json({
            error: 'Database error',
            details: err.message
        });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    console.log("🔐 Login request:", { email });

    if (!email || !password) {
        return res.status(400).json({
            error: 'Email and password are required'
        });
    }

    try {
        const sql = 'SELECT * FROM public.pft_users WHERE email = $1';
        const result = await db.query(sql, [email]);

        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({
                error: 'Invalid email or password'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                error: 'Invalid email or password'
            });
        }

        if (!JWT_SECRET) {
            return res.status(500).json({
                error: 'JWT_SECRET not configured'
            });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (err) {
        console.error("❌ Login error:", err);

        return res.status(500).json({
            error: 'Database error',
            details: err.message
        });
    }
});


app.get('/api/user', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        const sql = `
            SELECT id, username, email 
            FROM public.pft_users 
            WHERE id = $1
        `;

        const result = await db.query(sql, [decoded.id]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.json(user);

    } catch (err) {
        console.error("❌ Auth error:", err);

        return res.status(401).json({
            error: 'Invalid or expired token'
        });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
