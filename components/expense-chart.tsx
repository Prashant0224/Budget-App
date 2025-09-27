"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { Expense } from "@/app/page"

interface ExpenseChartProps {
  expenses: Expense[]
}

export function ExpenseChart({ expenses }: ExpenseChartProps) {
  // Group expenses by date and calculate cumulative spending
  const chartData = expenses
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce(
      (acc, expense) => {
        const date = expense.date
        const existingEntry = acc.find((entry) => entry.date === date)

        if (existingEntry) {
          existingEntry.amount += expense.amount
        } else {
          acc.push({
            date,
            amount: expense.amount,
            cumulative: 0,
          })
        }

        return acc
      },
      [] as { date: string; amount: number; cumulative: number }[],
    )

  // Calculate cumulative amounts
  let cumulative = 0
  chartData.forEach((entry) => {
    cumulative += entry.amount
    entry.cumulative = cumulative
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{formatDate(label)}</p>
          <p className="text-sm text-muted-foreground">Daily: ${payload[0]?.payload?.amount?.toFixed(2) || "0.00"}</p>
          <p className="text-sm text-primary font-medium">Total: ${payload[0]?.value?.toFixed(2) || "0.00"}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Trend</CardTitle>
        <CardDescription>Your cumulative spending over time</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No expense data to display
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tickFormatter={formatDate} className="text-xs fill-muted-foreground" />
                <YAxis tickFormatter={(value) => `$${value}`} className="text-xs fill-muted-foreground" />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
