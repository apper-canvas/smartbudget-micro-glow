import { transactionService } from "@/services/api/transactionService";
import { budgetService } from "@/services/api/budgetService";
import { format, startOfMonth, endOfMonth } from "date-fns";

class ReportService {
  constructor() {}

  // Simulate API delay
  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateReportData(month, year) {
    await this.delay();
    
    try {
      // Get all transactions and budgets
      const [transactions, budgets] = await Promise.all([
        transactionService.getAll(),
        budgetService.getAll()
      ]);

      // Filter transactions for the selected month/year
const monthTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date_c);
        return format(transactionDate, "MMMM") === month && 
               transactionDate.getFullYear() === year;
      });

      // Calculate basic metrics
      const totalIncome = monthTransactions
        .filter(t => t.type_c === "income")
        .reduce((sum, t) => sum + t.amount_c, 0);

      const totalExpenses = monthTransactions
        .filter(t => t.type_c === "expense")
        .reduce((sum, t) => sum + t.amount_c, 0);

      const netIncome = totalIncome - totalExpenses;

      // Get budgets for the selected month/year
      const monthBudgets = budgets.filter(budget => 
        budget.month_c === month && budget.year_c === year
      );

      // Calculate budget variances
      const budgetVariances = monthBudgets.map(budget => {
        const spent = monthTransactions
          .filter(t => t.type_c === "expense" && t.category_c === budget.category_c)
          .reduce((sum, t) => sum + t.amount_c, 0);

        return {
          category: budget.category_c,
          budget: budget.amount_c,
          spent: spent,
          variance: budget.amount_c - spent
        };
      });

      // Calculate category breakdown for expenses
      const categoryTotals = {};
      monthTransactions
        .filter(t => t.type_c === "expense")
        .forEach(transaction => {
          categoryTotals[transaction.category_c] = 
            (categoryTotals[transaction.category_c] || 0) + transaction.amount_c;
        });

      const categoryBreakdown = Object.entries(categoryTotals)
        .map(([name, amount]) => ({
          name,
          amount,
          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount);

      // Get transaction details for CSV export
      const transactionDetails = monthTransactions.map(transaction => ({
        date: format(new Date(transaction.date_c), "yyyy-MM-dd"),
        type: transaction.type_c,
        category: transaction.category_c,
        description: transaction.description_c,
        amount: transaction.amount_c
      }));

      return {
        month,
        year,
        totalIncome,
        totalExpenses,
        netIncome,
        budgetVariances,
        categoryBreakdown,
        transactionDetails,
        transactionCount: monthTransactions.length,
        averageTransaction: monthTransactions.length > 0 ? 
          totalExpenses / monthTransactions.filter(t => t.type_c === "expense").length : 0
      };
    } catch (error) {
      throw new Error("Failed to generate report data");
    }
  }

  async downloadReport(reportData, format) {
    await this.delay(1000); // Simulate processing time

    if (format === "csv") {
      return this.generateCSV(reportData);
    } else if (format === "pdf") {
      return this.generatePDF(reportData);
    }
  }

  generateCSV(reportData) {
    try {
      // Create CSV content with multiple sections
      let csvContent = "";
      
      // Summary section
      csvContent += "FINANCIAL REPORT SUMMARY\n";
      csvContent += `Period,${reportData.month} ${reportData.year}\n`;
      csvContent += `Generated,${format(new Date(), "yyyy-MM-dd HH:mm:ss")}\n`;
      csvContent += "\n";
      
      // Key Metrics
      csvContent += "KEY METRICS\n";
      csvContent += "Metric,Amount\n";
      csvContent += `Total Income,$${reportData.totalIncome.toFixed(2)}\n`;
      csvContent += `Total Expenses,$${reportData.totalExpenses.toFixed(2)}\n`;
      csvContent += `Net Income,$${reportData.netIncome.toFixed(2)}\n`;
      csvContent += "\n";

      // Budget Variances
      if (reportData.budgetVariances.length > 0) {
        csvContent += "BUDGET VARIANCES\n";
        csvContent += "Category,Budget,Spent,Variance,Usage %\n";
        reportData.budgetVariances.forEach(variance => {
          const usagePercent = variance.budget > 0 ? 
            ((variance.spent / variance.budget) * 100).toFixed(1) : 0;
          csvContent += `${variance.category},$${variance.budget.toFixed(2)},$${variance.spent.toFixed(2)},$${variance.variance.toFixed(2)},${usagePercent}%\n`;
        });
        csvContent += "\n";
      }

      // Category Breakdown
      if (reportData.categoryBreakdown.length > 0) {
        csvContent += "EXPENSE BREAKDOWN BY CATEGORY\n";
        csvContent += "Category,Amount,Percentage\n";
        reportData.categoryBreakdown.forEach(category => {
          csvContent += `${category.name},$${category.amount.toFixed(2)},${category.percentage.toFixed(1)}%\n`;
        });
        csvContent += "\n";
      }

      // Transaction Details
      if (reportData.transactionDetails.length > 0) {
        csvContent += "TRANSACTION DETAILS\n";
        csvContent += "Date,Type,Category,Description,Amount\n";
        reportData.transactionDetails.forEach(transaction => {
          csvContent += `${transaction.date},${transaction.type},${transaction.category},"${transaction.description}",$${transaction.amount.toFixed(2)}\n`;
        });
      }

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `financial-report-${reportData.month}-${reportData.year}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      throw new Error("Failed to generate CSV report");
    }
  }

  generatePDF(reportData) {
    try {
      // Create HTML content for PDF (simplified version)
      const htmlContent = this.createPDFHTML(reportData);
      
      // Create a new window for printing
      const printWindow = window.open("", "_blank");
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Trigger print dialog after content loads
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        
        // Close window after printing (user can cancel)
        setTimeout(() => {
          if (!printWindow.closed) {
            printWindow.close();
          }
        }, 1000);
      };
    } catch (error) {
      throw new Error("Failed to generate PDF report");
    }
  }

  createPDFHTML(reportData) {
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Financial Report - ${reportData.month} ${reportData.year}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #22c55e; padding-bottom: 20px; }
        .header h1 { color: #22c55e; margin: 0; }
        .header p { margin: 5px 0; color: #666; }
        .section { margin: 30px 0; }
        .section h2 { color: #16a34a; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .metrics { display: flex; justify-content: space-around; text-align: center; margin: 20px 0; }
        .metric { padding: 20px; }
        .metric .value { font-size: 24px; font-weight: bold; }
        .metric .label { color: #666; margin-top: 5px; }
        .income { color: #22c55e; }
        .expense { color: #ef4444; }
        .net-positive { color: #22c55e; }
        .net-negative { color: #ef4444; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background-color: #f9fafb; font-weight: 600; }
        .text-right { text-align: right; }
        .variance-positive { color: #22c55e; }
        .variance-negative { color: #ef4444; }
        .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Financial Report</h1>
        <p>${reportData.month} ${reportData.year}</p>
        <p>Generated on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}</p>
      </div>

      <div class="section">
        <h2>Key Metrics</h2>
        <div class="metrics">
          <div class="metric">
            <div class="value income">${formatCurrency(reportData.totalIncome)}</div>
            <div class="label">Total Income</div>
          </div>
          <div class="metric">
            <div class="value expense">${formatCurrency(reportData.totalExpenses)}</div>
            <div class="label">Total Expenses</div>
          </div>
          <div class="metric">
            <div class="value ${reportData.netIncome >= 0 ? 'net-positive' : 'net-negative'}">
              ${formatCurrency(reportData.netIncome)}
            </div>
            <div class="label">Net Income</div>
          </div>
        </div>
      </div>

      ${reportData.budgetVariances.length > 0 ? `
      <div class="section">
        <h2>Budget Variances</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th class="text-right">Budget</th>
              <th class="text-right">Spent</th>
              <th class="text-right">Variance</th>
              <th class="text-right">Usage %</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.budgetVariances.map(variance => `
            <tr>
              <td>${variance.category}</td>
              <td class="text-right">${formatCurrency(variance.budget)}</td>
              <td class="text-right">${formatCurrency(variance.spent)}</td>
              <td class="text-right ${variance.variance >= 0 ? 'variance-positive' : 'variance-negative'}">
                ${formatCurrency(variance.variance)}
              </td>
              <td class="text-right">${((variance.spent / variance.budget) * 100).toFixed(1)}%</td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      ${reportData.categoryBreakdown.length > 0 ? `
      <div class="section">
        <h2>Expense Breakdown by Category</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th class="text-right">Amount</th>
              <th class="text-right">Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.categoryBreakdown.map(category => `
            <tr>
              <td>${category.name}</td>
              <td class="text-right">${formatCurrency(category.amount)}</td>
              <td class="text-right">${category.percentage.toFixed(1)}%</td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <div class="footer">
        <p>This report was generated by SmartBudget - Personal Finance Tracker</p>
        <p>Report contains ${reportData.transactionCount} transactions for the selected period</p>
      </div>
    </body>
    </html>
    `;
  }
}

export const reportService = new ReportService();