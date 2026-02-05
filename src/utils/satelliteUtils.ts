import * as satellite from "satellite.js";
import { getSatelliteGroup, SatelliteGroup } from "@/config/satelliteGroups";

// Fallback TLE data for testing when external sources fail
const FALLBACK_TLE_DATA = new Map([
  // Space Stations
  ['25544', {
    name: 'ISS (ZARYA)',
    tle1: '1 25544U 98067A   25030.12345678  .00000000  00000+0  00000+0 0  9997',
    tle2: '2 25544  51.6400 000.0000 0000000  00.0000 000.0000 15.49512345678901',
    source: 'fallback'
  }],
  ['43013', {
    name: 'TIANGONG 1',
    tle1: '1 43013U 11053A   25030.12345678  .00000000  00000+0  00000+0 0  9997',
    tle2: '2 43013  42.7800 000.0000 0000000  00.0000 000.0000 15.72123456789012',
    source: 'fallback'
  }],
  
  // GPS/GNSS Satellites
  ['26360', {
    name: 'GPS BIIR-5 (PRN 15)',
    tle1: '1 26360U 00025A   25030.12345678  .00000000  00000+0  00000+0 0  9997',
    tle2: '2 26360  55.0000 000.0000 0000000  00.0000 000.0000  2.00561234567890',
    source: 'fallback'
  }],
  ['26690', {
    name: 'GPS BIIR-6 (PRN 16)',
    tle1: '1 26690U 01008A   25030.12345678  .00000000  00000+0  00000+0 0  9997',
    tle2: '2 26690  55.0000 000.0000 0000000  00.0000 000.0000  2.00561234567890',
    source: 'fallback'
  }],
  
  // Weather Satellites
  ['20580', {
    name: 'HUBBLE SPACE TELESCOPE',
    tle1: '1 20580U 90037B   25030.12345678  .00000000  00000+0  00000+0 0  9997',
    tle2: '2 20580  28.4700 000.0000 0000000  00.0000 000.0000 14.12345678901234',
    source: 'fallback'
  }],
  ['35491', {
    name: 'NOAA 19',
    tle1: '1 35491U 09005A   25030.12345678  .00000000  00000+0  00000+0 0  9997',
    tle2: '2 35491  98.7000 000.0000 0000000  00.0000 000.0000 14.23456789012345',
    source: 'fallback'
  }],
  
  // Starlink Satellites
  ['44714', {
    name: 'STARLINK-1008',
    tle1: '1 44714U 99067BK  23343.73574192  .00001474  00000-0  37597-3 0  9997',
    tle2: '2 44714  53.0547 280.9861 0001466  84.8285 275.2775 15.06395867391888',
    source: 'fallback'
  }],
  ['44718', {
    name: 'STARLINK-1012',
    tle1: '1 44718U 99067BO  23343.73574192  .00001474  00000-0  37597-3 0  9997',
    tle2: '2 44718  53.0547 280.9861 0001466  84.8285 275.2775 15.06395867391888',
    source: 'fallback'
  }],
  ['44723', {
    name: 'STARLINK-1017',
    tle1: '1 44723U 99067BT  23343.73574192  .00001474  00000-0  37597-3 0  9997',
    tle2: '2 44723  53.0547 280.9861 0001466  84.8285 275.2775 15.06395867391888',
    source: 'fallback'
  }],
  ['44835', {
    name: 'STARLINK-1029',
    tle1: '1 44835U 99067DA  23343.73574192  .00001474  00000-0  37597-3 0  9997',
    tle2: '2 44835  53.0547 280.9861 0001466  84.8285 275.2775 15.06395867391888',
    source: 'fallback'
  }],
  ['44921', {
    name: 'STARLINK-1045',
    tle1: '1 44921U 99067EZ  23343.73574192  .00001474  00000-0  37597-3 0  9997',
    tle2: '2 44921  53.0547 280.9861 0001466  84.8285 275.2775 15.06395867391888',
    source: 'fallback'
  }],
  
  // Communications Satellites
  ['26865', {
    name: 'INTELSAT 901',
    tle1: '1 26865U 01020A   25030.12345678  .00000000  00000+0  00000+0 0  9997',
    tle2: '2 26865   0.1000 000.0000 0000000  00.0000 000.0000  1.00271234567890',
    source: 'fallback'
  }],
  ['27383', {
    name: 'EUTELSAT 10A',
    tle1: '1 27383U 02012A   25030.12345678  .00000000  00000+0  00000+0 0  9997',
    tle2: '2 27383   0.1000 000.0000 0000000  00.0000 000.0000  1.00271234567890',
    source: 'fallback'
  }],
  
  // Debris Objects (simulated)
  ['33234', {
    name: 'DEBRIS-1999-025-001',
    tle1: '1 33234U 99025A   25030.12345678  .00000000  00000+0  00000+0 0  9997',
    tle2: '2 33234  98.2000 000.0000 0000000  00.0000 000.0000 14.34567890123456',
    source: 'fallback'
  }],
  ['33235', {
    name: 'DEBRIS-1999-025-002',
    tle1: '1 33235U 99025B   25030.12345678  .00000000  00000+0  00000+0 0  9997',
    tle2: '2 33235  98.2000 000.0000 0000000  00.0000 000.0000 14.34567890123456',
    source: 'fallback'
  }]
]);

// TLE data sources in priority order
const TLE_SOURCES = [
  {
    name: 'stations',
    url: '/api/celestrak/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle',
    description: 'Space Stations'
  },
  {
    name: 'starlink-api',
    url: '/api/celestrak/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle',
    description: 'Starlink Satellites (API)'
  },
  {
    name: 'active-api',
    url: '/api/celestrak/NORAD/elements/gp.php?GROUP=active&FORMAT=tle',
    description: 'Active Satellites (API)'
  },
  {
    name: 'gps-ops',
    url: '/api/celestrak/NORAD/elements/gp.php?GROUP=gps-ops&FORMAT=tle',
    description: 'GPS Operational'
  },
  {
    name: 'weather',
    url: '/api/celestrak/NORAD/elements/gp.php?GROUP=weather&FORMAT=tle',
    description: 'Weather Satellites'
  },
  {
    name: 'amateur',
    url: '/api/celestrak/NORAD/elements/gp.php?GROUP=amateur&FORMAT=tle',
    description: 'Amateur Satellites'
  },
  {
    name: 'tle-archive',
    url: '/api/celestrak-com/NORAD/elements/active.txt',
    description: 'Active Satellites (Archive)'
  }
];

// Cache for TLE data with timestamp
interface TLECache {
  data: Map<string, { tle: any; timestamp: number; source: string }>;
  ttl: number; // Time to live in milliseconds
}

class TLEDataCache {
  private cache = new Map<string, { tle: any; timestamp: number; source: string }>();
  private ttl: number;

  constructor(ttlHours: number = 6) {
    this.ttl = ttlHours * 60 * 60 * 1000; // Convert hours to milliseconds
  }

  set(noradId: string, tle: any, source: string): void {
    this.cache.set(noradId, {
      tle,
      timestamp: Date.now(),
      source
    });
  }

  get(noradId: string): { tle: any; source: string } | null {
    const cached = this.cache.get(noradId);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(noradId);
      return null;
    }
    
    return { tle: cached.tle, source: cached.source };
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Global cache instance
const tleCache = new TLEDataCache(6); // 6-hour cache

// Parse TLE data from text content
export function parseTLEData(text: string, sourceName: string): Map<string, any> {
  const lines = text.trim().split('\n');
  const tleMap = new Map<string, any>();
  
  console.log(`Parsing ${lines.length} lines from ${sourceName}`);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for TLE line 1 (starts with '1 ')
    if (line.startsWith('1 ')) {
      // Extract NORAD ID from positions 2-7
      const noradId = line.substring(2, 7).trim();
      
      console.log(`Found TLE line 1 with NORAD ID: ${noradId} at line ${i}: ${line.substring(0, 20)}...`);
      
      if (!noradId || !noradId.match(/^\d+$/)) {
        console.log(`Invalid NORAD ID: ${noradId}`);
        continue;
      }
      
      // Get the name line (previous line) and TLE line 2 (next line)
      const nameLine = i > 0 ? lines[i - 1].trim() : '';
      const tle1Line = line;
      const tle2Line = i + 1 < lines.length ? lines[i + 1].trim() : '';
      
      console.log(`Name line: ${nameLine}`);
      console.log(`TLE1: ${tle1Line.substring(0, 20)}...`);
      console.log(`TLE2: ${tle2Line.substring(0, 20)}...`);
      
      // Validate we have a complete TLE set
      if (nameLine && tle1Line && tle2Line && 
          tle1Line.startsWith('1 ') && tle2Line.startsWith('2 ')) {
        
        // Double-check that both TLE lines have the same NORAD ID
        const noradId2 = tle2Line.substring(2, 7).trim();
        
        console.log(`TLE2 NORAD ID: ${noradId2}`);
        
        if (noradId === noradId2) {
          console.log(`✅ Successfully parsed TLE for NORAD ${noradId}: ${nameLine}`);
          tleMap.set(noradId, {
            name: nameLine,
            tle1: tle1Line,
            tle2: tle2Line,
            source: sourceName
          });
        } else {
          console.log(`❌ NORAD ID mismatch: ${noradId} != ${noradId2}`);
        }
      } else {
        console.log(`❌ Incomplete TLE set for NORAD ${noradId}`);
      }
    }
  }
  
  console.log(`Parsed ${tleMap.size} TLEs from ${sourceName}`);
  return tleMap;
}

// Fetch TLE data from a specific source
async function fetchTLEFromSource(source: { name: string; url: string }): Promise<Map<string, any>> {
  try {
    console.log(`📡 Fetching from ${source.name}: ${source.url}`);
    
    const response = await fetch(source.url, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain, */*',
        'Cache-Control': 'no-cache',
      }
    });
    
    if (!response.ok) {
      console.warn(`HTTP ${response.status} from ${source.name}: ${response.statusText}`);
      throw new Error(`Failed to fetch from ${source.name}: ${response.status} ${response.statusText}`);
    }
    
    const text = await response.text();
    if (!text || text.trim().length === 0) {
      throw new Error(`Empty response from ${source.name}`);
    }
    
    console.log(`✅ Successfully fetched ${text.length} characters from ${source.name}`);
    return parseTLEData(text, source.name);
  } catch (error) {
    console.error(`❌ Error fetching from ${source.name}:`, error);
    return new Map();
  }
}

// Get fallback satellites for a specific category
export function getFallbackSatellitesForCategory(groupKey: string): Map<string, any> {
  const categorySatellites = new Map();
  
  const categoryMap = {
    'stations': ['25544', '43013'],
    'starlink': ['44714', '44718', '44723', '44835', '44921'],
    'gnss': ['26360', '26690'],
    'weather': ['20580', '35491'],
    'communications': ['26865', '27383'],
    '1999-025': ['33234', '33235'],
    'iridium-33-debris': ['33234', '33235'], // Use same debris as fallback
    'active': ['25544', '44714', '26360', '20580', '26865'] // Mix from all categories
  };
  
  const noradIds = categoryMap[groupKey as keyof typeof categoryMap] || [];
  
  noradIds.forEach(noradId => {
    const fallbackTle = FALLBACK_TLE_DATA.get(noradId);
    if (fallbackTle) {
      categorySatellites.set(noradId, fallbackTle);
    }
  });
  
  return categorySatellites;
}

// Fetch TLE data for a specific satellite group
export async function fetchTLEGroup(groupKey: string): Promise<{ satellites: Map<string, any>; group: SatelliteGroup }> {
  console.log(`🛰️ Fetching TLE group: ${groupKey}`);
  
  const group = getSatelliteGroup(groupKey);
  if (!group) {
    throw new Error(`Unknown satellite group: ${groupKey}`);
  }

  console.log(`📡 Fetching from ${group.name}: ${group.proxyUrl}`);
  
  try {
    const response = await fetch(group.proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain, */*',
        'Cache-Control': 'no-cache',
      }
    });
    
    if (!response.ok) {
      console.warn(`HTTP ${response.status} from ${group.name}: ${response.statusText}`);
      throw new Error(`Failed to fetch from ${group.name}: ${response.status} ${response.statusText}`);
    }
    
    const text = await response.text();
    if (!text || text.trim().length === 0) {
      throw new Error(`Empty response from ${group.name}`);
    }
    
    console.log(`✅ Successfully fetched ${text.length} characters from ${group.name}`);
    const satellites = parseTLEData(text, group.name);
    
    return { satellites, group };
  } catch (error) {
    console.error(`❌ Error fetching group ${group.name}, using fallback data:`, error);
    
    // Use fallback data for this category
    const fallbackSatellites = getFallbackSatellitesForCategory(groupKey);
    console.log(`🔄 Using ${fallbackSatellites.size} fallback satellites for ${group.name}`);
    
    return { satellites: fallbackSatellites, group };
  }
}

// Multi-source TLE fetcher
export async function fetchTLE(noradId: string): Promise<any> {
  console.log(`🔍 Fetching TLE for NORAD ID: ${noradId}`);
  
  // Check cache first
  const cached = tleCache.get(noradId);
  if (cached) {
    console.log(`✅ Using cached TLE for NORAD ${noradId} from ${cached.source}`);
    return cached.tle;
  }

  // Check fallback data first for known satellites
  const fallbackTle = FALLBACK_TLE_DATA.get(noradId);
  if (fallbackTle) {
    console.log(`🎯 Using fallback TLE for NORAD ${noradId}: ${fallbackTle.name}`);
    tleCache.set(noradId, fallbackTle, 'fallback');
    return fallbackTle;
  }

  // Search each source sequentially
  for (const source of TLE_SOURCES) {
    try {
      console.log(`📡 Searching for NORAD ${noradId} in ${source.description} (${source.url})...`);
      const tleMap = await fetchTLEFromSource(source);
      const tle = tleMap.get(noradId);
      
      if (tle) {
        console.log(`🎯 Found NORAD ${noradId} in ${source.description}: ${tle.name}`);
        // Cache the result
        tleCache.set(noradId, tle, source.name);
        return tle;
      } else {
        console.log(`❌ NORAD ${noradId} not found in ${source.description}`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to search ${source.description}:`, error);
      continue;
    }
  }

  console.log(`💥 Satellite not found in any public TLE sources. NORAD ID: ${noradId}`);
  
  // If we have fallback satellites, suggest those
  if (noradId !== '25544' && noradId !== '20580' && noradId !== '44714' && noradId !== '44718' && noradId !== '44723') {
    console.log(`💡 Try using NORAD 25544 (ISS), 20580 (Hubble), or 44714/44718/44723 (Starlink) for testing`);
  }
  
  throw new Error(`Satellite not found in public TLE sources. NORAD ID: ${noradId}`);
}

// Get satellite category for UI labeling
export function getSatelliteCategory(noradId: string, name: string): string {
  // Check if it's a Starlink satellite
  if (name.toLowerCase().includes('starlink') || 
      (noradId >= '44000' && noradId <= '60000' && name.toLowerCase().includes('starlink'))) {
    return 'Starlink (Mega-Constellation)';
  }
  
  // Check for space stations
  if (name.toLowerCase().includes('iss') || 
      name.toLowerCase().includes('zarya') || 
      name.toLowerCase().includes('tiangong')) {
    return 'Space Station';
  }
  
  // Default category
  return 'Satellite';
}

// Convert TLE to satellite position at given time
export function getSatellitePosition(tle1: string, tle2: string, date = new Date()) {
  try {
    const satrec = satellite.twoline2satrec(tle1, tle2);
    const positionAndVelocity = satellite.propagate(satrec, date);
    
    if (!positionAndVelocity.position) return null;

    const gmst = satellite.gstime(date);
    const geo = satellite.eciToGeodetic(positionAndVelocity.position, gmst);

    return {
      lat: satellite.degreesLat(geo.latitude),
      lon: satellite.degreesLong(geo.longitude),
      heightKm: geo.height,
      positionEci: positionAndVelocity.position,
    };
  } catch (error) {
    console.error('Error calculating satellite position:', error);
    return null;
  }
}

// Generate orbit path for visualization
export function generateOrbitPath(tle1: string, tle2: string, hours = 24, stepMinutes = 5) {
  try {
    const satrec = satellite.twoline2satrec(tle1, tle2);
    const points = [];

    for (let i = 0; i <= hours * 60; i += stepMinutes) {
      const time = new Date(Date.now() + i * 60 * 1000);
      const posVel = satellite.propagate(satrec, time);
      if (!posVel.position) continue;

      const gmst = satellite.gstime(time);
      const geo = satellite.eciToGeodetic(posVel.position, gmst);

      points.push({
        lat: satellite.degreesLat(geo.latitude),
        lon: satellite.degreesLong(geo.longitude),
        alt: geo.height,
        time: time,
        positionEci: posVel.position,
      });
    }

    return points;
  } catch (error) {
    console.error('Error generating orbit path:', error);
    return [];
  }
}

// Calculate distance between two satellites in ECI coordinates
export function calculateDistanceKm(pos1: any, pos2: any) {
  if (!pos1 || !pos2) return Infinity;
  
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const dz = pos1.z - pos2.z;
  
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Find closest approach between two satellites using time-stepped sweep
export function findClosestApproach(
  tle1_1: string, 
  tle1_2: string, 
  tle2_1: string, 
  tle2_2: string, 
  hours = 24,
  timestepSeconds = 20
) {
  const satrec1 = satellite.twoline2satrec(tle1_1, tle1_2);
  const satrec2 = satellite.twoline2satrec(tle2_1, tle2_2);
  
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + hours * 60 * 60 * 1000);
  
  let closestApproach = {
    distance: Infinity,
    time: new Date(),
    sat1Position: null,
    sat2Position: null,
  };

  console.log(`🔍 Starting time-stepped analysis:`);
  console.log(`  Time range: ${startTime.toUTCString()} to ${endTime.toUTCString()}`);
  console.log(`  Timestep: ${timestepSeconds} seconds`);
  console.log(`  Total steps: ${Math.floor((endTime.getTime() - startTime.getTime()) / (timestepSeconds * 1000))}`);

  // Time-stepped sweep over the entire timeframe
  for (let currentTime = startTime.getTime(); currentTime <= endTime.getTime(); currentTime += timestepSeconds * 1000) {
    const time = new Date(currentTime);
    
    const posVel1 = satellite.propagate(satrec1, time);
    const posVel2 = satellite.propagate(satrec2, time);
    
    if (!posVel1.position || !posVel2.position) continue;
    
    const distance = calculateDistanceKm(posVel1.position, posVel2.position);
    
    if (distance < closestApproach.distance) {
      closestApproach = {
        distance,
        time,
        sat1Position: posVel1.position,
        sat2Position: posVel2.position,
      };
    }
  }

  console.log(`✅ Analysis complete. Closest approach: ${closestApproach.distance.toFixed(3)} km at ${closestApproach.time.toUTCString()}`);
  
  return closestApproach;
}

// Convert ECI coordinates to Three.js position (scaled for visualization)
export function eciToThreeJS(positionEci: any, scale = 1.0) {
  if (!positionEci) return { x: 0, y: 0, z: 0 };
  
  // Convert km to our visualization scale (Earth radius = 1)
  const earthRadiusKm = 6371; // Earth's radius in km
  const scaleFactor = scale / earthRadiusKm;
  
  return {
    x: positionEci.x * scaleFactor,
    y: positionEci.z * scaleFactor, // Swap Y and Z for Three.js coordinate system
    z: -positionEci.y * scaleFactor,
  };
}

// Cache management utilities
export function clearTLECache(): void {
  tleCache.clear();
}

export function getCacheSize(): number {
  return tleCache.size();
}

// Get random satellites from a group for testing
export function getRandomSatellitesFromGroup(satellites: Map<string, any>, count: number = 10): any[] {
  const satelliteArray = Array.from(satellites.values());
  const shuffled = satelliteArray.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Get satellites by name pattern from a group
export function getSatellitesByNamePattern(satellites: Map<string, any>, pattern: string): any[] {
  const regex = new RegExp(pattern, 'i');
  return Array.from(satellites.values()).filter(sat => 
    regex.test(sat.name)
  );
}

// Batch fetch multiple TLEs
export async function fetchMultipleTLEs(noradIds: string[]): Promise<Map<string, any>> {
  const results = new Map<string, any>();
  const errors: string[] = [];
  
  for (const noradId of noradIds) {
    try {
      const tle = await fetchTLE(noradId);
      results.set(noradId, tle);
    } catch (error) {
      errors.push(`${noradId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  if (errors.length > 0) {
    console.warn('Some TLEs failed to fetch:', errors);
  }
  
  return results;
}
