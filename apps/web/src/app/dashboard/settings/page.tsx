'use client';
import { useState } from 'react';

function cn(...classes: (string | boolean | undefined)[]) { return classes.filter(Boolean).join(' '); }

const daysOfWeek = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const defaultHours = daysOfWeek.map(d => ({ day: d, enabled: d !== 'Sunday', open: '11:00', close: d==='Friday'||d==='Saturday'?'23:00':'22:00' }));

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState('general');
  const [name, setName] = useState("Mario's Italian Kitchen");
  const [address, setAddress] = useState('123 Main Street, New York, NY 10001');
  const [phone, setPhone] = useState('(555) 123-4567');
  const [timezone, setTimezone] = useState('America/New_York');
  const [cuisine, setCuisine] = useState('Italian');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [assistantId] = useState('asst_abc123xyz789');
  const [voiceStyle, setVoiceStyle] = useState('friendly');
  const [greeting, setGreeting] = useState("Thank you for calling Mario's Italian Kitchen! How can I help you today?");
  const [hours, setHours] = useState(defaultHours);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [newOrderNotif, setNewOrderNotif] = useState(true);
  const [failedCallNotif, setFailedCallNotif] = useState(true);
  const [dailySummary, setDailySummary] = useState(true);

  const handleSave = () => { setSaving(true); setTimeout(() => setSaving(false), 1500); };
  const toggleHours = (i: number) => { const u = [...hours]; u[i].enabled = !u[i].enabled; setHours(u); };

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className={cn('relative w-10 h-5 rounded-full transition-colors', on?'bg-orange-500':'bg-zinc-700')}>
      <div className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform', on?'left-5':'left-0.5')} />
    </button>
  );

  const sections = [
    { id: 'general', label: 'General' },
    { id: 'ai-agent', label: 'AI Agent' },
    { id: 'phone', label: 'Phone Numbers' },
    { id: 'hours', label: 'Business Hours' },
    { id: 'notifications', label: 'Notifications' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage your restaurant configuration</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 flex lg:flex-col gap-1 overflow-x-auto">
            {sections.map(s => (
              <button key={s.id} onClick={() => setSection(s.id)} className={cn('px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap', section===s.id?'bg-orange-500/10 text-orange-400':'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800')}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-6">
          {section === 'general' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-zinc-100 mb-6">General Information</h2>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-zinc-300 mb-1">Restaurant Name</label>
                  <input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-orange-500" /></div>
                <div><label className="block text-sm font-medium text-zinc-300 mb-1">Address</label>
                  <input type="text" value={address} onChange={e=>setAddress(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-orange-500" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-zinc-300 mb-1">Phone</label>
                    <input type="text" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-orange-500" /></div>
                  <div><label className="block text-sm font-medium text-zinc-300 mb-1">Cuisine</label>
                    <input type="text" value={cuisine} onChange={e=>setCuisine(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-orange-500" /></div>
                </div>
                <div><label className="block text-sm font-medium text-zinc-300 mb-1">Timezone</label>
                  <select value={timezone} onChange={e=>setTimezone(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-orange-500">
                    <option value="America/New_York">Eastern (ET)</option><option value="America/Chicago">Central (CT)</option>
                    <option value="America/Denver">Mountain (MT)</option><option value="America/Los_Angeles">Pacific (PT)</option>
                  </select></div>
              </div>
            </div>
          )}

          {section === 'ai-agent' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-zinc-100 mb-6">AI Agent Configuration</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-3 h-3 rounded-full', aiEnabled?'bg-green-500 animate-pulse':'bg-zinc-600')} />
                    <div><p className="text-sm font-medium text-zinc-100">AI Agent Status</p>
                      <p className="text-xs text-zinc-400">{aiEnabled?'Actively answering calls':'Paused'}</p></div>
                  </div>
                  <Toggle on={aiEnabled} onToggle={() => setAiEnabled(!aiEnabled)} />
                </div>
                <div><label className="block text-sm font-medium text-zinc-300 mb-1">Assistant ID</label>
                  <div className="flex gap-2">
                    <input type="text" value={assistantId} readOnly className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-400 font-mono text-sm" />
                    <button onClick={()=>navigator.clipboard?.writeText(assistantId)} className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 hover:text-zinc-100">Copy</button>
                  </div></div>
                <div><label className="block text-sm font-medium text-zinc-300 mb-1">Voice Style</label>
                  <select value={voiceStyle} onChange={e=>setVoiceStyle(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-orange-500">
                    <option value="friendly">Friendly & Warm</option><option value="professional">Professional</option><option value="casual">Casual</option>
                  </select></div>
                <div><label className="block text-sm font-medium text-zinc-300 mb-1">Opening Greeting</label>
                  <textarea value={greeting} onChange={e=>setGreeting(e.target.value)} rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-orange-500 resize-none" />
                  <p className="text-xs text-zinc-500 mt-1">First thing the AI says when answering.</p></div>
              </div>
            </div>
          )}

          {section === 'phone' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-zinc-100 mb-6">Phone Numbers</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                  <div><p className="font-medium text-zinc-100">(555) 987-6543</p><p className="text-sm text-zinc-400">Primary AI Line</p></div>
                  <span className="px-2.5 py-0.5 bg-green-500/10 text-green-400 text-xs font-medium rounded-full">Active</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                  <div><p className="font-medium text-zinc-100">(555) 123-4567</p><p className="text-sm text-zinc-400">Forwarding Number</p></div>
                  <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full">Transfer Target</span>
                </div>
                <button className="w-full border border-dashed border-zinc-700 rounded-lg py-3 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 transition-colors text-sm">+ Add Phone Number</button>
              </div>
            </div>
          )}

          {section === 'hours' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-zinc-100 mb-6">Business Hours</h2>
              <div className="space-y-3">
                {hours.map((h, i) => (
                  <div key={h.day} className="flex items-center gap-4 py-2">
                    <Toggle on={h.enabled} onToggle={() => toggleHours(i)} />
                    <span className="w-24 text-sm text-zinc-300">{h.day}</span>
                    {h.enabled ? (
                      <div className="flex items-center gap-2">
                        <input type="time" value={h.open} onChange={e=>{const u=[...hours];u[i].open=e.target.value;setHours(u)}} className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100" />
                        <span className="text-zinc-500">to</span>
                        <input type="time" value={h.close} onChange={e=>{const u=[...hours];u[i].close=e.target.value;setHours(u)}} className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100" />
                      </div>
                    ) : <span className="text-sm text-zinc-500">Closed</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'notifications' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-zinc-100 mb-6">Notification Preferences</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-zinc-300 mb-3">Channels</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between"><span className="text-sm text-zinc-300">Email Notifications</span><Toggle on={emailNotifs} onToggle={()=>setEmailNotifs(!emailNotifs)} /></div>
                    <div className="flex items-center justify-between"><span className="text-sm text-zinc-300">SMS Notifications</span><Toggle on={smsNotifs} onToggle={()=>setSmsNotifs(!smsNotifs)} /></div>
                  </div>
                </div>
                <div className="border-t border-zinc-800 pt-6">
                  <h3 className="text-sm font-medium text-zinc-300 mb-3">Alert Types</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between"><div><span className="text-sm text-zinc-300">New Order Alerts</span><p className="text-xs text-zinc-500">Get notified for every new order</p></div><Toggle on={newOrderNotif} onToggle={()=>setNewOrderNotif(!newOrderNotif)} /></div>
                    <div className="flex items-center justify-between"><div><span className="text-sm text-zinc-300">Failed Call Alerts</span><p className="text-xs text-zinc-500">When AI can't complete a call</p></div><Toggle on={failedCallNotif} onToggle={()=>setFailedCallNotif(!failedCallNotif)} /></div>
                    <div className="flex items-center justify-between"><div><span className="text-sm text-zinc-300">Daily Summary</span><p className="text-xs text-zinc-500">End-of-day recap</p></div><Toggle on={dailySummary} onToggle={()=>setDailySummary(!dailySummary)} /></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
