require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require("cors");
const connectDB = require('./config/db'); // Import the database connection function
const transactionRoutes = require('./routes/transactionRoutes'); // Import transaction routes

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://your-frontend.vercel.app",
    ],
    credentials: true,
  })
);
const PORT = process.env.PORT || 8000;

console.log("ENV PORT:", process.env.PORT);

// Connect to MongoDB before starting the server
connectDB();

// Middleware to parse JSON bodies
app.use(express.json());

// Route Middleware
// All requests starting with /api/transactions will be handled by transactionRoutes
app.use('/api/transactions', transactionRoutes);

app.get('/', (req, res) => {
  res.send('Hello World! Database is connected.');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
