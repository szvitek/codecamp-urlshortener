const mongoose = require('mongoose');

module.exports = function connectDB() {
  const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';

  try {
    mongoose.connect(url);
  } catch (err) {
    process.exit(1);
  }

  const dbConnection = mongoose.connection;

  dbConnection.once('open', () => {
    console.log(`Database connected: ${url}`);
  });

  dbConnection.on('error', (err) => {
    console.error(`Connection error: ${err}`);
  });
};
