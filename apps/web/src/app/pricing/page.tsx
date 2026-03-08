'use client';
import { useState } from 'react';
import Link from 'next/link';

function cn(...classes: (string | boolean | undefined)[]) { return classes.filter(Boolean).join(' '); }

const plans = [
  { name: 'Starter', price: 49, desc: 'Perfect for small restaurants', features: ['Up to 200 AI calls/mo', '1 phone number', 'Basic analytics', 'Email support', 'Menu management'], notIncluded: ['Custom voice', 'Priority support', 'API access'] },
  { name: 'Growth', price: 149, desc: 'Most popular for growing businesses', popular: true, features: ['Up to 2,000 AI calls/mo', '3 phone numbers', 'Advanced analytics', 'Priority support', 'Menu management', 'Custom AI voice', 'Webhook integrations'], notIncluded: ['API access'] },
  { name: 'Enterprise', price: 399, desc: 'For multi-location restaurants', features: ['Unlimited AI calls', '10 phone numbers', 'Advanced analytics', 'Dedicated support', 'Menu management', 'Custom AI voice', 'Full API access', 'White-label option'] },
];

const faqs = [
  { q: 'How does the free trial work?', a: 'You get 14 days of full access to the Growth plan. No credit card required. Cancel anytime.' },
  { q: 'Can I change plans later?', a: 'Yes! Upgrade or downgrade anytime. Changes take effect immediately with prorated billing.' },
  { q: 'What happens if I exceed my call limit?', a: 'We will notify you at 80% usage. Additional calls are billed at $0.10/call on Starter and $0.07/call on Growth.' },
  { q: 'Do you offer annual billing?', a: 'Yes! Annual plans save 20%. Contact sales for enterprise annual pricing.' },
  { q: 'Can I port my existing phone number?', a: 'Absolutely. We support number porting from all major carriers. The process takes 1-3 business days.' },
  { q: 'Is there a setup fee?', a: 'No setup fees ever. You only pay your monthly subscription.' },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </div>
            <span className="text-xl font-bold">Calley AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-zinc-400 hover:text-zinc-100 transition-colors">Sign In</Link>
            <Link href="/sign-up" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Start free, scale as you grow. All plans include a 14-day free trial.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map(plan => (
              <div key={plan.name} className={cn('bg-zinc-900 rounded-xl p-8 relative', plan.popular ? 'border-2 border-orange-500' : 'border border-zinc-800')}>
                {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</div>}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-zinc-400 text-sm mt-1">{plan.desc}</p>
                <div className="mt-6 mb-8"><span className="text-4xl font-bold">${plan.price}</span><span className="text-zinc-400">/mo</span></div>
                <Link href="/sign-up" className={cn('block text-center py-2.5 rounded-lg font-medium transition-colors', plan.popular ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border border-zinc-700 text-zinc-300 hover:border-zinc-500')}>
                  Start Free Trial
                </Link>
                <div className="mt-8 space-y-3">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <span className="text-zinc-300">{f}</span>
                    </div>
                  ))}
                  {plan.notIncluded?.map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-zinc-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      <span className="text-zinc-500">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-zinc-900/30 border-y border-zinc-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq===i?null:i)} className="w-full flex items-center justify-between p-4 text-left">
                  <span className="font-medium text-zinc-100">{faq.q}</span>
                  <span className="text-zinc-400 text-xl">{openFaq===i?'-':'+'}</span>
                </button>
                {openFaq===i && <div className="px-4 pb-4 text-zinc-400 text-sm">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-zinc-400 mb-8">14 days free. No credit card required.</p>
          <Link href="/sign-up" className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-lg font-semibold text-lg transition-colors">Start Free Trial</Link>
        </div>
      </section>
    </div>
  );
}