"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  ShoppingBag,
  Phone,
  UtensilsCrossed,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingBag,
  },
  {
    label: "Calls",
    href: "/dashboard/calls",
    icon: Phone,
  },
  {
    label: "Menu",
    href: "/dashboard/menu",
    icon: UtensilsCrossed,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-zinc-900 border-r border-zinc-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-800">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
              <Phone className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-zinc-100">
              Calley <span className="text-orange-500">AI</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-orange-500/10 text-orange-500"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", active ? "text-orange-500" : "text-zinc-500")} />
                {item.label}
                {active && (
                  <ChevronRight className="ml-auto h-4 w-4 text-orange-500/60" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-zinc-800 px-4 py-4">
          <div className="flex items-center gap-3 rounded-lg bg-zinc-800/50 px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20">
              <span className="text-xs font-semibold text-orange-500">PRO</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-300">Pro Plan</p>
              <p className="text-xs text-zinc-500">1,247 / 5,000 calls</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-sm font-semibold text-zinc-100">
                Mario&apos;s Italian Kitchen
              </h2>
              <p className="text-xs text-zinc-500">Restaurant Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status indicator */}
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-500">AI Agent Active</span>
            </div>

            {/* User button */}
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
