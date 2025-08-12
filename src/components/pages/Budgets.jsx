import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { format } from "date-fns";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import BudgetCard from "@/components/organisms/BudgetCard";
import BudgetForm from "@/components/organisms/BudgetForm";
import { budgetService } from "@/services/api/budgetService";
import { transactionService } from "@/services/api/transactionService";

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "MMMM"));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [budgetsData, transactionsData] = await Promise.all([
        budgetService.getAll(),
        transactionService.getAll()
      ]);

      setBudgets(budgetsData);
      setTransactions(transactionsData);
    } catch (err) {
      setError("Failed to load budget data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudget = () => {
    setEditingBudget(null);
    setShowForm(true);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingBudget(null);
    loadData();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingBudget(null);
  };

  const handleDeleteBudget = async (budgetId) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) {
      return;
    }

    try {
      await budgetService.delete(budgetId);
      toast.success("Budget deleted successfully!");
      loadData();
    } catch (error) {
      toast.error("Failed to delete budget");
    }
  };

  // Filter budgets for selected month and year
  const filteredBudgets = budgets.filter(budget => 
    budget.month === selectedMonth && budget.year === selectedYear
  );

  // Calculate spending for each budget
  const budgetsWithSpending = filteredBudgets.map(budget => {
    const spent = transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transaction.type === "expense" && 
               transaction.category === budget.category &&
               format(transactionDate, "MMMM") === selectedMonth &&
               transactionDate.getFullYear() === selectedYear;
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return { ...budget, spent };
  });

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-gray-600">
            Set spending limits for different categories and track your progress.
          </p>
        </div>
        <Button onClick={handleAddBudget}>
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Create Budget
        </Button>
      </div>

      {/* Period Selector */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-display font-semibold text-gray-900">
            Budget Overview
          </h2>
          <div className="flex items-center gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleFormCancel();
              }
            }}
          >
            <BudgetForm
              budget={editingBudget}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Budget Cards */}
      {budgetsWithSpending.length === 0 ? (
        <Empty
          icon="Target"
          title={`No budgets for ${selectedMonth} ${selectedYear}`}
          message="Create your first budget to start tracking your spending limits."
          actionLabel="Create Budget"
          onAction={handleAddBudget}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgetsWithSpending.map((budget, index) => (
            <BudgetCard
              key={budget.Id}
              budget={budget}
              spent={budget.spent}
              onEdit={handleEditBudget}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      {budgetsWithSpending.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
              {selectedMonth} {selectedYear} Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(budgetsWithSpending.reduce((sum, budget) => sum + budget.amount, 0))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold text-red-600">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(budgetsWithSpending.reduce((sum, budget) => sum + budget.spent, 0))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Remaining</p>
                <p className={`text-2xl font-bold ${
                  budgetsWithSpending.reduce((sum, budget) => sum + (budget.amount - budget.spent), 0) >= 0 
                    ? "text-green-600" : "text-red-600"
                }`}>
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(budgetsWithSpending.reduce((sum, budget) => sum + (budget.amount - budget.spent), 0))}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Budgets;