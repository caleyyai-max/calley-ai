"use client";

import { useState } from "react";
import {
  ShoppingBag,
  Clock,
  Phone,
  ChevronDown,
  ChevronUp,
  Check,
  ChefHat,
  Bell,
  CheckCircle2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, formatPhone } from "@/lib/utils";

// ---------- Types ----------

type OrderStatus =
  | "NEW"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  modifiers?: string[];
}

interface Order {
  id: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  notes?: string;
}

// ---------- Constants ----------

const statusStyles: Record<OrderStatus, { bg: string; text: string; dot: string }> = {
  NEW: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-500" },
  CONFIRMED: { bg: "bg-yellow-500/10", text: "text-yellow-400", dot: "bg-yellow-500" },
  PREPARING: { bg: "bg-orange-500/10", text: "text-orange-400", dot: "bg-orange-500" },
  READY: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-500" },
  COMPLETED: { bg: "bg-zinc-500/10", text: "text-zinc-400", dot: "bg-zinc-500" },
  CANCELLED: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-500" },
};

const filterTabs: { label: string; value: OrderStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "New", value: "NEW" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Preparing", value: "PREPARING" },
  { label: "Ready", value: "READY" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

// ---------- Mock Data ----------

const mockOrders: Order[] = [
  {
    id: "ord_8f3a1b2c",
    customerPhone: "+12125551234",
    items: [
      { name: "Margherita Pizza", quantity: 1, price: 14.99, modifiers: ["Extra cheese"] },
      { name: "Caesar Salad", quantity: 1, price: 8.99 },
    ],
    total: 23.98,
    status: "NEW",
    createdAt: "2 min ago",
    notes: "Please ring doorbell",
  },
  {
    id: "ord_9c4d2e3f",
    customerPhone: "+12125555678",
    items: [
      { name: "Chicken Parmesan", quantity: 1, price: 18.99 },
      { name: "Garlic Bread", quantity: 2, price: 4.99 },
      { name: "Tiramisu", quantity: 1, price: 8.99 },
    ],
    total: 37.96,
    status: "NEW",
    createdAt: "5 min ago",
  },
  {
    id: "ord_a5e6f7g8",
    customerPhone: "+12125559012",
    items: [
      { name: "Spaghetti Bolognese", quantity: 2, price: 15.99 },
      { name: "Meatballs (Side)", quantity: 1, price: 6.99 },
    ],
    total: 38.97,
    status: "CONFIRMED",
    createdAt: "12 min ago",
  },
  {
    id: "ord_b6f7g8h9",
    customerPhone: "+12125553456",
    items: [
      { name: "Pepperoni Pizza (Large)", quantity: 1, price: 18.99, modifiers: ["Thin crust"] },
      { name: "Coke", quantity: 2, price: 2.99 },
    ],
    total: 24.97,
    status: "PREPARING",
    createdAt: "20 min ago",
  },
  {
    id: "ord_c7g8h9i0",
    customerPhone: "+12125557890",
    items: [
      { name: "Fettuccine Alfredo", quantity: 1, price: 16.99 },
      { name: "Bruschetta", quantity: 1, price: 9.99 },
    ],
    total: 26.98,
    status: "PREPARING",
    createdAt: "25 min ago",
    notes: "Allergic to nuts",
  },
  {
    id: "ord_d8h9i0j1",
    customerPhone: "+12125551357",
    items: [
      { name: "Veggie Pizza (Medium)", quantity: 1, price: 14.99 },
    ],
    total: 14.99,
    status: "READY",
    createdAt: "32 min ago",
  },
  {
    id: "ord_e9i0j1k2",
    customerPhone: "+12125552468",
    items: [
      { name: "Lasagna", quantity: 1, price: 17.99 },
      { name: "Garden Salad", quantity: 1, price: 7.99 },
      { name: "Sparkling Water", quantity: 1, price: 3.49 },
    ],
    total: 29.47,
    status: "COMPLETED",
    createdAt: "45 min ago",
  },
  {
    id: "ord_f0j1k2l3",
    customerPhone: "+12125553579",
    items: [
      { name: "Calzone", quantity: 1, price: 13.99 },
      { name: "Minestrone Soup", quantity: 1, price: 6.99 },
    ],
    total: 20.98,
    status: "CANCELLED",
    createdAt: "1 hr ago",
    notes: "Customer changed mind",
  },
];

// ---------- Action Buttons ----------

function getActions(status: OrderStatus): { label: string; icon: React.ElementType; nextStatus: OrderStatus }[] {
  switch (status) {
    case "NEW":
      return [{ label: "Confirm", icon: Check, nextStatus: "CONFIRMED" }];
    case "CONFIRMED":
      return [{ label: "Start Preparing", icon: ChefHat, nextStatus: "PREPARING" }];
    case "PREPARING":
      return [{ label: "Mark Ready", icon: Bell, nextStatus: "READY" }];
    case "READY":
      return [{ label: "Complete", icon: CheckCircle2, nextStatus: "COMPLETED" }];
    default:
      return [];
  }
}

// ---------- Component ----------

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "ALL">("ALL");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const filteredOrders =
    activeFilter === "ALL"
      ? orders
      : orders.filter((o) => o.status === activeFilter);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  const statusCounts = orders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Orders</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage incoming and active orders from phone calls.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => {
          const count =
            tab.value === "ALL"
              ? orders.length
              : statusCounts[tab.value] || 0;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                activeFilter === tab.value
                  ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-300"
              )}
            >
              {tab.value !== "ALL" && (
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    statusStyles[tab.value as OrderStatus]?.dot
                  )}
                />
              )}
              {tab.label}
              <span
                className={cn(
                  "ml-1 rounded-full px-1.5 py-0.5 text-xs",
                  activeFilter === tab.value
                    ? "bg-orange-500/20 text-orange-400"
                    : "bg-zinc-800 text-zinc-500"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders grid */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center">
          <ShoppingBag className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 font-medium">No orders found</p>
          <p className="text-sm text-zinc-500 mt-1">
            Orders matching this filter will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const actions = getActions(order.status);

            return (
              <div
                key={order.id}
                className={cn(
                  "rounded-xl border bg-zinc-900 transition-colors",
                  order.status === "NEW"
                    ? "border-blue-500/30"
                    : "border-zinc-800 hover:border-zinc-700"
                )}
              >
                {/* Card header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-semibold text-zinc-100">
                      #{order.id.slice(-6).toUpperCase()}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                        statusStyles[order.status].bg,
                        statusStyles[order.status].text
                      )}
                    >
                      <div
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          statusStyles[order.status].dot
                        )}
                      />
                      {order.status}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Customer info */}
                <div className="px-5 pb-3">
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{formatPhone(order.customerPhone)}</span>
                    <span className="text-zinc-600">&middot;</span>
                    <Clock className="h-3.5 w-3.5" />
                    <span>{order.createdAt}</span>
                  </div>
                </div>

                {/* Items list */}
                <div className="px-5 pb-3">
                  <div className="space-y-1.5">
                    {order.items
                      .slice(0, isExpanded ? undefined : 2)
                      .map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between text-sm"
                        >
                          <div className="min-w-0">
                            <span className="text-zinc-200">
                              {item.quantity}x {item.name}
                            </span>
                            {isExpanded && item.modifiers && (
                              <p className="text-xs text-zinc-500 mt-0.5">
                                {item.modifiers.join(", ")}
                              </p>
                            )}
                          </div>
                          <span className="text-zinc-400 shrink-0 ml-3">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    {!isExpanded && order.items.length > 2 && (
                      <p className="text-xs text-zinc-500">
                        +{order.items.length - 2} more item
                        {order.items.length - 2 > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && order.notes && (
                  <div className="px-5 pb-3">
                    <div className="rounded-lg bg-zinc-800/50 px-3 py-2">
                      <p className="text-xs font-medium text-zinc-400 mb-0.5">Note</p>
                      <p className="text-sm text-zinc-300">{order.notes}</p>
                    </div>
                  </div>
                )}

                {/* Footer: total + actions */}
                <div className="flex items-center justify-between border-t border-zinc-800 px-5 py-3">
                  <p className="text-base font-bold text-zinc-100">
                    {formatPrice(order.total)}
                  </p>
                  <div className="flex items-center gap-2">
                    {actions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() =>
                          handleStatusChange(order.id, action.nextStatus)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
                      >
                        <action.icon className="h-3.5 w-3.5" />
                        {action.label}
                      </button>
                    ))}
                    {order.status === "NEW" && (
                      <button
                        onClick={() =>
                          handleStatusChange(order.id, "CANCELLED")
                        }
                        className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        title="Cancel order"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
