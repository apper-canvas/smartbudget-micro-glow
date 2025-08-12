class BudgetService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = "budget_c";
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "category_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "month_c" } },
          { field: { Name: "year_c" } }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching budgets:", error.message);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "category_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "month_c" } },
          { field: { Name: "year_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching budget with ID ${id}:`, error.message);
      throw error;
    }
  }

  async create(budgetData) {
    try {
      const params = {
        records: [
          {
            Name: budgetData.Name || `${budgetData.category_c} Budget`,
            Tags: budgetData.Tags || "",
            category_c: budgetData.category_c,
            amount_c: parseFloat(budgetData.amount_c),
            month_c: budgetData.month_c,
            year_c: parseInt(budgetData.year_c)
          }
        ]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create budget ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error("Failed to create budget");
        }

        return response.results[0].data;
      }
    } catch (error) {
      console.error("Error creating budget:", error.message);
      throw error;
    }
  }

  async update(id, budgetData) {
    try {
      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: budgetData.Name || `${budgetData.category_c} Budget`,
            Tags: budgetData.Tags || "",
            category_c: budgetData.category_c,
            amount_c: parseFloat(budgetData.amount_c),
            month_c: budgetData.month_c,
            year_c: parseInt(budgetData.year_c)
          }
        ]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update budget ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error("Failed to update budget");
        }

        return response.results[0].data;
      }
    } catch (error) {
      console.error("Error updating budget:", error.message);
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to delete budget ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error("Failed to delete budget");
        }

        return response.results[0].data;
      }
    } catch (error) {
      console.error("Error deleting budget:", error.message);
      throw error;
    }
  }

  async getByPeriod(month, year) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "category_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "month_c" } },
          { field: { Name: "year_c" } }
        ],
        where: [
          {
            FieldName: "month_c",
            Operator: "EqualTo",
            Values: [month]
          },
          {
            FieldName: "year_c",
            Operator: "EqualTo",
            Values: [year]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching budgets by period:", error.message);
      throw error;
    }
  }

  async getByCategoryAndPeriod(category, month, year) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "category_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "month_c" } },
          { field: { Name: "year_c" } }
        ],
        where: [
          {
            FieldName: "category_c",
            Operator: "EqualTo",
            Values: [category]
          },
          {
            FieldName: "month_c",
            Operator: "EqualTo",
            Values: [month]
          },
          {
            FieldName: "year_c",
            Operator: "EqualTo",
            Values: [year]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data?.[0] || null;
    } catch (error) {
      console.error("Error fetching budget by category and period:", error.message);
      throw error;
    }
  }
}

export const budgetService = new BudgetService();