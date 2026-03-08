'use client';
import { useState } from 'react';

function cn(...classes: (string | boolean | undefined)[]) { return classes.filter(Boolean).join(' '); }

const invoices = [
  { id: 'INV-003', date: 'Mar 1, 2026', desc: 'Growth Plan - Monthly', amount: 149, status: 'Paid' },
  { id: 'INV-002', date: 'Feb 1, 2026', desc: 'Growth Plan - Monthly', amount: 149, status: 'Paid' },
  { id: 'INV-001', date: 'Jan 1, 2026', desc: 'Growth Plan - Monthly', amount: 149, status: 'Paid' },
];

export default function BillingPage() {
  const [showPlans, setShowPlans] = useState(false);
  const callsUsed = 847;
  const callsLimit = 2000;
  const callsPct = (callsUsed/callsLimit)*100;
  const phonesUsed = 2;
  const phonesLimit = 3;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Billing</h1>
        <p className="text-zinc-400 text-sm mt-1">Manage your subscription and invoices</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Growth Plan</h2>
            <p className="text-zinc-400 text-sm">$149/month - Renews Apr 8, 2026</p>
          </div>
          <span className="px-2.5 py-0.5 bg-green-500/10 text-green-400 text-xs font-medium rounded-full">Active</span>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <div className="flex justify-between text-sm mb-1"><span className="text-zinc-300">AI Calls</span><span className="text-zinc-400">{callsUsed}/{callsLimit}</span></div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full', callsPct>90?'bg-red-500':callsPct>70?'bg-yellow-500':'bg-orange-500')} style={{width:`${callsPct}%`}} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1"><span className="text-zinc-300">Phone Numbers</span><span className="text-zinc-400">{phonesUsed}/{phonesLimit}</span></div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-blue-500" style={{width:`${(phonesUsed/phonesLimit)*100}%`}} />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setShowPlans(!showPlans)} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            {showPlans ? 'Hide Plans' : 'Upgrade Plan'}
          </button>
          <button className="border border-zinc-700 text-zinc-300 hover:border-zinc-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Update Payment</button>
        </div>
      </div>

      {showPlans && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Compare Plans</h2>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div />{['Starter $49','Growth $149','Enterprise $399'].map(p => <div key={p} className="text-center font-medium text-zinc-100">{p}</div>)}
            {[
              ['AI Calls', '200/mo', '2,000/mo', 'Unlimited'],
              ['Phone Numbers', '1', '3', '10'],
              ['Analytics', 'Basic', 'Advanced', 'Advanced'],
              ['Support', 'Email', 'Priority', 'Dedicated'],
              ['Custom Voice', 'No', 'Yes', 'Yes'],
              ['API Access', 'No', 'No', 'Yes'],
            ].map(([feat, ...vals]) => (
              <>{[feat, ...vals].map((v, i) => <div key={`${feat}-${i}`} className={cn('py-2 border-t border-zinc-800', i===0?'text-zinc-400':'text-center text-zinc-300')}>{v}</div>)}</>
            ))}
          </div>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Invoice History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-zinc-800">
              <th className="text-left py-2 text-zinc-400 font-medium">Invoice</th>
              <th className="text-left py-2 text-zinc-400 font-medium">Date</th>
              <th className="text-left py-2 text-zinc-400 font-medium">Description</th>
              <th className="text-right py-2 text-zinc-400 font-medium">Amount</th>
              <th className="text-right py-2 text-zinc-400 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-b border-zinc-800/50">
                  <td className="py-3 text-zinc-300 font-mono">{inv.id}</td>
                  <td className="py-3 text-zinc-400">{inv.date}</td>
                  <td className="py-3 text-zinc-300">{inv.desc}</td>
                  <td className="py-3 text-zinc-100 text-right font-medium">${inv.amount}</td>
                  <td className="py-3 text-right"><span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full">{inv.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-zinc-500 mt-4">Questions? Contact <a href="mailto:billing@calley.ai" className="text-orange-400 hover:underline">billing@calley.ai</a></p>
      </div>
    </div>
  );
}
