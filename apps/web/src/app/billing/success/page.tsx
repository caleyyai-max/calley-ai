'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BillingSuccessPage() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => { if (p >= 100) { clearInterval(timer); return 100; } return p + 2; });
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <div className="absolute inset-0 w-20 h-20 mx-auto bg-green-500/5 rounded-full blur-xl" />
        </div>

        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Payment Successful!</h1>
        <p className="text-zinc-400 mb-8">Your subscription has been activated.</p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6 text-left">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-100">Growth Plan</h2>
            <span className="px-2.5 py-0.5 bg-green-500/10 text-green-400 text-xs font-medium rounded-full">Active</span>
          </div>
          <div className="text-2xl font-bold text-zinc-100 mb-1">$149<span className="text-sm text-zinc-400 font-normal">/month</span></div>
          <p className="text-sm text-zinc-400 mb-4">Next billing: April 8, 2026</p>
          <div className="space-y-2">
            {['Up to 2,000 AI calls/mo', '3 phone numbers', 'Advanced analytics', 'Priority support', 'Custom AI voice'].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span className="text-zinc-300">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-zinc-500 mb-6 flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          Receipt sent to your email
        </p>

        <Link href="/dashboard" className="block w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors mb-3">
          Go to Dashboard
        </Link>
        <div className="flex items-center justify-center gap-4 text-sm">
          <Link href="/dashboard/billing" className="text-zinc-400 hover:text-zinc-100 transition-colors">View Billing</Link>
          <Link href="/dashboard/settings" className="text-zinc-400 hover:text-zinc-100 transition-colors">Account Settings</Link>
        </div>
      </div>
    </div>
  );
}