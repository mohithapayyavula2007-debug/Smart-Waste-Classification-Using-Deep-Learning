import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { limit = '50', offset = '0', category_id } = req.query;
      let q = supabase.from('classifications').select('*').order('created_at', { ascending: false });
      if (category_id) q = q.eq('category_id', category_id);
      const { data, error } = await q.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { image_url, category_id, predicted_class, confidence, details } = req.body;
      const { data, error } = await supabase.from('classifications')
        .insert({ image_url, category_id, predicted_class, confidence, details: details || {} })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PATCH') {
      const { id, feedback, corrected_category } = req.body;
      const { data, error } = await supabase.from('classifications')
        .update({ feedback, corrected_category, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
