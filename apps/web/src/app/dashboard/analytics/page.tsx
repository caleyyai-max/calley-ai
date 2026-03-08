"use client";

import { useState } from "react";
import {
  DollarSign,
  ShoppingBag,
  Phone,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";

// ---------- Types ----------

type TimeRange = "7d" | "30d" | "90d";

interface DailyRevenue {
  label: string;
  value: number;
}

interface OrdersByStatus {
  status: string;
  count: number;
  color: string;
}

interface TopItem {
  name: string;
  count: number;
  revenue: number;
}

// ---------- Mock Data ----------

const revenueData: Record<TimeRange, DailyRevenue[]> = {
  "7d": [
    { label: "Mon", value: 1240 },
    { label: "Tue", value: 980 },
    { label: "Wed", value: 1450 },
    { label: "Thu", value: 1120 },
    { label: "Fri", value: 1890 },
    { label: "Sat", value: 2340 },
    { label: "Sun", value: 1780 },
  ],
  "30d": [
    { label: "Wk 1", value: 7200 },
    { label: "Wk 2", value: 8400 },
    { label: "Wk 3", value: 7800 },
    { label: "Wk 4", value: 9100 },
  ],
  "90d": [
    { label: "Jan", value: 28500 },
    { label: "Feb", value: 31200 },
    { label: "Mar", value: 34800 },
  ],
};

const totalRevenue: Record<TimeRange, number> = {
  "7d": 10800,
  "30d": 32500,
  "90d": 94500,
};

const totalOrders: Record<TimeRange, number> = {
  "7d": 342,
  "30d": 1247,
  "90d": 3891,
};

const ordersByStatus: OrdersByStatus[] = [
  { status: "Completed", count: 287, color: "bg-emerald-500" },
  { status: "Confirmed", count: 23, color: "bg-yellow-500" },
  { status: "Preparing", count: 12, color: "bg-orange-500" },
  { status: "New", count: 8, color: "bg-blue-500" },
  { status: "Ready", count: 5, color: "bg-cyan-500" },
  { status: "Cancelled", count: 7, color: "bg-red-500" },
];

const callsOverview = {
  total: 342,
  completed: 312,
  failed: 18,
  transferred: 12,
  avgDuration: "2m 18s",
};

const topItems: TopItem[] = [
  { name: "Margherita Pizza", count: 89, revenue: 1334.11 },
  { name: "Chicken Parmesan", count: 72, revenue: 1367.28 },
  { name: "Fettuccine Alfredo", count: 58, revenue: 985.42 },
  { name: "Spaghetti Bolognese", count: 51, revenue: 815.49 },
  { name: "Caesar Salad", count: 47, revenue: 422.53 },
];

// Peak hours: rows = hours (11 AM - 9 PM), cols = days (Mon-Sun)
const peakHoursData: number[][] = [
  [2, 3, 2, 4, 5, 8, 7],   // 11 AM
  [5, 6, 5, 7, 8, 10, 9],  // 12 PM
  [4, 5, 4, 5, 6, 7, 6],   // 1 PM
  [2, 2, 3, 2, 3, 4, 3],   // 2 PM
  [1, 1, 2, 1, 2, 2, 2],   // 3 PM
  [2, 3, 2, 3, 4, 5, 4],   // 4 PM
  [6, 7, 6, 8, 9, 10, 9],  // 5 PM
  [8, 9, 8, 10, 10, 10, 10],// 6 PM
  [7, 8, 7, 9, 10, 10, 9], // 7 PM
  [4, 5, 4, 5, 7, 8, 6],   // 8 PM
  [2, 2, 2, 3, 4, 5, 3],   // 9 PM
];

const peakHoursLabels = [
  "11 AM", "12 PM", "1 PM", "2 PM", "3 PM",
  "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM",
];

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getHeatColor(val: number): string {
  if (val <= 2) return "bg-orange-500/10";
  if (val <= 4) return "bg-orange-500/20";
  if (val <= 6) return "bg-orange-500/35";
  if (val <= 8) return "bg-orange-500/55";
  return "bg-orange-500/80";
}

// ---------- Component ----------

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");

  const currentRevenue = revenueData[timeRange];
  const maxRevenue = Math.max(...currentRevenue.map((d) => d.value));

  const maxOrderStatus = Math.max(...ordersByStatus.map((o) => o.count));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Analytics</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Track performance, revenue, and call metrics.
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900 p-1">
          {(["7d", "30d", "90d"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                timeRange === range
                  ? "bg-orange-500 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-zinc-100">
                {formatPrice(totalRevenue[timeRange])}
              </p>
              <p className="text-xs text-zinc-500">Total Revenue</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <ShoppingBag className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-zinc-100">
                {totalOrders[timeRange].toLocaleString()}
              </p>
              <p className="text-xs text-zinc-500">Total Orders</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10">
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-zinc-100">
                {formatPrice(totalRevenue[timeRange] / totalOrders[timeRange])}
              </p>
              <p className="text-xs text-zinc-500">Avg Order Value</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10">
              <Phone className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-zinc-100">
                {callsOverview.total}
              </p>
              <p className="text-xs text-zinc-500">Total Calls</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart (div-based bar chart) */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-zinc-100">Revenue</h2>
            <span className="text-sm text-zinc-500">
              {timeRange === "7d"
                ? "Last 7 days"
                : timeRange === "30d"
                  ? "Last 30 days"
                  : "Last 90 days"}
            </span>
          </div>
          <div className="flex items-end gap-2 h-48">
            {currentRevenue.map((day) => {
              const heightPct = (day.value / maxRevenue) * 100;
              return (
                <div
                  key={day.label}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <span className="text-xs text-zinc-400 font-mono">
                    {formatPrice(day.value)}
                  </span>
                  <div className="w-full relative" style={{ height: "160px" }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 rounded-t-md bg-gradient-to-t from-orange-600 to-orange-400 transition-all duration-500 ease-out hover:from-orange-500 hover:to-orange-300"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500">{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Orders by status (horizontal bar chart) */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-base font-semibold text-zinc-100 mb-6">
            Orders by Status
          </h2>
          <div className="space-y-4">
            {ordersByStatus.map((item) => {
              const widthPct = (item.count / maxOrderStatus) * 100;
              return (
                <div key={item.status}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-zinc-300">{item.status}</span>
                    <span className="text-sm font-mono text-zinc-400">
                      {item.count}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700 ease-out",
                        item.color
                      )}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calls overview */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-base font-semibold text-zinc-100 mb-5">
            Calls Overview
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                  <Phone className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <span className="text-sm text-zinc-300">Total Calls</span>
              </div>
              <span className="text-sm font-bold text-zinc-100">
                {callsOverview.total}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <span className="text-sm text-zinc-300">Completed</span>
              </div>
              <span className="text-sm font-bold text-zinc-100">
                {callsOverview.completed}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                  <XCircle className="h-3.5 w-3.5 text-red-500" />
                </div>
                <span className="text-sm text-zinc-300">Failed</span>
              </div>
              <span className="text-sm font-bold text-zinc-100">
                {callsOverview.failed}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                  <Clock className="h-3.5 w-3.5 text-purple-500" />
                </div>
                <span className="text-sm text-zinc-300">Avg Duration</span>
              </div>
              <span className="text-sm font-bold text-zinc-100">
                {callsOverview.avgDuration}
              </span>
            </div>
          </div>
        </div>

        {/* Top selling items */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-base font-semibold text-zinc-100 mb-5">
            Top Selling Items
          </h2>
          <div className="space-y-3">
            {topItems.map((item, idx) => (
              <div
                key={item.name}
                className="flex items-center gap-3 rounded-lg bg-zinc-800/40 px-3 py-2.5"
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold",
                    idx === 0
                      ? "bg-orange-500/20 text-orange-400"
                      : idx === 1
                        ? "bg-zinc-600/30 text-zinc-300"
                        : idx === 2
                          ? "bg-amber-500/15 text-amber-500"
                          : "bg-zinc-800 text-zinc-500"
                  )}
                >
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {item.count} orders
                  </p>
                </div>
                <span className="text-sm font-mono font-medium text-zinc-300">
                  {formatPrice(item.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Peak hours heatmap */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-base font-semibold text-zinc-100 mb-5">
            Peak Hours
          </h2>
          <div className="overflow-x-auto">
            <div className="min-w-[280px]">
              {/* Day headers */}
              <div className="grid grid-cols-[50px_repeat(7,1fr)] gap-1 mb-1">
                <div /> {/* empty corner */}
                {dayLabels.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs text-zinc-500 font-medium"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Hour rows */}
              {peakHoursData.map((row, rowIdx) => (
                <div
                  key={rowIdx}
                  className="grid grid-cols-[50px_repeat(7,1fr)] gap-1 mb-1"
                >
                  <div className="text-xs text-zinc-500 flex items-center">
                    {peakHoursLabels[rowIdx]}
                  </div>
                  {row.map((val, colIdx) => (
                    <div
                      key={colIdx}
                      className={cn(
                        "aspect-square rounded-sm flex items-center justify-center transition-colors",
                        getHeatColor(val)
                      )}
                      title={`${dayLabels[colIdx]} ${peakHoursLabels[rowIdx]}: ${val} orders`}
                    >
                      <span className="text-[10px] font-mono text-zinc-400">
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              ))}

              {/* Legend */}
              <div className="flex items-center justify-end gap-1 mt-3">
                <span className="text-xs text-zinc-600 mr-1">Low</span>
                {["bg-orange-500/10", "bg-orange-500/20", "bg-orange-500/35", "bg-orange-500/55", "bg-orange-500/80"].map(
                  (color, i) => (
                    <div
                      key={i}
                      className={cn("h-3 w-3 rounded-sm", color)}
                    />
                  )
                )}
                <span className="text-xs text-zinc-600 ml-1">High</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
