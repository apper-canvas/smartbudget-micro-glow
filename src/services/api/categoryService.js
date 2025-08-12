class CategoryService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = "category_c";
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "type_c" } },
          { field: { Name: "icon_c" } },
          { field: { Name: "color_c" } }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching categories:", error.message);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "type_c" } },
          { field: { Name: "icon_c" } },
          { field: { Name: "color_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching category with ID ${id}:`, error.message);
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
          { field: { Name: "icon_c" } },
          { field: { Name: "color_c" } }
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
      console.error("Error fetching categories by type:", error.message);
      throw error;
    }
  }

  async create(categoryData) {
    try {
      const params = {
        records: [
          {
            Name: categoryData.Name,
            Tags: categoryData.Tags || "",
            type_c: categoryData.type_c,
            icon_c: categoryData.icon_c,
            color_c: categoryData.color_c
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
          console.error(`Failed to create category ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error("Failed to create category");
        }

        return response.results[0].data;
      }
    } catch (error) {
      console.error("Error creating category:", error.message);
      throw error;
    }
  }

  async update(id, categoryData) {
    try {
      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: categoryData.Name,
            Tags: categoryData.Tags || "",
            type_c: categoryData.type_c,
            icon_c: categoryData.icon_c,
            color_c: categoryData.color_c
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
          console.error(`Failed to update category ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error("Failed to update category");
        }

        return response.results[0].data;
      }
    } catch (error) {
      console.error("Error updating category:", error.message);
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
          console.error(`Failed to delete category ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error("Failed to delete category");
        }

        return response.results[0].data;
      }
    } catch (error) {
      console.error("Error deleting category:", error.message);
      throw error;
    }
  }
}

export const categoryService = new CategoryService();