const mongoose = require('mongoose');
module.exports = function connectMongo() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fairbrix';
  if (mongoose.connection.readyState === 1) {
    return;
  }
  mongoose.set('strictQuery', true);
  mongoose.connect(uri)
    .then(() => console.log('MongoDB connected'))
    .catch((error) => console.error('MongoDB connection error:', error));
};