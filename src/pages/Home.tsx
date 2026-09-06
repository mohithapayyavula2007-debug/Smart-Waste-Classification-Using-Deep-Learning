import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Camera, ArrowRight, Zap, Shield, Globe } from 'lucide-react';
import { StatsCard } from '../components/StatsCard';

export default function Home() {
  const [stats, setStats] = useState({ total: 0, guidelines: 0, confidenceAvg: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => {
        setStats({
          total: data.total || 0,
          guidelines: data.guidelines || 0,
          confidenceAvg: data.confidenceAvg || 0,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white px-8 py-16 sm:px-12">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4"
          >
            Smart Waste Classification
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-emerald-50 mb-8"
          >
            Using deep learning to identify waste types instantly. Upload an image or use your camera to classify waste and learn how to recycle it properly.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              to="/classify"
              className="inline-flex items-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-colors shadow-lg"
            >
              <Camera className="w-5 h-5" />
              Start Classifying
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Live Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            title="Total Classifications"
            value={loading ? '...' : stats.total}
            icon={Zap}
            color="bg-emerald-500"
            delay={0}
          />
          <StatsCard
            title="Recycling Guidelines"
            value={loading ? '...' : stats.guidelines}
            icon={Shield}
            color="bg-teal-500"
            delay={0.1}
          />
          <StatsCard
            title="Avg Confidence"
            value={loading ? '...' : `${(stats.confidenceAvg * 100).toFixed(1)}%`}
            icon={Globe}
            color="bg-blue-500"
            delay={0.2}
          />
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Upload Image', desc: 'Drag & drop or capture a photo of waste material.' },
            { step: '2', title: 'AI Analysis', desc: 'Deep learning model (MobileNet) classifies the waste type instantly.' },
            { step: '3', title: 'Recycle Guide', desc: 'Get detailed recycling instructions and disposal guidelines.' },
          ].map((f, i) => (
            <motion.div
              key={f.step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mb-3">
                {f.step}
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{f.title}</h3>
              <p className="text-sm text-slate-500">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
