require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.test') });
const db = require('../db');

if (process.env.NODE_ENV !== 'test') {
    throw new Error('DB cleanup should only run in test mode!');
}

beforeEach(async () => {
    // Clear test users before each test
    await db.query('DELETE FROM users');
});

afterAll(async () => {
    // Close the database connection after all tests
    // await db.end();
});