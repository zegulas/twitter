const request = require('supertest');
const createApp = require('../../app');
const db = require('../../db');
// console.log(db)
const app = createApp(db);

describe('POST /api/auth/signup [real DB]', () => {
    test('should create user in real DB and return 201', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'ashish',
                email: 'ashish@example.com',
                password: 'password123'
            });
        expect(res.statusCode).toBe(201);
        expect(res.body.user).toHaveProperty('username', 'ashish');

        // Check if user is inserted in the DB
        const result = await db.query('SELECT * FROM users where email = $1', ['ashish@example.com']);
        expect(result.rows.length).toBe(1);
    });

    test('should return 400 if fields are missing', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ email: 'test@example.com' }); // Missing username and password

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('All fields are required');
    });

    test('should return 409 if username already exists', async () => {
        await db.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
            ['ashish', 'ashish@example.com', 'hashedpassword123']
        );
        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'ashish',
                email: 'ashish@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toBe(409);
        expect(res.body.error).toBe('Username or email already exists');
    });

    test('should return 409 if email already exists', async () => {
        await db.query(`INSERT INTO users (username, email, password)  VALUES ('ashish', 'ashish@example.com', 'hashed')`);

        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'ashish',
                email: 'ashish@example.com',
                password: 'hashed'
            });

        expect(res.statusCode).toBe(409);
        expect(res.body.error).toMatch(/already exists/i);
    });
});

describe('POST /api/auth/login [real DB]', () => {
    test('should login user with valid credentials and return 200', async () => {
        // First, create a user using the signup endpoint
        await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'ashish',
                email: 'ashish@example.com',
                password: 'ashish@123'
            });

        // Now, test the login endpoint
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'ashish@example.com', password: 'ashish@123' });;

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(res.body.user).toBeDefined();
        expect(res.body.user).toHaveProperty('email', 'ashish@example.com');

    });

    test('should return 400 if email or password is missing', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'ashish@example.com' }); // Missing password

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Email and password are required');
    });

    test('should return 401 if email or password is incorrect', async () => {
        // First, create a user using the signup endpoint
        await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'ashish',
                email: 'ashish@example.com',
                password: 'ashish@123'
            });

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'ashish@example.com', password: 'wrongpassword' });
        expect(res.statusCode).toBe(401);
        expect(res.body.error).toBe('Invalid credentials');
    });
})