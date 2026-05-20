const express = require('express');
const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getTransaction
} = require('../controllers/transactionController');
const {
  getAnalytics,
} = require("../controllers/analyticsController");


/**
 * Routes are like the 'Traffic Police' of your app.
 * They only care about the URL (path) and the HTTP method (GET, POST, etc.).
 * Instead of doing the work themselves, they 'route' the request
 * to the correct controller function.
 */

const router = express.Router();

// Map the GET request to the getTransactions controller function
router.get('/', getTransactions);

// Map the GET request to the getAnalytics controller function
router.get("/analytics", getAnalytics);

// Map the GET request to the getTransaction controller function for a single item
router.get('/:id', getTransaction);

// Map the PUT request to the updateTransaction controller function
// :id is a route parameter that will be passed to req.params.id in the controller
router.put('/:id', updateTransaction);

// Map the DELETE request to the deleteTransaction controller function
router.delete('/:id', deleteTransaction);

// Map the POST request to the createTransaction controller function
// Since this is used in index.js as '/api/transactions', this '/' refers to that base path
router.post('/', createTransaction);



module.exports = router;
