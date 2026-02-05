import * as satellite from 'satellite.js';

// --- Types ---
export interface ConjunctionResult {
  minDistanceKm: number;
  timeOfClosestApproach: Date | null;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  calculationDurationMs: number; // useful for debugging performance
}

/**
 * Calculates the Euclidean distance (km) between two satellites at a specific time.
 */
const getDistanceAtTime = (
  sat1: satellite.SatRec,
  sat2: satellite.SatRec,
  time: Date
): number | null => {
  // Propagate
  const pos1 = satellite.propagate(sat1, time).position;
  const pos2 = satellite.propagate(sat2, time).position;

  // Validate propagation (satellite.js returns boolean on failure)
  if (
    !pos1 || !pos2 || 
    typeof pos1 === 'boolean' || typeof pos2 === 'boolean'
  ) {
    return null;
  
  }
  // Calculate 3D Distance (km)
  // satellite.js uses ECI coordinates in km
  const dx = (pos1 as satellite.EciVec3<number>).x - (pos2 as satellite.EciVec3<number>).x;
  const dy = (pos1 as satellite.EciVec3<number>).y - (pos2 as satellite.EciVec3<number>).y;
  const dz = (pos1 as satellite.EciVec3<number>).z - (pos2 as satellite.EciVec3<number>).z;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

/**
 * Sweeps through time to find the closest approach using a Two-Pass optimization.
 * * @param sat1Rec - Satellite 1 record
 * @param sat2Rec - Satellite 2 record
 * @param timeframeHours - Search window in hours
 */
export const analyzeConjunction = (
  sat1Rec: satellite.SatRec,
  sat2Rec: satellite.SatRec,
  timeframeHours: number
): ConjunctionResult => {
  const calcStart = performance.now();
  
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + timeframeHours * 60 * 60 * 1000);
  
  console.log(`🕐 Time-sweep: ${startTime.toUTCString()} to ${endTime.toUTCString()} (${timeframeHours} hours)`);
  
  let globalMinDist = Infinity;
  let timeOfClosest: Date | null = null;
  let iterations = 0;

  // ==========================================================
  // PASS 1: COARSE SCAN
  // Step size: 60 seconds (Good balance of speed vs accuracy)
  // ==========================================================
  const COARSE_STEP_MS = 60 * 1000;
  let roughTimeOfClosest = startTime;

  for (
    let t = startTime.getTime(); 
    t <= endTime.getTime(); 
    t += COARSE_STEP_MS
  ) {
    iterations++;
    const checkTime = new Date(t);
    const dist = getDistanceAtTime(sat1Rec, sat2Rec, checkTime);

    if (dist !== null && dist < globalMinDist) {
      globalMinDist = dist;
      roughTimeOfClosest = checkTime;
      console.log(`📍 New minimum: ${dist.toFixed(3)} km at ${checkTime.toUTCString()}`);
    }
  }

  console.log(`🔍 Coarse scan complete: ${iterations} iterations, best: ${globalMinDist.toFixed(3)} km`);

  // ==========================================================
  // PASS 2: FINE SCAN (Optimization)
  // Look 5 minutes before and after the rough time
  // Step size: 1 second (High precision)
  // ==========================================================
  const FINE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
  const FINE_STEP_MS = 1000; // 1 second

  // Define fine window boundaries
  const fineStart = Math.max(startTime.getTime(), roughTimeOfClosest.getTime() - FINE_WINDOW_MS);
  const fineEnd = Math.min(endTime.getTime(), roughTimeOfClosest.getTime() + FINE_WINDOW_MS);

  // Reset min distance to refine it in this window
  // (We keep the coarse result as a baseline, but we expect to beat it)
  let fineIterations = 0;
  
  for (
    let t = fineStart; 
    t <= fineEnd; 
    t += FINE_STEP_MS
  ) {
    fineIterations++;
    const checkTime = new Date(t);
    const dist = getDistanceAtTime(sat1Rec, sat2Rec, checkTime);

    if (dist !== null && dist < globalMinDist) {
      globalMinDist = dist;
      timeOfClosest = checkTime;
      console.log(`🎯 Fine scan improvement: ${dist.toFixed(3)} km at ${checkTime.toUTCString()}`);
    }
  }

  console.log(`🔬 Fine scan complete: ${fineIterations} iterations, final best: ${globalMinDist.toFixed(3)} km`);

  // Fallback: If fine pass didn't improve (unlikely), use coarse result
  if (!timeOfClosest) {
      timeOfClosest = roughTimeOfClosest;
  }

  // ==========================================================
  // RISK ASSESSMENT
  // ==========================================================
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  
  if (globalMinDist < 10) { 
      // < 10km is extremely close in space terms
      riskLevel = 'HIGH';
  } else if (globalMinDist < 100) {
      riskLevel = 'MEDIUM';
  }

  const calcEnd = performance.now();

  return {
    minDistanceKm: Number(globalMinDist.toFixed(3)),
    timeOfClosestApproach: timeOfClosest,
    riskLevel,
    calculationDurationMs: calcEnd - calcStart
  };
};
