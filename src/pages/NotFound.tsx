import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Home, RefreshCcw } from 'lucide-react';

const NotFound = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. THE PHYSICS ENGINE
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;
    let mouse = { x: -1000, y: -1000, radius: 150 };

    // Set canvas size
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };
    window.addEventListener('resize', handleResize);

    // Particle Class
    class Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      density: number;
      color: string;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.baseX = x; // Remembers original position
        this.baseY = y;
        this.size = Math.random() * 2 + 1;
        this.density = Math.random() * 30 + 1;
        this.color = Math.random() > 0.8 ? '#06b6d4' : '#64748b'; // Cyan or Slate
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }

      update() {
        // Physics Logic: Mouse Interaction
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < mouse.radius) {
          // Push away from mouse (Scatter effect)
          this.x -= directionX * 5;
          this.y -= directionY * 5;
        } else {
          // Return to original position (Reform text)
          if (this.x !== this.baseX) {
            let dx = this.x - this.baseX;
            this.x -= dx / 10;
          }
          if (this.y !== this.baseY) {
            let dy = this.y - this.baseY;
            this.y -= dy / 10;
          }
        }
      }
    }

    // Initialize: Create particles from Text
    const init = () => {
      particles = [];
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Draw "404" text to read pixel data
      ctx.fillStyle = 'white';
      ctx.font = '900 30vw monospace'; // Huge text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('404', canvas.width / 2, canvas.height / 2);

      // Scan canvas to find where the text pixels are
      const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Create particles only where the text is
      // (Skip pixels for performance - step 20 for mobile)
      const stepSize = window.innerWidth < 768 ? 20 : 15;
      for (let y = 0, y2 = textCoordinates.height; y < y2; y += stepSize) {
        for (let x = 0, x2 = textCoordinates.width; x < x2; x += stepSize) {
          // Check alpha value (4th byte)
          if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
            particles.push(new Particle(x, y));
          }
        }
      }
    };

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].draw();
        particles[i].update();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    // Mouse & Touch Listeners
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    };

    init();
    animate();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#020617] overflow-hidden flex flex-col items-center justify-center">
      
      {/* 1. THE CANVAS (Physics Layer) */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* 2. OVERLAY UI (Buttons & Text) */}
      <div className="relative z-10 text-center pointer-events-none"> {/* pointer-events-none lets mouse pass through to canvas */}
        
        {/* Helper Text */}
        <p className="text-slate-500 font-mono text-xs tracking-[0.3em] uppercase mb-[40vh] opacity-60">
          // SIGNAL LOST // SECTOR NULL
        </p>

        {/* Buttons (Enable pointer events for these) */}
        <div className="mt-96 pointer-events-auto flex gap-6 justify-center">
          <Link 
            to="/" 
            className="btn-glass group flex items-center gap-2 text-slate-200 px-6 py-3"
          >
            <Home className="w-4 h-4" />
            <span className="font-mono text-sm tracking-widest font-bold">RETURN TO ORBIT</span>
          </Link>

          <button 
            onClick={() => window.location.reload()}
            className="btn-glass group flex items-center gap-2 text-slate-200 px-6 py-3 hover:text-white"
          >
            <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            <span className="font-mono text-sm tracking-widest font-bold">RETRY SIGNAL</span>
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default NotFound;
