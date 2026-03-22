const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dotenv = require('dotenv');

dotenv.config();

let mongoServer;

const connectDB = async () => {
    try {
        let uri = process.env.MONGO_URI;

        if (process.env.USE_MEMORY_DB === 'true') {
            mongoServer = await MongoMemoryServer.create();
            uri = mongoServer.getUri();
            console.log('Using mongodb-memory-server');
        }

        await mongoose.connect(uri || 'mongodb://localhost:27017/omnihealth');
        console.log('MongoDB Connected to', uri);
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
