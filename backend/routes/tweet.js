const express = require('express');
const tweetController = require('../controllers/tweetController');
const authMiddleware = require('../middleware/authMiddleware');

function tweetRoutes(db) {
    const router = express.Router();

    // Create a new tweet
    router.post('/', authMiddleware, (req, res) => {
        tweetController.createTweet(req, res, db);
    });

    // Get all tweets
    router.get('/', authMiddleware, (req, res) => {
        tweetController.getTweets(req, res, db);
    });

    // Get a specific tweet by ID
    router.get('/:id', authMiddleware, (req, res) => {
        tweetController.getTweetById(req, res, db);
    });

    // Delete a tweet
    router.delete('/:id', authMiddleware, (req, res) => {
        tweetController.deleteTweet(req, res, db);
    });

    return router;
}

module.exports = tweetRoutes;