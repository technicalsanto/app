import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { Plus, DollarSign, Target, Lightbulb, TrendingUp, Calendar, Trash2, BarChart, PieChart, TrendingDown } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, isWithinInterval } from 'date-fns';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Textarea } from './components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Progress } from './components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement);

// Category icons and colors
const categoryConfig = {
  food: { icon: '🍽️', color: 'bg-orange-100 text-orange-800', name: 'Food' },
  travel: { icon: '✈️', color: 'bg-blue-100 text-blue-800', name: 'Travel' },
  entertainment: { icon: '🎬', color: 'bg-purple-100 text-purple-800', name: 'Entertainment' },
  shopping: { icon: '🛍️', color: 'bg-pink-100 text-pink-800', name: 'Shopping' },
  bills: { icon: '📄', color: 'bg-red-100 text-red-800', name: 'Bills' },
  health: { icon: '⚕️', color: 'bg-green-100 text-green-800', name: 'Health' },
  other: { icon: '📦', color: 'bg-gray-100 text-gray-800', name: 'Other' }
};

// Chart colors matching our teal theme
const chartColors = {
  primary: 'rgb(20, 184, 166)',
  secondary: 'rgb(134, 239, 172)',
  tertiary: 'rgb(254, 240, 138)',
  quaternary: 'rgb(252, 165, 165)',
  quinary: 'rgb(196, 181, 253)',
  senary: 'rgb(167, 243, 208)',
  septenary: 'rgb(147, 197, 253)'
};

function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(`${API}/expenses`);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async () => {
    if (!newExpense.amount || !newExpense.category || !newExpense.description) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await axios.post(`${API}/expenses`, {
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        description: newExpense.description
      });
      
      setExpenses([response.data, ...expenses]);
      setNewExpense({ amount: '', category: '', description: '' });
      setIsAddingExpense(false);
      toast.success('Expense added successfully!');
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
    }
  };

  const deleteExpense = async (expenseId) => {
    try {
      await axios.delete(`${API}/expenses/${expenseId}`);
      setExpenses(expenses.filter(expense => expense.id !== expenseId));
      toast.success('Expense deleted successfully!');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expense Tracker</h2>
          <p className="text-gray-600">Track your daily spending</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total Spent This Month</p>
          <p className="text-2xl font-bold text-teal-600">${totalSpent.toFixed(2)}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading expenses...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {expenses.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No expenses yet</h3>
                <p className="text-gray-600 mb-4">Start tracking your spending by adding your first expense!</p>
              </CardContent>
            </Card>
          ) : (
            expenses.map((expense) => {
              const config = categoryConfig[expense.category] || categoryConfig.other;
              return (
                <Card key={expense.id} className="hover:shadow-md transition-shadow" data-testid={`expense-card-${expense.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full ${config.color} flex items-center justify-center text-2xl`}>
                          {config.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{expense.description}</h4>
                          <p className="text-sm text-gray-600">{config.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(expense.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-gray-900">${expense.amount.toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteExpense(expense.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          data-testid={`delete-expense-${expense.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Floating Add Button */}
      <Dialog open={isAddingExpense} onOpenChange={setIsAddingExpense}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-teal-500 hover:bg-teal-600 shadow-lg"
            data-testid="add-expense-button"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>Track your spending to better manage your budget.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                data-testid="expense-amount-input"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={newExpense.category} onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}>
                <SelectTrigger data-testid="expense-category-select">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center space-x-2">
                        <span>{config.icon}</span>
                        <span>{config.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What did you spend on?"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                data-testid="expense-description-input"
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsAddingExpense(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-teal-500 hover:bg-teal-600" onClick={addExpense} data-testid="save-expense-button">
                Add Expense
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    target_amount: '',
    target_date: ''
  });
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    try {
      const response = await axios.get(`${API}/savings-goals`);
      setGoals(response.data);
    } catch (error) {
      console.error('Error fetching savings goals:', error);
      toast.error('Failed to load savings goals');
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async () => {
    if (!newGoal.name || !newGoal.target_amount) {
      toast.error('Please fill in name and target amount');
      return;
    }

    try {
      const goalData = {
        name: newGoal.name,
        target_amount: parseFloat(newGoal.target_amount),
        target_date: newGoal.target_date || null
      };
      
      const response = await axios.post(`${API}/savings-goals`, goalData);
      setGoals([response.data, ...goals]);
      setNewGoal({ name: '', target_amount: '', target_date: '' });
      setIsAddingGoal(false);
      toast.success('Savings goal created successfully!');
    } catch (error) {
      console.error('Error adding savings goal:', error);
      toast.error('Failed to create savings goal');
    }
  };

  const updateGoalProgress = async (goalId, newAmount) => {
    try {
      const response = await axios.put(`${API}/savings-goals/${goalId}`, {
        current_amount: parseFloat(newAmount)
      });
      
      setGoals(goals.map(goal => 
        goal.id === goalId ? response.data : goal
      ));
      toast.success('Progress updated!');
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update progress');
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      await axios.delete(`${API}/savings-goals/${goalId}`);
      setGoals(goals.filter(goal => goal.id !== goalId));
      toast.success('Savings goal deleted successfully!');
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete savings goal');
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Savings Goals</h2>
          <p className="text-gray-600">Set targets and track your progress</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading savings goals...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {goals.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No savings goals yet</h3>
                <p className="text-gray-600 mb-4">Create your first savings goal to start building your future!</p>
              </CardContent>
            </Card>
          ) : (
            goals.map((goal) => {
              const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
              const isCompleted = progress >= 100;
              
              return (
                <Card key={goal.id} className={`hover:shadow-md transition-shadow ${isCompleted ? 'border-green-200 bg-green-50' : ''}`} data-testid={`savings-goal-card-${goal.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{goal.name}</CardTitle>
                        <CardDescription>
                          ${goal.current_amount.toFixed(2)} of ${goal.target_amount.toFixed(2)}
                          {goal.target_date && (
                            <span className="ml-2">• Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isCompleted && <span className="text-2xl">🎉</span>}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteGoal(goal.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          data-testid={`delete-goal-${goal.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm font-medium text-teal-600">{progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={Math.min(progress, 100)} className="h-3" />
                      </div>
                      
                      <div className="flex space-x-2">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Add to savings"
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const newAmount = (goal.current_amount || 0) + parseFloat(e.target.value || 0);
                              if (newAmount >= 0) {
                                updateGoalProgress(goal.id, newAmount);
                                e.target.value = '';
                              }
                            }
                          }}
                          data-testid={`add-savings-input-${goal.id}`}
                        />
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            const input = e.target.closest('.flex').querySelector('input');
                            const addAmount = parseFloat(input.value || 0);
                            const newAmount = (goal.current_amount || 0) + addAmount;
                            if (newAmount >= 0 && addAmount > 0) {
                              updateGoalProgress(goal.id, newAmount);
                              input.value = '';
                            }
                          }}
                          data-testid={`add-savings-button-${goal.id}`}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Floating Add Button */}
      <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-teal-500 hover:bg-teal-600 shadow-lg"
            data-testid="add-goal-button"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Savings Goal</DialogTitle>
            <DialogDescription>Set a target and start saving towards your goal.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="goal-name">Goal Name</Label>
              <Input
                id="goal-name"
                placeholder="e.g., Vacation, Emergency Fund"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                data-testid="goal-name-input"
              />
            </div>
            <div>
              <Label htmlFor="target-amount">Target Amount ($)</Label>
              <Input
                id="target-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newGoal.target_amount}
                onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                data-testid="goal-amount-input"
              />
            </div>
            <div>
              <Label htmlFor="target-date">Target Date (Optional)</Label>
              <Input
                id="target-date"
                type="date"
                value={newGoal.target_date}
                onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                data-testid="goal-date-input"
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsAddingGoal(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-teal-500 hover:bg-teal-600" onClick={addGoal} data-testid="save-goal-button">
                Create Goal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Analytics Dashboard Component
function Analytics() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(`${API}/expenses`);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Calculate analytics data
  const getCategoryData = () => {
    const categoryTotals = {};
    expenses.forEach(expense => {
      const category = expense.category || 'other';
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
    });

    const categories = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);
    const colors = categories.map((_, index) => Object.values(chartColors)[index % Object.values(chartColors).length]);

    return {
      labels: categories.map(cat => categoryConfig[cat]?.name || cat),
      datasets: [{
        data: amounts,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 2
      }]
    };
  };

  const getMonthlyData = () => {
    const monthlyTotals = {};
    const last6Months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date()
    });

    // Initialize all months with 0
    last6Months.forEach(month => {
      const monthKey = format(month, 'yyyy-MM');
      monthlyTotals[monthKey] = 0;
    });

    // Add actual expenses
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const monthKey = format(expenseDate, 'yyyy-MM');
      if (monthlyTotals.hasOwnProperty(monthKey)) {
        monthlyTotals[monthKey] += expense.amount;
      }
    });

    return {
      labels: last6Months.map(month => format(month, 'MMM yyyy')),
      datasets: [{
        label: 'Monthly Spending',
        data: Object.values(monthlyTotals),
        backgroundColor: 'rgba(20, 184, 166, 0.2)',
        borderColor: 'rgb(20, 184, 166)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    };
  };

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const avgMonthlySpending = totalSpent / Math.max(1, Math.ceil(expenses.length / 10)); // rough estimate
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    return isWithinInterval(expenseDate, {
      start: startOfMonth(now),
      end: endOfMonth(now)
    });
  });
  const thisMonthTotal = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-600">Insights into your spending patterns</p>
        </div>
        <Card className="text-center py-8">
          <CardContent>
            <BarChart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No data to analyze yet</h3>
            <p className="text-gray-600">Start tracking expenses to see your spending insights!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <p className="text-gray-600">Insights into your spending patterns</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-teal-600">${totalSpent.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-blue-600">${thisMonthTotal.toFixed(2)}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-purple-600">{expenses.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-teal-600" />
              <span>Spending by Category</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Pie 
                data={getCategoryData()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true
                      }
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-teal-600" />
              <span>Monthly Spending Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line 
                data={getMonthlyData()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return '$' + value.toFixed(0);
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart className="h-5 w-5 text-teal-600" />
            <span>Category Breakdown</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(
              expenses.reduce((acc, expense) => {
                const category = expense.category || 'other';
                acc[category] = (acc[category] || 0) + expense.amount;
                return acc;
              }, {})
            )
              .sort(([,a], [,b]) => b - a)
              .map(([category, amount]) => {
                const config = categoryConfig[category] || categoryConfig.other;
                const percentage = ((amount / totalSpent) * 100).toFixed(1);
                
                return (
                  <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center text-lg`}>
                        {config.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{config.name}</p>
                        <p className="text-sm text-gray-600">{percentage}% of total spending</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">${amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">
                        {expenses.filter(e => e.category === category).length} transactions
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SmartTips() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTips = async () => {
    try {
      const response = await axios.get(`${API}/tips`);
      setTips(response.data);
    } catch (error) {
      console.error('Error fetching tips:', error);
      toast.error('Failed to load tips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Smart Tips</h2>
        <p className="text-gray-600">Personalized money-saving advice based on your spending</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generating personalized tips...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tips.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <Lightbulb className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tips available yet</h3>
                <p className="text-gray-600 mb-4">Add some expenses first to get personalized money-saving tips!</p>
              </CardContent>
            </Card>
          ) : (
            tips.map((tip) => (
              <Card key={tip.id} className={`hover:shadow-md transition-shadow ${tip.is_personalized ? 'border-teal-200 bg-teal-50' : ''}`} data-testid={`tip-card-${tip.id}`}>
                <CardHeader>
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${tip.is_personalized ? 'bg-teal-100' : 'bg-yellow-100'}`}>
                      {tip.is_personalized ? (
                        <TrendingUp className="h-5 w-5 text-teal-600" />
                      ) : (
                        <Lightbulb className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{tip.title}</CardTitle>
                      <CardDescription className="mt-2 text-base leading-relaxed">
                        {tip.content}
                      </CardDescription>
                      <div className="mt-3 flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          tip.is_personalized 
                            ? 'bg-teal-100 text-teal-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {tip.is_personalized ? '🎯 Personalized' : '💡 General'}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">{tip.category}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('expenses');

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
      <BrowserRouter>
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-3 bg-teal-500 rounded-full">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">SpendWise</h1>
            </div>
            <p className="text-gray-600 text-lg">Your personal budget tracker for smarter spending</p>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="expenses" className="flex items-center space-x-2" data-testid="expenses-tab">
                <DollarSign className="h-4 w-4" />
                <span>Expenses</span>
              </TabsTrigger>
              <TabsTrigger value="goals" className="flex items-center space-x-2" data-testid="goals-tab">
                <Target className="h-4 w-4" />
                <span>Goals</span>
              </TabsTrigger>
              <TabsTrigger value="tips" className="flex items-center space-x-2" data-testid="tips-tab">
                <Lightbulb className="h-4 w-4" />
                <span>Tips</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="expenses">
              <ExpenseTracker />
            </TabsContent>

            <TabsContent value="goals">
              <SavingsGoals />
            </TabsContent>

            <TabsContent value="tips">
              <SmartTips />
            </TabsContent>
          </Tabs>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;