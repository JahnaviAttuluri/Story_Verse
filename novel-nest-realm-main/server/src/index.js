const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
const booksRouter = require('./routes/books');
const authRouter = require('./routes/auth');
app.use('/api/books', booksRouter);
app.use('/api/auth', authRouter);

// Mongo connection
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://jonv0488:staywithmeforever0488@cluster0.594zizl.mongodb.net/?appName=Cluster0';

async function start() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✓ MongoDB connected successfully');
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
    
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`✓ API server listening on http://localhost:${port}`);
      console.log(`✓ MongoDB URI: ${mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
    });
  } catch (err) {
    console.error('✗ Failed to start server:', err.message);
    if (err.message.includes('ECONNREFUSED')) {
      console.error('\n⚠️  MongoDB is not running or not accessible!');
      console.error('   Please start MongoDB or check your MONGODB_URI in .env');
      console.error('   Default: mongodb://127.0.0.1:27017/novel_nest_realm');
    }
    process.exit(1);
  }
}

start();


