"use client";

import { useState } from "react";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  PhoneForwarded,
  Clock,
  TrendingUp,
  Smile,
  Meh,
  Frown,
  X,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPhone } from "@/lib/utils";

// ---------- Types ----------

type CallStatus = "RINGING" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "TRANSFERRED";
type Sentiment = "positive" | "neutral" | "negative";

interface Call {
  id: string;
  dateTime: string;
  customerPhone: string;
  duration: string;
  durationSec: number;
  status: CallStatus;
  sentiment: Sentiment;
  orderLinked: string | null;
  transcript: TranscriptEntry[];
}

interface TranscriptEntry {
  speaker: "AI" | "Customer";
  text: string;
  timestamp: string;
}

// ---------- Constants ----------

const callStatusStyles: Record<CallStatus, { bg: string; text: string }> = {
  RINGING: { bg: "bg-blue-500/10", text: "text-blue-400" },
  IN_PROGRESS: { bg: "bg-yellow-500/10", text: "text-yellow-400" },
  COMPLETED: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  FAILED: { bg: "bg-red-500/10", text: "text-red-400" },
  TRANSFERRED: { bg: "bg-purple-500/10", text: "text-purple-400" },
};

const sentimentConfig: Record<Sentiment, { icon: React.ElementType; color: string; label: string }> = {
  positive: { icon: Smile, color: "text-emerald-400", label: "Positive" },
  neutral: { icon: Meh, color: "text-zinc-400", label: "Neutral" },
  negative: { icon: Frown, color: "text-red-400", label: "Negative" },
};

// ---------- Mock Data ----------

const sampleTranscript: TranscriptEntry[] = [
  { speaker: "AI", text: "Thank you for calling Mario's Italian Kitchen! How can I help you today?", timestamp: "0:00" },
  { speaker: "Customer", text: "Hi, I'd like to place an order for delivery.", timestamp: "0:04" },
  { speaker: "AI", text: "Of course! I'd be happy to help you with that. What would you like to order?", timestamp: "0:07" },
  { speaker: "Customer", text: "Can I get a large pepperoni pizza and a Caesar salad?", timestamp: "0:12" },
  { speaker: "AI", text: "Great choices! That's a large pepperoni pizza for $18.99 and a Caesar salad for $8.99. Would you like to add anything else?", timestamp: "0:16" },
  { speaker: "Customer", text: "No, that's it. How long will it take?", timestamp: "0:24" },
  { speaker: "AI", text: "Your order should be ready in about 25-30 minutes. Can I confirm your delivery address?", timestamp: "0:27" },
  { speaker: "Customer", text: "Sure, it's 123 Main Street, Apartment 4B.", timestamp: "0:33" },
  { speaker: "AI", text: "Perfect! Your order total is $27.98. I've placed the order and it'll be delivered to 123 Main Street, Apt 4B. Thank you for ordering from Mario's!", timestamp: "0:37" },
  { speaker: "Customer", text: "Thanks!", timestamp: "0:45" },
];

const mockCalls: Call[] = [
  {
    id: "call_01",
    dateTime: "Today, 2:45 PM",
    customerPhone: "+12125551234",
    duration: "2:34",
    durationSec: 154,
    status: "COMPLETED",
    sentiment: "positive",
    orderLinked: "#8F3A1B",
    transcript: sampleTranscript,
  },
  {
    id: "call_02",
    dateTime: "Today, 2:30 PM",
    customerPhone: "+12125555678",
    duration: "1:12",
    durationSec: 72,
    status: "COMPLETED",
    sentiment: "positive",
    orderLinked: "#9C4D2E",
    transcript: sampleTranscript,
  },
  {
    id: "call_03",
    dateTime: "Today, 2:15 PM",
    customerPhone: "+12125559012",
    duration: "0:45",
    durationSec: 45,
    status: "IN_PROGRESS",
    sentiment: "neutral",
    orderLinked: null,
    transcript: sampleTranscript.slice(0, 4),
  },
  {
    id: "call_04",
    dateTime: "Today, 1:50 PM",
    customerPhone: "+12125553456",
    duration: "3:21",
    durationSec: 201,
    status: "COMPLETED",
    sentiment: "positive",
    orderLinked: "#B6F7G8",
    transcript: sampleTranscript,
  },
  {
    id: "call_05",
    dateTime: "Today, 1:30 PM",
    customerPhone: "+12125557890",
    duration: "0:15",
    durationSec: 15,
    status: "FAILED",
    sentiment: "negative",
    orderLinked: null,
    transcript: [{ speaker: "AI", text: "Thank you for calling Mario's Italian Kitchen! How can I help you today?", timestamp: "0:00" }, { speaker: "Customer", text: "...", timestamp: "0:10" }],
  },
  {
    id: "call_06",
    dateTime: "Today, 12:45 PM",
    customerPhone: "+12125551357",
    duration: "4:10",
    durationSec: 250,
    status: "TRANSFERRED",
    sentiment: "neutral",
    orderLinked: null,
    transcript: sampleTranscript,
  },
  {
    id: "call_07",
    dateTime: "Today, 12:20 PM",
    customerPhone: "+12125552468",
    duration: "1:55",
    durationSec: 115,
    status: "COMPLETED",
    sentiment: "positive",
    orderLinked: "#E9I0J1",
    transcript: sampleTranscript,
  },
  {
    id: "call_08",
    dateTime: "Today, 11:50 AM",
    customerPhone: "+12125553579",
    duration: "2:08",
    durationSec: 128,
    status: "COMPLETED",
    sentiment: "neutral",
    orderLinked: "#F0J1K2",
    transcript: sampleTranscript,
  },
  {
    id: "call_09",
    dateTime: "Yesterday, 8:30 PM",
    customerPhone: "+12125554680",
    duration: "0:30",
    durationSec: 30,
    status: "RINGING",
    sentiment: "neutral",
    orderLinked: null,
    transcript: [],
  },
  {
    id: "call_10",
    dateTime: "Yesterday, 7:15 PM",
    customerPhone: "+12125555791",
    duration: "2:45",
    durationSec: 165,
    status: "COMPLETED",
    sentiment: "negative",
    orderLinked: null,
    transcript: sampleTranscript,
  },
];

// ---------- Stats ----------

const callStats = [
  {
    label: "Total Calls (30d)",
    value: "342",
    icon: Phone,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    label: "Success Rate",
    value: "94.2%",
    icon: TrendingUp,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    label: "Avg Duration",
    value: "2m 18s",
    icon: Clock,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
  {
    label: "Orders from Calls",
    value: "287",
    icon: ShoppingBag,
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-500",
  },
];

// ---------- Component ----------

export default function CallsPage() {
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Calls</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Monitor call activity and review AI conversation transcripts.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {callStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  stat.iconBg
                )}
              >
                <stat.icon className={cn("h-4 w-4", stat.iconColor)} />
              </div>
              <div>
                <p className="text-xl font-bold text-zinc-100">{stat.value}</p>
                <p className="text-xs text-zinc-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call table + slide-over container */}
      <div className="relative flex gap-0">
        {/* Table */}
        <div
          className={cn(
            "flex-1 rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden transition-all duration-300",
            selectedCall ? "lg:mr-[400px]" : ""
          )}
        >
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[1fr_1fr_100px_120px_100px_120px_60px] gap-4 border-b border-zinc-800 px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            <span>Date / Time</span>
            <span>Customer Phone</span>
            <span>Duration</span>
            <span>Status</span>
            <span>Sentiment</span>
            <span>Order</span>
            <span></span>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-zinc-800">
            {mockCalls.map((call) => {
              const SentimentIcon = sentimentConfig[call.sentiment].icon;
              return (
                <div
                  key={call.id}
                  onClick={() => setSelectedCall(call)}
                  className={cn(
                    "grid grid-cols-1 md:grid-cols-[1fr_1fr_100px_120px_100px_120px_60px] gap-2 md:gap-4 px-5 py-4 cursor-pointer transition-colors",
                    selectedCall?.id === call.id
                      ? "bg-orange-500/5"
                      : "hover:bg-zinc-800/30"
                  )}
                >
                  {/* Date/Time */}
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-zinc-500 md:hidden" />
                    <span className="text-sm text-zinc-200">{call.dateTime}</span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-zinc-500 md:hidden" />
                    <span className="text-sm text-zinc-300 font-mono">
                      {formatPhone(call.customerPhone)}
                    </span>
                  </div>

                  {/* Duration */}
                  <span className="text-sm text-zinc-400 font-mono">
                    {call.duration}
                  </span>

                  {/* Status */}
                  <div>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        callStatusStyles[call.status].bg,
                        callStatusStyles[call.status].text
                      )}
                    >
                      {call.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Sentiment */}
                  <div className="flex items-center gap-1.5">
                    <SentimentIcon
                      className={cn(
                        "h-4 w-4",
                        sentimentConfig[call.sentiment].color
                      )}
                    />
                    <span className="text-xs text-zinc-500 md:hidden">
                      {sentimentConfig[call.sentiment].label}
                    </span>
                  </div>

                  {/* Order linked */}
                  <div>
                    {call.orderLinked ? (
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-orange-400 bg-orange-500/10 rounded-full px-2 py-0.5">
                        <ShoppingBag className="h-3 w-3" />
                        {call.orderLinked}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-600">--</span>
                    )}
                  </div>

                  {/* Chevron */}
                  <div className="hidden md:flex items-center justify-end">
                    <ChevronRight className="h-4 w-4 text-zinc-600" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Slide-over panel */}
        {selectedCall && (
          <div className="fixed right-0 top-0 z-50 h-full w-full sm:w-[400px] bg-zinc-900 border-l border-zinc-800 shadow-2xl overflow-y-auto animate-slide-in-right lg:absolute lg:top-auto lg:h-auto lg:min-h-full lg:z-10 lg:rounded-xl">
            {/* Panel header */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-zinc-900 border-b border-zinc-800 px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Call Transcript
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {selectedCall.dateTime} &middot; {selectedCall.duration}
                </p>
              </div>
              <button
                onClick={() => setSelectedCall(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Call meta */}
            <div className="px-5 py-4 border-b border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Customer</span>
                <span className="text-sm text-zinc-200 font-mono">
                  {formatPhone(selectedCall.customerPhone)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Status</span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                    callStatusStyles[selectedCall.status].bg,
                    callStatusStyles[selectedCall.status].text
                  )}
                >
                  {selectedCall.status.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Sentiment</span>
                <div className="flex items-center gap-1.5">
                  {(() => {
                    const SIcon = sentimentConfig[selectedCall.sentiment].icon;
                    return (
                      <>
                        <SIcon
                          className={cn(
                            "h-4 w-4",
                            sentimentConfig[selectedCall.sentiment].color
                          )}
                        />
                        <span className="text-sm text-zinc-300">
                          {sentimentConfig[selectedCall.sentiment].label}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>
              {selectedCall.orderLinked && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Order</span>
                  <span className="text-sm font-mono text-orange-400">
                    {selectedCall.orderLinked}
                  </span>
                </div>
              )}
            </div>

            {/* Transcript */}
            <div className="px-5 py-4 space-y-4">
              <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Conversation
              </h4>
              {selectedCall.transcript.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-8">
                  No transcript available.
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedCall.transcript.map((entry, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex gap-3",
                        entry.speaker === "AI" ? "justify-start" : "justify-end"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-xl px-3.5 py-2.5",
                          entry.speaker === "AI"
                            ? "bg-zinc-800 rounded-tl-sm"
                            : "bg-orange-500/10 rounded-tr-sm"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={cn(
                              "text-xs font-medium",
                              entry.speaker === "AI"
                                ? "text-blue-400"
                                : "text-orange-400"
                            )}
                          >
                            {entry.speaker === "AI" ? "Calley AI" : "Customer"}
                          </span>
                          <span className="text-xs text-zinc-600">
                            {entry.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-200 leading-relaxed">
                          {entry.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
