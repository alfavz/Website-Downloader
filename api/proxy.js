// api/proxy.js — Vercel Serverless Function
// Semua request dari frontend di-forward ke API Fareza/Hazel

const ALLOWED_HOSTS = [
  'api.fareza.eu.cc',
  'zelapi.eu.cc',
];

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { target } = req.query;
  if (!target) return res.status(400).json({ error: 'Missing target param' });

  let targetUrl;
  try {
    targetUrl = new URL(decodeURIComponent(target));
  } catch {
    return res.status(400).json({ error: 'Invalid target URL' });
  }

  // Whitelist host
  if (!ALLOWED_HOSTS.includes(targetUrl.hostname)) {
    return res.status(403).json({ error: 'Host not allowed' });
  }

  // Inject Hazel API key dari env jika ke zelapi
  if (targetUrl.hostname === 'zelapi.eu.cc') {
    const key = process.env.HAZEL_APIKEY;
    if (key) targetUrl.searchParams.set('apikey', key);
  }

  try {
    const upstream = await fetch(targetUrl.toString(), {
      headers: { 'User-Agent': 'alfavz-dl/1.0' },
    });

    const contentType = upstream.headers.get('content-type') || 'application/json';
    const body = await upstream.text();

    res.setHeader('Content-Type', contentType);
    // Cache 30 detik di edge — hemat invocation
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(upstream.status).send(body);
  } catch (e) {
    return res.status(502).json({ error: 'Upstream error', detail: e.message });
  }
}
