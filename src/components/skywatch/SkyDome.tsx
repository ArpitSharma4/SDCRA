import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SatellitePosition {
    id: string;
    name: string;
    azimuth: number; // Degrees 0-360
    elevation: number; // Degrees 0-90
    altitude: number; // km
    type: string;
}

interface SkyDomeProps {
    satellites: SatellitePosition[];
}

export const SkyDome: React.FC<SkyDomeProps> = ({ satellites }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [hoveredSat, setHoveredSat] = useState<string | null>(null);

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Convert Az/El to X/Y coordinates on the dome
    const getPosition = (az: number, el: number) => {
        // Basic projection: Azimuth maps to X axis, Elevation maps to Y axis (distance from center or bottom)
        // For a panoramic view:
        // X: Azimuth 0-360 maps to 0-100% width. (0 = North, 90 = East, 180 = South, 270 = West)
        // Y: Elevation 0-90 maps to height.

        // Normalize Azimuth to be centered? typically N is center or left. 
        // Let's make 180 (South) the center if looking south, or usually N is 0. 
        // Let's standard map 0 to left, 360 to right.
        const x = (az / 360) * 100;

        // Elevation: 0 deg = bottom (horizon), 90 deg = top (zenith)
        // But since it's a dome, maybe we want a polar plot?
        // The prompt asks for "Panorama view of sky".
        // 0-90 Mapping linear for now.
        const y = (el / 90) * 100;

        return { x, y };
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-[2/1] bg-gradient-to-b from-slate-900 to-black overflow-hidden rounded-t-3xl border-b border-slate-800"
        >
            {/* Star Background - Static */}
            <div className="absolute inset-0 opacity-50">
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-white rounded-full animate-pulse"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 2 + 1}px`,
                            height: `${Math.random() * 2 + 1}px`,
                            opacity: Math.random() * 0.7 + 0.3,
                            animationDuration: `${Math.random() * 3 + 2}s`
                        }}
                    />
                ))}
            </div>

            {/* Grid Lines */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Horizon Line */}
                <div className="absolute bottom-0 w-full h-px bg-slate-700/50" />

                {/* Vertical Grid Lines (Azimuth) */}
                {[0, 90, 180, 270].map((az) => (
                    <div
                        key={az}
                        className="absolute top-0 bottom-0 border-l border-slate-700/20 text-xs text-slate-500 pt-2 pl-1"
                        style={{ left: `${(az / 360) * 100}%` }}
                    >
                        {az}°
                    </div>
                ))}

                {/* Horizontal Grid Lines (Elevation) */}
                {[30, 60].map((el) => (
                    <div
                        key={el}
                        className="absolute w-full border-b border-slate-700/10 text-xs text-slate-600 pl-2"
                        style={{ bottom: `${(el / 90) * 100}%` }}
                    >
                        {el}°
                    </div>
                ))}
            </div>

            {/* Satellites */}
            <AnimatePresence>
                {satellites.map((sat) => {
                    // Filter satellites below horizon (-5 degrees generally visible in some contexts, strictly 0 here)
                    if (sat.elevation < 0) return null;

                    const { x, y } = getPosition(sat.azimuth, sat.elevation);
                    const isHovered = hoveredSat === sat.id;

                    return (
                        <motion.div
                            key={sat.id}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className="absolute group cursor-pointer"
                            style={{
                                left: `${x}%`,
                                bottom: `${y}%`,
                                transform: 'translate(-50%, 50%)' // Center the dot
                            }}
                            onMouseEnter={() => setHoveredSat(sat.id)}
                            onMouseLeave={() => setHoveredSat(null)}
                        >
                            {/* The Glowing Orb */}
                            <div
                                className={`w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_15px_cyan] transition-all duration-300 ${isHovered ? 'scale-150 bg-white' : ''}`}
                            />

                            {/* Tooltip */}
                            {isHovered && (
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 bg-slate-900/90 border border-cyan-500/30 rounded text-xs text-cyan-100 backdrop-blur-sm z-50">
                                    <div className="font-bold text-white">{sat.name}</div>
                                    <div>Alt: {Math.round(sat.altitude)} km</div>
                                    <div>Az: {sat.azimuth.toFixed(1)}° El: {sat.elevation.toFixed(1)}°</div>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* Legend / Overlay Text */}
            <div className="absolute top-4 right-4 text-xs text-slate-500 text-right">
                LIVE TRACKING<br />
                <span className="text-cyan-400">{satellites.filter(s => s.elevation > 0).length} VISIBLE</span>
            </div>
        </div>
    );
};
