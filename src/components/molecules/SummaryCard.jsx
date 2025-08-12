import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const SummaryCard = ({ 
  title, 
  amount, 
  icon, 
  color = "primary", 
  trend,
  delay = 0 
}) => {
  const colorClasses = {
    primary: "text-primary-500 bg-primary-50",
    success: "text-green-500 bg-green-50",
    warning: "text-yellow-500 bg-yellow-50",
    danger: "text-red-500 bg-red-50"
  };

  const formatAmount = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(value));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card hover className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold font-display text-gray-900">
              {formatAmount(amount)}
            </p>
            {trend && (
              <p className={`text-sm mt-1 ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
                <ApperIcon 
                  name={trend > 0 ? "TrendingUp" : "TrendingDown"} 
                  className="w-3 h-3 inline mr-1" 
                />
                {Math.abs(trend)}%
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <ApperIcon name={icon} className="w-6 h-6" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default SummaryCard;