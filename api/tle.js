// This is a Vercel Serverless Function.
// It acts as a middleman: Frontend -> This Function -> Celestrak
// It strips away all CORS issues.

export default async function handler(request, response) {
  // Enable CORS for all requests
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }
  
  // Only allow GET requests
  if (request.method !== 'GET') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    // 1. Get the query parameters (e.g., ?GROUP=stations&FORMAT=tle)
    const queryString = new URLSearchParams(request.query).toString();
    
    if (!queryString) {
      response.status(400).json({ error: 'Missing query parameters' });
      return;
    }
    
    // 2. Construct the real URL
    // We target Celestrak directly. No public proxies needed.
    const targetUrl = `https://celestrak.org/NORAD/elements/gp.php?${queryString}`;

    console.log(`🛰️ Proxying request to: ${targetUrl}`);
    
    // 3. Fetch the data server-side
    const apiResponse = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'SDCRA-Satellite-Tracker/1.0 (https://sdcra.vercel.app)',
        'Accept': 'text/plain, application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!apiResponse.ok) {
      console.error(`❌ Celestrak responded with ${apiResponse.status}`);
      throw new Error(`Celestrak responded with ${apiResponse.status}: ${apiResponse.statusText}`);
    }

    const data = await apiResponse.text();
    
    // Validate that we got actual TLE data, not an error page
    if (data.includes('Access Denied') || data.includes('403 Forbidden') || data.includes('<!DOCTYPE html>')) {
      throw new Error('Celestrak returned access denied or error page');
    }

    console.log(`✅ Successfully fetched ${data.length} characters from Celestrak`);

    // 4. Return the data to your frontend with proper caching
    response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate'); // Cache for 5 mins speed
    response.status(200).type('text/plain').send(data);

  } catch (error) {
    console.error("❌ Proxy Error:", error);
    response.status(500).json({ 
      error: 'Failed to fetch satellite data',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
