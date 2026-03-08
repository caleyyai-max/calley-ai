"use client";

import { useState } from "react";
import {
  ShoppingBag,
  DollarSign,
  Phone,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  PhoneCall,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, formatPhone } from "@/lib/utils";

// ---------- Mock Data ----------

interface StatCard {
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

const stats: StatCard[] = [
  {
    label: "Today's Orders",
    value: "47",
    change: 12.5,
    icon: ShoppingBag,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    label: "Revenue",
    value: "$1,284.50",
    change: 8.2,
    icon: DollarSign,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    label: "Active Calls",
    value: "3",
    change: -2.1,
    icon: Phone,
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-500",
  },
  {
    label: "Avg Call Duration",
    value: "2m 34s",
    change: 5.3,
    icon: Clock,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
];

type OrderStatus = "NEW" | "CONFIRMED" | "PREPARING" | "READY" | "COMPLETED";

interface RecentOrder {
  id: string;
  customer: string;
  phone: string;
  items: string[];
  total: number;
  status: OrderStatus;
  time: string;
}

const statusStyles: Record<OrderStatus, { bg: string; text: string }> = {
  NEW: { bg: "bg-blue-500/10", text: "text-blue-400" },
  CONFIRMED: { bg: "bg-yellow-500/10", text: "text-yellow-400" },
  PREPARING: { bg: "bg-orange-500/10", text: "text-orange-400" },
  READY: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  COMPLETED: { bg: "bg-zinc-500/10", text: "text-zinc-400" },
};

const recentOrders: RecentOrder[] = [
  {
    id: "ord_a1b2c3",
    customer: "Walk-in",
    phone: "+12125551234",
    items: ["Margherita Pizza", "Caesar Salad"],
    total: 28.5,
    status: "NEW",
    time: "2 min ago",
  },
  {
    id: "ord_d4e5f6",
    customer: "Walk-in",
    phone: "+12125555678",
    items: ["Chicken Parm", "Garlic Bread", "Tiramisu"],
    total: 42.0,
    status: "CONFIRMED",
    time: "8 min ago",
  },
  {
    id: "ord_g7h8i9",
    customer: "Walk-in",
    phone: "+12125559012",
    items: ["Spaghetti Bolognese"],
    total: 16.5,
    status: "PREPARING",
    time: "15 min ago",
  },
  {
    id: "ord_j0k1l2",
    customer: "Walk-in",
    phone: "+12125553456",
    items: ["Pepperoni Pizza (Large)", "2x Coke"],
    total: 24.0,
    status: "READY",
    time: "22 min ago",
  },
  {
    id: "ord_m3n4o5",
    customer: "Walk-in",
    phone: "+12125557890",
    items: ["Fettuccine Alfredo", "Bruschetta"],
    total: 31.0,
    status: "COMPLETED",
    time: "35 min ago",
  },
];

interface ActiveCall {
  id: string;
  phone: string;
  duration: string;
  status: string;
}

const activeCalls: ActiveCall[] = [
  { id: "call_1", phone: "+12125551111", duration: "1:23", status: "Taking order" },
  { id: "call_2", phone: "+12125552222", duration: "0:45", status: "Menu inquiry" },
  { id: "call_3", phone: "+12125553333", duration: "2:10", status: "Confirming details" },
];

// ---------- Component ----------

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Overview of your restaurant&apos;s AI ordering activity.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 transition-colors hover:border-zinc-700"
          >
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  stat.iconBg
                )}
              >
                <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  stat.change >= 0
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                )}
              >
                {stat.change >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {stat.change >= 0 ? "+" : ""}
                {stat.change}%
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-zinc-100">{stat.value}</p>
              <p className="text-sm text-zinc-400 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders - takes 2 columns */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
            <h2 className="text-base font-semibold text-zinc-100">Recent Orders</h2>
            <a
              href="/dashboard/orders"
              className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-400 transition-colors"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="divide-y divide-zinc-800">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-zinc-800/30 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800">
                    <ShoppingBag className="h-4 w-4 text-zinc-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-100 truncate">
                      {order.items.join(", ")}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {formatPhone(order.phone)} &middot; {order.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-sm font-medium text-zinc-100">
                    {formatPrice(order.total)}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      statusStyles[order.status].bg,
                      statusStyles[order.status].text
                    )}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Calls - takes 1 column */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
            <h2 className="text-base font-semibold text-zinc-100">Active Calls</h2>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">{activeCalls.length} live</span>
            </div>
          </div>
          <div className="divide-y divide-zinc-800">
            {activeCalls.map((call) => (
              <div
                key={call.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-zinc-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/10">
                      <PhoneCall className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-zinc-900 bg-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-100">
                      {formatPhone(call.phone)}
                    </p>
                    <p className="text-xs text-zinc-500">{call.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-zinc-300">{call.duration}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-zinc-800 px-6 py-3">
            <a
              href="/dashboard/calls"
              className="flex items-center justify-center gap-1 text-sm text-orange-500 hover:text-orange-400 transition-colors"
            >
              View call history
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
