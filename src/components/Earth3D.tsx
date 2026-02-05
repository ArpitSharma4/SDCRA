import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring, animated } from '@react-spring/three';

// Local texture paths
const TEXTURE_PATHS = {
  day: '/textures/earth/earth_day.jpg',
  night: '/textures/earth/earth_night.jpg'
};

// Color constants
const ATMOSPHERE_COLOR = new THREE.Color(0x1a5dff);
const SUN_LIGHT_COLOR = 0xffffcc;

const Earth: React.FC<{
  isNightMode: boolean;
  ambientIntensity: number;
  sunIntensity: number;
  showOrbits?: boolean;
}> = ({ isNightMode, ambientIntensity, sunIntensity, showOrbits = false }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  
  // Load textures with error handling
  const [dayMap, nightMap] = useLoader(THREE.TextureLoader, [
    TEXTURE_PATHS.day,
    TEXTURE_PATHS.night
  ]);

  // Set texture properties and update when textures load
  useEffect(() => {
    if (!dayMap || !nightMap) return;
    
    const initTextures = () => {
      [dayMap, nightMap].forEach((texture, index) => {
        if (texture) {
          texture.anisotropy = 4;
          // @ts-ignore - Three.js types are not up to date
          if (index === 0) texture.encoding = THREE.sRGBEncoding;
          texture.minFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;
        }
      });
      
      // Position camera
      camera.position.set(0, 0.5, 3.5);
    };

    initTextures();

    // Cleanup function
    return () => {
      [dayMap, nightMap].forEach(texture => {
        if (texture) {
          texture.dispose();
        }
      });
    };
  }, [camera, dayMap, nightMap]);
  
  // Update Earth material when isNightMode changes
  useEffect(() => {
    if (!earthRef.current || !dayMap || !nightMap) return;
    
    const material = earthRef.current.material as THREE.MeshPhongMaterial;
    
    // Update the map and emissive map based on the current mode
    material.map = isNightMode ? nightMap : dayMap;
    material.emissiveMap = isNightMode ? nightMap : null;
    material.emissiveIntensity = isNightMode ? 0.8 : 0;
    
    // Ensure the material updates
    material.needsUpdate = true;
    
    // Force the renderer to update
    if (material.map) material.map.needsUpdate = true;
    if (material.emissiveMap) material.emissiveMap.needsUpdate = true;
    
  }, [isNightMode, dayMap, nightMap]);


  // Create Earth material with default day texture
  const earthMaterial = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      map: dayMap,
      emissive: 0x000000,
      emissiveMap: nightMap,
      emissiveIntensity: 0,
      specular: new THREE.Color(0x333333), // Brighter specular highlights
      shininess: 10, // Increased shininess for more pronounced highlights
      bumpScale: 0.08, // Slightly more pronounced bump mapping
      color: new THREE.Color(0xffffff), // Ensure full color from texture
    });
  }, [dayMap, nightMap]);

  // Create procedural cloud material using shaders
  const cloudMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        
        // Classic Perlin 3D Noise
        vec4 permute(vec4 x) {
          return mod(((x*34.0)+1.0)*x, 289.0);
        }
        
        vec4 taylorInvSqrt(vec4 r) {
          return 1.79284291400159 - 0.85373472095314 * r;
        }
        
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          
          i = mod(i, 289.0);
          vec4 p = permute(permute(permute(
                   i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                 + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                 + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
          
          float n_ = 1.0/7.0;
          vec3  ns = n_ * D.wyz - D.xzx;
          
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }
        
        float fbm(vec3 x) {
          float v = 0.0;
          float a = 0.5;
          vec3 shift = vec3(100);
          for (int i = 0; i < 5; ++i) {
            v += a * snoise(x);
            x = x * 2.0 + shift;
            a *= 0.5;
          }
          return v;
        }
        
        void main() {
          vec2 uv = vUv * 2.0 - 1.0;
          vec3 coord = vec3(uv, time * 0.05);
          
          float n = fbm(coord * 3.0);
          n = smoothstep(0.3, 0.7, n);
          
          // Vary opacity based on view angle for better 3D feel
          vec3 N = normalize(vec3(uv * 2.0 - 1.0, 1.0));
          float fresnel = pow(1.0 - abs(N.z), 2.0);
          
          gl_FragColor = vec4(1.0, 1.0, 1.0, n * 0.5 * (0.5 + 0.5 * fresnel));
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
  }, []);

  // Ultra-subtle atmospheric glow
  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: ATMOSPHERE_COLOR },
        time: { value: 0 },
        viewVector: { value: new THREE.Vector3() }
      },
      vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          // Very subtle falloff
          intensity = pow(0.8 - dot(vNormal, vNormel), 1.2);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        
        void main() {
          // Extremely subtle glow with smooth edges
          float glow = smoothstep(0.0, 0.5, intensity);
          // Very low max opacity with smooth falloff
          float alpha = pow(glow, 2.0) * 0.08;
          
          // Soft cyan-blue tint that's barely noticeable
          vec3 color = mix(glowColor, vec3(0.9, 0.95, 1.0), 0.7);
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
  }, []);

  // Animation frame updates - OrbitControls handles rotation now
  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    
    // Update material properties based on day/night mode
    if (earthRef.current) {
      const material = earthRef.current.material as THREE.MeshPhongMaterial;
      material.emissiveIntensity = isNightMode ? 1.2 : 0.8;
    }
    
    // Update atmosphere shader view vector
    if (atmosphereRef.current?.material) {
      const material = atmosphereRef.current.material as THREE.ShaderMaterial;
      material.uniforms.time.value += 0.001;
      material.uniforms.viewVector.value = 
        new THREE.Vector3().subVectors(
          camera.position,
          atmosphereRef.current.position
        ).normalize();
    }
    
    // Update cloud shader time uniform
    if (cloudsRef.current?.material) {
      const material = cloudsRef.current.material as THREE.ShaderMaterial;
      material.uniforms.time.value = elapsed;
    }
  });

  return (
    <>
      <ambientLight intensity={isNightMode ? 0.4 : 0.8} color={isNightMode ? '#2a2a4a' : '#ffffff'} />
      <directionalLight
        position={[5, 3, 5]}
        intensity={isNightMode ? 1.5 : 2.2}
        color={isNightMode ? 0xffeedd : 0xffffe6} // Warmer light
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Earth */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <primitive object={earthMaterial} attach="material" />
      </mesh>
      
      {/* Cloud Layer */}
      <mesh ref={cloudsRef} scale={[1.01, 1.01, 1.01]}>
        <sphereGeometry args={[1.01, 64, 64]} />
        <primitive object={cloudMaterial} attach="material" />
      </mesh>
      
      {/* Ultra-subtle atmospheric glow */}
      <mesh ref={atmosphereRef} scale={[1.008, 1.008, 1.008]}>
        <sphereGeometry args={[1.015, 32, 32]} />
        <primitive object={atmosphereMaterial} attach="material" />
      </mesh>
      
      {/* Orbit Rings */}
      {showOrbits && (
        <>
          {/* Satellite 1 - LEO orbit (slightly tilted) - Cyan/Blue */}
          <mesh rotation={[Math.PI / 2, 0, Math.PI / 12]}>
            <ringGeometry args={[1.1, 1.105, 64]} />
            <meshBasicMaterial 
              color={0x22d3ee} // Cyan/Blue color for Satellite 1
              opacity={0.4} 
              transparent 
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Satellite 2 - MEO orbit (different tilt) - Amber/Orange */}
          <mesh rotation={[Math.PI / 2, 0, -Math.PI / 8]}>
            <ringGeometry args={[1.4, 1.405, 64]} />
            <meshBasicMaterial 
              color={0xf59e0b} // Amber/Orange color for Satellite 2
              opacity={0.4} 
              transparent 
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Closest approach point (red sphere) */}
          <mesh position={[0.8, 0.6, 0]}>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
          
          {/* Reduced debris - only 15 representative objects */}
          <DebrisParticles count={15} />
        </>
      )}
      
      {/* Subtle stars in the background */}
      <Stars
        radius={800}  // Increased from 300 to cover more area
        depth={200}   // Increased from 100
        count={3000}  // Increased from 1000 for more stars
        factor={4}
        saturation={0}
        fade
        speed={0.2}
      />
    </>
  );
}

// Debris particles component
function DebrisParticles({ count = 100 }: { count?: number }) {
  const particlesRef = useRef<THREE.Points>(null);
  
  // Generate random debris positions
  const [positions, bufferAttribute] = useMemo(() => {
    const pos = new Float32Array(count * 3); // count particles * 3 coordinates
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.2 + Math.random() * 0.8; // Between 1.2 and 2.0
      const height = (Math.random() - 0.5) * 0.5;
      
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const attr = new THREE.BufferAttribute(pos, 3);
    return [pos, attr];
  }, [count]);
  
  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={0xff6600}
        size={0.02}
        transparent
        opacity={0.8}
        sizeAttenuation={true}
      />
    </points>
  );
}



interface Earth3DProps {
  className?: string;
  isNightMode?: boolean;
  showOrbits?: boolean;
  position?: 'center' | 'left' | 'right';
}

export const Earth3D = React.memo(function Earth3D({ className, isNightMode = false, showOrbits = false, position = 'right' }: Earth3DProps) {
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Animation values for day/night transition with increased brightness
  const { ambientIntensity, sunIntensity } = useSpring({
    ambientIntensity: isNightMode ? 0.3 : 0.2,  // Increased ambient light
    sunIntensity: isNightMode ? 0.5 : 2.2,      // Increased sun intensity
    config: { duration: 1000 }
  });
  
  // Determine positioning based on position prop
  const getPositionStyles = () => {
    switch (position) {
      case 'center':
        return {
          position: 'absolute' as const,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'auto' as const,
          cursor: 'grab' as const,
        };
      case 'left':
        return {
          position: 'absolute' as const,
          left: '0%',
          width: '120%',
          height: '120%',
          zIndex: 0,
          pointerEvents: 'auto' as const,
          cursor: 'grab' as const,
        };
      case 'right':
      default:
        return {
          position: 'absolute' as const,
          right: '-45%',
          width: '160%',
          height: '145%',
          zIndex: 0,
          pointerEvents: 'auto' as const,
          cursor: 'grab' as const,
        };
    }
  };
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom(prevZoom => {
        // Calculate new zoom level with limits (0.5 to 2.0)
        const delta = -e.deltaY * 0.001;
        const newZoom = Math.min(Math.max(0.5, prevZoom + delta), 2.0);
        zoomRef.current = newZoom;
        return newZoom;
      });
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        canvas.removeEventListener('wheel', handleWheel);
      };
    }
  }, []);

  // ResizeObserver for robust responsiveness
  useEffect(() => {
    if (!mountRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        
        // Find the canvas and update its size
        const canvas = mountRef.current?.querySelector('canvas');
        if (canvas) {
          // Update canvas size directly
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;
          
          // Trigger a resize event for Three.js
          window.dispatchEvent(new Event('resize'));
        }
      }
    });

    // Start observing the container
    resizeObserver.observe(mountRef.current);

    // Trigger resize immediately
    if (mountRef.current) {
      const { clientWidth, clientHeight } = mountRef.current;
      const canvas = mountRef.current.querySelector('canvas');
      if (canvas) {
        canvas.style.width = `${clientWidth}px`;
        canvas.style.height = `${clientHeight}px`;
        window.dispatchEvent(new Event('resize'));
      }
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  
  // Memoize the Earth component to prevent unnecessary re-renders
  const earthComponent = useMemo(() => (
    <Earth 
      isNightMode={isNightMode} 
      ambientIntensity={ambientIntensity as unknown as number}
      sunIntensity={sunIntensity as unknown as number}
      showOrbits={showOrbits}
    />
  ), [isNightMode, ambientIntensity, sunIntensity, showOrbits]);

  // Memoize the stars component
  const starsComponent = useMemo(() => (
    <animated.group scale={isNightMode ? 1.2 : 1}>
      {/* Main stars layer */}
      <Stars
        radius={100}  // Distance from center
        depth={50}    // Depth of star field
        count={isNightMode ? 3000 : 1500}  // More visible in night mode
        factor={isNightMode ? 6 : 4}       // Size factor
        saturation={0}
        fade
        speed={isNightMode ? 0.5 : 0.2}   // Faster movement in night mode
      />

      {/* Distant stars layer */}
      <Stars
        radius={200}
        depth={100}
        count={isNightMode ? 2000 : 1000}
        factor={isNightMode ? 2 : 1}
        saturation={0}
        fade
        speed={isNightMode ? 0.3 : 0.1}
      />
    </animated.group>
  ), [isNightMode]);

  // Background gradient component
  const BackgroundGradient = () => {
    return (
      <mesh position={[0, 0, -500]}>
        <planeGeometry args={[1000, 1000, 1, 1]} />
        <shaderMaterial
          side={THREE.BackSide}
          uniforms={{
            color1: { value: new THREE.Color(0x0a0e1a) },  // Deep navy
            color2: { value: new THREE.Color(0x0f1620) },  // Slightly lighter navy
            color3: { value: new THREE.Color(0x05080f) },  // Near black
          }}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 color1;
            uniform vec3 color2;
            uniform vec3 color3;
            varying vec2 vUv;
            
            void main() {
              // Create a subtle gradient from top to bottom
              float gradient = smoothstep(0.0, 0.7, vUv.y);
              vec3 color = mix(color1, color2, gradient);
              
              // Add a subtle vignette effect
              vec2 uv = vUv * 2.0 - 1.0;
              float vignette = 1.0 - smoothstep(0.7, 1.5, length(uv));
              color = mix(color3, color, vignette * 0.8 + 0.2);
              
              gl_FragColor = vec4(color, 1.0);
            }
          `}
        />
      </mesh>
    );
  };

  // Animated starfield component with rotation
  const AnimatedStarfield = ({ positions, count }: { positions: Float32Array; count: number }) => {
    const starfieldRef = useRef<THREE.Points>(null);
    
    useFrame(() => {
      if (starfieldRef.current) {
        // Add very slow rotation for subtle sense of vastness
        starfieldRef.current.rotation.y += 0.0001;
      }
    });
    
    return (
      <points ref={starfieldRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.15}  // Smaller stars for more realistic look
          sizeAttenuation={true}  // Stars get smaller when further away
          color="#e8f0ff"  // Soft blue-white color
          transparent={true}
          opacity={0.8}  // Slight transparency so they aren't distracting
        />
      </points>
    );
  };

  // Deep Space Spherical Starfield component
  const Starfield = useMemo(() => {
    const count = 4000;  // Increased to 4000 stars for dense, realistic look
    const positions = new Float32Array(count * 3);
    const sphereRadius = 400; // Large sphere radius to surround Earth
    
    for (let i = 0; i < count; i++) {
      // Generate random points on sphere surface using spherical coordinates
      const theta = Math.random() * Math.PI * 2; // Azimuthal angle (0 to 2π)
      const phi = Math.acos(2 * Math.random() - 1); // Polar angle (0 to π)
      
      // Convert spherical to Cartesian coordinates
      positions[i * 3] = sphereRadius * Math.sin(phi) * Math.cos(theta);     // x
      positions[i * 3 + 1] = sphereRadius * Math.sin(phi) * Math.sin(theta); // y  
      positions[i * 3 + 2] = sphereRadius * Math.cos(phi);                   // z
    }
    
    return (
      <AnimatedStarfield positions={positions} count={count} />
    );
  }, []);

  return (
    <div 
      ref={mountRef}
      className={`w-full h-full relative overflow-hidden ${className || ''}`}
      style={getPositionStyles()}
    >
      <Canvas 
        camera={{ 
          position: [0, 0, 2.5], 
          fov: 60, 
          near: 0.1, 
          far: 1000,
          zoom: zoom
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transform: `scale(${zoom})`,
          transformOrigin: 'center',
          transition: 'transform 0.1s ease-out'
        }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          
          // Enable dithering for smoother gradients (using the correct property)
          // @ts-ignore - dithering is a valid property on the renderer
          gl.domElement.style.imageRendering = 'pixelated';
        }}
      >
        {/* Background Elements */}
        <BackgroundGradient />
        <fog attach="fog" args={['#0a0e1a', 200, 600]} />
        
        {/* Starfield */}
        {Starfield}
        
        {/* OrbitControls for interaction */}
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.5}
          rotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
          target={[0, 0, 0]}
          enableDamping={true}
          dampingFactor={0.05}
        />
        
        <ambientLight intensity={0.1} />
        <animated.directionalLight 
          position={[5, 3, 5]} 
          intensity={sunIntensity}
          color={SUN_LIGHT_COLOR}
          castShadow
        />
        
        <animated.ambientLight intensity={ambientIntensity} />
        
        {earthComponent}
        {starsComponent}
      </Canvas>
    </div>
  );
});
