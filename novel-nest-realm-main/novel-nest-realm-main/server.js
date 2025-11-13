require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

async function connectToMongoDB() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB!');
  } catch (err) {
    console.error('Connection failed', err);
  }
}

connectToMongoDB();