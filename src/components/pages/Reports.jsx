import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { reportService } from "@/services/api/reportService";

const Reports = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "MMMM"));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReportData();
  }, [selectedMonth, selectedYear]);

  const loadReportData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await reportService.generateReportData(selectedMonth, selectedYear);
      setReportData(data);
    } catch (err) {
      setError("Failed to load report data");
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!reportData) return;

    setGenerating(true);
    try {
      await reportService.downloadReport(reportData, selectedFormat);
      toast.success(`${selectedFormat.toUpperCase()} report downloaded successfully!`);
    } catch (error) {
      toast.error(`Failed to generate ${selectedFormat.toUpperCase()} report`);
    } finally {
      setGenerating(false);
    }
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getVarianceColor = (variance) => {
    if (variance > 0) return "text-green-600";
    if (variance < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getVarianceIcon = (variance) => {
    if (variance > 0) return "TrendingUp";
    if (variance < 0) return "TrendingDown";
    return "Minus";
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600">
            Generate detailed monthly financial reports with key metrics and insights.
          </p>
        </div>
      </div>

      {/* Report Configuration */}
      <Card className="p-6">
        <h2 className="text-lg font-display font-semibold text-gray-900 mb-4">
          Report Configuration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="pdf">PDF Report</option>
              <option value="csv">CSV Data</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleDownloadReport}
              disabled={!reportData || generating}
              className="w-full"
            >
              {generating ? (
                <>
                  <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ApperIcon name="Download" className="w-4 h-4 mr-2" />
                  Download
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {error ? (
        <Error message={error} onRetry={loadReportData} />
      ) : reportData ? (
        <div className="space-y-6">
          {/* Key Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
                Key Metrics - {selectedMonth} {selectedYear}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
                    <ApperIcon name="TrendingUp" className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-500">Total Income</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(reportData.totalIncome)}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-2">
                    <ApperIcon name="TrendingDown" className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-sm text-gray-500">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(reportData.totalExpenses)}
                  </p>
                </div>
                <div className="text-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-2 ${
                    reportData.netIncome >= 0 ? "bg-green-100" : "bg-red-100"
                  }`}>
                    <ApperIcon 
                      name="DollarSign" 
                      className={`w-6 h-6 ${reportData.netIncome >= 0 ? "text-green-600" : "text-red-600"}`} 
                    />
                  </div>
                  <p className="text-sm text-gray-500">Net Income</p>
                  <p className={`text-2xl font-bold ${reportData.netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(reportData.netIncome)}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Budget Variances */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
                Budget Variances
              </h3>
              {reportData.budgetVariances.length === 0 ? (
                <Empty
                  icon="Target"
                  title="No budgets set"
                  message="Create budgets to see variance analysis in your reports."
                />
              ) : (
                <div className="space-y-4">
                  {reportData.budgetVariances.map((variance, index) => (
                    <motion.div
                      key={variance.category}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          variance.variance >= 0 ? "bg-green-100" : "bg-red-100"
                        }`}>
                          <ApperIcon 
                            name={getVarianceIcon(variance.variance)}
                            className={`w-4 h-4 ${getVarianceColor(variance.variance)}`}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{variance.category}</p>
                          <p className="text-sm text-gray-500">
                            Spent: {formatCurrency(variance.spent)} / Budget: {formatCurrency(variance.budget)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${getVarianceColor(variance.variance)}`}>
                          {variance.variance >= 0 ? "+" : ""}{formatCurrency(variance.variance)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {((variance.spent / variance.budget) * 100).toFixed(1)}% used
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
                Expense Breakdown by Category
              </h3>
              {reportData.categoryBreakdown.length === 0 ? (
                <Empty
                  icon="PieChart"
                  title="No expenses recorded"
                  message="Add some expense transactions to see category breakdown."
                />
              ) : (
                <div className="space-y-3">
                  {reportData.categoryBreakdown.map((category, index) => (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full bg-primary-500" />
                        <span className="text-gray-700">{category.name}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">
                          {category.percentage.toFixed(1)}%
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(category.amount)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
};

export default Reports;