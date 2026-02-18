// api/tle.js
import fetch from 'node-fetch'; // Explicit import to prevent "fetch is not defined" errors

export default async function handler(request, response) {
  // 1. Setup CORS headers
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request (Preflight)
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
    const { GROUP, FORMAT } = request.query;
    
    // Default to 'stations' if no group provided
    const group = GROUP || 'stations';
    const format = FORMAT || 'tle';
    
    const targetUrl = `https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=${format}`;
    
    console.log(`[VERCEL] 🛰️ Fetching TLE from: ${targetUrl}`);
    console.log(`[VERCEL] 📊 Request query:`, request.query);

    const apiResponse = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'SDCRA-Satellite-Tracker/1.0 (https://sdcra.vercel.app)',
        'Accept': 'text/plain, application/json',
        'Cache-Control': 'no-cache'
      },
      timeout: 30000 // 30 second timeout
    });

    if (!apiResponse.ok) {
      console.error(`[VERCEL] ❌ Celestrak responded with status: ${apiResponse.status}`);
      throw new Error(`Celestrak responded with status: ${apiResponse.status} ${apiResponse.statusText}`);
    }

    const data = await apiResponse.text();
    
    console.log(`[VERCEL] ✅ Successfully fetched ${data.length} characters from Celestrak`);
    console.log(`[VERCEL] 📝 First 100 chars: ${data.substring(0, 100)}`);

    // Validate that we got actual TLE data, not an error page
    if (data.includes('Access Denied') || data.includes('403 Forbidden') || data.includes('<!DOCTYPE html>')) {
      console.error(`[VERCEL] ❌ Celestrak returned access denied or HTML error page`);
      throw new Error('Celestrak returned access denied or error page');
    }

    // Cache for 5 minutes to prevent hitting Celestrak rate limits
    response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    
    response.status(200).type('text/plain').send(data);

  } catch (error) {
    console.error("[VERCEL ERROR] ❌", error);
    console.error("[VERCEL ERROR] 📋 Details:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    response.status(500).json({ 
      error: 'Failed to fetch satellite data', 
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
