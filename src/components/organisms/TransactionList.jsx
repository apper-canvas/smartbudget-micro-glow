import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { format } from "date-fns";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import CategoryIcon from "@/components/molecules/CategoryIcon";
import { transactionService } from "@/services/api/transactionService";

const TransactionList = ({ onEdit, onAdd, refreshTrigger }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    loadTransactions();
  }, [refreshTrigger]);

  const loadTransactions = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch (err) {
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      await transactionService.delete(id);
      toast.success("Transaction deleted successfully!");
      loadTransactions();
    } catch (error) {
      toast.error("Failed to delete transaction");
    }
  };

  const formatAmount = (amount, type) => {
    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount));

    return type === "income" ? `+${formattedAmount}` : `-${formattedAmount}`;
  };

  const filteredAndSortedTransactions = transactions
    .filter(transaction => {
      if (filter === "all") return true;
      return transaction.type === filter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date) - new Date(a.date);
        case "amount":
          return b.amount - a.amount;
        case "category":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

  if (loading) return <Loading type="table" />;
  if (error) return <Error message={error} onRetry={loadTransactions} />;
  if (transactions.length === 0) {
    return (
      <Empty
        icon="Receipt"
        title="No transactions yet"
        message="Start tracking your finances by adding your first transaction."
        actionLabel="Add Transaction"
        onAction={onAdd}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Sort */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {["all", "income", "expense"].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  filter === filterOption
                    ? "bg-primary-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Transaction List */}
      {filteredAndSortedTransactions.length === 0 ? (
        <Empty
          icon="Filter"
          title="No transactions found"
          message="Try adjusting your filters to see more transactions."
        />
      ) : (
        <Card className="divide-y divide-gray-100">
          {filteredAndSortedTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    transaction.type === "income" ? "bg-green-50" : "bg-red-50"
                  }`}>
                    <CategoryIcon 
                      category={transaction.category} 
                      className={`w-5 h-5 ${
                        transaction.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    />
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {transaction.description}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{transaction.category}</span>
                      <span>•</span>
                      <span>{format(new Date(transaction.date), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className={`font-semibold text-lg ${
                    transaction.type === "income" ? "text-green-600" : "text-red-600"
                  }`}>
                    {formatAmount(transaction.amount, transaction.type)}
                  </span>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(transaction)}
                    >
                      <ApperIcon name="Edit2" className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(transaction.Id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <ApperIcon name="Trash2" className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </Card>
      )}
    </div>
  );
};

export default TransactionList;