import { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { transactionService } from "@/services/api/transactionService";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";

const SpendingTrendChart = ({ months = 6 }) => {
  const [chartData, setChartData] = useState({ series: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadChartData();
  }, [months]);

  const loadChartData = async () => {
    setLoading(true);
    setError("");
    
    try {
const transactions = await transactionService.getAll();
      
      if (transactions.length === 0) {
        setChartData({ series: [], categories: [] });
        setLoading(false);
        return;
      }

      // Generate the last N months
      const endDate = new Date();
      const startDate = subMonths(endDate, months - 1);
      const monthsInterval = eachMonthOfInterval({
        start: startOfMonth(startDate),
        end: endOfMonth(endDate)
      });

      // Initialize data structure
      const monthlyData = monthsInterval.map(month => ({
        month: format(month, "MMM yyyy"),
        income: 0,
        expenses: 0
      }));

      // Group transactions by month
      transactions.forEach(transaction => {
        const transactionDate = new Date(transaction.date_c);
        const monthKey = format(transactionDate, "MMM yyyy");
        
        const monthData = monthlyData.find(m => m.month === monthKey);
        if (monthData) {
          if (transaction.type_c === "income") {
            monthData.income += transaction.amount_c;
          } else {
            monthData.expenses += transaction.amount_c;
          }
        }
      });

      // Prepare chart data
      const categories = monthlyData.map(data => data.month);
      const incomeData = monthlyData.map(data => data.income);
      const expenseData = monthlyData.map(data => data.expenses);
      const netData = monthlyData.map(data => data.income - data.expenses);

      const series = [
        {
          name: "Income",
          data: incomeData,
          color: "#22c55e"
        },
        {
          name: "Expenses",
          data: expenseData,
          color: "#ef4444"
        },
        {
          name: "Net",
          data: netData,
          color: "#3b82f6"
        }
      ];

      setChartData({ series, categories });
    } catch (err) {
      setError("Failed to load spending trend data");
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    chart: {
      type: "line",
      height: 400,
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    markers: {
      size: 6,
      hover: {
        sizeOffset: 2,
      },
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          fontSize: "12px",
          fontFamily: "Inter, system-ui, sans-serif",
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(val);
        },
        style: {
          fontSize: "12px",
          fontFamily: "Inter, system-ui, sans-serif",
        },
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
    legend: {
      position: "top",
      horizontalAlign: "center",
      fontSize: "14px",
      fontFamily: "Inter, system-ui, sans-serif",
    },
    grid: {
      strokeDashArray: 3,
      borderColor: "#e5e7eb",
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

  if (chartData.series.length === 0 || chartData.series.every(s => s.data.every(d => d === 0))) {
    return (
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-display font-semibold text-gray-900">
            Spending Trends
          </h3>
          <p className="text-sm text-gray-500">
            Last {months} months
          </p>
        </div>
        <Empty
          icon="TrendingUp"
          title="No transaction data"
          message={`You haven't recorded any transactions in the last ${months} months yet.`}
        />
      </Card>
    );
  }

  // Calculate summary stats
  const latestMonthData = chartData.series.map(s => s.data[s.data.length - 1] || 0);
  const [latestIncome, latestExpenses, latestNet] = latestMonthData;

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-display font-semibold text-gray-900">
              Spending Trends
            </h3>
            <p className="text-sm text-gray-500">
              Last {months} months
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">This Month Income</p>
            <p className="text-lg font-semibold text-green-600">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(latestIncome)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">This Month Expenses</p>
            <p className="text-lg font-semibold text-red-600">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(latestExpenses)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Net This Month</p>
            <p className={`text-lg font-semibold ${latestNet >= 0 ? "text-green-600" : "text-red-600"}`}>
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(latestNet)}
            </p>
          </div>
        </div>
      </div>

      <div className="h-96">
        <ReactApexChart
          options={chartOptions}
          series={chartData.series}
          type="line"
          height="100%"
        />
      </div>
    </Card>
  );
};

export default SpendingTrendChart;