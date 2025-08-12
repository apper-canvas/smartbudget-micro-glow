import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { transactionService } from "@/services/api/transactionService";
import { budgetService } from "@/services/api/budgetService";
import ApperIcon from "@/components/ApperIcon";
import SummaryCard from "@/components/molecules/SummaryCard";
import CategoryIcon from "@/components/molecules/CategoryIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Transactions from "@/components/pages/Transactions";
import Charts from "@/components/pages/Charts";
import Reports from "@/components/pages/Reports";
const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentMonth] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [transactionsData, budgetsData] = await Promise.all([
        transactionService.getAll(),
        budgetService.getAll()
      ]);

      setTransactions(transactionsData);
      setBudgets(budgetsData);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading type="dashboard" />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  // Calculate current month data
const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const currentMonthTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date_c);
    return transactionDate >= monthStart && transactionDate <= monthEnd;
  });

  const monthlyIncome = currentMonthTransactions
    .filter(t => t.type_c === "income")
    .reduce((sum, t) => sum + t.amount_c, 0);

  const monthlyExpenses = currentMonthTransactions
    .filter(t => t.type_c === "expense")
    .reduce((sum, t) => sum + t.amount_c, 0);

  const netIncome = monthlyIncome - monthlyExpenses;

  // Get recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5);

  // Get current month budgets
  const currentMonthBudgets = budgets.filter(budget => 
    budget.month_c === format(currentMonth, "MMMM") && 
    budget.year_c === currentMonth.getFullYear()
  );
// Calculate budget spending
  const budgetProgress = currentMonthBudgets.map(budget => {
    const spent = currentMonthTransactions
      .filter(t => t.type_c === "expense" && t.category_c === budget.category_c)
      .reduce((sum, t) => sum + t.amount_c, 0);
    
    return { ...budget, spent, percentage: budget.amount_c > 0 ? (spent / budget.amount_c) * 100 : 0 };
  });
  const formatAmount = (amount, type = null) => {
    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount));

    if (type === "income") return `+${formattedAmount}`;
    if (type === "expense") return `-${formattedAmount}`;
    return formattedAmount;
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Monthly Income"
          amount={monthlyIncome}
          icon="TrendingUp"
          color="success"
          delay={0}
        />
        <SummaryCard
          title="Monthly Expenses"
          amount={monthlyExpenses}
          icon="TrendingDown"
          color="danger"
          delay={0.1}
        />
        <SummaryCard
          title="Net Income"
          amount={netIncome}
          icon="DollarSign"
          color={netIncome >= 0 ? "success" : "danger"}
          delay={0.2}
        />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">
          <h2 className="text-lg font-display font-semibold text-gray-900 mb-4">
            Quick Actions
</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => window.location.href = "/transactions"}
            >
              <ApperIcon name="Plus" className="w-5 h-5" />
              <span className="text-sm">Add Transaction</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => window.location.href = "/budgets"}
            >
              <ApperIcon name="Target" className="w-5 h-5" />
              <span className="text-sm">Set Budget</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => window.location.href = "/charts"}
            >
              <ApperIcon name="PieChart" className="w-5 h-5" />
              <span className="text-sm">View Charts</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => window.location.href = "/reports"}
            >
              <ApperIcon name="FileText" className="w-5 h-5" />
              <span className="text-sm">Generate Reports</span>
            </Button>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold text-gray-900">
                Recent Transactions
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/transactions"}
              >
                View All
                <ApperIcon name="ArrowRight" className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {recentTransactions.length === 0 ? (
              <Empty
                icon="Receipt"
                title="No transactions yet"
                message="Start by adding your first transaction."
                onAction={() => window.location.href = "/transactions"}
                actionLabel="Add Transaction"
              />
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.Id}
                    className="flex items-center justify-between py-2"
                  >
<div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type_c === "income" ? "bg-green-50" : "bg-red-50"
                      }`}>
                        <CategoryIcon 
                          category={transaction.category_c} 
                          className={`w-4 h-4 ${
                            transaction.type_c === "income" ? "text-green-600" : "text-red-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {transaction.description_c}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.category_c}
                        </p>
                      </div>
                    </div>
<span className={`font-semibold text-sm ${
                      transaction.type_c === "income" ? "text-green-600" : "text-red-600"
                    }`}>
                      {formatAmount(transaction.amount_c, transaction.type_c)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Budget Overview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold text-gray-900">
                Budget Overview
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/budgets"}
              >
                View All
                <ApperIcon name="ArrowRight" className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {budgetProgress.length === 0 ? (
              <Empty
                icon="Target"
                title="No budgets set"
                message="Create your first budget to track spending."
                onAction={() => window.location.href = "/budgets"}
                actionLabel="Set Budget"
              />
            ) : (
<div className="space-y-4">
                {budgetProgress.slice(0, 4).map((budget) => (
                  <div key={budget.Id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{budget.category_c}</span>
                      <span className="font-medium">
                        {formatAmount(budget.spent)} / {formatAmount(budget.amount_c)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          budget.percentage >= 100 ? "bg-red-500" :
                          budget.percentage >= 80 ? "bg-yellow-500" :
                          "bg-primary-500"
                        }`}
                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;