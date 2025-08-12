import budgetsData from "@/services/mockData/budgets.json";

class BudgetService {
  constructor() {
    this.budgets = [...budgetsData];
  }

  // Simulate API delay
  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    await this.delay();
    return [...this.budgets];
  }

  async getById(id) {
    await this.delay();
    const budget = this.budgets.find(b => b.Id === parseInt(id));
    if (!budget) {
      throw new Error("Budget not found");
    }
    return { ...budget };
  }

  async create(budgetData) {
    await this.delay();
    
    // Check if budget already exists for the same category, month, and year
    const existingBudget = this.budgets.find(b => 
      b.category === budgetData.category && 
      b.month === budgetData.month && 
      b.year === budgetData.year
    );

    if (existingBudget) {
      throw new Error("Budget already exists for this category and period");
    }

    const newBudget = {
      ...budgetData,
      Id: Math.max(...this.budgets.map(b => b.Id)) + 1,
    };

    this.budgets.push(newBudget);
    return { ...newBudget };
  }

  async update(id, budgetData) {
    await this.delay();
    
    const index = this.budgets.findIndex(b => b.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Budget not found");
    }

    // Check if budget already exists for the same category, month, and year (excluding current)
    const existingBudget = this.budgets.find(b => 
      b.Id !== parseInt(id) &&
      b.category === budgetData.category && 
      b.month === budgetData.month && 
      b.year === budgetData.year
    );

    if (existingBudget) {
      throw new Error("Budget already exists for this category and period");
    }

    const updatedBudget = {
      ...this.budgets[index],
      ...budgetData,
      Id: parseInt(id),
    };

    this.budgets[index] = updatedBudget;
    return { ...updatedBudget };
  }

  async delete(id) {
    await this.delay();
    
    const index = this.budgets.findIndex(b => b.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Budget not found");
    }

    const deletedBudget = this.budgets.splice(index, 1)[0];
    return { ...deletedBudget };
  }

  // Get budgets by month and year
  async getByPeriod(month, year) {
    await this.delay();
    
    return this.budgets.filter(budget => 
      budget.month === month && budget.year === year
    );
  }

  // Get budget by category for specific month/year
  async getByCategoryAndPeriod(category, month, year) {
    await this.delay();
    
    return this.budgets.find(budget => 
      budget.category === category && 
      budget.month === month && 
      budget.year === year
    );
  }
}

export const budgetService = new BudgetService();