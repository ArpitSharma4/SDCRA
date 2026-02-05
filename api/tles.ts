import { NextRequest, NextResponse } from 'next/server';

// Map group names to Celestrak URLs
const CELESTRAK_URLS: Record<string, string> = {
  'stations': 'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle',
  'starlink': 'https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle',
  'active': 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle',
  'gnss': 'https://celestrak.org/NORAD/elements/gp.php?GROUP=gnss&FORMAT=tle',
  'weather': 'https://celestrak.org/NORAD/elements/gp.php?GROUP=weather&FORMAT=tle',
  'communications': 'https://celestrak.org/NORAD/elements/gp.php?GROUP=communications&FORMAT=tle',
  '1999-025': 'https://celestrak.org/NORAD/elements/gp.php?GROUP=1999-025&FORMAT=tle',
  'iridium-33-debris': 'https://celestrak.org/NORAD/elements/gp.php?GROUP=iridium-33-debris&FORMAT=tle',
  'amateur': 'https://celestrak.org/NORAD/elements/gp.php?GROUP=amateur&FORMAT=tle',
  'gps-ops': 'https://celestrak.org/NORAD/elements/gp.php?GROUP=gps-ops&FORMAT=tle'
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const group = searchParams.get('group');

  // Validate group parameter
  if (!group || !CELESTRAK_URLS[group]) {
    return NextResponse.json(
      { error: 'Invalid group parameter', validGroups: Object.keys(CELESTRAK_URLS) },
      { status: 400 }
    );
  }

  const targetUrl = CELESTRAK_URLS[group];

  try {
    console.log(`🛰️ Fetching TLE data for group: ${group} from ${targetUrl}`);

    // Fetch data from Celestrak with proper headers
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/plain,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0',
        'Upgrade-Insecure-Requests': '1'
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(15000) // 15 second timeout
    });

    if (!response.ok) {
      console.error(`❌ Celestrak returned status ${response.status} for group ${group}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    
    if (!text || text.trim().length === 0) {
      console.error(`❌ Empty response from Celestrak for group ${group}`);
      throw new Error('Empty response from Celestrak');
    }

    console.log(`✅ Successfully fetched ${text.length} characters for group ${group}`);

    // Return the TLE data with caching headers
    return new NextResponse(text, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 's-maxage=7200, stale-while-revalidate=86400', // 2 hours cache, 24 hours stale
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'X-Data-Source': 'LIVE',
        'X-Group': group,
        'X-Satellite-Count': text.split('\n').filter(line => line.trim().startsWith('1 ')).length.toString()
      }
    });

  } catch (error) {
    console.error(`❌ Error fetching TLE data for group ${group}:`, error);
    
    // Return error response
    return NextResponse.json(
      { 
        error: 'Failed to fetch TLE data',
        group,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache',
          'X-Data-Source': 'ERROR'
        }
      }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
