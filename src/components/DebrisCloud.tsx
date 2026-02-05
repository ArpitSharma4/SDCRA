import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSatelliteData } from '@/hooks/useSatelliteData';
import { getSatellitePosition, eciToThreeJS } from '@/utils/satelliteUtils';

interface DebrisCloudProps {
  showDebris?: boolean;
  showActive?: boolean;
  showStarlink?: boolean;
  altitudeRange?: [number, number];
}

export const DebrisCloud: React.FC<DebrisCloudProps> = ({
  showDebris = true,
  showActive = true,
  showStarlink = true,
  altitudeRange = [200, 35000]
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);

  // Fetch multiple satellite data groups
  const activeData = useSatelliteData('active');
  const starlinkData = useSatelliteData('starlink');
  const stationsData = useSatelliteData('stations');
  const debris1999Data = useSatelliteData('1999-025');
  const iridiumDebrisData = useSatelliteData('iridium-33-debris');

  // Merge all satellite data into one massive dataset
  const allSatellites = useMemo(() => {
    const merged = new Map();
    
    // Add active satellites
    if (showActive && activeData.satellites.size > 0 && !activeData.isLoading) {
      activeData.satellites.forEach((sat, id) => {
        merged.set(`active-${id}`, { ...sat, type: 'active' });
      });
    }
    
    // Add Starlink satellites
    if (showStarlink && starlinkData.satellites.size > 0 && !starlinkData.isLoading) {
      starlinkData.satellites.forEach((sat, id) => {
        merged.set(`starlink-${id}`, { ...sat, type: 'starlink' });
      });
    }
    
    // Add space stations
    if (showActive && stationsData.satellites.size > 0 && !stationsData.isLoading) {
      stationsData.satellites.forEach((sat, id) => {
        merged.set(`station-${id}`, { ...sat, type: 'active' });
      });
    }
    
    // Add debris clouds
    if (showDebris) {
      if (debris1999Data.satellites.size > 0 && !debris1999Data.isLoading) {
        debris1999Data.satellites.forEach((sat, id) => {
          merged.set(`debris1999-${id}`, { ...sat, type: 'debris' });
        });
      }
      
      if (iridiumDebrisData.satellites.size > 0 && !iridiumDebrisData.isLoading) {
        iridiumDebrisData.satellites.forEach((sat, id) => {
          merged.set(`iridium-${id}`, { ...sat, type: 'debris' });
        });
      }
      
      // Always add synthetic debris if no real debris data or for better visualization
      const syntheticCount = Math.max(0, 1000 - merged.size);
      for (let i = 0; i < syntheticCount; i++) {
        merged.set(`synthetic-debris-${i}`, {
          name: `DEBRIS-${i}`,
          type: 'debris',
          synthetic: true
        });
      }
    }
    
    return merged;
  }, [showDebris, showActive, showStarlink, activeData, starlinkData, stationsData, debris1999Data, iridiumDebrisData]);

  // Generate particle data with danger color coding
  const particleData = useMemo(() => {
    const positions = new Float32Array(allSatellites.size * 3);
    const colors = new Float32Array(allSatellites.size * 3);
    const sizes = new Float32Array(allSatellites.size);
    const altitudes = new Float32Array(allSatellites.size);
    
    let index = 0;
    const earthRadius = 6371; // km
    
    allSatellites.forEach((satellite) => {
      let position, altitude;
      
      if (satellite.synthetic) {
        // Generate synthetic orbital positions for debris
        altitude = 200 + Math.random() * 2000; // LEO debris cloud
        const radius = (earthRadius + altitude) / earthRadius / 1000; // Convert to Earth units
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        position = new THREE.Vector3(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        );
      } else {
        // Use real satellite data
        try {
          if (satellite.tle1 && satellite.tle2) {
            const satPos = getSatellitePosition(satellite.tle1, satellite.tle2, new Date());
            if (satPos && satPos.positionEci) {
              position = eciToThreeJS(satPos.positionEci, 1.0);
              const posMagnitude = Math.sqrt(position.x * position.x + position.y * position.y + position.z * position.z);
              altitude = (posMagnitude * 6371) - earthRadius; // Convert back to km
            } else {
              throw new Error('No position data from satellite');
            }
          } else {
            throw new Error('Missing TLE data');
          }
        } catch (error) {
          // Fallback to random position if calculation fails
          altitude = 400 + Math.random() * 1000;
          const radius = (earthRadius + altitude) / earthRadius / 1000;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI;
          
          position = new THREE.Vector3(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
          );
        }
      }
      
      // Store position
      positions[index * 3] = position.x;
      positions[index * 3 + 1] = position.y;
      positions[index * 3 + 2] = position.z;
      
      // Store altitude for filtering
      altitudes[index] = altitude;
      
      // Apply danger color scheme
      let color;
      if (satellite.type === 'debris' || satellite.name?.includes('DEB') || satellite.name?.includes('R/B')) {
        // Red/Orange for dangerous debris
        color = new THREE.Color(0xef4444); // Red
      } else if (satellite.type === 'starlink' || satellite.name?.includes('STARLINK')) {
        // Cyan for Starlink
        color = new THREE.Color(0x06b6d4); // Cyan
      } else {
        // Blue for other active satellites
        color = new THREE.Color(0x3b82f6); // Blue
      }
      
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
      
      // Size based on type
      sizes[index] = satellite.type === 'debris' ? 0.015 : 0.025;
      
      index++;
    });
    
    return {
      positions,
      colors,
      sizes,
      altitudes,
      count: allSatellites.size
    };
  }, [allSatellites]);

  // Filter particles by altitude range
  const filteredData = useMemo(() => {
    if (altitudeRange[0] === 0 && altitudeRange[1] === 35000) {
      return particleData; // No filtering needed
    }
    
    const [minAlt, maxAlt] = altitudeRange;
    const filteredPositions = [];
    const filteredColors = [];
    const filteredSizes = [];
    
    for (let i = 0; i < particleData.count; i++) {
      const altitude = particleData.altitudes[i];
      if (altitude >= minAlt && altitude <= maxAlt) {
        filteredPositions.push(
          particleData.positions[i * 3],
          particleData.positions[i * 3 + 1],
          particleData.positions[i * 3 + 2]
        );
        filteredColors.push(
          particleData.colors[i * 3],
          particleData.colors[i * 3 + 1],
          particleData.colors[i * 3 + 2]
        );
        filteredSizes.push(particleData.sizes[i]);
      }
    }
    
    return {
      positions: new Float32Array(filteredPositions),
      colors: new Float32Array(filteredColors),
      sizes: new Float32Array(filteredSizes),
      count: filteredSizes.length
    };
  }, [particleData, altitudeRange]);

  // Create texture for circular sprites
  const spriteTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d')!;
    
    // Create circular gradient
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Animation frame
  useFrame(() => {
    timeRef.current += 0.002;
    
    const points = pointsRef.current;
    if (points && points.material) {
      const material = points.material as THREE.PointsMaterial;
      // Gentle pulsing effect
      material.opacity = 0.7 + Math.sin(timeRef.current) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={filteredData.count}
          array={filteredData.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={filteredData.count}
          array={filteredData.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={filteredData.count}
          array={filteredData.sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        map={spriteTexture}
        depthWrite={false}
      />
    </points>
  );
};
