// tests/globalTeardown.js
const db = require('../db');

module.exports = async () => {
    await db.end(); // cleanly close PostgreSQL connection
};
