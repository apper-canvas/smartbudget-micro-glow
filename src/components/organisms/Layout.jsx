import React, { useContext, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthContext } from "../../App";
import ApperIcon from "@/components/ApperIcon";

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { name: "Transactions", href: "/transactions", icon: "Receipt" },
    { name: "Budgets", href: "/budgets", icon: "Target" },
    { name: "Charts", href: "/charts", icon: "PieChart" },
  ];

  const getPageTitle = () => {
    const currentNav = navigation.find(nav => nav.href === location.pathname);
    return currentNav?.name || "Dashboard";
  };

  // Desktop Sidebar Component
  const DesktopSidebar = () => (
    <aside className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <ApperIcon name="DollarSign" className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-display font-bold text-gray-900">
                SmartBudget
              </span>
            </div>
          </div>
          <nav className="mt-8 flex-1" aria-label="Sidebar">
            <div className="px-2 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive
                        ? "bg-primary-50 text-primary-600 border-r-2 border-primary-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  <ApperIcon
                    name={item.icon}
                    className="mr-3 flex-shrink-0 h-5 w-5"
                  />
                  {item.name}
                </NavLink>
              ))}
</div>
            
            <div className="mt-auto">
              <LogoutButton />
            </div>
          </nav>
        </div>
      </div>
    </aside>
  );

  // Mobile Sidebar Component
  const MobileSidebar = () => (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div 
              className="fixed inset-0 bg-black bg-opacity-25"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          </motion.div>

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                    <ApperIcon name="DollarSign" className="w-5 h-5 text-white" />
                  </div>
                  <span className="ml-3 text-xl font-display font-bold text-gray-900">
                    SmartBudget
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isActive
                          ? "bg-primary-50 text-primary-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                  >
                    <ApperIcon
                      name={item.icon}
                      className="mr-3 flex-shrink-0 h-5 w-5"
                    />
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
);

  // Logout Button Component
  function LogoutButton() {
    const { logout } = useContext(AuthContext);

    return (
      <button
        onClick={logout}
        className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
      >
        <ApperIcon name="LogOut" className="w-4 h-4 mr-2" />
        Logout
      </button>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DesktopSidebar />
      <MobileSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
<div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                <ApperIcon name="Menu" className="w-5 h-5" />
              </button>
              <h1 className="ml-4 text-xl font-display font-semibold text-gray-900">
                {getPageTitle()}
              </h1>
</div>
            <LogoutButton />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="hidden lg:block mb-8">
                <h1 className="text-3xl font-display font-bold text-gray-900">
                  {getPageTitle()}
                </h1>
              </div>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;