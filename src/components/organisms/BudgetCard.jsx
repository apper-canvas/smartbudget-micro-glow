import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import CategoryIcon from "@/components/molecules/CategoryIcon";

const BudgetCard = ({ budget, spent = 0, onEdit, index = 0 }) => {
  const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
  const remaining = budget.amount - spent;
  
  const getProgressColor = () => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-primary-500";
  };

  const getStatusColor = () => {
    if (percentage >= 100) return "text-red-600 bg-red-50";
    if (percentage >= 80) return "text-yellow-600 bg-yellow-50";
    return "text-primary-600 bg-primary-50";
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card hover className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-50 rounded-full">
              <CategoryIcon category={budget.category} className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{budget.category}</h3>
              <p className="text-sm text-gray-500">
                {budget.month} {budget.year}
              </p>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(budget)}
            className="text-gray-400 hover:text-gray-600"
          >
            <ApperIcon name="Edit2" className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {/* Budget vs Spent */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Spent</span>
            <span className="font-medium">{formatAmount(spent)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Budget</span>
            <span className="font-medium">{formatAmount(budget.amount)}</span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                {Math.round(percentage)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(percentage, 100)}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`h-2 rounded-full ${getProgressColor()}`}
              />
            </div>
          </div>

          {/* Remaining */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-600">Remaining</span>
            <span className={`font-semibold ${
              remaining >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              {remaining >= 0 ? formatAmount(remaining) : `-${formatAmount(Math.abs(remaining))}`}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default BudgetCard;