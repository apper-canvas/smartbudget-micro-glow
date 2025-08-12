import { useState } from "react";
import { motion } from "framer-motion";
import { format, subMonths } from "date-fns";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import ExpensePieChart from "@/components/organisms/ExpensePieChart";
import SpendingTrendChart from "@/components/organisms/SpendingTrendChart";
const Charts = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [trendMonths, setTrendMonths] = useState(6);

  // Generate months for selector (last 12 months)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: date.toISOString(),
      label: format(date, "MMMM yyyy")
    };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-gray-600">
            Visualize your spending patterns and financial trends over time.
          </p>
        </div>
      </div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
<Card className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-display font-semibold text-gray-900 mb-2">
                Chart Controls
              </h2>
              <p className="text-sm text-gray-600">
                Customize the time period and data shown in your charts.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Pie Chart Month:
                </label>
                <select
                  value={selectedDate.toISOString()}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {monthOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Trend Period:
                </label>
                <select
                  value={trendMonths}
                  onChange={(e) => setTrendMonths(parseInt(e.target.value))}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={3}>3 Months</option>
                  <option value={6}>6 Months</option>
                  <option value={12}>12 Months</option>
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = "/reports"}
                className="flex items-center gap-2"
              >
                <ApperIcon name="FileText" className="w-4 h-4" />
                <span className="hidden sm:inline">Generate Reports</span>
                <span className="sm:hidden">Reports</span>
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Expense Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ExpensePieChart selectedDate={selectedDate} />
        </motion.div>

        {/* Spending Trend Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:row-span-2"
        >
          <SpendingTrendChart months={trendMonths} />
        </motion.div>
      </div>

      {/* Chart Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
            Chart Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Expense Breakdown</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• View your spending distribution by category</li>
                <li>• Identify your highest expense categories</li>
                <li>• Compare spending across different months</li>
                <li>• Track changes in spending patterns</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Spending Trends</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Monitor income vs expenses over time</li>
                <li>• Identify seasonal spending patterns</li>
                <li>• Track your net income trends</li>
                <li>• Plan for upcoming financial goals</li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Charts;