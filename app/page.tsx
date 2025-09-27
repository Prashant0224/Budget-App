"use client"

import { useState, useEffect } from "react"
import { BudgetDashboard } from "@/components/budget-dashboard"
import { ExpenseForm } from "@/components/expense-form"
import { BudgetSetup } from "@/components/budget-setup"

export interface Expense {
  id: string
  amount: number
  category: string
  description: string
  date: string
}

export interface Budget {
  amount: number
  month: string
  year: number
}

export default function Home() {
  const [budget, setBudget] = useState<Budget | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])

  // Load data from localStorage on mount
  useEffect(() => {
    const savedBudget = localStorage.getItem("budget")
    const savedExpenses = localStorage.getItem("expenses")

    if (savedBudget) {
      setBudget(JSON.parse(savedBudget))
    }

    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses))
    }
  }, [])

  // Save budget to localStorage
  const handleSetBudget = (newBudget: Budget) => {
    setBudget(newBudget)
    localStorage.setItem("budget", JSON.stringify(newBudget))
  }

  // Add expense and save to localStorage
  const handleAddExpense = (expense: Omit<Expense, "id">) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
    }
    const updatedExpenses = [...expenses, newExpense]
    setExpenses(updatedExpenses)
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses))
  }

  // Delete expense and update localStorage
  const handleDeleteExpense = (id: string) => {
    const updatedExpenses = expenses.filter((expense) => expense.id !== id)
    setExpenses(updatedExpenses)
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses))
  }

  if (!budget) {
    return <BudgetSetup onSetBudget={handleSetBudget} />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">Smart Budget Tracker</h1>
          <p className="text-muted-foreground text-lg">
            Track your expenses and stay on budget with intelligent predictions
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <BudgetDashboard
              budget={budget}
              expenses={expenses}
              onDeleteExpense={handleDeleteExpense}
              onResetBudget={() => {
                setBudget(null)
                localStorage.removeItem("budget")
              }}
            />
          </div>
          <div>
            <ExpenseForm onAddExpense={handleAddExpense} />
          </div>
        </div>
      </div>
    </div>
  )
}
