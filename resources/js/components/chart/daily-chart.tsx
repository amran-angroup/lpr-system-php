"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "An interactive bar chart"

const chartData = [
  { date: "2024-04-01", in: 222, out: 150 },
  { date: "2024-04-02", in: 97, out: 180 },
  { date: "2024-04-03", in: 167, out: 120 },
  { date: "2024-04-04", in: 242, out: 260 },
  { date: "2024-04-05", in: 373, out: 290 },
  { date: "2024-04-06", in: 301, out: 340 },
  { date: "2024-04-07", in: 245, out: 180 },
  { date: "2024-04-08", in: 409, out: 320 },
  { date: "2024-04-09", in: 59, out: 110 },
  { date: "2024-04-10", in: 261, out: 190 },
  { date: "2024-04-11", in: 327, out: 350 },
  { date: "2024-04-12", in: 292, out: 210 },
  { date: "2024-04-13", in: 342, out: 380 },
  { date: "2024-04-14", in: 137, out: 220 },
  { date: "2024-04-15", in: 120, out: 170 },
  { date: "2024-04-16", in: 138, out: 190 },
  { date: "2024-04-17", in: 446, out: 360 },
  { date: "2024-04-18", in: 364, out: 410 },
  { date: "2024-04-19", in: 243, out: 180 },
  { date: "2024-04-20", in: 89, out: 150 },
  { date: "2024-04-21", in: 137, out: 200 },
  { date: "2024-04-22", in: 224, out: 170 },
  { date: "2024-04-23", in: 138, out: 230 },
  { date: "2024-04-24", in: 387, out: 290 },
  { date: "2024-04-25", in: 215, out: 250 },
  { date: "2024-04-26", in: 75, out: 130 },
  { date: "2024-04-27", in: 383, out: 420 },
  { date: "2024-04-28", in: 122, out: 180 },
  { date: "2024-04-29", in: 315, out: 240 },
  { date: "2024-04-30", in: 454, out: 380 },
  { date: "2024-05-01", in: 165, out: 220 },
  { date: "2024-05-02", in: 293, out: 310 },
  { date: "2024-05-03", in: 247, out: 190 },
  { date: "2024-05-04", in: 385, out: 420 },
  { date: "2024-05-05", in: 481, out: 390 },
  { date: "2024-05-06", in: 498, out: 520 },
  { date: "2024-05-07", in: 388, out: 300 },
  { date: "2024-05-08", in: 149, out: 210 },
  { date: "2024-05-09", in: 227, out: 180 },
  { date: "2024-05-10", in: 293, out: 330 },
  { date: "2024-05-11", in: 335, out: 270 },
  { date: "2024-05-12", in: 197, out: 240 },
  { date: "2024-05-13", in: 197, out: 160 },
  { date: "2024-05-14", in: 448, out: 490 },
  { date: "2024-05-15", in: 473, out: 380 },
  { date: "2024-05-16", in: 338, out: 400 },
  { date: "2024-05-17", in: 499, out: 420 },
  { date: "2024-05-18", in: 315, out: 350 },
  { date: "2024-05-19", in: 235, out: 180 },
  { date: "2024-05-20", in: 177, out: 230 },
  { date: "2024-05-21", in: 82, out: 140 },
  { date: "2024-05-22", in: 81, out: 120 },
  { date: "2024-05-23", in: 252, out: 290 },
  { date: "2024-05-24", in: 294, out: 220 },
  { date: "2024-05-25", in: 201, out: 250 },
  { date: "2024-05-26", in: 213, out: 170 },
  { date: "2024-05-27", in: 420, out: 460 },
  { date: "2024-05-28", in: 233, out: 190 },
  { date: "2024-05-29", in: 78, out: 130 },
  { date: "2024-05-30", in: 340, out: 280 },
  { date: "2024-05-31", in: 178, out: 230 },
  { date: "2024-06-01", in: 178, out: 200 },
  { date: "2024-06-02", in: 470, out: 410 },
  { date: "2024-06-03", in: 103, out: 160 },
  { date: "2024-06-04", in: 439, out: 380 },
  { date: "2024-06-05", in: 88, out: 140 },
  { date: "2024-06-06", in: 294, out: 250 },
  { date: "2024-06-07", in: 323, out: 370 },
  { date: "2024-06-08", in: 385, out: 320 },
  { date: "2024-06-09", in: 438, out: 480 },
  { date: "2024-06-10", in: 155, out: 200 },
  { date: "2024-06-11", in: 92, out: 150 },
  { date: "2024-06-12", in: 492, out: 420 },
  { date: "2024-06-13", in: 81, out: 130 },
  { date: "2024-06-14", in: 426, out: 380 },
  { date: "2024-06-15", in: 307, out: 350 },
  { date: "2024-06-16", in: 371, out: 310 },
  { date: "2024-06-17", in: 475, out: 520 },
  { date: "2024-06-18", in: 107, out: 170 },
  { date: "2024-06-19", in: 341, out: 290 },
  { date: "2024-06-20", in: 408, out: 450 },
  { date: "2024-06-21", in: 169, out: 210 },
  { date: "2024-06-22", in: 317, out: 270 },
  { date: "2024-06-23", in: 480, out: 530 },
  { date: "2024-06-24", in: 132, out: 180 },
  { date: "2024-06-25", in: 141, out: 190 },
  { date: "2024-06-26", in: 434, out: 380 },
  { date: "2024-06-27", in: 448, out: 490 },
  { date: "2024-06-28", in: 149, out: 200 },
  { date: "2024-06-29", in: 103, out: 160 },
  { date: "2024-06-30", in: 446, out: 400 },
]

const chartConfig = {
  views: {
    label: "Page Views",
  },
  in: {
    label: "Desktop",
    color: "var(--chart-2)",
  },
  out: {
    label: "Mobile",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function DailyChart() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("in")

  const total = React.useMemo(
    () => ({
      in: chartData.reduce((acc, curr) => acc + curr.in, 0),
      out: chartData.reduce((acc, curr) => acc + curr.out, 0),
    }),
    []
  )

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle>Daily Vehicle Log</CardTitle>
          <CardDescription>
            Showing total vehicle log for the last 3 months
          </CardDescription>
        </div>
        <div className="flex">
          {["in", "out"].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[350px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
