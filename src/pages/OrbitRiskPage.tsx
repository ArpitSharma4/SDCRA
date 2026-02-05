import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Satellite, Activity, Wifi, WifiOff, Ruler, Clock, CheckCircle2, MapPin, Zap, Cloud, Radio } from 'lucide-react';
import { Earth3D } from '@/components/Earth3D';
import { OrbitalHUD } from '@/components/OrbitalHUD';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import { findClosestApproach, getSatellitePosition, generateOrbitPath, getSatelliteCategory, clearTLECache, fetchTLEGroup, getRandomSatellitesFromGroup } from '@/utils/satelliteUtils';
import { analyzeConjunction, ConjunctionResult } from '@/utils/orbitalMath';
import * as satellite from 'satellite.js';
import { SATELLITE_GROUPS, getSatelliteGroupOptions, DEFAULT_SATELLITE_GROUP, SatelliteGroup } from '@/config/satelliteGroups';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSatelliteData } from '@/hooks/useSatelliteData';
import { Badge } from '@/components/ui/badge';

export function OrbitRiskPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  const navigate = useNavigate();
  
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

  const testServerlessAccess = useCallback(async () => {
    console.log('🧪 Testing direct Celestrak access from browser...');
    
    try {
      // Test direct access from browser (same as you're doing manually)
      const testUrl = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle';
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain, */*',
        }
      });
      
      console.log('📊 Browser test result:', response.status);
      
      if (response.ok) {
        const text = await response.text();
        const satelliteCount = text.split('\n').filter(line => line.trim().startsWith('1 ')).length;
        
        alert(`✅ Browser Access Works!\n\nStatus: ${response.status}\nSatellites: ${satelliteCount}\n\nThis confirms Celestrak is accessible.\nThe issue is likely with the proxy/serverless setup.`);
      } else {
        alert(`❌ Browser Access Failed!\n\nStatus: ${response.status}\n${response.statusText}\n\nThis is unexpected since you can access it manually.`);
      }
    } catch (error) {
      console.error('Test failed:', error);
      alert(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

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
      let riskLevel = 'Low';
      let riskReasons = [];
      
      if (conjunctionResult.minDistanceKm < 1) {
        riskLevel = 'High';
        riskReasons.push('Miss distance < 1 km');
      } else if (conjunctionResult.minDistanceKm < 5) {
        riskLevel = 'Medium';
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

  const toggleNightMode = React.useCallback(() => {
    setIsNightMode(prev => !prev);
  }, []);

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
    setSatellite1(value);
    clearResults();
  }, [clearResults]);

  const handleSatellite2Change = useCallback((value: string) => {
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

  const resultsContainerVariants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.12 }
    }
  };

  const resultsItemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 }
  };

  // Auto-select first two satellites when data is loaded or category changes
  useEffect(() => {
  // 1. STOP if data is still loading (prevents selecting old satellites)
  if (satelliteData.isLoading) return;

  // 2. STOP if user is manually editing
  if (userIsEditing) return;

  // 3. STOP if we don't have enough satellites to select
  if (satelliteData.satellites.size < 2) return;

  // 4. Only auto-select if inputs are empty OR invalid for the current category
  const isSat1Valid = satellite1 && satelliteData.satellites.has(satellite1);
  const isSat2Valid = satellite2 && satelliteData.satellites.has(satellite2);

  if (!isSat1Valid || !isSat2Valid) {
    const ids = Array.from(satelliteData.satellites.keys());
    setSatellite1(ids[0]);
    setSatellite2(ids[1]);
    console.log(`Auto-selected satellites: ${ids[0]} and ${ids[1]}`);
  }
}, [satelliteData.satellites, satelliteData.isLoading, satellite1, satellite2, userIsEditing]); // Include selectedCategory

  // Get available satellite IDs for placeholder
  const getAvailableSatelliteIds = () => {
    if (satelliteData.satellites.size === 0) return 'Loading...';
    const ids = Array.from(satelliteData.satellites.keys()).slice(0, 5);
    return ids.join(', ') + (satelliteData.satellites.size > 5 ? '...' : '');
  };

  // Load default satellite category on component mount
  useEffect(() => {
    handleCategoryChange(DEFAULT_SATELLITE_GROUP);
  }, []); // Only run once on mount

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col">
      <main className="flex-grow flex flex-col">
        {/* Header */}
        <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm mt-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Empty header - just for visual separation */}
          </div>
        </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Satellite className="h-5 w-5 text-primary" />
                  Input Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category" className="text-xs tracking-wider font-semibold text-muted-foreground uppercase">Satellite Category</Label>
                  <Select value={selectedCategory} onValueChange={handleCategoryChange} disabled={satelliteData.isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select satellite category" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSatelliteGroupOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-muted-foreground">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {satelliteData.isLoading && (
                    <p className="text-xs text-muted-foreground mt-1">Loading satellites...</p>
                  )}
                  {satelliteData.satellites.size > 0 && !satelliteData.isLoading && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Loaded {satelliteData.satellites.size} satellites
                      </p>
                      <div className="flex items-center gap-2">
                        {satelliteData.source === 'LIVE' && (
                          <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                            <Wifi className="w-3 h-3 mr-1" />
                            Live Data
                          </Badge>
                        )}
                        {satelliteData.source === 'ERROR' && (
                          <Badge variant="destructive" className="text-xs">
                            <WifiOff className="w-3 h-3 mr-1" />
                            Error
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="satellite1" className="text-xs tracking-wider font-semibold text-muted-foreground uppercase">NORAD ID - Satellite 1</Label>
                  <Input
                    id="satellite1"
                    placeholder={`Available: ${getAvailableSatelliteIds()}`}
                    value={satellite1}
                    onChange={(e) => handleSatellite1Change(e.target.value)}
                    disabled={satelliteData.isLoading || satelliteData.satellites.size === 0}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Enter NORAD ID or select from available satellites</p>
                </div>
                <div>
                  <Label htmlFor="satellite2" className="text-xs tracking-wider font-semibold text-muted-foreground uppercase">NORAD ID - Satellite 2</Label>
                  <Input
                    id="satellite2"
                    placeholder={`Available: ${getAvailableSatelliteIds()}`}
                    value={satellite2}
                    onChange={(e) => handleSatellite2Change(e.target.value)}
                    disabled={satelliteData.isLoading || satelliteData.satellites.size === 0}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Enter NORAD ID or select from available satellites</p>
                </div>
                <div>
                  <Label htmlFor="timeframe" className="text-xs tracking-wider font-semibold text-muted-foreground uppercase">Timeframe (hours)</Label>
                  <Input
                    id="timeframe"
                    type="number"
                    value={timeframe}
                    onChange={(e) => handleTimeframeChange(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Analysis period: 1-168 hours (1 week max)</p>
                </div>
                <Button 
                  onClick={handleAnalyzeRisk}
                  disabled={!satellite1 || !satellite2 || isAnalyzing || satelliteData.satellites.size === 0}
                  className="w-full"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Risk'}
                </Button>
                
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Visualization Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Orbital Visualization
                </CardTitle>
              </CardHeader>
              <CardContent className="relative h-96 flex items-center justify-center">
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Earth3D 
                      className="w-full h-full max-w-md max-h-md" 
                      isNightMode={isNightMode}
                      showOrbits={true}
                      position="center"
                    />
                    {/* Distance label overlay */}
                    {analysisResults && (
                      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full border border-border text-xs font-medium">
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
                {/* View toggle button positioned below Earth */}
                <div className="absolute bottom-0 right-4">
                  <button
                    onClick={toggleNightMode}
                    className="flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-sm rounded-full border border-border shadow-lg hover:bg-accent/30 transition-colors"
                  >
                    <span className="text-sm font-medium">View:</span>
                    <span className="text-sm font-medium">{isNightMode ? 'Day' : 'Night'}</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Panel */}
          {showResults && analysisResults && (
            <motion.div
              variants={resultsContainerVariants}
              initial="hidden"
              animate="show"
              className="lg:col-span-3"
            >
              <motion.div variants={resultsItemVariants}>
                <Card
                  className={
                    `overflow-hidden border border-white/10 bg-slate-900/50 backdrop-blur-md ` +
                    (analysisResults.riskLevel === 'HIGH'
                      ? 'shadow-[0_0_40px_rgba(239,68,68,0.25)]'
                      : analysisResults.riskLevel === 'MEDIUM'
                        ? 'shadow-[0_0_40px_rgba(234,179,8,0.18)]'
                        : 'shadow-[0_0_40px_rgba(16,185,129,0.18)]')
                  }
                >
                  <CardHeader className="border-b border-white/10 bg-gradient-to-r from-slate-900/60 via-slate-900/30 to-slate-900/60">
                    <CardTitle className="flex items-center justify-between gap-3">
                      <span>Analysis Results</span>
                      <Badge variant="outline" className="border-white/15 bg-white/5 text-xs">
                        Live
                      </Badge>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-6">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                        <div className="text-left">
                          <div className="text-sm font-semibold text-white/90 truncate">{analysisResults.satellite1Name}</div>
                          <div className="mt-2">
                            <Badge variant="secondary" className="bg-white/5 text-white/70 border border-white/10 text-xs">
                              {analysisResults.satellite1Category}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs tracking-[0.35em] text-white/50">VS</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-white/90 truncate">{analysisResults.satellite2Name}</div>
                          <div className="mt-2 flex justify-end">
                            <Badge variant="secondary" className="bg-white/5 text-white/70 border border-white/10 text-xs">
                              {analysisResults.satellite2Category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
                      <div
                        className={
                          `rounded-2xl border border-white/10 bg-white/5 p-6 ` +
                          (analysisResults.riskLevel === 'HIGH'
                            ? 'shadow-[0_0_32px_rgba(239,68,68,0.22)]'
                            : analysisResults.riskLevel === 'MEDIUM'
                              ? 'shadow-[0_0_32px_rgba(234,179,8,0.16)]'
                              : 'shadow-[0_0_32px_rgba(16,185,129,0.14)]')
                        }
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-xs tracking-wider font-semibold text-white/60 uppercase">Risk Level</div>
                          <Activity className="h-4 w-4 text-white/50" />
                        </div>
                        <div
                          className={
                            `mt-4 text-5xl font-extrabold leading-none ` +
                            (analysisResults.riskLevel === 'HIGH'
                              ? 'text-red-500 animate-pulse'
                              : analysisResults.riskLevel === 'MEDIUM'
                                ? 'text-yellow-400'
                                : 'text-emerald-400')
                          }
                        >
                          {analysisResults.riskLevel}
                        </div>
                        <div className="mt-3 text-sm text-white/55">
                          Confidence signals: {analysisResults.riskReasons.length}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                          <div className="flex items-start justify-between gap-3">
                            <div className="text-xs tracking-wider font-semibold text-white/60 uppercase">Closest Approach</div>
                            <Ruler className="h-4 w-4 text-white/50" />
                          </div>
                          <div className="mt-4 text-4xl font-bold text-cyan-300">
                            {analysisResults.closestApproachDistance}
                            <span className="ml-2 text-sm font-semibold text-white/50">km</span>
                          </div>
                          <div className="mt-2 text-xs text-white/45">Minimum separation within the selected window</div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                          <div className="flex items-start justify-between gap-3">
                            <div className="text-xs tracking-wider font-semibold text-white/60 uppercase">Time of Closest (UTC)</div>
                            <Clock className="h-4 w-4 text-white/50" />
                          </div>
                          <div className="mt-4 text-3xl font-bold text-white/90">
                            {new Date(analysisResults.timeOfClosestApproach).toLocaleTimeString('en-US', {
                              timeZone: 'UTC',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            <span className="ml-2 text-sm font-semibold text-white/50">UTC</span>
                          </div>
                          <div className="mt-2 text-xs text-white/45">
                            {new Date(analysisResults.timeOfClosestApproach).toLocaleDateString('en-US', {
                              timeZone: 'UTC',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-white/90 uppercase tracking-wider">Risk Analysis Factors</div>
                        <Badge variant="secondary" className="bg-white/5 text-white/70 border border-white/10 text-xs">
                          {analysisResults.riskReasons.length}
                        </Badge>
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {analysisResults.riskReasons.map((reason: string, index: number) => {
                          const isNegative = /high|danger|collision|impact|close|warning|critical|risk/i.test(reason);
                          return (
                            <div
                              key={index}
                              className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-950/30 px-4 py-3"
                            >
                              {isNegative ? (
                                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                              ) : (
                                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
                              )}
                              <div className="text-sm text-white/70 leading-snug">{reason}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
      </main>
    </div>
  );
}

export default React.memo(OrbitRiskPage);
