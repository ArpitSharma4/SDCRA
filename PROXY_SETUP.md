# TLE Proxy Setup

## Problem
Celestrak TLE sources were blocking direct requests due to CORS policies and rate limiting.

## Solution
Implemented a Vite development proxy to bypass CORS issues and restore live TLE data fetching.

## Configuration

### Vite Config (vite.config.ts)
```typescript
server: {
  proxy: {
    '/api/celestrak': {
      target: 'https://celestrak.org',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/celestrak/, ''),
      secure: true,
    },
    '/api/celestrak-com': {
      target: 'https://www.celestrak.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/celestrak-com/, ''),
      secure: true,
    },
  },
}
```

### Updated TLE Sources
- All TLE URLs now use `/api/celestrak/...` instead of direct `https://celestrak.org/...`
- Proxy handles CORS headers and browser compatibility
- Fallback data still available if proxy fails

## Testing
1. Start dev server: `npm run dev`
2. Click "Test Proxy Connection" button in the UI
3. Check console for detailed logging

## Available Endpoints
- `/api/celestrak/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle` - Space Stations
- `/api/celestrak/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle` - Starlink Satellites
- `/api/celestrak/NORAD/elements/gp.php?GROUP=active&FORMAT=tle` - Active Satellites
- And more...

## Benefits
✅ Live TLE data restored
✅ CORS issues resolved
✅ Better error handling
✅ Detailed logging
✅ Fallback data still available
