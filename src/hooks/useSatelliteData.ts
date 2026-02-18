import { useState, useEffect, useCallback } from 'react';
import { getSatelliteGroup, SatelliteGroup } from '@/config/satelliteGroups';
import { parseTLEData } from '@/utils/satelliteUtils';

export interface SatelliteData {
  satellites: Map<string, any>;
  source: 'LIVE' | 'OFFLINE' | 'ERROR';
  isLoading: boolean;
  error: string | null;
  satelliteCount: number;
  group: SatelliteGroup | null;
}

export function useSatelliteData(categoryId: string | null): SatelliteData {
  const [data, setData] = useState<SatelliteData>({
    satellites: new Map(),
    source: 'ERROR',
    isLoading: false,
    error: null,
    satelliteCount: 0,
    group: null
  });

  const fetchSatelliteData = useCallback(async (id: string) => {
    const group = getSatelliteGroup(id);
    if (!group) {
      setData(prev => ({
        ...prev,
        error: `Unknown satellite category: ${id}`,
        isLoading: false,
        source: 'ERROR'
      }));
      return;
    }

    setData(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      group
    }));

    try {
      console.log(`🔄 Fetching satellite data for category: ${id}`);
      console.log(`🔗 Using proxy URL: ${group.proxyUrl}`);
      console.log(`🔗 CORS Proxy URL: ${group.corsProxyUrl}`);
      console.log(`🔗 Original URL: ${group.url}`);
      
      // Check if we're in production (no local server available)
      const isProduction = !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1');
      
      if (isProduction) {
        console.log('🌐 Production mode detected - using CORS proxy');
        // Strategy 1: Try CORS proxy directly for production
        try {
          console.log(`🔄 Trying CORS proxy: ${group.corsProxyUrl}`);
          
          let corsResponse = await fetch(group.corsProxyUrl, {
            method: 'GET',
            headers: {
              'Accept': 'text/plain, application/json',
              'Cache-Control': 'no-cache'
            },
            signal: AbortSignal.timeout(15000) // 15 second timeout for CORS proxy
          });

          console.log(`📊 CORS Proxy Response status: ${corsResponse.status}`);

          if (corsResponse.ok) {
            const text = await corsResponse.text();
            
            console.log(`✅ CORS Proxy data fetched: ${text.length} chars`);
            console.log(`📝 First 100 chars: ${text.substring(0, 100)}`);
            
            const satellites = parseTLEData(text, 'cors-proxy-live');
            
            setData({
              satellites,
              source: 'LIVE',
              isLoading: false,
              error: null,
              satelliteCount: satellites.size,
              group
            });
            return;
          }

          throw new Error(`CORS Proxy returned status ${corsResponse.status}`);

        } catch (corsError) {
          console.warn(`⚠️ CORS proxy failed for ${id}, trying fallback:`, corsError);
        }
      } else {
        console.log('🏠 Development mode detected - using local proxy');
        // Strategy 1: Try to fetch from our Vite proxy (for development)
        let response = await fetch(group.proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'text/plain, application/json',
            'Cache-Control': 'no-cache'
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        console.log(`📊 Response status: ${response.status} for ${group.proxyUrl}`);

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          
          if (contentType?.includes('application/json')) {
            // Proxy returned an error JSON
            const errorData = await response.json();
            throw new Error(errorData.message || 'Proxy error');
          } else {
            // Proxy returned TLE data successfully
            const text = await response.text();
            
            console.log(`✅ Live data fetched: ${text.length} chars`);
            console.log(`📝 First 100 chars: ${text.substring(0, 100)}`);
            
            const satellites = parseTLEData(text, 'proxy-live');
            
            setData({
              satellites,
              source: 'LIVE',
              isLoading: false,
              error: null,
              satelliteCount: satellites.size,
              group
            });
            return;
          }
        }

        throw new Error(`Proxy returned status ${response.status}`);
      }
      
        // Strategy 2: Fallback to local static file
      try {
        const fallbackUrl = `/${id}.txt`;
        console.log(`🔄 Trying fallback file: ${fallbackUrl}`);
        
        let fallbackResponse = await fetch(fallbackUrl, {
          method: 'GET',
          headers: { 'Accept': 'text/plain' },
          signal: AbortSignal.timeout(5000) // 5 second timeout for local file
        });

        if (!fallbackResponse.ok) {
          throw new Error(`Fallback file not found: ${fallbackResponse.status}`);
        }

        const text = await fallbackResponse.text();
        console.log(`✅ Fallback data loaded: ${text.length} chars`);
        
        const satellites = parseTLEData(text, 'fallback-file');
        
        setData({
          satellites,
          source: 'OFFLINE',
          isLoading: false,
          error: null,
          satelliteCount: satellites.size,
          group
        });

      } catch (fallbackError) {
        console.error(`❌ Both proxy and fallback failed for ${id}:`, fallbackError);
        
        // Strategy 3: Use hardcoded fallback data
        const hardcodedFallbacks = getHardcodedFallbacks(id);
        
        setData({
          satellites: hardcodedFallbacks,
          source: 'OFFLINE',
          isLoading: false,
          error: fallbackError instanceof Error ? fallbackError.message : 'Failed to fetch satellite data',
          satelliteCount: hardcodedFallbacks.size,
          group
        });
      }
    } catch (error) {
      console.error(`❌ Critical error in fetchSatelliteData:`, error);
      setData({
        satellites: new Map(),
        source: 'ERROR',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        satelliteCount: 0,
        group
      });
    }
  }, [getSatelliteGroup, parseTLEData]);

  // Helper function to get hardcoded fallback data
  const getHardcodedFallbacks = (id: string): Map<string, any> => {
    const fallbacks = new Map();
    
    // Define minimal fallback satellites for each category
    const fallbackData: Record<string, any[]> = {
      'stations': [
        {
          name: 'ISS (ZARYA)',
          tle1: '1 25544U 98067A   25030.12345678  .00000000  00000+0  00000+0 0  9997',
          tle2: '2 25544  51.6400 000.0000 0000000  00.0000 000.0000 15.49512345678901',
          source: 'hardcoded-fallback'
        }
      ],
      'starlink': [
        {
          name: 'STARLINK-1008',
          tle1: '1 44714U 99067BK  23343.73574192  .00001474  00000-0  37597-3 0  9997',
          tle2: '2 44714  53.0547 280.9861 0001466  84.8285 275.2775 15.06395867391888',
          source: 'hardcoded-fallback'
        },
        {
          name: 'STARLINK-1012',
          tle1: '1 44718U 99067BO  23343.73574192  .00001474  00000-0  37597-3 0  9997',
          tle2: '2 44718  53.0547 280.9861 0001466  84.8285 275.2775 15.06395867391888',
          source: 'hardcoded-fallback'
        }
      ],
      'gnss': [
        {
          name: 'GPS BIIR-5 (PRN 15)',
          tle1: '1 26360U 00025A   25030.12345678  .00000000  00000+0  00000+0 0  9997',
          tle2: '2 26360  55.0000 000.0000 0000000  00.0000 000.0000 2.00561234567890',
          source: 'hardcoded-fallback'
        }
      ],
      'iridium-33-debris': [
        {
          name: 'IRIDIUM 33 DEBRIS',
          tle1: '1 35939U 99049C   25030.12345678  .00000000  00000+0  00000+0 0  9997',
          tle2: '2 35939  86.4000 000.0000 0000000  00.0000 000.0000 14.34261234567890',
          source: 'hardcoded-fallback'
        }
      ]
    };
    
    const satellites = fallbackData[id] || fallbackData['stations']; // Default to stations
    
    satellites.forEach((sat, index) => {
      fallbacks.set(`fallback-${index}`, sat);
    });
    
    return fallbacks;
  };

  // Fetch data when categoryId changes
 useEffect(() => {
  if (!categoryId) return;

  // ➤ ADD THIS BLOCK: Immediately wipe old data when category changes
  setData(prev => ({
    ...prev,
    satellites: new Map(), // <--- This kills the "ghost" satellites
    isLoading: true,
    error: null
  }));

  fetchSatelliteData(categoryId);
}, [categoryId, fetchSatelliteData]);

  return data;
}
