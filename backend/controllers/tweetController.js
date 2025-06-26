async function createTweet(req, res, db) {
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Tweet cannot be empty' });
    }

    try {
        const result = await db.query(
            'INSERT INTO tweets (user_id, content) values ($1, $2) RETURNING * ', [userId, content.trim()]
        )

        return res.status(201).json({ tweet: result.rows[0] })
    } catch (err) {
        console.error('Error creating tweet:', err);
        return res.status(500).json({ error: 'Server error' });
    }
}

async function getTweets(req, res, db) {
    try {
        const result = await db.query(`
            SELECT t.id, u.username, t.content, t.created_at
            FROM tweets t
            JOIN users u ON t.user_id = u.id
            WHERE t.deleted_at IS NULL
            ORDER BY t.created_at DESC
            LIMIT 20;
    `);
        return res.status(200).json({ tweets: result.rows });
    } catch (err) {
        console.error('Error fetching tweets:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

async function getTweetById(req, res, db) {
    const tweetId = req.params.id;

    try {
        const result = await db.query(`
            SELECT t.id, u.username, t.content, t.created_at
            FROM tweets t
            JOIN users u ON t.user_id = u.id
            WHERE t.id = $1 AND t.deleted_at IS NULL;
        `, [tweetId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tweet not found' });
        }
        return res.status(200).json({ tweet: result.rows[0] });
    } catch (err) {
        console.error('Error fetching tweet:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

async function deleteTweet(req, res, db) {
    const tweetId = req.params.id;
    const userId = req.user.id;

    try {
        const result = await db.query(
            `UPDATE tweets
             SET deleted_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
             RETURNING *`,
            [tweetId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tweet not found or already deleted' });
        }

        return res.status(200).json({ message: 'Tweet deleted successfully' });
    } catch (err) {
        console.error('Error deleting tweet:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { createTweet, getTweets, getTweetById, deleteTweet };