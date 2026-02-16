import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wifi, WifiOff, Play, Terminal, Search } from 'lucide-react';
import { Earth3D } from '@/components/Earth3D';
import { OrbitalHUD } from '@/components/OrbitalHUD';
import React from 'react';
import { getSatellitePosition, generateOrbitPath, getSatelliteCategory } from '@/utils/satelliteUtils';
import { analyzeConjunction, ConjunctionResult } from '@/utils/orbitalMath';
import * as satellite from 'satellite.js';
import { getSatelliteGroupOptions, DEFAULT_SATELLITE_GROUP } from '@/config/satelliteGroups';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSatelliteData } from '@/hooks/useSatelliteData';
import { Badge } from '@/components/ui/badge';

export function OrbitRiskPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Form states
  const [satellite1, setSatellite1] = useState('');
  const [satellite2, setSatellite2] = useState('');
  const [timeframe, setTimeframe] = useState('24');
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_SATELLITE_GROUP);
  
  // Use the new satellite data hook
  const satelliteData = useSatelliteData(selectedCategory);
  
  // Real satellite data states
  const [satellite1Data, setSatellite1Data] = useState<any>(null);
  const [satellite2Data, setSatellite2Data] = useState<any>(null);
  const [satellite1Category, setSatellite1Category] = useState<string>('');
  const [satellite2Category, setSatellite2Category] = useState<string>('');
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Track if user is manually editing to prevent auto-selection override
  const [userIsEditing, setUserIsEditing] = useState(false);

  const getCurrentSatelliteDetails = useCallback((noradId: string) => {
    if (!noradId) return null;
    const tle = satelliteData.satellites.get(noradId);
    if (!tle) return null;

    const category = getSatelliteCategory(noradId, tle.name);

    let inclinationDeg: number | null = null;
    let altitudeKm: number | null = null;

    try {
      const satrec = satellite.twoline2satrec(tle.tle1, tle.tle2);
      inclinationDeg = (satrec.inclo * 180) / Math.PI;

      const now = new Date();
      const propagated = satellite.propagate(satrec, now);
      const pos = propagated.position;
      if (pos && typeof pos !== 'boolean') {
        const x = (pos as satellite.EciVec3<number>).x;
        const y = (pos as satellite.EciVec3<number>).y;
        const z = (pos as satellite.EciVec3<number>).z;
        const rKm = Math.sqrt(x * x + y * y + z * z);
        altitudeKm = rKm - 6371;
      }
    } catch {
      // Ignore parsing/propagation errors; UI will show nulls
    }

    return {
      name: tle.name as string,
      category,
      inclinationDeg,
      altitudeKm,
    };
  }, [satelliteData.satellites]);

  const satellite1Details = getCurrentSatelliteDetails(satellite1);
  const satellite2Details = getCurrentSatelliteDetails(satellite2);

  const handleAnalyzeRisk = useCallback(async () => {
    if (!satellite1 || !satellite2) {
      setError('Please enter both NORAD IDs');
      return;
    }

    // Check if satellites exist in loaded data
    const sat1Data = satelliteData.satellites.get(satellite1);
    const sat2Data = satelliteData.satellites.get(satellite2);
    
    if (!sat1Data || !sat2Data) {
      setError(`Satellites not found in loaded data. Available: ${Array.from(satelliteData.satellites.keys()).join(', ')}`);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setShowResults(false);
    
    try {
      // Clear previous results immediately
      setAnalysisResults(null);
      setSatellite1Data(null);
      setSatellite2Data(null);
      setSatellite1Category('');
      setSatellite2Category('');
      
      // Use the already loaded TLE data
      const tle1 = sat1Data;
      const tle2 = sat2Data;

      // Get satellite categories
      const category1 = getSatelliteCategory(satellite1, tle1.name);
      const category2 = getSatelliteCategory(satellite2, tle2.name);
      setSatellite1Category(category1);
      setSatellite2Category(category2);

      // Find closest approach using Two-Pass Algorithm
      const timeframeHours = parseInt(timeframe);
      console.log("Analyze Triggered with:");
      console.log("  Satellite 1 ID:", satellite1);
      console.log("  Satellite 2 ID:", satellite2);
      console.log("  Satellite 1 Data:", sat1Data ? "Loaded" : "Missing");
      console.log("  Satellite 2 Data:", sat2Data ? "Loaded" : "Missing");
      console.log("  Timeframe (hours):", timeframeHours); // <--- THIS MUST CHANGE when you change inputs
      console.log("  Timeframe String:", timeframe);
      console.log("  Parsed Timeframe:", timeframeHours);
      console.log(`Starting Two-Pass analysis for ${tle1.name} & ${tle2.name} over ${timeframeHours} hours`);
      
      // Create SatRec objects
      const sat1 = satellite.twoline2satrec(tle1.tle1, tle1.tle2);
      const sat2 = satellite.twoline2satrec(tle2.tle1, tle2.tle2);
      
      // Run the Two-Pass Algorithm
      const conjunctionResult: ConjunctionResult = analyzeConjunction(sat1, sat2, timeframeHours);
      
      console.log(`Two-Pass analysis complete: ${conjunctionResult.minDistanceKm} km at ${conjunctionResult.timeOfClosestApproach?.toUTCString()} (${conjunctionResult.calculationDurationMs.toFixed(2)}ms)`);

      // Get current positions
      const now = new Date();
      const pos1 = getSatellitePosition(tle1.tle1, tle1.tle2, now);
      const pos2 = getSatellitePosition(tle2.tle1, tle2.tle2, now);

      // Generate orbit paths for visualization
      const orbit1Path = generateOrbitPath(tle1.tle1, tle1.tle2, timeframeHours);
      const orbit2Path = generateOrbitPath(tle2.tle1, tle2.tle2, timeframeHours);

      // Determine risk level using Two-Pass results
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = conjunctionResult.riskLevel;
      let riskReasons = [];
      
      if (conjunctionResult.minDistanceKm < 1) {
        riskLevel = 'HIGH';
        riskReasons.push('Miss distance < 1 km');
      } else if (conjunctionResult.minDistanceKm < 5) {
        riskLevel = 'MEDIUM';
        riskReasons.push('Miss distance < 5 km');
      } else {
        riskReasons.push('Miss distance > 5 km');
      }

      if (conjunctionResult.minDistanceKm < 10) {
        riskReasons.push('Close encounter detected');
      }

      // Add category-specific risk factors
      if (category1 === 'Starlink (Mega-Constellation)' || category2 === 'Starlink (Mega-Constellation)') {
        riskReasons.push('Starlink mega-constellation environment');
      }

      // Add timeframe-specific information
      riskReasons.push(`Analyzed over ${timeframeHours}-hour period`);
      
      // Check for repeating approaches (same orbital plane)
      if (category1 === 'Starlink (Mega-Constellation)' && category2 === 'Starlink (Mega-Constellation)') {
        riskReasons.push('Same constellation - potential periodic approaches');
      }

      setSatellite1Data({ ...tle1, currentPosition: pos1, orbitPath: orbit1Path });
      setSatellite2Data({ ...tle2, currentPosition: pos2, orbitPath: orbit2Path });
      
      const newResults = {
        riskLevel,
        closestApproachDistance: conjunctionResult.minDistanceKm.toFixed(3),
        timeOfClosestApproach: conjunctionResult.timeOfClosestApproach?.toUTCString() || 'Unknown',
        riskReasons,
        satellite1Name: tle1.name,
        satellite2Name: tle2.name,
        satellite1Category: category1,
        satellite2Category: category2,
        timeframeHours: timeframeHours,
        analysisTime: new Date().toUTCString(),
        calculationDurationMs: conjunctionResult.calculationDurationMs,
      };

      setAnalysisResults(newResults);
      setShowResults(true);
      
      console.log(`Analysis complete: ${newResults.closestApproachDistance} km at ${newResults.timeOfClosestApproach}`);
      
      // Scroll to results after analysis
      setTimeout(() => {
        const resultsElement = document.getElementById('analysis-results');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      // Clear all results on error
      setShowResults(false);
      setAnalysisResults(null);
      setSatellite1Data(null);
      setSatellite2Data(null);
      setSatellite1Category('');
      setSatellite2Category('');
    } finally {
      setIsAnalyzing(false);
    }
  }, [satellite1, satellite2, timeframe]);

  const clearResults = React.useCallback(() => {
    setShowResults(false);
    setAnalysisResults(null);
    setSatellite1Data(null);
    setSatellite2Data(null);
    setSatellite1Category('');
    setSatellite2Category('');
    setError(null);
  }, []);

  const handleSatellite1Change = useCallback((value: string) => {
    setUserIsEditing(true);
    setSatellite1(value);
    clearResults();
  }, [clearResults]);

  const handleSatellite2Change = useCallback((value: string) => {
    setUserIsEditing(true);
    setSatellite2(value);
    clearResults();
  }, [clearResults]);

  const handleTimeframeChange = useCallback((value: string) => {
    setTimeframe(value);
    clearResults();
  }, [clearResults]);

  const handleCategoryChange = useCallback(async (categoryKey: string) => {
    console.log(`Changing satellite category to: ${categoryKey}`);
    
    setSelectedCategory(categoryKey);
    setError(null);
    setUserIsEditing(false); // Reset editing flag when category changes
    
    // Clear previous results and satellites
    clearResults();
    setSatellite1('');  // Clear leftover satellite IDs
    setSatellite2('');  // Clear leftover satellite IDs
    
    // The hook will automatically load data and we'll auto-select when ready
  }, [clearResults]);

  // Auto-select first two satellites when data is loaded (only if inputs are empty)
  useEffect(() => {
    // 1. STOP if data is still loading
    if (satelliteData.isLoading) return;

    // 2. STOP if user is manually editing
    if (userIsEditing) return;

    // 3. STOP if we don't have enough satellites to select
    if (satelliteData.satellites.size < 2) return;

    // 4. Only auto-select if BOTH inputs are completely empty
    if (!satellite1 && !satellite2) {
      const ids = Array.from(satelliteData.satellites.keys());
      setSatellite1(ids[0]);
      setSatellite2(ids[1]);
      console.log(`Auto-selected satellites: ${ids[0]} and ${ids[1]}`);
    }
  }, [satelliteData.satellites, satelliteData.isLoading, satellite1, satellite2, userIsEditing]);

  // Load default satellite category on component mount
  useEffect(() => {
    handleCategoryChange(DEFAULT_SATELLITE_GROUP);
  }, []); // Only run once on mount

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 overflow-hidden font-mono pt-16 lg:pt-20">
      {/* Main Content - Three Column Layout */}
      <div className="container mx-auto px-4 py-4 h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)]">
        <div className="grid grid-cols-12 gap-4 h-full">
          
          {/* Left Panel - Target & Live Feed (25% width) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="col-span-3 space-y-3"
          >
            {/* Target Input */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-lg p-3">
              <h3 className="text-xs font-bold tracking-wider text-cyan-400 uppercase mb-2">Target Acquisition</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-[10px] text-slate-400 uppercase tracking-wider">Satellite Category</Label>
                  <Select value={selectedCategory} onValueChange={handleCategoryChange} disabled={satelliteData.isLoading}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white font-mono text-xs mt-1 h-8">
                      <SelectValue placeholder="Select satellite category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {getSatelliteGroupOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-slate-400">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {satelliteData.isLoading && (
                    <p className="text-[10px] text-slate-400 mt-1">Loading satellites...</p>
                  )}
                  {satelliteData.satellites.size > 0 && !satelliteData.isLoading && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400">
                        Loaded {satelliteData.satellites.size} satellites
                      </p>
                      <div className="flex items-center gap-2">
                        {satelliteData.source === 'LIVE' && (
                          <Badge variant="secondary" className="text-[10px] bg-emerald-900 text-emerald-200 border-emerald-700">
                            <Wifi className="w-3 h-3 mr-1" />
                            Live Data
                          </Badge>
                        )}
                        {satelliteData.source === 'ERROR' && (
                          <Badge variant="destructive" className="text-[10px]">
                            <WifiOff className="w-3 h-3 mr-1" />
                            Error
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <Label className="text-[10px] text-slate-400 uppercase tracking-wider">NORAD ID</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={satellite1}
                      onChange={(e) => handleSatellite1Change(e.target.value)}
                      disabled={satelliteData.isLoading}
                      className="bg-slate-800/50 border-slate-700 text-white font-mono text-xs h-8"
                      placeholder={satelliteData.satellites.size === 0 ? "Load satellite data first..." : "Enter ID..."}
                    />
                    <Button 
                      size="sm"
                      disabled={satelliteData.isLoading}
                      className="btn-glass text-slate-200 px-3 h-8"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                  {satelliteData.satellites.size === 0 && !satelliteData.isLoading && (
                    <p className="text-[10px] text-yellow-400 mt-1">⚠ Select a satellite category above to load data</p>
                  )}
                </div>
                
                <div>
                  <Label className="text-[10px] text-slate-400 uppercase tracking-wider">Secondary Object</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={satellite2}
                      onChange={(e) => handleSatellite2Change(e.target.value)}
                      disabled={satelliteData.isLoading}
                      className="bg-slate-800/50 border-slate-700 text-white font-mono text-xs h-8"
                      placeholder={satelliteData.satellites.size === 0 ? "Load satellite data first..." : "Enter ID..."}
                    />
                    <Button 
                      size="sm"
                      disabled={satelliteData.isLoading}
                      className="btn-glass text-slate-200 px-3 h-8"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                  {satelliteData.satellites.size === 0 && !satelliteData.isLoading && (
                    <p className="text-[10px] text-yellow-400 mt-1">⚠ Select a satellite category above to load data</p>
                  )}
                </div>
              </div>
            </div>

            {/* Target Details */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-lg p-3">
              <h3 className="text-xs font-bold tracking-wider text-cyan-400 uppercase mb-2">Target Details</h3>
              <div className="space-y-3 text-xs">
                <div className="pb-2 border-b border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Primary</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Name:</span>
                      <span className="text-white">{satellite1Details?.name ?? '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Altitude:</span>
                      <span className="text-white">
                        {typeof satellite1Details?.altitudeKm === 'number' ? `${satellite1Details.altitudeKm.toFixed(0)} km` : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Inclination:</span>
                      <span className="text-white">
                        {typeof satellite1Details?.inclinationDeg === 'number' ? `${satellite1Details.inclinationDeg.toFixed(1)}°` : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Category:</span>
                      <span className="text-white">{satellite1Details?.category ?? '—'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Secondary</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Name:</span>
                      <span className="text-white">{satellite2Details?.name ?? '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Altitude:</span>
                      <span className="text-white">
                        {typeof satellite2Details?.altitudeKm === 'number' ? `${satellite2Details.altitudeKm.toFixed(0)} km` : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Inclination:</span>
                      <span className="text-white">
                        {typeof satellite2Details?.inclinationDeg === 'number' ? `${satellite2Details.inclinationDeg.toFixed(1)}°` : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Category:</span>
                      <span className="text-white">{satellite2Details?.category ?? '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Center Panel - 3D Visualization (50% width) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="col-span-6"
          >
            <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800 rounded-lg h-full relative overflow-hidden">
              {/* 3D Earth Visualization */}
              <div className="absolute inset-0">
                <Earth3D 
                  className="w-full h-full" 
                  isNightMode={true}
                  showOrbits={showResults}
                  position="center"
                />
                {/* Distance label overlay */}
                {analysisResults && (
                  <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm px-4 py-2 rounded-full border border-cyan-500/50 text-cyan-300 font-mono text-sm">
                    {analysisResults.closestApproachDistance} km
                  </div>
                )}
              </div>
              
              {/* Orbital HUD Overlay */}
              <OrbitalHUD 
                satelliteName={satellite1Data?.name || 'ORBITAL_01'} 
                dataSource={satelliteData.source}
              />
            </div>
          </motion.div>

          {/* Right Panel - Mission Planner (25% width) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="col-span-3 space-y-3"
          >
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    analysisResults?.riskLevel === 'HIGH' ? 'bg-red-500 animate-pulse' :
                    analysisResults?.riskLevel === 'MEDIUM' ? 'bg-yellow-500' :
                    analysisResults?.riskLevel === 'LOW' ? 'bg-green-500' : 'bg-slate-500'
                  }`} />
                  <span className="text-xs uppercase tracking-wider">
                    {analysisResults?.riskLevel ? `${analysisResults.riskLevel} RISK` : 'NO DATA'}
                  </span>
                </div>

                <Button 
                  onClick={handleAnalyzeRisk}
                  disabled={!satellite1 || !satellite2 || isAnalyzing}
                  className="btn-glass text-slate-200 font-semibold px-3 py-2 flex items-center gap-2 h-9"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ANALYZING...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      RUN
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-lg p-3">
              <h3 className="text-xs font-bold tracking-wider text-cyan-400 uppercase mb-2">Results</h3>
              {analysisResults ? (
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Risk:</span>
                    <span className={`font-bold ${
                      analysisResults.riskLevel === 'HIGH' ? 'text-red-400' :
                      analysisResults.riskLevel === 'MEDIUM' ? 'text-yellow-400' :
                      'text-emerald-400'
                    }`}>
                      {analysisResults.riskLevel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Closest approach:</span>
                    <span className="text-white">{analysisResults.closestApproachDistance} km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">TCA (UTC):</span>
                    <span className="text-white">
                      {analysisResults.timeOfClosestApproach}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Timeframe:</span>
                    <span className="text-white">{analysisResults.timeframeHours}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Runtime:</span>
                    <span className="text-white">
                      {typeof analysisResults.calculationDurationMs === 'number'
                        ? `${analysisResults.calculationDurationMs.toFixed(0)}ms`
                        : '—'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Conjunction Pair</div>
                    <div className="text-[10px] text-white">{analysisResults.satellite1Name}</div>
                    <div className="text-[10px] text-slate-400">{analysisResults.satellite1Category}</div>
                    <div className="my-1 text-[10px] text-slate-500">↔</div>
                    <div className="text-[10px] text-white">{analysisResults.satellite2Name}</div>
                    <div className="text-[10px] text-slate-400">{analysisResults.satellite2Category}</div>
                  </div>
                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Reasons</div>
                    <div className="space-y-1">
                      {(analysisResults.riskReasons ?? []).slice(0, 3).map((reason: string, idx: number) => (
                        <div key={idx} className="text-xs text-slate-300">
                          - {reason}
                        </div>
                      ))}
                      {(analysisResults.riskReasons ?? []).length > 3 && (
                        <div className="text-xs text-slate-500">
                          +{(analysisResults.riskReasons ?? []).length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 font-mono">
                  Run simulation to generate results.
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-400 font-mono">{error}</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(OrbitRiskPage);
