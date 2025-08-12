import { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { transactionService } from "@/services/api/transactionService";
import { format, startOfMonth, endOfMonth } from "date-fns";

const ExpensePieChart = ({ selectedDate = new Date() }) => {
  const [chartData, setChartData] = useState({ series: [], labels: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadChartData();
  }, [selectedDate]);

  const loadChartData = async () => {
    setLoading(true);
    setError("");
    
    try {
const transactions = await transactionService.getAll();
      
      // Filter expenses for the selected month
      const monthStart = startOfMonth(selectedDate);
      const monthEnd = endOfMonth(selectedDate);
      
      const monthlyExpenses = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date_c);
        return transaction.type_c === "expense" && 
               transactionDate >= monthStart && 
               transactionDate <= monthEnd;
      });

      if (monthlyExpenses.length === 0) {
        setChartData({ series: [], labels: [] });
        setLoading(false);
        return;
      }

      // Group expenses by category
      const expensesByCategory = monthlyExpenses.reduce((acc, transaction) => {
        const category = transaction.category_c;
        acc[category] = (acc[category] || 0) + transaction.amount_c;
        return acc;
      }, {});

      // Convert to chart format
      const labels = Object.keys(expensesByCategory);
      const series = Object.values(expensesByCategory);

      setChartData({ series, labels });
    } catch (err) {
      setError("Failed to load expense data");
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    chart: {
      type: "pie",
      height: 400,
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
    },
    labels: chartData.labels,
    colors: [
      "#22c55e", "#16a34a", "#15803d", "#166534", "#14532d",
      "#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f",
      "#3b82f6", "#2563eb", "#1d4ed8", "#1e40af", "#1e3a8a"
    ],
    legend: {
      position: "bottom",
      offsetY: 0,
      fontSize: "14px",
      fontFamily: "Inter, system-ui, sans-serif",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "60%",
        },
        expandOnClick: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${Math.round(val)}%`,
      style: {
        fontSize: "12px",
        fontWeight: 600,
      },
    },
    tooltip: {
      y: {
        formatter: (val) => {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(val);
        },
      },
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          height: 300,
        },
        legend: {
          position: "bottom",
        },
      },
    }],
  };

  if (loading) return <Loading />;
  
  if (error) {
    return (
      <Card className="p-6">
        <Error message={error} onRetry={loadChartData} />
      </Card>
    );
  }

  if (chartData.series.length === 0) {
    return (
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-display font-semibold text-gray-900">
            Expenses by Category
          </h3>
          <p className="text-sm text-gray-500">
            {format(selectedDate, "MMMM yyyy")}
          </p>
        </div>
        <Empty
          icon="PieChart"
          title="No expenses this month"
          message={`You haven't recorded any expenses for ${format(selectedDate, "MMMM yyyy")} yet.`}
        />
      </Card>
    );
  }

  const totalExpenses = chartData.series.reduce((sum, value) => sum + value, 0);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-display font-semibold text-gray-900">
              Expenses by Category
            </h3>
            <p className="text-sm text-gray-500">
              {format(selectedDate, "MMMM yyyy")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Expenses</p>
            <p className="text-xl font-bold text-red-600">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(totalExpenses)}
            </p>
          </div>
        </div>
      </div>

      <div className="h-96">
        <ReactApexChart
          options={chartOptions}
          series={chartData.series}
          type="pie"
          height="100%"
        />
      </div>
    </Card>
  );
};

export default ExpensePieChart;