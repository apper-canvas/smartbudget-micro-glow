import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { transactionService } from "@/services/api/transactionService";
import { categoryService } from "@/services/api/categoryService";
import ApperIcon from "@/components/ApperIcon";
import CategoryIcon from "@/components/molecules/CategoryIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";

const TransactionList = ({ onEdit, onAdd, refreshTrigger }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Basic filters
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  
  // Advanced filters
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  const [categoryFilter, setCategoryFilter] = useState("");
  const [amountRange, setAmountRange] = useState({
    minAmount: "",
    maxAmount: ""
  });
useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchTerm, filter, dateRange, categoryFilter, amountRange, sortBy]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [transactionData, categoryData] = await Promise.all([
        transactionService.getAll(),
        categoryService.getAll()
      ]);
      setTransactions(transactionData);
      setCategories(categoryData);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      const filters = {
        searchTerm: searchTerm.trim(),
        type: filter === "all" ? "" : filter,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        category: categoryFilter,
        minAmount: amountRange.minAmount ? parseFloat(amountRange.minAmount) : null,
        maxAmount: amountRange.maxAmount ? parseFloat(amountRange.maxAmount) : null
      };

      const filtered = await transactionService.searchTransactions(transactions, filters);
      
      // Apply sorting
      const sorted = filtered.sort((a, b) => {
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

      setFilteredTransactions(sorted);
    } catch (err) {
      console.error("Filter error:", err);
      setFilteredTransactions([]);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilter("all");
    setDateRange({ startDate: "", endDate: "" });
    setCategoryFilter("");
    setAmountRange({ minAmount: "", maxAmount: "" });
    setSortBy("date");
    toast.success("All filters cleared");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

try {
      await transactionService.delete(id);
      toast.success("Transaction deleted successfully!");
      loadData();
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

const hasActiveFilters = searchTerm || filter !== "all" || dateRange.startDate || 
    dateRange.endDate || categoryFilter || amountRange.minAmount || amountRange.maxAmount;

if (loading) return <Loading type="table" />;
  if (error) return <Error message={error} onRetry={loadData} />;
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
{/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search transactions by description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
      </Card>

      {/* Filter Controls */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Basic Filters Row */}
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

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="min-w-[120px]"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="category">Category</option>
                </Select>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2"
              >
                <ApperIcon name="Filter" className="w-4 h-4" />
                Advanced
                <ApperIcon 
                  name={showAdvancedFilters ? "ChevronUp" : "ChevronDown"} 
                  className="w-4 h-4" 
                />
              </Button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-gray-200 pt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Date Range */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Date Range</label>
                    <div className="space-y-2">
                      <Input
                        type="date"
                        placeholder="Start date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                      <Input
                        type="date"
                        placeholder="End date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <Select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.Id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {/* Amount Range */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Amount Range</label>
                    <div className="space-y-2">
                      <Input
                        type="number"
                        placeholder="Min amount"
                        value={amountRange.minAmount}
                        onChange={(e) => setAmountRange(prev => ({ ...prev, minAmount: e.target.value }))}
                        step="0.01"
                        min="0"
                      />
                      <Input
                        type="number"
                        placeholder="Max amount"
                        value={amountRange.maxAmount}
                        onChange={(e) => setAmountRange(prev => ({ ...prev, maxAmount: e.target.value }))}
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Filter Actions */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Actions</label>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        disabled={!hasActiveFilters}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <ApperIcon name="X" className="w-4 h-4" />
                        Clear All
                      </Button>
                      <div className="text-xs text-gray-500 text-center">
                        {filteredTransactions.length} of {transactions.length} transactions
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

{/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <Empty
          icon={hasActiveFilters ? "Filter" : "Receipt"}
          title={hasActiveFilters ? "No transactions found" : "No transactions yet"}
          message={hasActiveFilters ? "Try adjusting your filters to see more transactions." : "Start tracking your finances by adding your first transaction."}
          actionLabel={!hasActiveFilters ? "Add Transaction" : undefined}
          onAction={!hasActiveFilters ? onAdd : undefined}
        />
      ) : (
        <Card className="divide-y divide-gray-100">
{filteredTransactions.map((transaction, index) => (
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