class TransactionService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = "transaction_c";
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "type_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "created_at_c" } }
        ],
        orderBy: [
          {
            fieldName: "date_c",
            sorttype: "DESC"
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
      console.error("Error fetching transactions:", error.message);
      throw error;
    }
  }

  async searchTransactions(transactions, filters = {}) {
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
      if (searchTerm && !transaction.description_c?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Type filter
      if (type && transaction.type_c !== type) {
        return false;
      }

      // Date range filter
      if (startDate || endDate) {
        const transactionDate = new Date(transaction.date_c);
        
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
      if (category && transaction.category_c !== category) {
        return false;
      }

      // Amount range filter
      const amount = Math.abs(transaction.amount_c);
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
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "type_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "created_at_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching transaction with ID ${id}:`, error.message);
      throw error;
    }
  }

  async create(transactionData) {
    try {
      const params = {
        records: [
          {
            Name: transactionData.Name || `${transactionData.type_c} transaction`,
            Tags: transactionData.Tags || "",
            type_c: transactionData.type_c,
            amount_c: parseFloat(transactionData.amount_c),
            category_c: transactionData.category_c,
            description_c: transactionData.description_c,
            date_c: transactionData.date_c,
            created_at_c: new Date().toISOString()
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
          console.error(`Failed to create transaction ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error("Failed to create transaction");
        }

        return response.results[0].data;
      }
    } catch (error) {
      console.error("Error creating transaction:", error.message);
      throw error;
    }
  }

  async update(id, transactionData) {
    try {
      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: transactionData.Name || `${transactionData.type_c} transaction`,
            Tags: transactionData.Tags || "",
            type_c: transactionData.type_c,
            amount_c: parseFloat(transactionData.amount_c),
            category_c: transactionData.category_c,
            description_c: transactionData.description_c,
            date_c: transactionData.date_c
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
          console.error(`Failed to update transaction ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error("Failed to update transaction");
        }

        return response.results[0].data;
      }
    } catch (error) {
      console.error("Error updating transaction:", error.message);
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
          console.error(`Failed to delete transaction ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error("Failed to delete transaction");
        }

        return response.results[0].data;
      }
    } catch (error) {
      console.error("Error deleting transaction:", error.message);
      throw error;
    }
  }

  async getByDateRange(startDate, endDate) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "type_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "created_at_c" } }
        ],
        where: [
          {
            FieldName: "date_c",
            Operator: "GreaterThanOrEqualTo",
            Values: [startDate.toISOString()]
          },
          {
            FieldName: "date_c",
            Operator: "LessThanOrEqualTo", 
            Values: [endDate.toISOString()]
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
      console.error("Error fetching transactions by date range:", error.message);
      throw error;
    }
  }

  async getByCategory(category) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "type_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "created_at_c" } }
        ],
        where: [
          {
            FieldName: "category_c",
            Operator: "EqualTo",
            Values: [category]
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
      console.error("Error fetching transactions by category:", error.message);
      throw error;
    }
  }

  async getByType(type) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "type_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "created_at_c" } }
        ],
        where: [
          {
            FieldName: "type_c",
            Operator: "EqualTo",
            Values: [type]
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
      console.error("Error fetching transactions by type:", error.message);
      throw error;
    }
  }
}

export const transactionService = new TransactionService();