export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;
  if (!TOKEN || !BASE_ID) return res.status(500).json({ error: 'Variables no configuradas' });

  // POST - crear registro
  if (req.method === 'POST') {
    const { table, fields } = req.body;
    if (!table || !fields) return res.status(400).json({ error: 'Faltan parametros' });
    try {
      const r = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields }),
        }
      );
      return res.status(r.ok ? 200 : r.status).json(await r.json());
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  // PATCH - actualizar registro existente
  if (req.method === 'PATCH') {
    const { table, id, fields } = req.body;
    if (!table || !id || !fields) return res.status(400).json({ error: 'Faltan parametros' });
    try {
      const r = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}/${id}`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields }),
        }
      );
      return res.status(r.ok ? 200 : r.status).json(await r.json());
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  // GET - leer registros
  const { table, offset } = req.query;
  if (!table) return res.status(400).json({ error: 'Falta el parametro table' });
  let url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}?pageSize=100`;
  if (offset) url += `&offset=${offset}`;
  try {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
    if (!r.ok) return res.status(r.status).json({ error: await r.text() });
    return res.status(200).json(await r.json());
  } catch (e) { return res.status(500).json({ error: e.message }); }
}
