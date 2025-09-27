"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import type { Expense } from "@/app/page"

interface CategoryBreakdownProps {
  expenses: Expense[]
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(var(--success))",
]

export function CategoryBreakdown({ expenses }: CategoryBreakdownProps) {
  // Group expenses by category
  const categoryData = expenses.reduce(
    (acc, expense) => {
      const existing = acc.find((item) => item.category === expense.category)
      if (existing) {
        existing.amount += expense.amount
      } else {
        acc.push({
          category: expense.category,
          amount: expense.amount,
        })
      }
      return acc
    },
    [] as { category: string; amount: number }[],
  )

  // Sort by amount descending
  categoryData.sort((a, b) => b.amount - a.amount)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const total = categoryData.reduce((sum, item) => sum + item.amount, 0)
      const percentage = ((data.amount / total) * 100).toFixed(1)

      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.category}</p>
          <p className="text-sm text-primary font-medium">
            ${data.amount.toFixed(2)} ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
        <CardDescription>How you're spending by category</CardDescription>
      </CardHeader>
      <CardContent>
        {categoryData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No expense data to display
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="amount"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
