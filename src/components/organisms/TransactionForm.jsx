import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import { transactionService } from "@/services/api/transactionService";
import { categoryService } from "@/services/api/categoryService";
import { format } from "date-fns";

const TransactionForm = ({ transaction, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd")
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCategories();
    
    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount.toString(),
        category: transaction.category,
        description: transaction.description,
        date: format(new Date(transaction.date), "yyyy-MM-dd")
      });
    }
  }, [transaction]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(),
      };

      if (transaction) {
        await transactionService.update(transaction.Id, transactionData);
        toast.success("Transaction updated successfully!");
      } else {
        await transactionService.create(transactionData);
        toast.success("Transaction added successfully!");
      }

      onSuccess();
    } catch (error) {
      toast.error(transaction ? "Failed to update transaction" : "Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display font-semibold text-gray-900">
          {transaction ? "Edit Transaction" : "Add Transaction"}
        </h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
          >
            <ApperIcon name="X" className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transaction Type */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, type: "income", category: "" }))}
            className={`p-3 rounded-lg border-2 transition-all duration-200 ${
              formData.type === "income"
                ? "border-primary-500 bg-primary-50 text-primary-700"
                : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
            }`}
          >
            <ApperIcon name="TrendingUp" className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm font-medium">Income</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, type: "expense", category: "" }))}
            className={`p-3 rounded-lg border-2 transition-all duration-200 ${
              formData.type === "expense"
                ? "border-primary-500 bg-primary-50 text-primary-700"
                : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
            }`}
          >
            <ApperIcon name="TrendingDown" className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm font-medium">Expense</span>
          </button>
        </div>

        {/* Amount */}
        <FormField
          type="number"
          name="amount"
          label="Amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
          min="0"
          error={errors.amount}
          required
        />

        {/* Category */}
        <FormField
          type="select"
          name="category"
          label="Category"
          value={formData.category}
          onChange={handleChange}
          error={errors.category}
          required
        >
          <option value="">Select a category</option>
          {filteredCategories.map((category) => (
            <option key={category.Id} value={category.name}>
              {category.name}
            </option>
          ))}
        </FormField>

        {/* Description */}
        <FormField
          name="description"
          label="Description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Transaction description"
          error={errors.description}
          required
        />

        {/* Date */}
        <FormField
          type="date"
          name="date"
          label="Date"
          value={formData.date}
          onChange={handleChange}
          error={errors.date}
          required
        />

        {/* Submit Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading && <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />}
            {transaction ? "Update" : "Add"} Transaction
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default TransactionForm;