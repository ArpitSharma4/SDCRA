# Satellite Categories Expansion

## Overview
Expanded the Space Debris Collision Risk Analyser to support all major satellite categories, not just Starlink.

## New Features

### 1. Satellite Group Configuration (`src/config/satelliteGroups.ts`)
- **8 Satellite Categories** with display names, icons, and colors:
  - 🛰️ **Space Stations** - ISS, Tiangong, and other space stations
  - 📡 **Starlink** - SpaceX Starlink satellite constellation
  - 🗺️ **GPS / GNSS** - GPS, GLONASS, Galileo, and other navigation satellites
  
### 2. Enhanced Data Service (`src/utils/satelliteUtils.ts`)
- **`fetchTLEGroup(groupKey)`** - Fetch TLE data for specific satellite groups
- **`getRandomSatellitesFromGroup()`** - Get random satellites for testing
- **`getSatellitesByNamePattern()`** - Filter satellites by name pattern
- **Proxy Integration** - All groups use the existing proxy system
- **Fallback Support** - Graceful error handling when groups fail to load

### 3. Updated UI (`src/pages/OrbitRiskPage.tsx`)
- **Category Dropdown** - Beautiful selector with icons and descriptions
- **Auto-Selection** - Automatically selects first two satellites when category loads
- **Loading States** - Shows loading status while fetching satellite data
- **Satellite Count** - Displays number of loaded satellites
- **Smart Disabling** - Disables inputs when no satellites are available

### 4. Proxy Configuration (`vite.config.ts`)
- **Multiple Endpoints** - Supports both celestrak.org and celestrak.com
- **Enhanced Logging** - Detailed request/response logging
- **Error Handling** - Better error reporting for debugging

## Technical Implementation

### Category Selection Flow
1. User selects category from dropdown
2. System fetches TLE data via proxy
3. Satellites are parsed and cached
4. First two satellites are auto-selected
5. User can manually change satellite IDs
6. Analysis uses Two-Pass Algorithm with live data

### Performance Optimizations
- **Efficient Parsing** - Optimized TLE parsing for large datasets
- **Smart Caching** - 6-hour cache for TLE data
- **Lazy Loading** - Only loads data when category is selected
- **Memory Management** - Clears previous data before loading new category

### Error Handling
- **Graceful Degradation** - Falls back to cached data if live fetch fails
- **User Feedback** - Clear error messages and loading states
- **Fallback Data** - Built-in fallback satellites for testing

## Usage

### Basic Usage
1. Select satellite category from dropdown
2. Wait for satellites to load (shows count)
3. Adjust satellite IDs if desired
4. Set timeframe
5. Click "Analyze Risk"

### Advanced Usage
- **Debris Analysis** - Select debris categories for collision risk
- **Navigation Satellites** - Analyze GPS/GNSS constellation conflicts
- **Weather Monitoring** - Check weather satellite conjunctions
- **Station Safety** - Monitor space station approach risks

## Benefits

✅ **Comprehensive Coverage** - All major satellite types supported
✅ **Live Data** - Real-time TLE data via proxy
✅ **User-Friendly** - Intuitive category selection
✅ **Performance Optimized** - Handles thousands of satellites efficiently
✅ **Robust Error Handling** - Graceful fallbacks and clear feedback
✅ **Scalable** - Easy to add new satellite categories

## Future Enhancements
- Satellite visualization by category
- Batch analysis for multiple satellites
- Historical conjunction analysis
- Custom category creation
- Real-time collision alerts
