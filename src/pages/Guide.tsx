import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, AlertTriangle, CheckCircle2, Recycle } from 'lucide-react';

interface Guideline {
  id: number;
  title: string;
  description: string;
  category_id: number;
  hazard_level: 'low' | 'medium' | 'high';
  recyclability: 'recyclable' | 'not_recyclable' | 'special';
  tips: string[];
}

interface Category {
  id: number;
  name: string;
  color: string;
  icon_name: string;
}

export default function Guide() {
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/guidelines').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ])
      .then(([g, c]) => {
        setGuidelines(g || []);
        setCategories(c || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = guidelines.filter(g => {
    const matchesSearch = !search || g.title.toLowerCase().includes(search.toLowerCase()) || g.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || g.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getHazardColor = (level: string) => {
    if (level === 'high') return 'bg-red-50 text-red-700 border-red-200';
    if (level === 'medium') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-green-50 text-green-700 border-green-200';
  };

  const getRecyclabilityColor = (r: string) => {
    if (r === 'recyclable') return 'text-green-600';
    if (r === 'not_recyclable') return 'text-red-600';
    return 'text-amber-600';
  };

  const getRecyclabilityIcon = (r: string) => {
    if (r === 'recyclable') return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (r === 'not_recyclable') return <AlertTriangle className="w-4 h-4 text-red-600" />;
    return <Recycle className="w-4 h-4 text-amber-600" />;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Recycling Guide</h1>
        <p className="text-slate-500 mt-1">Learn how to properly dispose and recycle different types of waste.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search guidelines..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select
          value={selectedCategory || ''}
          onChange={e => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
          className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading guidelines...</p>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200/60">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No guidelines found.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((g, i) => (
          <motion.div
            key={g.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-slate-900">{g.title}</h3>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getHazardColor(g.hazard_level)}`}>
                  {g.hazard_level} hazard
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-3">{g.description}</p>
            <div className="flex items-center gap-2 mb-3">
              {getRecyclabilityIcon(g.recyclability)}
              <span className={`text-sm font-medium capitalize ${getRecyclabilityColor(g.recyclability)}`}>
                {g.recyclability.replace('_', ' ')}
              </span>
            </div>
            {g.tips && g.tips.length > 0 && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Tips</p>
                <ul className="space-y-1">
                  {g.tips.map((tip, j) => (
                    <li key={j} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
