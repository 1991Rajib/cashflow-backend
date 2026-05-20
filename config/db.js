const mongoose = require('mongoose');

/**
 * This function connects the Express application to the MongoDB database.
 * We use async/await because connecting to a database is a 'promise-based'
 * operation that takes some time to complete.
 */
const connectDB = async () => {
  try {
    // mongoose.connect() initiates the connection to the MongoDB URI
    // provided in our environment variables.
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If there's an error (e.g., DB is down, wrong password), it will be caught here.
    console.error(`Error: ${error.message}`);

    // Exit the process with failure (1) so the server doesn't run without a DB.
    process.exit(1);
  }
};

module.exports = connectDB;
