'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Plus, Edit2, Trash2, ChevronRight, TrendingUp, TrendingDown, Search, Calendar } from 'lucide-react'

type Expense = {
  id: string
  amount: number
  category: string
  date: string
  notes: string
}

type ChatMessage = {
  id: string
  role: 'user' | 'agent'
  content: string
  timestamp: string
}

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other']
const CATEGORY_COLORS: Record<string, string> = {
  Food: '#ff6b6b',
  Transport: '#4ecdc4',
  Shopping: '#ff9f43',
  Bills: '#34495e',
  Entertainment: '#a29bfe',
  Health: '#00b894',
  Other: '#95a5a6'
}

// Sample data generator
function generateSampleData(): Expense[] {
  const categories = CATEGORIES
  const expenses: Expense[] = []
  const today = new Date()

  const sampleExpenses = [
    { amount: 45, category: 'Food', notes: 'Dinner with friends' },
    { amount: 12.5, category: 'Food', notes: 'Coffee and breakfast' },
    { amount: 85, category: 'Transport', notes: 'Gas' },
    { amount: 120, category: 'Shopping', notes: 'Winter jacket' },
    { amount: 65, category: 'Bills', notes: 'Internet subscription' },
    { amount: 45, category: 'Entertainment', notes: 'Movie tickets' },
    { amount: 35, category: 'Health', notes: 'Gym membership' },
    { amount: 28, category: 'Food', notes: 'Groceries' },
    { amount: 15, category: 'Transport', notes: 'Ride share' },
    { amount: 55, category: 'Shopping', notes: 'Electronics' },
    { amount: 30, category: 'Bills', notes: 'Phone bill' },
    { amount: 25, category: 'Entertainment', notes: 'Streaming subscription' },
    { amount: 40, category: 'Health', notes: 'Doctor visit' },
    { amount: 50, category: 'Food', notes: 'Restaurant lunch' },
    { amount: 22, category: 'Transport', notes: 'Public transit pass' },
    { amount: 95, category: 'Shopping', notes: 'Shoes' },
    { amount: 18, category: 'Food', notes: 'Delivery dinner' },
    { amount: 60, category: 'Bills', notes: 'Electricity' },
    { amount: 35, category: 'Entertainment', notes: 'Concert tickets' },
    { amount: 48, category: 'Health', notes: 'Pharmacy' }
  ]

  sampleExpenses.forEach((expense, index) => {
    const daysAgo = Math.floor(Math.random() * 30)
    const date = new Date(today)
    date.setDate(date.getDate() - daysAgo)

    expenses.push({
      id: Math.random().toString(36).substr(2, 9),
      amount: expense.amount,
      category: expense.category,
      date: date.toISOString().split('T')[0],
      notes: expense.notes
    })
  })

  return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export default function SpendWiseApp() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ amount: '', category: '', date: '', notes: '' })
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'week' | 'month'>('month')
  const [searchQuery, setSearchQuery] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Initialize with sample data
  useEffect(() => {
    setExpenses(generateSampleData())
    const now = new Date()
    setFormData(prev => ({ ...prev, date: now.toISOString().split('T')[0] }))
  }, [])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Helper functions
  const getDateRange = () => {
    const today = new Date()
    let startDate = new Date(today)
    startDate.setHours(0, 0, 0, 0)

    if (filterDateRange === 'week') {
      startDate.setDate(today.getDate() - today.getDay())
    } else if (filterDateRange === 'month') {
      startDate.setDate(1)
    }

    return { startDate, endDate: today }
  }

  const filteredExpenses = expenses.filter(exp => {
    const { startDate, endDate } = getDateRange()
    const expDate = new Date(exp.date)
    const matchesCategory = filterCategory === 'all' || exp.category === filterCategory
    const matchesDate = expDate >= startDate && expDate <= endDate
    const matchesSearch = exp.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exp.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesDate && matchesSearch
  })

  const categoryTotals = filteredExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount
    return acc
  }, {} as Record<string, number>)

  const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0)
  const monthlySpent = expenses
    .filter(exp => {
      const expDate = new Date(exp.date)
      const now = new Date()
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, exp) => sum + exp.amount, 0)

  const lastMonthSpent = expenses
    .filter(exp => {
      const expDate = new Date(exp.date)
      const now = new Date()
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      return expDate >= lastMonth && expDate <= lastMonthEnd
    })
    .reduce((sum, exp) => sum + exp.amount, 0)

  const dailyAverage = filteredExpenses.length > 0 ? totalSpent / filteredExpenses.length : 0

  const chartData = Object.entries(categoryTotals).map(([category, amount]) => ({
    name: category,
    value: amount,
    percentage: ((amount / totalSpent) * 100).toFixed(1)
  }))

  const recentExpenses = filteredExpenses.slice(0, 5)

  // Generate 30-day spending trend
  const getLast30DaysTrend = () => {
    const trendData: { date: string; amount: number }[] = []
    const today = new Date()

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const dayTotal = expenses
        .filter(exp => exp.date === dateStr)
        .reduce((sum, exp) => sum + exp.amount, 0)

      trendData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: parseFloat(dayTotal.toFixed(2))
      })
    }

    return trendData
  }

  const trendData = getLast30DaysTrend()

  // Form handlers
  const handleAddExpense = () => {
    if (!formData.amount || !formData.category) return

    const newExpense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      notes: formData.notes
    }

    if (editingId) {
      setExpenses(expenses.map(exp => exp.id === editingId ? { ...newExpense, id: editingId } : exp))
      setEditingId(null)
    } else {
      setExpenses([newExpense, ...expenses])
    }

    setFormData({ amount: '', category: '', date: new Date().toISOString().split('T')[0], notes: '' })
    setShowAddModal(false)
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingId(expense.id)
    setFormData({
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date,
      notes: expense.notes
    })
    setShowAddModal(true)
  }

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(exp => exp.id !== id))
  }

  // Chat handler
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return

    const currentInput = chatInput

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: currentInput,
      timestamp: new Date().toISOString()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setChatLoading(true)

    try {
      const expenseData = filteredExpenses.map(exp => ({
        amount: exp.amount,
        category: exp.category,
        date: exp.date,
        notes: exp.notes
      }))

      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `User query: "${currentInput}"\n\nExpense data: ${JSON.stringify(expenseData)}`,
          agent_id: '693069930683f6b758456d1b'
        })
      })

      const data = await response.json()

      if (data.success && data.response) {
        const agentMessage: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          role: 'agent',
          content: typeof data.response === 'string'
            ? data.response
            : data.response?.summary ?? data.response?.detailed_analysis ?? JSON.stringify(data.response),
          timestamp: new Date().toISOString()
        }
        setChatMessages(prev => [...prev, agentMessage])
      }
    } catch (error) {
      console.error('Error fetching insights:', error)
      const errorMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'agent',
        content: 'Sorry, I encountered an error analyzing your expenses. Please try again.',
        timestamp: new Date().toISOString()
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setChatLoading(false)
    }
  }

  const suggestedQuestions = [
    "Show me this week's spending summary",
    'What did I spend the most on this month?',
    'How can I reduce my expenses?',
    'Give me budget recommendations',
    'Compare this month vs last month'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">SpendWise</h1>
            <p className="text-sm text-slate-600">Personal Expense Tracker</p>
          </div>
          <Button
            onClick={() => {
              setShowAddModal(true)
              setEditingId(null)
              setFormData({ amount: '', category: '', date: new Date().toISOString().split('T')[0], notes: '' })
            }}
            className="bg-teal-500 hover:bg-teal-600 text-white gap-2"
          >
            <Plus size={20} />
            Add Expense
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* DASHBOARD TAB */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-0">
                <CardContent className="p-6">
                  <p className="text-slate-400 text-sm mb-1">This Month</p>
                  <p className="text-4xl font-bold text-white mb-2">${monthlySpent.toFixed(2)}</p>
                  <div className="flex items-center gap-2">
                    {monthlySpent > lastMonthSpent ? (
                      <>
                        <TrendingUp size={16} className="text-red-400" />
                        <span className="text-sm text-red-400">
                          {(((monthlySpent - lastMonthSpent) / lastMonthSpent) * 100).toFixed(1)}% vs last month
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown size={16} className="text-green-400" />
                        <span className="text-sm text-green-400">
                          {(((lastMonthSpent - monthlySpent) / lastMonthSpent) * 100).toFixed(1)}% vs last month
                        </span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <p className="text-slate-600 text-sm mb-1">Daily Average</p>
                  <p className="text-4xl font-bold text-slate-900 mb-2">${dailyAverage.toFixed(2)}</p>
                  <p className="text-xs text-slate-500">Based on {filteredExpenses.length} transactions</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <p className="text-slate-600 text-sm mb-1">Top Category</p>
                  <p className="text-3xl font-bold text-slate-900 mb-2">
                    {chartData.length > 0 ? chartData[0].name : 'N/A'}
                  </p>
                  <p className="text-xs text-slate-500">
                    ${chartData.length > 0 ? chartData[0].value.toFixed(2) : '0.00'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Category Breakdown Chart */}
            {chartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                      <Bar dataKey="value" fill="#00d4aa" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* 30-Day Spending Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Spending Trend (Last 30 Days)</CardTitle>
                <CardDescription>Daily spending overview</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} interval={4} />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => `$${value.toFixed(2)}`}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#00d4aa"
                      strokeWidth={3}
                      dot={{ fill: '#00d4aa', r: 4 }}
                      activeDot={{ r: 6 }}
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('expenses')}
                  className="text-teal-600 hover:text-teal-700"
                >
                  View All <ChevronRight size={16} />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentExpenses.map(expense => (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                          style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
                        >
                          {expense.category.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{expense.notes}</p>
                          <p className="text-xs text-slate-600">{expense.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">${expense.amount.toFixed(2)}</p>
                        <p className="text-xs text-slate-600">
                          {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* EXPENSES TAB */}
          <TabsContent value="expenses" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
                    <Select value={filterDateRange} onValueChange={(value: any) => setFilterDateRange(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="all">All Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
                    <div className="relative">
                      <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                      <Input
                        placeholder="Search expenses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transactions List */}
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>
                  Total: ${totalSpent.toFixed(2)} ({filteredExpenses.length} transactions)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredExpenses.length > 0 ? (
                    filteredExpenses.map(expense => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold"
                            style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
                          >
                            {expense.category.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{expense.notes}</p>
                            <p className="text-sm text-slate-600">{expense.category}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(expense.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>

                        <div className="text-right mr-4">
                          <p className="text-lg font-semibold text-red-600">${expense.amount.toFixed(2)}</p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditExpense(expense)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-600">No expenses found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* INSIGHTS TAB */}
          <TabsContent value="insights" className="space-y-6">
            <Card className="flex flex-col h-[600px]">
              <CardHeader>
                <CardTitle>Spending Insights Chat</CardTitle>
                <CardDescription>Ask questions about your spending habits and get AI-powered analysis</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto space-y-4 mb-4">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <p className="text-slate-600 mb-6">Start by asking about your spending habits</p>
                    <div className="grid grid-cols-1 gap-2 w-full">
                      {suggestedQuestions.map((question, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          className="text-left justify-start h-auto py-2 px-3 text-sm"
                          onClick={() => {
                            setChatInput(question)
                          }}
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {chatMessages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs md:max-w-md lg:max-w-lg p-4 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-slate-900 text-white rounded-br-none'
                              : 'bg-slate-100 text-slate-900 rounded-bl-none border border-slate-300'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-100 text-slate-900 p-4 rounded-lg rounded-bl-none">
                          <div className="flex gap-2">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </>
                )}
              </CardContent>

              {/* Chat Input */}
              <div className="border-t border-slate-200 p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about your spending..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !chatLoading && handleSendMessage()}
                    disabled={chatLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={chatLoading || !chatInput.trim()}
                    className="bg-teal-500 hover:bg-teal-600 text-white"
                  >
                    {chatLoading ? 'Analyzing...' : 'Ask'}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Expense Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update your expense details' : 'Enter the details for your new expense'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <Textarea
                placeholder="Add a description..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false)
                  setEditingId(null)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddExpense}
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
              >
                {editingId ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
