import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle, ArrowRight } from 'lucide-react';

interface ClassificationResultProps {
  category: string;
  confidence: number;
  topPredictions: Array<{ className: string; probability: number }>;
  onFeedback: (feedback: 'correct' | 'incorrect') => void;
  feedback?: string | null;
}

export function ClassificationResultComponent({
  category,
  confidence,
  topPredictions,
  onFeedback,
  feedback,
}: ClassificationResultProps) {
  const getCategoryIcon = () => {
    if (category === 'Plastic') return <AlertCircle className="w-6 h-6 text-blue-500" />;
    if (category === 'Paper/Cardboard') return <AlertCircle className="w-6 h-6 text-amber-500" />;
    if (category === 'Metal') return <AlertCircle className="w-6 h-6 text-slate-500" />;
    if (category === 'Glass') return <AlertCircle className="w-6 h-6 text-cyan-500" />;
    if (category === 'Organic/Food') return <CheckCircle className="w-6 h-6 text-green-500" />;
    if (category === 'Electronic') return <XCircle className="w-6 h-6 text-red-500" />;
    if (category === 'Textile') return <AlertCircle className="w-6 h-6 text-purple-500" />;
    return <AlertCircle className="w-6 h-6 text-slate-400" />;
  };

  const getCategoryColor = () => {
    if (category === 'Plastic') return 'bg-blue-50 border-blue-200 text-blue-800';
    if (category === 'Paper/Cardboard') return 'bg-amber-50 border-amber-200 text-amber-800';
    if (category === 'Metal') return 'bg-slate-50 border-slate-200 text-slate-800';
    if (category === 'Glass') return 'bg-cyan-50 border-cyan-200 text-cyan-800';
    if (category === 'Organic/Food') return 'bg-green-50 border-green-200 text-green-800';
    if (category === 'Electronic') return 'bg-red-50 border-red-200 text-red-800';
    if (category === 'Textile') return 'bg-purple-50 border-purple-200 text-purple-800';
    return 'bg-slate-50 border-slate-200 text-slate-800';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-4">
        {getCategoryIcon()}
        <div>
          <h3 className="text-lg font-bold text-slate-900">{category}</h3>
          <p className="text-sm text-slate-500">Confidence: {(confidence * 100).toFixed(1)}%</p>
        </div>
      </div>

      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border mb-4 ${getCategoryColor()}`}>
        <ArrowRight className="w-4 h-4" />
        {category === 'General Waste' ? 'Dispose as General Waste' : `Recycle as ${category}`}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Top Predictions</p>
        {topPredictions.map((pred, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pred.probability * 100}%` }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
            <span className="text-xs text-slate-600 w-24 text-right truncate">{pred.className}</span>
            <span className="text-xs font-medium text-slate-900 w-12 text-right">{(pred.probability * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <p className="text-sm text-slate-600 mb-3">Was this classification correct?</p>
        <div className="flex gap-2">
          <button
            onClick={() => onFeedback('correct')}
            disabled={!!feedback}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              feedback === 'correct'
                ? 'bg-green-100 text-green-700'
                : 'bg-slate-100 text-slate-700 hover:bg-green-50 hover:text-green-700'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Yes
          </button>
          <button
            onClick={() => onFeedback('incorrect')}
            disabled={!!feedback}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              feedback === 'incorrect'
                ? 'bg-red-100 text-red-700'
                : 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-700'
            }`}
          >
            <XCircle className="w-4 h-4" />
            No
          </button>
        </div>
      </div>
    </motion.div>
  );
}
