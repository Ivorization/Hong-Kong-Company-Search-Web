// Vercel serverless proxy for Hong Kong Companies Registry API.
// Avoids 403/CORS when the browser calls the API directly.

const HK_API_BASE = 'https://data.cr.gov.hk/cr/api/api/v1/api_builder/json';

module.exports = async function handler(req, res) {
  // CORS: allow frontend (same origin on Vercel, or any for dev)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { source, q } = req.query;
  if (!source || !q || (source !== 'local' && source !== 'foreign')) {
    return res.status(400).json({ error: 'Missing or invalid query: source (local|foreign) and q required' });
  }

  const fieldName = source === 'local' ? 'Comp_name' : 'Corp_name_full';
  const params = new URLSearchParams({
    'query[0][key1]': fieldName,
    'query[0][key2]': 'begins_with',
    'query[0][key3]': String(q).trim(),
    format: 'json',
  });
  const url = `${HK_API_BASE}/${source}/search?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'HKCompanyFinder/1.0 (https://github.com/hk-company-search)',
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json(data || { error: response.statusText });
    }

    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(data);
  } catch (err) {
    console.error('Proxy error:', err.message);
    return res.status(502).json({ error: 'Proxy request failed', message: err.message });
  }
}
