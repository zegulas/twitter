const dotenv = require('dotenv');
// Load .env.test if we're in test mode
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });
const db = require('./db');
const createApp = require('./app');

const app = createApp(db);

const PORT = process.env.PORT || 5001;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
