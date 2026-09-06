import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { category_id, search } = req.query;
      let q = supabase.from('recycling_guidelines').select('*').order('sort_order', { ascending: true });
      if (category_id) q = q.eq('category_id', category_id);
      if (search) q = q.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
