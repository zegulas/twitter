const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function signup(req, res, db) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const hashed = await bcrypt.hash(password, 10);

    try {
        const result = await db.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
            [username, email, hashed]
        );

        return res.status(201).json({ user: result.rows[0] });
    } catch (err) {
        console.error('Error signing up user:', err);
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Username or email already exists' });
        }
        return res.status(500).json({ error: 'Server error' });
    }
}

async function login(req, res, db) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const result = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                created_at: user.created_at
            },
            token,
            message: 'Login successful'
        })
    } catch (err) {
        console.error('Error logging in user:', err);
        return res.status(500).json({ error: 'Server error' });
    }
}

module.exports = { signup, login };