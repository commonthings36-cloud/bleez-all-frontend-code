import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { IMG } from '../data/travelImages';
import { Navbar, Footer } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { 
  DollarSign, Plus, Trash2, Plane, Hotel, Utensils, 
  ShoppingBag, Car, Ticket, MoreHorizontal, TrendingUp,
  TrendingDown, PieChart, Download, Share2, Loader2,
  Calendar, Receipt, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { cn } from '../lib/utils';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const categoryIcons = {
  flight: Plane,
  hotel: Hotel,
  food: Utensils,
  transport: Car,
  shopping: ShoppingBag,
  activities: Ticket,
  other: MoreHorizontal
};

const categoryColors = {
  flight: 'bg-blue-500',
  hotel: 'bg-purple-500',
  food: 'bg-orange-500',
  transport: 'bg-green-500',
  shopping: 'bg-pink-500',
  activities: 'bg-yellow-500',
  other: 'bg-gray-500'
};

const ExpensesPage = () => {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const { user, token } = useAuth();
  const { formatAmount, getSymbol, currency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expenseReport, setExpenseReport] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(tripId || '');
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  const [newExpense, setNewExpense] = useState({
    category: 'food',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    vendor: ''
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchTrips();
  }, [token, navigate]);

  useEffect(() => {
    if (selectedTrip) {
      fetchExpenses(selectedTrip);
    }
  }, [selectedTrip]);

  const fetchTrips = async () => {
    try {
      const response = await axios.get(`${API}/itineraries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrips(response.data);
      if (response.data.length > 0 && !selectedTrip) {
        setSelectedTrip(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async (tripId) => {
    try {
      const response = await axios.get(`${API}/expenses/trip/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenseReport(response.data);
    } catch (error) {
      // No expenses yet
      setExpenseReport({
        trip_id: tripId,
        total_spent: 0,
        budget: 1000,
        remaining: 1000,
        by_category: {},
        expenses: []
      });
    }
  };

  const addExpense = async () => {
    if (!newExpense.description || !newExpense.amount) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!selectedTrip) {
      toast.error('Please select a trip first');
      return;
    }

    setSaving(true);
    try {
      await axios.post(`${API}/expenses`, {
        trip_id: selectedTrip,
        category: newExpense.category,
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        date: newExpense.date,
        vendor: newExpense.vendor
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Expense added!');
      setShowAddDialog(false);
      setNewExpense({
        category: 'food',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        vendor: ''
      });
      fetchExpenses(selectedTrip);
    } catch (error) {
      console.error('Expense error:', error.response?.data || error);
      toast.error(error.response?.data?.detail || 'Failed to add expense');
    } finally {
      setSaving(false);
    }
  };

  const deleteExpense = async (expenseId) => {
    if (!window.confirm('Delete this expense?')) return;
    
    try {
      await axios.delete(`${API}/expenses/${expenseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Expense deleted');
      fetchExpenses(selectedTrip);
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const exportReport = () => {
    if (!expenseReport) return;
    
    const report = `
EXPENSE REPORT
==============
Trip: ${trips.find(t => t.id === selectedTrip)?.destination || 'Unknown'}
Currency: ${currency}

SUMMARY
-------
Total Budget: ${formatAmount(expenseReport.budget)}
Total Spent: ${formatAmount(expenseReport.total_spent)}
Remaining: ${formatAmount(expenseReport.remaining)}

BY CATEGORY
-----------
${Object.entries(expenseReport.by_category).map(([cat, amount]) => 
  `${cat.charAt(0).toUpperCase() + cat.slice(1)}: ${formatAmount(amount)}`
).join('\n')}

EXPENSES
--------
${expenseReport.expenses.map(e => 
  `${e.date} | ${e.category} | ${e.description} | ${formatAmount(e.amount)}`
).join('\n')}
    `;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-report-${selectedTrip}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded!');
  };

  const budgetPercentage = expenseReport 
    ? Math.min((expenseReport.total_spent / expenseReport.budget) * 100, 100)
    : 0;

  const isOverBudget = expenseReport && expenseReport.total_spent > expenseReport.budget;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <PageHero image={IMG.trip(1600)} eyebrow="Expenses" title="Track trip spending" subtitle="Keep every cost organised, from flights to dinners." />
      
      <main className="flex-1 pt-10 pb-16">
        <div className="container-main">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif mb-2">
                Expense <span className="gold-text">Tracker</span>
              </h1>
              <p className="text-muted-foreground">Track your travel spending and stay on budget</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Trip Selector */}
              <Select value={selectedTrip} onValueChange={setSelectedTrip}>
                <SelectTrigger className="w-[200px] bg-white/5">
                  <SelectValue placeholder="Select trip" />
                </SelectTrigger>
                <SelectContent>
                  {trips.map(trip => (
                    <SelectItem key={trip.id} value={trip.id}>
                      {trip.destination}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Add Expense */}
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" /> Add Expense
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-white/10">
                  <DialogHeader>
                    <DialogTitle>Add New Expense</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={newExpense.category} onValueChange={(v) => setNewExpense(prev => ({ ...prev, category: v }))}>
                        <SelectTrigger className="bg-white/5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flight">✈️ Flight</SelectItem>
                          <SelectItem value="hotel">🏨 Hotel</SelectItem>
                          <SelectItem value="food">🍽️ Food & Dining</SelectItem>
                          <SelectItem value="transport">🚗 Transport</SelectItem>
                          <SelectItem value="shopping">🛍️ Shopping</SelectItem>
                          <SelectItem value="activities">🎟️ Activities</SelectItem>
                          <SelectItem value="other">📦 Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Description *</Label>
                      <Input
                        value={newExpense.description}
                        onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="What did you spend on?"
                        className="bg-white/5"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Amount ({getSymbol()}) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newExpense.amount}
                          onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                          placeholder="0.00"
                          className="bg-white/5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={newExpense.date}
                          onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                          className="bg-white/5"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Vendor (Optional)</Label>
                      <Input
                        value={newExpense.vendor}
                        onChange={(e) => setNewExpense(prev => ({ ...prev, vendor: e.target.value }))}
                        placeholder="Restaurant name, hotel, etc."
                        className="bg-white/5"
                      />
                    </div>

                    <Button onClick={addExpense} disabled={saving} className="w-full btn-primary">
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                      Add Expense
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Export */}
              <Button variant="outline" onClick={exportReport} disabled={!expenseReport}>
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
            </div>
          </div>

          {trips.length === 0 ? (
            <div className="text-center py-16 glass-card rounded-2xl">
              <Receipt className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No trips yet</h3>
              <p className="text-muted-foreground mb-4">Create a trip first to start tracking expenses</p>
              <Button onClick={() => navigate('/plan')} className="btn-primary">
                Plan a Trip
              </Button>
            </div>
          ) : expenseReport && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Budget Overview */}
              <div className="lg:col-span-1 space-y-6">
                {/* Budget Card */}
                <div className={cn(
                  "glass-card p-6 rounded-2xl",
                  isOverBudget && "border-red-500/50"
                )}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    Budget Overview
                  </h3>
                  
                  {/* Progress Bar */}
                  <div className="relative h-4 bg-white/10 rounded-full overflow-hidden mb-4">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        isOverBudget ? "bg-red-500" : budgetPercentage > 75 ? "bg-yellow-500" : "bg-green-500"
                      )}
                      style={{ width: `${budgetPercentage}%` }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-400">{formatAmount(expenseReport.budget, 'USD', { compact: true })}</p>
                      <p className="text-xs text-muted-foreground">Budget</p>
                    </div>
                    <div>
                      <p className={cn("text-2xl font-bold", isOverBudget ? "text-red-400" : "text-white")}>
                        {formatAmount(expenseReport.total_spent, 'USD', { compact: true })}
                      </p>
                      <p className="text-xs text-muted-foreground">Spent</p>
                    </div>
                    <div>
                      <p className={cn("text-2xl font-bold", expenseReport.remaining < 0 ? "text-red-400" : "text-primary")}>
                        {formatAmount(Math.abs(expenseReport.remaining), 'USD', { compact: true })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {expenseReport.remaining < 0 ? 'Over' : 'Left'}
                      </p>
                    </div>
                  </div>

                  {isOverBudget && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">You're over budget!</span>
                    </div>
                  )}
                </div>

                {/* By Category */}
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold mb-4">By Category</h3>
                  <div className="space-y-3">
                    {Object.entries(expenseReport.by_category).length === 0 ? (
                      <p className="text-muted-foreground text-sm">No expenses yet</p>
                    ) : (
                      Object.entries(expenseReport.by_category).map(([category, amount]) => {
                        const Icon = categoryIcons[category] || MoreHorizontal;
                        const percentage = (amount / expenseReport.total_spent) * 100;
                        return (
                          <div key={category} className="flex items-center gap-3">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", categoryColors[category])}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="capitalize">{category}</span>
                                <span>{formatAmount(amount)}</span>
                              </div>
                              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className={cn("h-full rounded-full", categoryColors[category])}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Expenses List */}
              <div className="lg:col-span-2">
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
                    <span>Recent Expenses</span>
                    <span className="text-sm text-muted-foreground">
                      {expenseReport.expenses.length} items
                    </span>
                  </h3>
                  
                  {expenseReport.expenses.length === 0 ? (
                    <div className="text-center py-12">
                      <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No expenses recorded yet</p>
                      <p className="text-sm text-muted-foreground">Click "Add Expense" to start tracking</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {expenseReport.expenses.map((expense) => {
                        const Icon = categoryIcons[expense.category] || MoreHorizontal;
                        return (
                          <div 
                            key={expense.id}
                            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                          >
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", categoryColors[expense.category])}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{expense.description}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                {expense.date}
                                {expense.vendor && <span>• {expense.vendor}</span>}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{formatAmount(expense.amount)}</p>
                              <p className="text-xs text-muted-foreground capitalize">{expense.category}</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteExpense(expense.id)}
                              className="text-muted-foreground hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ExpensesPage;
