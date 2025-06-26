const request = require('supertest');
const createApp = require('../../app');

const mockDb = {
    query: jest.fn()
};

const app = createApp(mockDb);

describe('Health Check', () => {
    test('GET /api/health should return 200 and message', async () => {
        const response = await request(app).get('/api/health');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ status: 'Backend is working!' });
        expect(response.body.status).toBe('Backend is working!');
    });
});
