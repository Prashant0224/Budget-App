"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trash2, Settings, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import type { Budget, Expense } from "@/app/page"
import { ExpenseChart } from "@/components/expense-chart"
import { CategoryBreakdown } from "@/components/category-breakdown"

interface BudgetDashboardProps {
  budget: Budget
  expenses: Expense[]
  onDeleteExpense: (id: string) => void
  onResetBudget: () => void
}

export function BudgetDashboard({ budget, expenses, onDeleteExpense, onResetBudget }: BudgetDashboardProps) {
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const remaining = budget.amount - totalSpent
  const percentageSpent = (totalSpent / budget.amount) * 100

  // Calculate daily spending rate and prediction
  const currentDate = new Date()
  const daysInMonth = new Date(budget.year, new Date().getMonth() + 1, 0).getDate()
  const daysPassed = currentDate.getDate()
  const daysRemaining = daysInMonth - daysPassed

  const dailySpendingRate = totalSpent / daysPassed
  const projectedTotal = dailySpendingRate * daysInMonth
  const projectedOverspend = projectedTotal - budget.amount

  // Generate prediction message
  const getPredictionMessage = () => {
    if (projectedOverspend > 0) {
      const overspendDate = Math.ceil(budget.amount / dailySpendingRate)
      return {
        type: "warning" as const,
        message: `At this rate, you will overspend your budget by the ${overspendDate}${getOrdinalSuffix(overspendDate)} of the month.`,
        icon: AlertTriangle,
      }
    } else if (percentageSpent > 80) {
      return {
        type: "caution" as const,
        message: "You're spending at a high rate but still on track to stay within budget.",
        icon: TrendingUp,
      }
    } else {
      return {
        type: "success" as const,
        message: "You are on track to stay within your budget.",
        icon: TrendingDown,
      }
    }
  }

  const prediction = getPredictionMessage()

  function getOrdinalSuffix(day: number) {
    if (day > 3 && day < 21) return "th"
    switch (day % 10) {
      case 1:
        return "st"
      case 2:
        return "nd"
      case 3:
        return "rd"
      default:
        return "th"
    }
  }

  const getStatusColor = () => {
    if (percentageSpent >= 100) return "bg-destructive"
    if (percentageSpent >= 80) return "bg-warning"
    return "bg-success"
  }

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">
              {budget.month} {budget.year} Budget
            </CardTitle>
            <CardDescription>Track your monthly spending progress</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onResetBudget}>
            <Settings className="h-4 w-4 mr-2" />
            Change Budget
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">${budget.amount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Budget</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">${totalSpent.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Spent</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${remaining >= 0 ? "text-success" : "text-destructive"}`}>
                ${Math.abs(remaining).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">{remaining >= 0 ? "Remaining" : "Over Budget"}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{percentageSpent.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(percentageSpent, 100)} className="h-3" />
          </div>

          {/* Prediction Message */}
          <Card
            className={`border-l-4 ${
              prediction.type === "warning"
                ? "border-l-destructive bg-destructive/5"
                : prediction.type === "caution"
                  ? "border-l-warning bg-warning/5"
                  : "border-l-success bg-success/5"
            }`}
          >
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <prediction.icon
                  className={`h-5 w-5 mt-0.5 ${
                    prediction.type === "warning"
                      ? "text-destructive"
                      : prediction.type === "caution"
                        ? "text-warning"
                        : "text-success"
                  }`}
                />
                <p className="text-sm font-medium text-balance">{prediction.message}</p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <ExpenseChart expenses={expenses} />
        <CategoryBreakdown expenses={expenses} />
      </div>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>Your latest spending activity</CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No expenses recorded yet. Add your first expense to get started!
            </div>
          ) : (
            <div className="space-y-3">
              {expenses
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{expense.description}</span>
                        <Badge variant="secondary" className="text-xs">
                          {expense.category}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">${expense.amount.toFixed(2)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteExpense(expense.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
