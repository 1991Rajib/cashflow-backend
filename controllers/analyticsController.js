const Transaction = require("../models/Transaction");

/**
 * GET ANALYTICS
 * /api/transactions/analytics
 */
const getAnalytics = async (req, res) => {
  try {
    /**
     * Query params
     */
    const month = Number(req.query.month);

    const year = Number(req.query.year);

    /**
     * Validate
     */
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and year are required",
      });
    }

    /**
     * Start date
     */
    const startDate = new Date(
      year,
      month - 1,
      1
    );

    /**
     * End date
     */
    const endDate = new Date(
      year,
      month,
      0,
      23,
      59,
      59
    );

    /**
     * Get transactions
     */
    const transactions =
      await Transaction.find({
        transactionDate: {
          $gte: startDate,
          $lte: endDate,
        },
      });

    /**
     * Total income
     */
    const totalIncome = transactions
      .filter(
        (item) => item.type === "income"
      )
      .reduce(
        (acc, item) => acc + item.amount,
        0
      );

    /**
     * Total expenses
     */
    const totalExpenses = transactions
      .filter(
        (item) => item.type === "expense"
      )
      .reduce(
        (acc, item) => acc + item.amount,
        0
      );

    /**
     * Balance
     */
    const balance =
      totalIncome - totalExpenses;

    /**
     * Savings rate
     */
    const savingsRate =
      totalIncome > 0
        ? Number(
          (
            (balance / totalIncome) *
            100
          ).toFixed(0)
        )
        : 0;

    /**
     * Category breakdown
     */
    const expenseTransactions =
      transactions.filter(
        (item) => item.type === "expense"
      );

    const categoryMap = {};

    expenseTransactions.forEach(
      (item) => {
        if (
          !categoryMap[item.category]
        ) {
          categoryMap[item.category] = 0;
        }

        categoryMap[item.category] +=
          item.amount;
      }
    );

    const categoryBreakdown =
      Object.entries(categoryMap).map(
        ([category, total]) => ({
          category,
          total,
        })
      );

    /**
     * Final response
     */
    res.status(200).json({
      success: true,

      data: {
        month,
        year,

        totalIncome,
        totalExpenses,
        balance,
        savingsRate,

        categoryBreakdown,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getAnalytics,
};