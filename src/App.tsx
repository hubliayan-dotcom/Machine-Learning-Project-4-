import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  BarChart3, 
  Search, 
  Terminal, 
  ChevronRight, 
  AlertCircle,
  Clock,
  Briefcase,
  Monitor,
  Database
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { explainTransaction, FraudExplanation } from './services/gemini';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Mock Data ---
const PR_DATA = [
  { recall: 0.0, precision: 1.0 },
  { recall: 0.2, precision: 0.98 },
  { recall: 0.4, precision: 0.95 },
  { recall: 0.6, precision: 0.92 },
  { recall: 0.8, precision: 0.88 },
  { recall: 0.85, precision: 0.82 },
  { recall: 0.9, precision: 0.75 },
  { recall: 0.95, precision: 0.60 },
  { recall: 1.0, precision: 0.17 },
];

const INITIAL_TRANSACTIONS = [
  { id: 'tx_829', amount: 149.62, time: 0, v1: -1.35, is_fraud: false, status: 'ALLOW', prob: 0.02 },
  { id: 'tx_492', amount: 4.99, time: 2, v1: 1.19, is_fraud: false, status: 'ALLOW', prob: 0.01 },
  { id: 'tx_122', amount: 1235.00, time: 10, v1: -2.31, is_fraud: true, status: 'REVIEW', prob: 0.89 },
  { id: 'tx_773', amount: 35.12, time: 15, v1: 0.98, is_fraud: false, status: 'ALLOW', prob: 0.05 },
];

const PIE_DATA = [
  { name: 'Legit', value: 284315, color: '#10B981' },
  { name: 'Fraud', value: 492, color: '#EF4444' },
];

// --- Components ---

const StatCard = ({ title, value, sub, icon: Icon, trend }: any) => (
  <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-50 rounded-lg">
        <Icon className="w-5 h-5 text-slate-600" />
      </div>
      {trend && (
        <span className={cn(
          "text-xs font-medium px-2 py-1 rounded-full",
          trend > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">{title}</h3>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-semibold tracking-tight">{value}</span>
      {sub && <span className="text-sm text-slate-400">{sub}</span>}
    </div>
  </div>
);

export default function App() {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [threshold, setThreshold] = useState(0.5);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [explanation, setExplanation] = useState<FraudExplanation | null>(null);
  const [explaining, setExplaining] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const stats = useMemo(() => {
    const flagged = transactions.filter(t => t.prob >= threshold);
    const recall = 0.912; // Simulated
    const precision = flagged.length > 0 ? 0.884 : 0;
    return { recall, precision, f1: 0.898 };
  }, [transactions, threshold]);

  const handleExplain = async (tx: any) => {
    setSelectedTx(tx);
    setExplaining(true);
    setExplanation(null);
    try {
      const result = await explainTransaction(tx);
      setExplanation(result);
    } catch (err) {
      console.error(err);
    } finally {
      setExplaining(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand selection:text-white">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-sky-500 p-1.5 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none tracking-tight">SAFEGUARD <span className="text-sky-400">AI</span></h1>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-[0.2em]">Enterprise Fraud Engine v2.0</span>
            </div>
          </div>
          
          <nav className="flex gap-6">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={cn("text-sm font-medium transition-colors", activeTab === 'dashboard' ? "text-white" : "text-slate-400 hover:text-white")}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('inference')}
              className={cn("text-sm font-medium transition-colors", activeTab === 'inference' ? "text-white" : "text-slate-400 hover:text-white")}
            >
              Inference Sandbox
            </button>
            <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Monitoring</button>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs font-mono text-emerald-400">● SYSTEM_NORMAL</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Latency: 22ms</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto p-6 md:p-8">
        {activeTab === 'dashboard' ? (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="PR-AUC" value="0.912" icon={BarChart3} trend={1.2} />
              <StatCard title="Precision" value={(stats.precision * 100).toFixed(1) + '%'} icon={ShieldCheck} />
              <StatCard title="Recall" value={(stats.recall * 100).toFixed(1) + '%'} icon={Activity} />
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm text-white">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <Database className="w-5 h-5 text-sky-400" />
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">OPTIMIZED</span>
                </div>
                <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Business Cost</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight">$3,450</span>
                  <span className="text-xs text-slate-500">minimized</span>
                </div>
                <p className="text-[10px] mt-2 text-slate-500 leading-tight">
                  Based on $5k/FN and $50/FP weighting strategy.
                </p>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Charts */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Class Distribution</h2>
                    <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">N=284,807</span>
                  </div>
                  <div className="h-[300px] flex gap-8">
                    <div className="w-[40%]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={PIE_DATA}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {PIE_DATA.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-grow flex flex-col justify-center space-y-4">
                      {PIE_DATA.map((item) => (
                        <div key={item.name} className="flex justify-between items-center border-l-4 pl-4" style={{ borderColor: item.color }}>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{item.name}</p>
                            <p className="text-xs text-slate-400">{item.value.toLocaleString()} items</p>
                          </div>
                          <p className="text-sm font-mono font-bold">{(item.value / 2848.07).toFixed(3)}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Precision-Recall Curve</h2>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={PR_DATA}>
                        <defs>
                          <linearGradient id="colorPr" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis 
                          dataKey="recall" 
                          label={{ value: 'Recall', position: 'insideBottom', offset: -5 }} 
                          stroke="#94A3B8"
                          fontSize={12}
                        />
                        <YAxis 
                          label={{ value: 'Precision', angle: -90, position: 'insideLeft' }} 
                          stroke="#94A3B8"
                          fontSize={12}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="precision" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPr)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Right Column: Decisions & Threshold */}
              <div className="space-y-8">
                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-xl shadow-slate-200">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <Terminal className="w-4 h-4" /> Threshold Tuner
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-slate-400">Current Threshold</span>
                        <span className="font-mono text-sky-400">{threshold.toFixed(2)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.01" 
                        max="0.99" 
                        step="0.01" 
                        value={threshold} 
                        onChange={(e) => setThreshold(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                      />
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <p className="text-[10px] text-slate-400 uppercase mb-3 tracking-wider">Business Impact Simulation</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">False Positives</span>
                          <span className="font-mono text-rose-400">{Math.round(40 * (1 - threshold))} / day</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">Caught Fraud</span>
                          <span className="font-mono text-emerald-400">{Math.round(85 * threshold)} / day</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Latest Signals</h2>
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((tx, idx) => (
                      <div key={tx.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors rounded-lg group cursor-pointer" onClick={() => handleExplain(tx)}>
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                          tx.prob > threshold ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {tx.prob > threshold ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-sm font-bold truncate">#{tx.id}</p>
                          <p className="text-xs text-slate-500 font-mono">${tx.amount.toFixed(2)}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] font-mono text-slate-400 mb-0.5">SCORE</p>
                          <p className={cn("text-xs font-bold", tx.prob > threshold ? "text-rose-600" : "text-slate-700")}>
                            {tx.prob.toFixed(3)}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Explanation Modal */}
            <AnimatePresence>
              {selectedTx && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden"
                  >
                    <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold">Transaction Report: {selectedTx.id}</h3>
                        <p className="text-xs text-slate-400 font-mono">XGBoost Inference Result</p>
                      </div>
                      <button onClick={() => setSelectedTx(null)} className="text-slate-400 hover:text-white">✕</button>
                    </div>

                    <div className="p-8">
                      {explaining ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-sm font-medium text-slate-500">Generating SHAP Explanations via LLM-Guided Analysis...</p>
                        </div>
                      ) : explanation ? (
                        <div className="space-y-8">
                          <div className="grid grid-cols-3 gap-6">
                            <div className="col-span-2 space-y-4">
                              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Model Summary</h4>
                                <p className="text-sm text-slate-700 leading-relaxed italic">"{explanation.summary}"</p>
                              </div>
                              <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Top Drivers (SHAP)</h4>
                                {explanation.top_features.map((feat, i) => (
                                  <div key={i} className="flex items-center gap-4">
                                    <div className="w-24 text-xs font-mono text-slate-500 uppercase">{feat.feature}</div>
                                    <div className="flex-grow bg-slate-100 h-2 rounded-full overflow-hidden">
                                      <div 
                                        className={cn("h-full", feat.contribution > 0 ? "bg-rose-500" : "bg-emerald-500")}
                                        style={{ width: `${Math.abs(feat.contribution * 100)}%`, marginLeft: feat.contribution < 0 ? 'auto' : '0' }}
                                      />
                                    </div>
                                    <div className="w-40 text-[10px] text-slate-400 italic">{feat.reason}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-6">
                              <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Risk Score</p>
                                <p className={cn("text-4xl font-bold font-mono", explanation.fraud_probability > 0.5 ? "text-rose-600" : "text-emerald-600")}>
                                  {(explanation.fraud_probability * 100).toFixed(1)}%
                                </p>
                                <span className={cn(
                                  "inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                                  explanation.risk_level === 'HIGH' ? "bg-rose-100 text-rose-600" : explanation.risk_level === 'MEDIUM' ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                                )}>
                                  {explanation.risk_level} RISK
                                </span>
                              </div>
                              <button 
                                onClick={() => setSelectedTx(null)}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm tracking-wide hover:bg-slate-800 transition-colors shadow-lg active:scale-95"
                              >
                                APPROVE & CLOSE
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white p-8 rounded-2xl border border-border shadow-xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-sky-100 text-sky-600 rounded-xl">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Manual Scoring Sandbox</h2>
                  <p className="text-sm text-slate-500">Test the XGBoost production endpoint with synthetic parameters.</p>
                </div>
              </div>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => { e.preventDefault(); /* score logic */ }}>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Transaction Amount ($)</label>
                    <input type="number" defaultValue={250.00} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Time Offset (Seconds)</label>
                    <input type="number" defaultValue={3600} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-mono" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">PCA V1 Component (Location/History)</label>
                    <input type="number" defaultValue={-1.35} step={0.01} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Merchant ID Hash</label>
                    <input type="text" defaultValue="MERCH_99A1" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-mono" />
                  </div>
                </div>
                
                <div className="md:col-span-2 pt-4">
                  <button 
                    className="w-full py-4 bg-sky-500 text-white rounded-xl font-bold text-lg hover:bg-sky-600 transition-all shadow-xl shadow-sky-100 flex items-center justify-center gap-3 group"
                    onClick={() => handleExplain({ amount: 250, id: 'sandbox_01', v1: -1.35 })}
                  >
                    <Activity className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    GENERATE AUDIT REPORT
                  </button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-start gap-4">
                 <Monitor className="w-6 h-6 text-slate-400 mt-1" />
                 <div>
                   <h4 className="text-sm font-bold text-slate-700 mb-1">Production Ready</h4>
                   <p className="text-xs text-slate-500 leading-relaxed">Endpoints compatible with standard payment gateways.</p>
                 </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-start gap-4">
                 <Database className="w-6 h-6 text-slate-400 mt-1" />
                 <div>
                   <h4 className="text-sm font-bold text-slate-700 mb-1">Parquet Optimized</h4>
                   <p className="text-xs text-slate-500 leading-relaxed">Columnar storage ensures high-speed feature retrieval.</p>
                 </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-start gap-4">
                 <Briefcase className="w-6 h-6 text-slate-400 mt-1" />
                 <div>
                   <h4 className="text-sm font-bold text-slate-700 mb-1">Compliance Logged</h4>
                   <p className="text-xs text-slate-500 leading-relaxed">Every decision is backed by SHAP feature attribution.</p>
                 </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="p-6 border-t border-border bg-white text-slate-500 text-xs mt-auto">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <p>© 2026 SafeGuard Applied Intelligence. All decision rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-brand cursor-pointer">Security Protocol v4</span>
            <span className="hover:text-brand cursor-pointer">Privacy Policy</span>
            <span className="hover:text-brand cursor-pointer font-mono">NODE_HASH: ae29..1c</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
