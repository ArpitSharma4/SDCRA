import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🧪 Testing direct Celestrak access...');
  
  try {
    // Test with a simple URL
    const testUrl = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle';
    
    console.log(`📡 Testing URL: ${testUrl}`);
    
    const response = await fetch(testUrl, {
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
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📊 Response Headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error Response: ${errorText}`);
      
      return NextResponse.json({
        success: false,
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: testUrl,
        timestamp: new Date().toISOString()
      });
    }

    const text = await response.text();
    const lineCount = text.split('\n').length;
    const satelliteCount = text.split('\n').filter(line => line.trim().startsWith('1 ')).length;

    console.log(`✅ Success! Got ${lineCount} lines, ${satelliteCount} satellites`);

    return NextResponse.json({
      success: true,
      status: response.status,
      lineCount,
      satelliteCount,
      url: testUrl,
      timestamp: new Date().toISOString(),
      firstFewLines: text.split('\n').slice(0, 6).join('\n')
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
