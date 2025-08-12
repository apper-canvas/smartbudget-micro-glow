import ApperIcon from "@/components/ApperIcon";

const CategoryIcon = ({ category, className = "w-8 h-8" }) => {
  const categoryIcons = {
    "Food & Dining": "UtensilsCrossed",
    "Transportation": "Car",
    "Entertainment": "Music",
    "Shopping": "ShoppingBag",
    "Health": "Heart",
    "Education": "BookOpen",
    "Bills": "Receipt",
    "Groceries": "ShoppingCart",
    "Travel": "Plane",
    "Other": "Circle",
    "Salary": "Briefcase",
    "Freelance": "Laptop",
    "Business": "Building2",
    "Investments": "TrendingUp",
    "Gifts": "Gift"
  };

  const iconName = categoryIcons[category] || "Circle";

  return <ApperIcon name={iconName} className={className} />;
};

export default CategoryIcon;