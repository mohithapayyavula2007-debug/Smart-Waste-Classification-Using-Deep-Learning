import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Activity, Target } from 'lucide-react';
import { StatsCard } from '../components/StatsCard';

interface CategoryDist {
  name: string;
  count: number;
  color: string;
}

interface StatsData {
  total: number;
  guidelines: number;
  categoryDistribution: CategoryDist[];
  confidenceAvg: number;
  recent: any[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#06b6d4', '#8b5cf6', '#ef4444', '#6366f1', '#64748b'];

export default function Analytics() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const chartData = stats?.categoryDistribution?.map(c => ({ name: c.name, value: c.count })) || [];
  const pieData = chartData.filter(d => d.value > 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
        <p className="text-slate-500 mt-1">Insights and performance metrics from waste classifications.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Total Classifications" value={loading ? '...' : stats?.total || 0} icon={Activity} color="bg-emerald-500" delay={0} />
        <StatsCard title="Avg Confidence" value={loading ? '...' : `${((stats?.confidenceAvg || 0) * 100).toFixed(1)}%`} icon={Target} color="bg-blue-500" delay={0.1} />
        <StatsCard title="Active Categories" value={loading ? '...' : (stats?.categoryDistribution?.filter(c => c.count > 0).length || 0)} icon={TrendingUp} color="bg-teal-500" delay={0.2} />
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading analytics...</p>
        </div>
      )}

      {!loading && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm"
          >
            <h3 className="font-semibold text-slate-900 mb-4">Category Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm"
          >
            <h3 className="font-semibold text-slate-900 mb-4">Classification Breakdown</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name || ''}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      )}

      {!loading && stats && stats.recent && stats.recent.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm"
        >
          <h3 className="font-semibold text-slate-900 mb-4">Recent Classifications</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 px-3 font-medium text-slate-500">Category</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-500">Confidence</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-500">Feedback</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((r, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                        {r.predicted_class}
                      </span>
                    </td>
                    <td className="py-2 px-3">{(r.confidence * 100).toFixed(1)}%</td>
                    <td className="py-2 px-3">
                      {r.feedback === 'correct' && <span className="text-green-600 text-xs font-medium">Correct</span>}
                      {r.feedback === 'incorrect' && <span className="text-red-600 text-xs font-medium">Incorrect</span>}
                      {!r.feedback && <span className="text-slate-400 text-xs">Pending</span>}
                    </td>
                    <td className="py-2 px-3 text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
