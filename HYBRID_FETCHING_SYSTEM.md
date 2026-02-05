# Hybrid Data Fetching System

## Overview
Implemented a robust 3-tier Hybrid Data Fetching System to solve Celestrak IP bans and CORS issues permanently.

## Architecture

### 1. Vercel Serverless Proxy (`api/tles.ts`)
**Purpose**: Serverless middleman that hides user IPs and caches responses

**Features**:
- **IP Masking**: Requests come from Vercel's servers, not user IPs
- **Proper Headers**: Uses browser-like headers to avoid detection
- **Caching**: 2-hour cache with stale-while-revalidate for performance
- **Timeout Protection**: 15-second timeout prevents hanging requests
- **Error Handling**: Returns structured JSON errors with 500 status codes
- **CORS Support**: Handles preflight OPTIONS requests

**Endpoints**:
```
GET /api/tles?group=stations
GET /api/tles?group=starlink
GET /api/tles?group=active
... (all satellite categories)
```

**Response Headers**:
```
Cache-Control: s-maxage=7200, stale-while-revalidate=86400
X-Data-Source: LIVE
X-Group: stations
X-Satellite-Count: 15
```

### 2. Custom React Hook (`src/hooks/useSatelliteData.ts`)
**Purpose**: Manages fetching logic with intelligent fallback strategy

**3-Tier Strategy**:
1. **Live Data** (`/api/tles?group=...`) - Try serverless proxy first
2. **Local Files** (`/starlink.txt`) - Fall back to static files
3. **Hardcoded Data** - Ultimate fallback with minimal satellites

**Return Object**:
```typescript
{
  satellites: Map<string, any>,
  source: 'LIVE' | 'OFFLINE' | 'ERROR',
  isLoading: boolean,
  error: string | null,
  satelliteCount: number,
  group: SatelliteGroup | null
}
```

**Features**:
- **Auto-retry**: Automatic fallback when proxy fails
- **Timeout Protection**: Different timeouts for each tier
- **Error Recovery**: Graceful degradation with user feedback
- **Caching Integration**: Works with existing TLE cache system

### 3. Enhanced Configuration (`src/config/satelliteGroups.ts`)
**Purpose**: Maps categories to both remote URLs and local fallback files

**Enhanced Interface**:
```typescript
export interface SatelliteGroup {
  id: string;
  name: string;
  description: string;
  url: string;           // Original Celestrak URL
  proxyUrl: string;      // Serverless proxy URL
  fallbackFile: string;  // Local static file
  color: string;
  icon: string;
}
```

### 4. UI Integration (`src/pages/OrbitRiskPage.tsx`)
**Purpose**: Visual feedback for data source status

**Visual Indicators**:
- 🟢 **Live Data Badge** - Green badge with WiFi icon
- ⚠️ **Offline Mode Badge** - Yellow badge with WiFiOff icon  
- ❌ **Error Badge** - Red badge for complete failures

**Smart Interactions**:
- Auto-selects first two satellites when data loads
- Disables inputs when no data available
- Shows satellite count and loading status
- Clear error messages and feedback

## Static Fallback Files

**Created Files**:
- `/public/stations.txt` - Space stations (ISS, Tiangong)
- `/public/starlink.txt` - Starlink satellites
- `/public/gnss.txt` - GPS/GNSS satellites
- `/public/weather.txt` - Weather satellites

**File Format**: Standard TLE format with name and two-line elements

## Benefits

### ✅ **Reliability**
- **Never Crashes**: 3-tier fallback ensures app always works
- **IP Protection**: Serverless proxy prevents user IP bans
- **Graceful Degradation**: Smooth transitions between data sources

### ✅ **Performance**
- **2-Hour Caching**: Reduces server load and improves speed
- **Stale-While-Revalidate**: Serves cached data while refreshing
- **Local Fallbacks**: Instant fallback to static files

### ✅ **User Experience**
- **Visual Feedback**: Clear indicators of data source status
- **Auto-Selection**: Smart satellite selection on load
- **Error Recovery**: Automatic fallback without user intervention

### ✅ **Developer Experience**
- **Simple Hook**: One-line integration with useSatelliteData
- **Type Safety**: Full TypeScript support
- **Debugging**: Detailed logging and error reporting

## Usage Example

```typescript
// In any component
const satelliteData = useSatelliteData('starlink');

// Access data
console.log(satelliteData.satellites); // Map of satellites
console.log(satelliteData.source);     // 'LIVE' | 'OFFLINE' | 'ERROR'
console.log(satelliteData.isLoading);  // boolean
```

## Deployment Notes

### **Vercel Deployment**
- Serverless functions automatically deployed
- Edge caching enabled for 2 hours
- CORS headers configured properly

### **Local Development**
- Static files served from `/public` folder
- Fallback system works without serverless functions
- Full functionality during development

### **Monitoring**
- Response headers include data source info
- Console logging for debugging
- Error tracking with structured messages

## Future Enhancements

- **Real-time Updates**: WebSocket for live satellite positions
- **Custom Categories**: User-defined satellite groups
- **Historical Data**: Time-series satellite tracking
- **Advanced Caching**: Redis for distributed caching
- **Multiple Sources**: Additional TLE providers integration

This system ensures the Space Debris Collision Risk Analyser works reliably regardless of Celestrak availability or network restrictions.
