const { ApperClient } = window.ApperSDK;

class GoalService {
  constructor() {
    this.tableName = 'goal_c';
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "description_c" } },
          { field: { Name: "target_amount_c" } },
          { field: { Name: "target_date_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "ModifiedOn" } }
        ],
        orderBy: [
          { fieldName: "CreatedOn", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error('Failed to fetch goals:', response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching goals:", error.response.data.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error fetching goals:", error.message);
        throw error;
      }
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "description_c" } },
          { field: { Name: "target_amount_c" } },
          { field: { Name: "target_date_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "ModifiedOn" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);

      if (!response.success) {
        console.error(`Failed to fetch goal with ID ${id}:`, response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching goal with ID ${id}:`, error.response.data.message);
        throw new Error(error.response.data.message);
      } else {
        console.error(`Error fetching goal with ID ${id}:`, error.message);
        throw error;
      }
    }
  }

  async create(goalData) {
    try {
      // Only include Updateable fields
      const updateableData = {
        Name: goalData.Name,
        Tags: goalData.Tags,
        description_c: goalData.description_c,
        target_amount_c: goalData.target_amount_c,
        target_date_c: goalData.target_date_c,
        status_c: goalData.status_c,
        category_c: goalData.category_c
      };

      const params = {
        records: [updateableData]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error('Failed to create goal:', response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);

        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} goal records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }

        return successfulRecords.map(result => result.data);
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating goal:", error.response.data.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error creating goal:", error.message);
        throw error;
      }
    }
  }

  async update(id, goalData) {
    try {
      // Only include Updateable fields plus Id
      const updateableData = {
        Id: id,
        Name: goalData.Name,
        Tags: goalData.Tags,
        description_c: goalData.description_c,
        target_amount_c: goalData.target_amount_c,
        target_date_c: goalData.target_date_c,
        status_c: goalData.status_c,
        category_c: goalData.category_c
      };

      const params = {
        records: [updateableData]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error('Failed to update goal:', response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);

        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} goal records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }

        return successfulUpdates.map(result => result.data);
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating goal:", error.response.data.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error updating goal:", error.message);
        throw error;
      }
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [id]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error('Failed to delete goal:', response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);

        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} goal records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }

        return successfulDeletions.length > 0;
      }

      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting goal:", error.response.data.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error deleting goal:", error.message);
        throw error;
      }
    }
  }
}

export const goalService = new GoalService();