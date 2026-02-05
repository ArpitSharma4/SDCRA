import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSatelliteData } from '@/hooks/useSatelliteData';

interface DebrisHeatmapProps {
  showDebris?: boolean;
  showActive?: boolean;
  showStarlink?: boolean;
  altitudeRange?: [number, number];
}

export const DebrisHeatmap: React.FC<DebrisHeatmapProps> = ({
  showDebris = true,
  showActive = true,
  showStarlink = true,
  altitudeRange = [0, 40000]
}) => {
  const timeRef = useRef(0);

  // Fetch satellite data groups
  const activeData = useSatelliteData('active');
  const starlinkData = useSatelliteData('starlink');
  const debrisData = useSatelliteData('debris');

  // Generate particle data based on actual satellite counts
  const particleData = useMemo(() => {
    let particleCount = 0;
    
    // Calculate total particles needed (limit for performance)
    if (showActive && activeData.satellites.size > 0) particleCount += Math.min(activeData.satellites.size, 100);
    if (showStarlink && starlinkData.satellites.size > 0) particleCount += Math.min(starlinkData.satellites.size, 200);
    if (showDebris) particleCount += 800; // Reduced debris count for performance
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    let index = 0;
    
    // Add active satellites (cyan)
    if (showActive && activeData.satellites.size > 0) {
      const activeCount = Math.min(activeData.satellites.size, 100);
      for (let i = 0; i < activeCount; i++) {
        const radius = 1.2 + Math.random() * 0.8;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[index * 3 + 2] = radius * Math.cos(phi);
        
        colors[index * 3] = 0.133; // Cyan (#22d3ee)
        colors[index * 3 + 1] = 0.827;
        colors[index * 3 + 2] = 0.933;
        
        sizes[index] = 0.02 + Math.random() * 0.02;
        index++;
      }
    }
    
    // Add Starlink satellites (cyan)
    if (showStarlink && starlinkData.satellites.size > 0) {
      const starlinkCount = Math.min(starlinkData.satellites.size, 200);
      for (let i = 0; i < starlinkCount; i++) {
        const radius = 1.3 + Math.random() * 0.7;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[index * 3 + 2] = radius * Math.cos(phi);
        
        colors[index * 3] = 0.133; // Cyan (#22d3ee)
        colors[index * 3 + 1] = 0.827;
        colors[index * 3 + 2] = 0.933;
        
        sizes[index] = 0.02 + Math.random() * 0.02;
        index++;
      }
    }
    
    // Add debris particles (red/orange)
    if (showDebris) {
      const debrisCount = 800;
      for (let i = 0; i < debrisCount; i++) {
        const radius = 1.1 + Math.random() * 1.2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[index * 3 + 2] = radius * Math.cos(phi);
        
        colors[index * 3] = 0.937; // Red/Orange (#ef4444)
        colors[index * 3 + 1] = 0.267;
        colors[index * 3 + 2] = 0.267;
        
        sizes[index] = 0.015 + Math.random() * 0.015;
        index++;
      }
    }
    
    return {
      positions,
      colors,
      sizes,
      count: particleCount
    };
  }, [showDebris, showActive, showStarlink, activeData, starlinkData, debrisData]);

  const pointsRef = useRef<THREE.Points>(null);

  // Simplified animation for better performance
  useFrame(() => {
    timeRef.current += 0.005; // Slower animation
    
    const points = pointsRef.current;
    if (points && points.material) {
      const material = points.material as THREE.PointsMaterial;
      // Simpler opacity animation
      material.opacity = 0.7 + Math.sin(timeRef.current) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleData.count}
          array={particleData.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleData.count}
          array={particleData.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleData.count}
          array={particleData.sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02} // Smaller size for performance
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
