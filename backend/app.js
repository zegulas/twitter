const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const tweetRoutes = require('./routes/tweet');
const authMiddleware = require('./middleware/authMiddleware');

function createApp(db) {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.get('/api/health', (req, res) => {
        res.json({ status: 'Backend is working!' });
    });
    app.use('/api/auth', authRoutes(db));
    app.use('/api/tweets', tweetRoutes(db));
    app.get('/api/protected', authMiddleware, (req, res) => {
        res.json({ message: 'This is a protected route and you are authenticated!', user: req.user });
    });
    return app;
}

module.exports = createApp;