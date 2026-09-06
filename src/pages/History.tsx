import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Filter, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Classification {
  id: number;
  image_url: string;
  predicted_class: string;
  confidence: number;
  feedback: string | null;
  created_at: string;
  waste_categories?: { name: string; color: string } | null;
}

export default function History() {
  const [items, setItems] = useState<Classification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');

  useEffect(() => {
    fetch('/api/classifications?limit=50')
      .then(r => r.json())
      .then(data => setItems(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(item => {
    if (filter === 'correct') return item.feedback === 'correct';
    if (filter === 'incorrect') return item.feedback === 'incorrect';
    return true;
  });

  const getCategoryColor = (category: string) => {
    if (category === 'Plastic') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (category === 'Paper/Cardboard') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (category === 'Metal') return 'bg-slate-50 text-slate-700 border-slate-200';
    if (category === 'Glass') return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    if (category === 'Organic/Food') return 'bg-green-50 text-green-700 border-green-200';
    if (category === 'Electronic') return 'bg-red-50 text-red-700 border-red-200';
    if (category === 'Textile') return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Classification History</h1>
          <p className="text-slate-500 mt-1">Review past classifications and provide feedback.</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All</option>
            <option value="correct">Correct</option>
            <option value="incorrect">Incorrect</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading history...</p>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200/60">
          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No classifications yet.</p>
          <p className="text-sm text-slate-400 mt-1">Go to Classify to start analyzing waste.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="aspect-video bg-slate-100 relative">
              <img
                src={item.image_url}
                alt="Classified waste"
                className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="absolute top-2 right-2">
                {item.feedback === 'correct' && <CheckCircle className="w-5 h-5 text-green-500 bg-white rounded-full" />}
                {item.feedback === 'incorrect' && <XCircle className="w-5 h-5 text-red-500 bg-white rounded-full" />}
                {!item.feedback && <AlertCircle className="w-5 h-5 text-slate-400 bg-white rounded-full" />}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(item.predicted_class)}`}>
                  {item.predicted_class}
                </span>
                <span className="text-xs text-slate-400">{(item.confidence * 100).toFixed(0)}%</span>
              </div>
              <p className="text-xs text-slate-400">
                {new Date(item.created_at).toLocaleString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
