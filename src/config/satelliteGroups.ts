// Satellite group configuration mapping display names to Celestrak Group URLs
export interface SatelliteGroup {
  id: string;
  name: string;
  description: string;
  url: string;
  proxyUrl: string;
  corsProxyUrl: string;
  fallbackFile: string;
  color: string;
  icon: string;
}

export const satelliteGroups: SatelliteGroup[] = [
  {
    id: 'stations',
    name: 'Space Stations',
    description: '',
    url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle',
    proxyUrl: '/api/celestrak/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle',
    corsProxyUrl: `https://corsproxy.io/?${encodeURIComponent('https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle')}`,
    fallbackFile: '/stations.txt',
    color: '#FF6B6B',
    icon: 'Satellite'
  },
  {
    id: 'starlink',
    name: 'Starlink',
    description: '',
    url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle',
    proxyUrl: '/api/celestrak/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle',
    corsProxyUrl: `https://corsproxy.io/?${encodeURIComponent('https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle')}`,
    fallbackFile: '/starlink.txt',
    color: '#00D4FF',
    icon: 'Satellite'
  },
  {
    id: 'gnss',
    name: 'GPS / GNSS',
    description: '',
    url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=gnss&FORMAT=tle',
    proxyUrl: '/api/celestrak/NORAD/elements/gp.php?GROUP=gnss&FORMAT=tle',
    corsProxyUrl: `https://corsproxy.io/?${encodeURIComponent('https://celestrak.org/NORAD/elements/gp.php?GROUP=gnss&FORMAT=tle')}`,
    fallbackFile: '/gnss.txt',
    color: '#4ECDC4',
    icon: 'MapPin'
  },
  {
    id: 'iridium-33-debris',
    name: 'Iridium 33 Debris',
    description: '',
    url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=iridium-33-debris&FORMAT=tle',
    proxyUrl: '/api/celestrak/NORAD/elements/gp.php?GROUP=iridium-33-debris&FORMAT=tle',
    corsProxyUrl: `https://corsproxy.io/?${encodeURIComponent('https://celestrak.org/NORAD/elements/gp.php?GROUP=iridium-33-debris&FORMAT=tle')}`,
    fallbackFile: '/iridium-33-debris.txt',
    color: '#FF69B4',
    icon: 'Zap'
  }
];

// Helper function to get group by ID
export function getSatelliteGroup(id: string): SatelliteGroup | undefined {
  return satelliteGroups.find(group => group.id === id);
}

// Helper function to get group options for dropdown
export function getSatelliteGroupOptions() {
  return satelliteGroups.map(group => ({
    value: group.id,
    label: `${group.icon} ${group.name}`,
    description: group.description
  }));
}

// Default group for initial load
export const DEFAULT_SATELLITE_GROUP = 'stations';
