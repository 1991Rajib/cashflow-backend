const Transaction = require('../models/Transaction');

/**
 * Controllers handle the 'Business Logic' of the application.
 * They receive the request from the router, process the data,
 * interact with the database, and send back the final response.
 *
 * Think of it as the 'Brain' that decides WHAT to do with the data.
 */

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access   Public
exports.deleteTransaction = async (req, res) => {
  try {
    const id = req.params.id;

    /**
     * Transaction.findByIdAndDelete(id):
     * - This method finds the document with the specified ID and removes it from the database.
     * - If the document is found and deleted, it returns the deleted document.
     * - If no document is found with that ID, it returns null.
     */
    const deletedTransaction = await Transaction.findByIdAndDelete(id);

    // If no document was found with that ID
    if (!deletedTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found with the provided ID',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      data: deletedTransaction,
    });
  } catch (error) {
    // Handle invalid MongoDB ObjectIDs (e.g., if the ID is not 24 hex chars)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Transaction ID format',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access   Public
exports.updateTransaction = async (req, res) => {

  try {
    /**
     * req.params.id:
     * - This comes from the URL (e.g., /api/transactions/64f123...).
     * - Express extracts this as a variable so we know WHICH document to update.
     */
    const id = req.params.id;

    /**
     * Transaction.findByIdAndUpdate(id, updateData, options):
     * - 1st arg: The unique ID of the document.
     * - 2nd arg: The data we want to change (req.body).
     * - 3rd arg (options):
     *   - new: true -> Returns the document AFTER the update was applied.
     *   - runValidators: true -> Ensures the updated data still follows the Schema rules
     *     (e.g., prevents changing 'type' to something other than 'income' or 'expense').
     */
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    // If no document was found with that ID
    if (!updatedTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found with the provided ID',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: updatedTransaction,
    });
  } catch (error) {
    // Handle validation errors during update
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: error.message,
      });
    }

    // Handle invalid MongoDB ObjectIDs (e.g., if the ID is not 24 hex chars)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Transaction ID format',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Get a single transaction
// @route   GET /api/transactions/:id
// @access   Public
exports.getTransaction = async (req, res) => {
  try {
    const id = req.params.id;

    /**
     * Transaction.findById(id):
     * - Finds a single document by its unique MongoDB _id.
     * - Returns the document if found, otherwise returns null.
     */
    const transaction = await Transaction.findById(id);

    // If no transaction was found with that ID
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found with the provided ID',
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    // Handle invalid MongoDB ObjectIDs
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Transaction ID format',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Get all transactions with pagination and filtering
// @route   GET /api/transactions
// @access  Public

exports.getTransactions = async (req, res) => {
  try {
    // =========================
    // PAGINATION
    // =========================

    const page =
      parseInt(req.query.page) || 1;

    const limit =
      parseInt(req.query.limit) || 10;

    const skip =
      (page - 1) * limit;

    // =========================
    // FILTER QUERY
    // =========================

    const query = {};

    /**
     * TYPE FILTER
     * Example:
     * ?type=income
     */
    if (req.query.type) {
      query.type = req.query.type;
    }

    /**
     * CATEGORY FILTER
     * Example:
     * ?category=Food
     */
    if (req.query.category) {
      query.category =
        req.query.category;
    }

    // =========================
    // DATE RANGE FILTER
    // =========================

    /**
     * Example:
     * ?startDate=2026-01-01
     * &endDate=2026-05-20
     */

    if (
      req.query.startDate ||
      req.query.endDate
    ) {
      query.transactionDate = {};

      /**
       * GREATER THAN EQUAL
       */
      if (req.query.startDate) {
        query.transactionDate.$gte =
          new Date(req.query.startDate);
      }

      /**
       * LESS THAN EQUAL
       */
      if (req.query.endDate) {
        query.transactionDate.$lte =
          new Date(req.query.endDate);
      }
    }

    // =========================
    // MONTH + YEAR FILTER
    // =========================

    /**
     * Example:
     * ?month=5&year=2026
     */

    if (
      req.query.month &&
      req.query.year
    ) {
      const month =
        parseInt(req.query.month);

      const year =
        parseInt(req.query.year);

      /**
       * Month starts from 0 in JS
       * so May = 4 internally
       */

      const startDate =
        new Date(year, month - 1, 1);

      /**
       * Last day of selected month
       */
      const endDate =
        new Date(year, month, 0);

      query.transactionDate = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // =========================
    // FETCH TRANSACTIONS
    // =========================

    const transactions =
      await Transaction.find(query)
        .sort({
          transactionDate: -1,
        })
        .skip(skip)
        .limit(limit);

    // =========================
    // TOTAL COUNT
    // =========================

    const totalTransactions =
      await Transaction.countDocuments(
        query
      );

    const totalPages = Math.ceil(
      totalTransactions / limit
    );

    // =========================
    // RESPONSE
    // =========================

    res.status(200).json({
      success: true,

      pagination: {
        currentPage: page,
        totalPages,
        totalTransactions,
        limit,
      },

      filtersApplied: query,

      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access   Public
exports.createTransaction = async (req, res) => {

  try {
    // req.body contains the JSON data sent by the user (thanks to express.json() middleware)
    const transactionData = req.body;

    // Create a new Transaction document using the model
    const transaction = await Transaction.create(transactionData);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction,
    });
  } catch (error) {
    // Handle validation errors from the Mongoose schema
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: error.message,
      });
    }

    // Handle any other unexpected server errors
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};
