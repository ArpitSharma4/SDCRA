import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, Globe, Navigation, Clock } from 'lucide-react';

interface PassCardProps {
    name: string;
    type: string;
    altitude: number;
    azimuth: number;
    elevation: number;
    speed: number;
    nextPass: string; // Calculated string "Rising in 12 min"
    visible: boolean;
}

export const PassCard: React.FC<PassCardProps> = ({
    name,
    type,
    altitude,
    azimuth,
    elevation,
    speed,
    nextPass,
    visible
}) => {
    return (
        <Card className={`relative border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden group hover:border-cyan-500/50 transition-all duration-300 ${visible ? 'shadow-[0_0_15px_rgba(34,211,238,0.1)]' : ''}`}>
            {/* Visibility Badge */}
            <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${visible ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                {visible ? 'Visible' : 'Below Horizon'}
            </div>

            <CardHeader className="pb-2 pt-6">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${visible ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
                    <div>
                        <CardTitle className="text-sm font-bold text-white tracking-wide">{name}</CardTitle>
                        <p className="text-xs text-slate-500 uppercase">{type}</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                    <div className="text-slate-500 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> Altitude
                    </div>
                    <div className="font-mono text-cyan-100">{Math.round(altitude)} km</div>
                </div>

                <div className="space-y-1">
                    <div className="text-slate-500 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Speed
                    </div>
                    <div className="font-mono text-cyan-100">{speed.toFixed(2)} km/s</div>
                </div>

                <div className="space-y-1">
                    <div className="text-slate-500 flex items-center gap-1">
                        <Navigation className="w-3 h-3" /> Position
                    </div>
                    <div className="font-mono text-cyan-100">
                        Az: {azimuth.toFixed(0)}° El: {elevation.toFixed(0)}°
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Next Pass
                    </div>
                    <div className="font-mono text-white">{nextPass}</div>
                </div>
            </CardContent>
        </Card>
    );
};
