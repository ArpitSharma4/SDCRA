import React, { useState } from 'react';
import { DebrisMap2D } from '../components/DebrisMap2D';
import { Switch } from '@/components/ui/switch';
import { Trash2, Satellite, Wifi } from 'lucide-react';

const HeatmapPage: React.FC = () => {
  // State for filters
  const [showDebris, setShowDebris] = useState(true);
  const [showActive, setShowActive] = useState(true);
  const [showStarlink, setShowStarlink] = useState(true);

  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      {/* Full Screen Map Only */}
      <DebrisMap2D 
        showDebris={showDebris}
        showActive={showActive}
        showStarlink={showStarlink}
        altitudeRange={[0, 35000]}
      />

      {/* Minimal Floating Controls - Bottom Center */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-slate-900/50 backdrop-blur-md rounded-full px-6 py-3 flex items-center gap-6 border border-slate-700/30">
          {/* Debris Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-xs text-slate-300">Debris</span>
            <Switch
              checked={showDebris}
              onCheckedChange={setShowDebris}
              className="data-[state=checked]:bg-red-600 scale-75"
            />
          </label>

          {/* Active Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
            <span className="text-xs text-slate-300">Active</span>
            <Switch
              checked={showActive}
              onCheckedChange={setShowActive}
              className="data-[state=checked]:bg-cyan-600 scale-75"
            />
          </label>

          {/* Starlink Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-slate-300">Starlink</span>
            <Switch
              checked={showStarlink}
              onCheckedChange={setShowStarlink}
              className="data-[state=checked]:bg-blue-600 scale-75"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default HeatmapPage;
