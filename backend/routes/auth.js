const express = require('express');
const { signup, login } = require('../controllers/authController');

function authRoutes(db) {
    const router = express.Router();
    router.post('/signup', (req, res) => signup(req, res, db));
    router.post('/login', (req, res) => login(req, res, db));
    return router;
}

module.exports = authRoutes;
