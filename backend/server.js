const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { supabase } = require('./supabase');
const { devSignupConfirmedUser } = require('./devAuthSignup');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL;


const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';
if (!process.env.JWT_SECRET) {
    console.warn('⚠️ JWT_SECRET missing; using dev default (local only).');
}


const corsOrigins = FRONTEND_URL
    ? FRONTEND_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
    : true;

app.use(cors({
    origin: corsOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Dev-Supabase-Redirect"]
}));

app.use(express.json());


app.get('/', (req, res) => {
    res.send('🚀 Finance Tracker Backend is running');
});


app.get('/api/test-db', async (req, res) => {
    try {
        const { error } = await supabase
            .from('pft_users')
            .select('id')
            .limit(1);

        if (error) {
            throw error;
        }

        res.json({ success: true, supabase: true });
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
        const user = await devSignupConfirmedUser(supabase, { username, email, password });

        return res.status(201).json({
            ok: true,
            userId: user?.id || null
        });

    } catch (err) {
        console.error("❌ Signup error:", err);

        if (err.code === 'USER_EXISTS') {
            return res.status(409).json({
                error: 'User already exists'
            });
        }

        return res.status(500).json({
            error: 'Signup failed',
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
        const { data: user, error } = await supabase
            .from('pft_users')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        if (error) {
            throw error;
        }

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

        // JWT_SECRET is defaulted for local dev; in production it should be provided via env vars.

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

        const { data: user, error } = await supabase
            .from('pft_users')
            .select('id, username, email')
            .eq('id', decoded.id)
            .maybeSingle();

        if (error) {
            throw error;
        }

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
