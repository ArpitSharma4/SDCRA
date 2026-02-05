import { analyzeConjunction } from './orbitalMath';
import * as satellite from 'satellite.js';

// Test data for two Starlink satellites
const STARLINK_TLE1 = {
  line1: '1 44714U 99067BK  23343.73574192  .00001474  00000-0  37597-3 0  9997',
  line2: '2 44714  53.0547 280.9861 0001466  84.8285 275.2775 15.06395867391888'
};

const STARLINK_TLE2 = {
  line1: '1 44718U 99067BO  23343.73574192  .00001474  00000-0  37597-3 0  9997',
  line2: '2 44718  53.0547 280.9861 0001466  84.8285 275.2775 15.06395867391888'
};

export function testTwoPassAlgorithm() {
  console.log('🧪 Testing Two-Pass Algorithm...');
  
  try {
    // Create SatRec objects
    const sat1 = satellite.twoline2satrec(STARLINK_TLE1.line1, STARLINK_TLE1.line2);
    const sat2 = satellite.twoline2satrec(STARLINK_TLE2.line1, STARLINK_TLE2.line2);
    
    // Test with 24-hour timeframe
    const result = analyzeConjunction(sat1, sat2, 24);
    
    console.log('✅ Two-Pass Algorithm Test Results:');
    console.log(`   Min Distance: ${result.minDistanceKm} km`);
    console.log(`   Time of Closest Approach: ${result.timeOfClosestApproach?.toUTCString()}`);
    console.log(`   Risk Level: ${result.riskLevel}`);
    console.log(`   Calculation Duration: ${result.calculationDurationMs.toFixed(2)}ms`);
    
    return result;
  } catch (error) {
    console.error('❌ Two-Pass Algorithm Test Failed:', error);
    throw error;
  }
}
