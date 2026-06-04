
import React from 'react';
import { ArrowRight, Zap, Activity, Users, Globe } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const data = [
  { name: '08:00', sentiment: 65, risk: 20 },
  { name: '10:00', sentiment: 72, risk: 25 },
  { name: '12:00', sentiment: 68, risk: 30 },
  { name: '14:00', sentiment: 85, risk: 15 },
  { name: '16:00', sentiment: 78, risk: 10 },
  { name: '18:00', sentiment: 92, risk: 5 },
];

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-indigo-600 p-8 sm:p-12">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-outfit font-bold text-white mb-4">
            Unified Emotional Intelligence
          </h2>
          <p className="text-indigo-100 text-lg mb-8">
            Access real-time analysis across visual, auditory, and textual streams to gain a comprehensive 360° understanding of user sentiment and risk profiles.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => onNavigate('face')}
              className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors flex items-center gap-2"
            >
              Start Analysis <ArrowRight size={18} />
            </button>
            <button className="px-6 py-3 bg-indigo-500/20 text-white rounded-xl font-semibold border border-indigo-400/30 hover:bg-indigo-500/30 transition-colors">
              View Documentation
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block">
           <div className="absolute inset-0 bg-gradient-to-l from-indigo-600 to-transparent z-10" />
           <img src="https://picsum.photos/seed/abstract/800/400" className="w-full h-full object-cover opacity-30" alt="background" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Analyses Run', value: '1,284', icon: <Zap size={20} />, color: 'text-yellow-400' },
          { label: 'Avg Sentiment', value: '78%', icon: <Activity size={20} />, color: 'text-green-400' },
          { label: 'Profiles Scanned', value: '412', icon: <Users size={20} />, color: 'text-blue-400' },
          { label: 'Global Coverage', value: '18', icon: <Globe size={20} />, color: 'text-purple-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-colors">
            <div className={`p-2 rounded-lg bg-slate-800 inline-block mb-4 ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
               Sentiment Trends
            </h3>
            <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="sentiment" stroke="#6366f1" fillOpacity={1} fill="url(#colorSent)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
          <h3 className="text-lg font-bold text-white mb-6">System Health</h3>
          <div className="space-y-6">
            {[
              { label: 'Face Analysis SDK', status: 'Optimal', health: 98 },
              { label: 'Speech Engine', status: 'Stable', health: 94 },
              { label: 'Text Processor', status: 'Optimal', health: 100 },
              { label: 'Risk Heuristics', status: 'Stable', health: 91 },
            ].map((system, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">{system.label}</span>
                  <span className="text-indigo-400 font-medium">{system.status}</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${system.health}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800">
             <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors text-sm font-semibold">
               Run System Diagnostics
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
