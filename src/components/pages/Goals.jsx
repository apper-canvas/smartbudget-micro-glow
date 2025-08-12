import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, differenceInDays, isAfter, isBefore } from 'date-fns';
import { goalService } from '@/services/api/goalService';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';

const Goals = () => {
const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [formData, setFormData] = useState({
    Name: '',
    description_c: '',
    target_amount_c: '',
    target_date_c: '',
    status_c: 'Not Started',
    category_c: '',
    Tags: ''
  });

  const statusOptions = [
    { value: 'Not Started', label: 'Not Started' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  const statusColors = {
    'Not Started': 'bg-gray-100 text-gray-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800',
    'On Hold': 'bg-yellow-100 text-yellow-800',
    'Cancelled': 'bg-red-100 text-red-800'
  };

useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadGoals(), loadCategories()]);
    };
    loadData();
  }, []);

  const loadCategories = async () => {
    try {
      const { categoryService } = await import('@/services/api/categoryService');
      const categoriesData = await categoryService.getAll();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await goalService.getAll();
      setGoals(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Format data for submission
      const submitData = {
        ...formData,
        target_amount_c: parseFloat(formData.target_amount_c),
        target_date_c: formData.target_date_c ? new Date(formData.target_date_c).toISOString() : null,
        category_c: formData.category_c ? parseInt(formData.category_c) : null
      };

      if (editingGoal) {
        await goalService.update(editingGoal.Id, submitData);
        toast.success('Goal updated successfully');
      } else {
        await goalService.create(submitData);
        toast.success('Goal created successfully');
      }

      await loadGoals();
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Failed to save goal');
    } finally {
      setLoading(false);
    }
  };

const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      Name: goal.Name || '',
      description_c: goal.description_c || '',
      target_amount_c: goal.target_amount_c || '',
      target_date_c: goal.target_date_c ? format(new Date(goal.target_date_c), 'yyyy-MM-dd') : '',
      status_c: goal.status_c || 'Not Started',
      category_c: goal.category_c?.Id || goal.category_c || '',
      Tags: goal.Tags || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (goalId) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      await goalService.delete(goalId);
      toast.success('Goal deleted successfully');
      await loadGoals();
    } catch (err) {
      toast.error(err.message || 'Failed to delete goal');
    }
  };

  const resetForm = () => {
    setFormData({
      Name: '',
      description_c: '',
      target_amount_c: '',
      target_date_c: '',
      status_c: 'Not Started',
      category_c: '',
      Tags: ''
    });
    setEditingGoal(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getProgressData = (goal) => {
    const targetAmount = parseFloat(goal.target_amount_c) || 0;
    const targetDate = goal.target_date_c ? new Date(goal.target_date_c) : null;
    const today = new Date();
    
    let progress = 0;
    if (goal.status_c === 'Completed') progress = 100;
    else if (goal.status_c === 'In Progress') progress = 50;
    else if (goal.status_c === 'On Hold') progress = 25;
    
    const daysRemaining = targetDate ? differenceInDays(targetDate, today) : null;
    const isOverdue = targetDate ? isBefore(targetDate, today) : false;
    
    return { progress, daysRemaining, isOverdue, targetAmount };
  };

  const filteredGoals = goals.filter(goal => 
    statusFilter === 'All' || goal.status_c === statusFilter
  );

  if (loading && goals.length === 0) return <Loading />;
  if (error && goals.length === 0) return <Error message={error} onRetry={loadGoals} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
          <p className="text-gray-600 mt-1">Track and manage your financial goals</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2"
        >
          <ApperIcon name="Plus" size={20} />
          <span>Add Goal</span>
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {['All', ...statusOptions.map(opt => opt.value)].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === status
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status}
            {status !== 'All' && (
              <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                {goals.filter(g => g.status_c === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <Empty 
          message={statusFilter === 'All' ? "No goals yet" : `No ${statusFilter.toLowerCase()} goals`}
          action={
            <Button onClick={() => setShowForm(true)} variant="outline">
              <ApperIcon name="Plus" size={16} className="mr-2" />
              Add Your First Goal
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredGoals.map((goal) => {
              const { progress, daysRemaining, isOverdue, targetAmount } = getProgressData(goal);
              return (
                <motion.div
                  key={goal.Id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full">
                    <div className="flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{goal.Name}</h3>
                          {goal.category_c && (
                            <p className="text-sm text-gray-600">{goal.category_c.Name || goal.category_c}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-2">
                          <button
                            onClick={() => handleEdit(goal)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <ApperIcon name="Edit2" size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(goal.Id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <ApperIcon name="Trash2" size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      {goal.description_c && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {goal.description_c}
                        </p>
                      )}

                      {/* Progress */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Progress</span>
                            <span className="text-sm text-gray-600">{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Target Amount */}
                        <div className="text-center py-2">
                          <div className="text-2xl font-bold text-gray-900">
                            ${targetAmount.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Target Amount</div>
                        </div>

                        {/* Days Remaining */}
                        {daysRemaining !== null && (
                          <div className="text-center">
                            <div className={`text-sm font-medium ${
                              isOverdue ? 'text-red-600' : daysRemaining <= 30 ? 'text-yellow-600' : 'text-gray-600'
                            }`}>
                              {isOverdue 
                                ? `${Math.abs(daysRemaining)} days overdue`
                                : `${daysRemaining} days remaining`
                              }
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Status & Tags */}
                      <div className="flex items-center justify-between mt-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[goal.status_c]}`}>
                          {goal.status_c}
                        </span>
                        {goal.Tags && (
                          <div className="text-xs text-gray-500 truncate ml-2">
                            {goal.Tags.split(',').slice(0, 2).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Goal Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && resetForm()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingGoal ? 'Edit Goal' : 'Add New Goal'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ApperIcon name="X" size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Goal Name"
                    name="Name"
                    value={formData.Name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Emergency Fund"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description_c"
                      value={formData.description_c}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Describe your goal..."
                    />
                  </div>

                  <Input
                    label="Target Amount"
                    name="target_amount_c"
                    type="number"
                    step="0.01"
                    value={formData.target_amount_c}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                  />

                  <Input
                    label="Target Date"
                    name="target_date_c"
                    type="date"
                    value={formData.target_date_c}
                    onChange={handleChange}
                  />

<Select
                    label="Status"
                    name="status_c"
                    value={formData.status_c}
                    onChange={handleChange}
                    options={statusOptions}
                  />

                  <Select
                    label="Category"
                    name="category_c"
                    value={formData.category_c}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'Select a category' },
                      ...categories.map(cat => ({
                        value: cat.Id,
                        label: cat.Name
                      }))
                    ]}
                    placeholder="Select a category"
                  />

                  <Input
                    label="Tags"
                    name="Tags"
                    value={formData.Tags}
                    onChange={handleChange}
                    placeholder="personal, emergency, vacation (comma separated)"
                  />

                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? 'Saving...' : editingGoal ? 'Update Goal' : 'Create Goal'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Goals;