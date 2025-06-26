const request = require('supertest');
const createApp = require('../../app');
const db = require('../../db');

const testUser = {
    username: 'testuser',
    email: 'ashish@example.com',
    password: 'password123'
};

let app;
let token;

beforeAll(() => {
    app = createApp(db);
});

beforeEach(async () => {
    await db.query('DELETE FROM users'); // Clean slate before each test

    // Sign up and login the user
    token = await getValidToken(app, testUser);
});

afterAll(async () => {
    await db.query('DELETE FROM tweets');
    // await db.end();
});

describe('Tweet API Integration Tests', () => {
    test('Create a new tweet', async () => {
        const res = await request(app)
            .post('/api/tweets')
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'This is a test tweet' });

        expect(res.status).toBe(201);
        expect(res.body.tweet).toHaveProperty('id');
        expect(res.body.tweet.content).toBe('This is a test tweet');
    });

    test('Tweet with empty content should fail', async () => {
        const res = await request(app)
            .post('/api/tweets')
            .set('Authorization', `Bearer ${token}`)
            .send({ content: '' });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Tweet cannot be empty');
    });

    test('Tweet with missing content should fail', async () => {
        const res = await request(app)
            .post('/api/tweets')
            .set('Authorization', `Bearer ${token}`)
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Tweet cannot be empty');
    });

    test('Tweet without auth token should fail', async () => {
        const res = await request(app)
            .post('/api/tweets')
            .send({ content: 'Unauthorized tweet' });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Missing or invalid token');
    });
});

describe('Tweet API Error Handling', () => {
    test('Should return 500 if db query fails', async () => {
        const badDb = {
            query: async () => {
                throw new Error('Simulated DB failure');
            }
        };
        const badApp = createApp(badDb);
        const authToken = `Bearer ${token}`; // simulate missing/invalid user

        const res = await request(badApp)
            .post('/api/tweets')
            .set('Authorization', authToken)
            .send({ content: 'This will break' });

        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('error', 'Server error');
    });
});

async function getValidToken(app, user) {
    await request(app).post('/api/auth/signup').send(user);
    const res = await request(app).post('/api/auth/login').send({
        email: user.email,
        password: user.password
    });
    return res.body.token;
}
