import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Activity, TrendingUp, Shield } from 'lucide-react';

interface KesslerIndexProps {
  totalObjects: number;
  debrisCount: number;
  activeCount: number;
  starlinkCount: number;
  altitudeRange: [number, number];
}

export const KesslerIndex: React.FC<KesslerIndexProps> = ({
  totalObjects,
  debrisCount,
  activeCount,
  starlinkCount,
  altitudeRange
}) => {
  // Calculate Kessler Syndrome metrics
  const kesslerMetrics = useMemo(() => {
    const debrisRatio = totalObjects > 0 ? (debrisCount / totalObjects) * 100 : 0;
    
    // Estimate total mass (simplified calculation)
    const avgDebrisMass = 50; // kg per debris object
    const avgSatelliteMass = 500; // kg per active satellite
    const avgStarlinkMass = 260; // kg per Starlink satellite
    
    const totalMass = (debrisCount * avgDebrisMass) + 
                     (activeCount * avgSatelliteMass) + 
                     (starlinkCount * avgStarlinkMass);
    
    // Calculate collision risk based on altitude and density
    const [minAlt, maxAlt] = altitudeRange;
    let collisionRisk = 0;
    
    if (minAlt < 2000) {
      // LEO is most dangerous
      collisionRisk = Math.min(90, debrisRatio * 1.5);
    } else if (minAlt < 20000) {
      // MEO medium risk
      collisionRisk = Math.min(60, debrisRatio * 1.2);
    } else {
      // GEO lower risk
      collisionRisk = Math.min(30, debrisRatio * 0.8);
    }
    
    // Determine density level
    let densityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    let densityColor: string;
    
    if (totalObjects < 100) {
      densityLevel = 'LOW';
      densityColor = 'bg-green-600/20 text-green-300 border-green-500/30';
    } else if (totalObjects < 500) {
      densityLevel = 'MEDIUM';
      densityColor = 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30';
    } else if (totalObjects < 1000) {
      densityLevel = 'HIGH';
      densityColor = 'bg-orange-600/20 text-orange-300 border-orange-500/30';
    } else {
      densityLevel = 'CRITICAL';
      densityColor = 'bg-red-600/20 text-red-300 border-red-500/30';
    }
    
    // Kessler Index (0-100 scale)
    const kesslerIndex = Math.min(100, (debrisRatio * 0.7) + (collisionRisk * 0.3));
    
    return {
      debrisRatio: debrisRatio.toFixed(1),
      totalMass: totalMass.toFixed(0),
      collisionRisk: collisionRisk.toFixed(0),
      densityLevel,
      densityColor,
      kesslerIndex: kesslerIndex.toFixed(0)
    };
  }, [totalObjects, debrisCount, activeCount, starlinkCount, altitudeRange]);

  return (
    <Card className="bg-slate-900/40 backdrop-blur-xl border border-cyan-500/20 shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-cyan-400 text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Kessler Index
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Kessler Index */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-cyan-300 text-sm font-semibold">Overall Risk</span>
            <Badge 
              variant="secondary" 
              className={`${
                parseFloat(kesslerMetrics.kesslerIndex) > 70 
                  ? 'bg-red-600/20 text-red-300 border-red-500/30'
                  : parseFloat(kesslerMetrics.kesslerIndex) > 40
                  ? 'bg-orange-600/20 text-orange-300 border-orange-500/30'
                  : 'bg-green-600/20 text-green-300 border-green-500/30'
              }`}
            >
              {kesslerMetrics.kesslerIndex}/100
            </Badge>
          </div>
          <Progress 
            value={parseFloat(kesslerMetrics.kesslerIndex)} 
            className="h-2 bg-slate-700"
          />
        </div>

        {/* Density Level */}
        <div className="space-y-3">
          <h3 className="text-cyan-300 text-sm font-semibold">Debris Density</h3>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Current Zone</span>
              <Badge variant="secondary" className={kesslerMetrics.densityColor}>
                {kesslerMetrics.densityLevel}
              </Badge>
            </div>
            <div className="text-xs text-slate-500">
              Altitude: {altitudeRange[0].toLocaleString()} - {altitudeRange[1].toLocaleString()} km
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="space-y-3">
          <h3 className="text-cyan-300 text-sm font-semibold">Zone Statistics</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-3 w-3 text-red-400" />
                <span className="text-xs text-slate-400">Debris Ratio</span>
              </div>
              <div className="text-lg font-bold text-red-400">
                {kesslerMetrics.debrisRatio}%
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-3 w-3 text-orange-400" />
                <span className="text-xs text-slate-400">Collision Risk</span>
              </div>
              <div className="text-lg font-bold text-orange-400">
                {kesslerMetrics.collisionRisk}%
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-3 w-3 text-cyan-400" />
                <span className="text-xs text-slate-400">Total Mass</span>
              </div>
              <div className="text-lg font-bold text-cyan-400">
                {(parseFloat(kesslerMetrics.totalMass) / 1000).toFixed(1)}K kg
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-3 w-3 text-green-400" />
                <span className="text-xs text-slate-400">Objects</span>
              </div>
              <div className="text-lg font-bold text-green-400">
                {totalObjects.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="space-y-3">
          <h3 className="text-cyan-300 text-sm font-semibold">Risk Assessment</h3>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-xs text-slate-300 space-y-2">
              {parseFloat(kesslerMetrics.kesslerIndex) > 70 && (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-3 w-3 text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="text-red-300">
                    <strong>Critical:</strong> Kessler Syndrome threshold exceeded. 
                    Collision cascade likely in this region.
                  </span>
                </div>
              )}
              {parseFloat(kesslerMetrics.kesslerIndex) > 40 && parseFloat(kesslerMetrics.kesslerIndex) <= 70 && (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-3 w-3 text-orange-400 mt-0.5 flex-shrink-0" />
                  <span className="text-orange-300">
                    <strong>High Risk:</strong> Elevated collision probability. 
                    Active monitoring required.
                  </span>
                </div>
              )}
              {parseFloat(kesslerMetrics.kesslerIndex) <= 40 && (
                <div className="flex items-start gap-2">
                  <Shield className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-green-300">
                    <strong>Moderate Risk:</strong> Collision probability within acceptable limits.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
