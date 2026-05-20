const mongoose = require('mongoose');

/**
 * A Schema defines the 'shape' of the documents within a MongoDB collection.
 * Think of it as a blueprint for your data.
 */
const transactionSchema = new mongoose.Schema({
  // title: the name of the transaction (e.g., "Salary", "Grocery Shopping")
  title: {
    type: String,
    required: [true, 'Please provide a title for this transaction'],
    trim: true, // Removes leading and trailing whitespace
  },
  // amount: the money value of the transaction
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
  },
  // type: distinguishes if money is coming in (income) or going out (expense)
  type: {
    type: String,
    required: [true, 'Please specify if this is an income or expense'],
    enum: {
      values: ['income', 'expense'],
      message: 'Transaction type must be either income or expense',
    },
  },
  // category: helps group transactions (e.g., "Food", "Rent", "Entertainment")
  category: {
    type: String,
    trim: true,
  },
  // notes: optional extra information about the transaction
  notes: {
    type: String,
    trim: true,
  },
  // transactionDate: the actual date the transaction happened
  transactionDate: {
    type: Date,
    default: Date.now, // If no date is provided, it defaults to the current time
  },
}, {
  // timestamps: automatically creates 'createdAt' and 'updatedAt' fields
  timestamps: true,
});

/**
 * A Model is a wrapper around the Schema.
 * It provides the methods to query, create, update, and delete documents in MongoDB.
 * 'Transaction' is the name of the model. Mongoose will automatically
 * look for the plural, lowercase collection name in the DB: 'transactions'.
 */
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
