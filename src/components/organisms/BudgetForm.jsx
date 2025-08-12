import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { budgetService } from "@/services/api/budgetService";
import { categoryService } from "@/services/api/categoryService";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";

const BudgetForm = ({ budget, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    month: "",
    year: new Date().getFullYear()
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCategories();
if (budget) {
      setFormData({
        category: budget.category_c || "",
        amount: budget.amount_c?.toString() || "",
        month: budget.month_c || "",
        year: budget.year_c || new Date().getFullYear()
      });
    } else {
      // Set default month to current month
      const currentDate = new Date();
      const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
      setFormData(prev => ({
        ...prev,
        month: monthNames[currentDate.getMonth()]
      }));
    }
  }, [budget]);

const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      // Only show expense categories for budgets
      const expenseCategories = data.filter(cat => cat.type_c === "expense");
      setCategories(expenseCategories);
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

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.month) {
      newErrors.month = "Month is required";
    }

    if (!formData.year || formData.year < 2020) {
      newErrors.year = "Please select a valid year";
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
      const apiData = {
        Name: `${formData.category} Budget`,
        Tags: "",
        category_c: formData.category,
        amount_c: parseFloat(formData.amount),
        month_c: formData.month,
        year_c: parseInt(formData.year)
      };

      if (budget) {
        await budgetService.update(budget.Id, apiData);
        toast.success("Budget updated successfully!");
      } else {
        await budgetService.create(apiData);
        toast.success("Budget created successfully!");
      }

      onSuccess();
    } catch (error) {
      toast.error(budget ? "Failed to update budget" : "Failed to create budget");
    } finally {
      setLoading(false);
    }
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display font-semibold text-gray-900">
          {budget ? "Edit Budget" : "Create Budget"}
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
          {categories.map((category) => (
            <option key={category.Id} value={category.Name}>
              {category.Name}
            </option>
          ))}
        </FormField>

        {/* Amount */}
        <FormField
          type="number"
          name="amount"
          label="Budget Amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
          min="0"
          error={errors.amount}
          required
        />

        {/* Month and Year */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            type="select"
            name="month"
            label="Month"
            value={formData.month}
            onChange={handleChange}
            error={errors.month}
            required
          >
            <option value="">Select month</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </FormField>

          <FormField
            type="select"
            name="year"
            label="Year"
            value={formData.year}
            onChange={handleChange}
            error={errors.year}
            required
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </FormField>
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading && <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />}
            {budget ? "Update" : "Create"} Budget
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

export default BudgetForm;