import categoriesData from "@/services/mockData/categories.json";

class CategoryService {
  constructor() {
    this.categories = [...categoriesData];
  }

  // Simulate API delay
  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    await this.delay();
    return [...this.categories];
  }

  async getById(id) {
    await this.delay();
    const category = this.categories.find(c => c.Id === parseInt(id));
    if (!category) {
      throw new Error("Category not found");
    }
    return { ...category };
  }

  async getByType(type) {
    await this.delay();
    return this.categories.filter(category => category.type === type);
  }

  async create(categoryData) {
    await this.delay();
    
    const newCategory = {
      ...categoryData,
      Id: Math.max(...this.categories.map(c => c.Id)) + 1,
    };

    this.categories.push(newCategory);
    return { ...newCategory };
  }

  async update(id, categoryData) {
    await this.delay();
    
    const index = this.categories.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Category not found");
    }

    const updatedCategory = {
      ...this.categories[index],
      ...categoryData,
      Id: parseInt(id),
    };

    this.categories[index] = updatedCategory;
    return { ...updatedCategory };
  }

  async delete(id) {
    await this.delay();
    
    const index = this.categories.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Category not found");
    }

    const deletedCategory = this.categories.splice(index, 1)[0];
    return { ...deletedCategory };
  }
}

export const categoryService = new CategoryService();