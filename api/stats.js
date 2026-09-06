import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const [totalRes, categoriesRes, guidelinesRes, recentRes] = await Promise.all([
      supabase.from('classifications').select('*', { count: 'exact', head: true }),
      supabase.from('waste_categories').select('*, classifications(count)'),
      supabase.from('recycling_guidelines').select('*', { count: 'exact', head: true }),
      supabase.from('classifications').select('*, waste_categories(name, color)').order('created_at', { ascending: false }).limit(10),
    ]);

    const total = totalRes.count || 0;
    const categories = categoriesRes.data || [];
    const guidelines = guidelinesRes.count || 0;
    const recent = recentRes.data || [];

    const categoryDistribution = categories.map(c => ({
      name: c.name,
      count: c.classifications?.[0]?.count || 0,
      color: c.color,
    }));

    const confidenceAvg = recent.length > 0 ? recent.reduce((a, b) => a + (b.confidence || 0), 0) / recent.length : 0;

    return res.status(200).json({ total, guidelines, categoryDistribution, confidenceAvg, recent });
  } catch (err) {
    console.error('Stats API error:', err);
    res.status(500).json({ error: err.message });
  }
}
