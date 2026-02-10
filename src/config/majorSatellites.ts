export interface MajorSatellite {
  id: string; // NORAD ID
  name: string;
  type: 'Station' | 'Telescope' | 'Satellite' | 'Constellation';
  description?: string;
}

export const MAJOR_SATELLITES: MajorSatellite[] = [
  // Space Stations
  { id: '25544', name: 'ISS (ZARYA)', type: 'Station', description: 'International Space Station' },
  { id: '48274', name: 'TIANGONG', type: 'Station', description: 'Chinese Space Station' },

  // Telescopes
  { id: '20580', name: 'HUBBLE', type: 'Telescope', description: 'Hubble Space Telescope' },

  // Key Satellites
  { id: '27386', name: 'ENVISAT', type: 'Satellite', description: 'Environmental Satellite' },
  { id: '49260', name: 'LANDSAT 9', type: 'Satellite', description: 'Earth Observation' },
  { id: '27424', name: 'AQUA', type: 'Satellite', description: 'Earth Science' },
  { id: '25994', name: 'TERRA', type: 'Satellite', description: 'Earth Science' },

  // Starlink Subset (Recent/Bright ones)
  // Note: Starlink IDs change as new ones are launched, these are example IDs from recent batches or known bright ones.
  // We'll use a few representative ones. 
  // Ideally, we'd fetch "Starlink" category and sort by brightness, but for now specific IDs are safer for a "VIP" list.
  { id: '44714', name: 'STARLINK-1008', type: 'Constellation' },
  { id: '44718', name: 'STARLINK-1012', type: 'Constellation' },
  { id: '44723', name: 'STARLINK-1017', type: 'Constellation' },
  { id: '44835', name: 'STARLINK-1029', type: 'Constellation' },
  { id: '53544', name: 'STARLINK-4652', type: 'Constellation' }, // Example newer one
];
