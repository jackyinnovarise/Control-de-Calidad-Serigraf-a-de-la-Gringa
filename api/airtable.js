export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;

  if (!TOKEN || !BASE_ID) {
    return res.status(500).json({ error: 'Variables de entorno no configuradas' });
  }

  // POST - escribir log de acceso
  if (req.method === 'POST') {
    const { table, fields } = req.body;
    if (!table || !fields) return res.status(400).json({ error: 'Faltan parametros' });
    try {
      const response = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fields }),
        }
      );
      const data = await response.json();
      return res.status(response.ok ? 200 : response.status).json(data);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // GET - leer registros
  const { table, offset } = req.query;
  if (!table) return res.status(400).json({ error: 'Falta el parametro table' });

  let url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}?pageSize=100`;
  if (offset) url += `&offset=${offset}`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
