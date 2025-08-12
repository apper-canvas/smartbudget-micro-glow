import transactionsData from "@/services/mockData/transactions.json";

class TransactionService {
  constructor() {
    this.transactions = [...transactionsData];
  }

  // Simulate API delay
  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async getAll() {
    await this.delay();
    return [...this.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // Advanced search and filtering
  async searchTransactions(transactions, filters = {}) {
    // No delay needed for client-side filtering
    const {
      searchTerm = "",
      type = "",
      startDate = "",
      endDate = "",
      category = "",
      minAmount = null,
      maxAmount = null
    } = filters;

    return transactions.filter(transaction => {
      // Search term filter (description)
      if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Type filter
      if (type && transaction.type !== type) {
        return false;
      }

      // Date range filter
      if (startDate || endDate) {
        const transactionDate = new Date(transaction.date);
        
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (transactionDate < start) return false;
        }
        
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (transactionDate > end) return false;
        }
      }

      // Category filter
      if (category && transaction.category !== category) {
        return false;
      }

      // Amount range filter
      const amount = Math.abs(transaction.amount);
      if (minAmount !== null && amount < minAmount) {
        return false;
      }
      
      if (maxAmount !== null && amount > maxAmount) {
        return false;
      }

      return true;
    });
  }

  async getById(id) {
    await this.delay();
    const transaction = this.transactions.find(t => t.Id === parseInt(id));
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    return { ...transaction };
  }

  async create(transactionData) {
    await this.delay();
    
    const newTransaction = {
      ...transactionData,
      Id: Math.max(...this.transactions.map(t => t.Id)) + 1,
      createdAt: new Date().toISOString(),
    };

    this.transactions.push(newTransaction);
    return { ...newTransaction };
  }

  async update(id, transactionData) {
    await this.delay();
    
    const index = this.transactions.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Transaction not found");
    }

    const updatedTransaction = {
      ...this.transactions[index],
      ...transactionData,
      Id: parseInt(id),
    };

    this.transactions[index] = updatedTransaction;
    return { ...updatedTransaction };
  }

  async delete(id) {
    await this.delay();
    
    const index = this.transactions.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Transaction not found");
    }

    const deletedTransaction = this.transactions.splice(index, 1)[0];
    return { ...deletedTransaction };
  }

  // Get transactions by date range
  async getByDateRange(startDate, endDate) {
    await this.delay();
    
    return this.transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }

  // Get transactions by category
  async getByCategory(category) {
    await this.delay();
    
    return this.transactions.filter(transaction => 
      transaction.category === category
    );
  }

  // Get transactions by type
  async getByType(type) {
    await this.delay();
    
    return this.transactions.filter(transaction => 
      transaction.type === type
    );
  }
}

export const transactionService = new TransactionService();