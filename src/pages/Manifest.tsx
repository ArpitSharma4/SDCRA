import { motion } from 'framer-motion';
import { ExternalLink, User, Cpu, Radio, ScanSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SUBSYSTEMS = [
  { id: 'ORBIT_RISK', label: '3D Collision Physics Engine.', icon: Cpu },
  { id: 'CONJUNCTION_ALERT', label: 'Close Approach & Conjunction Analysis.', icon: ScanSearch },
  { id: 'REENTRY_WATCH', label: 'Real-time Topocentric Reentry Radar.', icon: Radio },
];

const TELEMETRY_LINES = [
  '> SGP4_PROPAGATE epoch=2025.02.10T00:00:00Z',
  '[OK] TLE_LOAD catalog=space-track',
  '> CONJUNCTION_SCAN window=7d',
  '[WARN] Debris count threshold exceeded LEO',
  '> ORBIT_INTERSECT obj_a=ISS obj_b=STARLINK-4521',
  '[OK] Collision probability: 0.000012',
  '> REENTRY_TRACK obj_id=25544 decay_epoch=2025.02.15',
  '[DATA] Reentry trajectory calculated',
  '> RADAR_SWEEP azimuth=180 elev=45',
  '[TELEMETRY] Doppler shift nominal',
  '> KESSLER_INDEX LEO=0.34 GEO=0.02',
  '[ALERT] LEO congestion +2.1% vs prior week',
  '> RENDER_GL context=WebGL2',
  '[OK] Three.js scene initialized',
  '> QUATERNION_UPDATE t=+86400s',
  '[OK] Attitude propagated',
  '> EPHEMERIS_REQUEST target=ISS',
  '[CACHE] TLE valid for 4.2h',
  '> ORBIT_RISK_CHECK sat_id=54321',
  '[OK] No conjunctions within 7d',
  '> CONJUNCTION_ALERT sat_id=54321',
  '[DATA] 3 close approaches in window',
  '> REENTRY_WATCH lat=40.7 lon=-74.0',
  '[OK] Reentry predictions loaded',
  '> SYS_CHECK all_subsystems',
  '[OK] ORBIT_RISK | CONJUNCTION_ALERT | REENTRY_WATCH',
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-emerald-500/95 font-mono scanlines overflow-x-hidden">
      {/* Top padding for fixed nav */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-10">
            {/* Header */}
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-2"
            >
              <p className="text-cyan-400/80 text-xs sm:text-sm tracking-[0.3em] uppercase">
                // CLASSIFIED // EYES ONLY
              </p>
              <h1
                className="glitch-text text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-emerald-400 cursor-blink"
                data-text="PROJECT SDCRA // TOP SECRET"
              >
                <span className="glitch-text-inner">PROJECT SDCRA // TOP SECRET</span>
              </h1>
              <p className="text-cyan-400/70 text-sm sm:text-base">
                Orbital Surveillance & Collision Risk Assessment
              </p>
            </motion.header>

            {/* Narrative */}
            <motion.section
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-4 border border-emerald-500/20 bg-slate-900/50 p-5 sm:p-6 rounded-sm"
            >
              <motion.p variants={item} className="text-amber-400/90 font-semibold text-lg">
                THE KESSLER SYNDROME IS IMMINENT.
              </motion.p>
              <motion.p variants={item} className="text-emerald-400/90 text-sm leading-relaxed">
                Low Earth orbit is becoming a junkyard. 100,000+ objects. Mach 25 velocities.
                One collision triggers a chain reaction—each impact spawns thousands of new
                fragments, until entire orbital shells become unusable. Satellites, stations,
                and future launches all at risk.
              </motion.p>
              <motion.p variants={item} className="text-cyan-400/80 text-sm leading-relaxed">
                SDCRA exists to model that risk. Not as a corporate dashboard—as a planetary
                defense tool. Real propagation (SGP4), real physics, real-time visualization.
              </motion.p>
            </motion.section>

            {/* Active Subsystems */}
            <motion.section
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              <h2 className="text-cyan-400/90 text-sm font-semibold tracking-wider uppercase">
                // Active Subsystems
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SUBSYSTEMS.map((sys, i) => (
                  <motion.div
                    key={sys.id}
                    variants={item}
                    className="border border-emerald-500/25 bg-slate-900/60 p-4 rounded-sm hover:border-emerald-500/50 hover:bg-slate-800/50 transition-colors"
                  >
                    <p className="text-amber-400/90 text-xs font-mono mb-1">[{sys.id}]</p>
                    <p className="text-emerald-400/90 text-sm">{sys.label}</p>
                    <sys.icon className="w-4 h-4 text-cyan-500/60 mt-2" />
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Operator Profile */}
            <motion.section
              variants={container}
              initial="hidden"
              animate="show"
              className="border border-cyan-500/25 bg-slate-900/50 p-5 sm:p-6 rounded-sm"
            >
              <h2 className="text-cyan-400/90 text-sm font-semibold tracking-wider uppercase mb-4">
                // Operator Profile
              </h2>
              <motion.div variants={item} className="flex items-start gap-4">
                <div className="rounded-full border-2 border-emerald-500/40 p-2 bg-slate-800/50">
                  <User className="w-8 h-8 text-emerald-400/90" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-emerald-400 font-semibold text-lg">CMD. ARPIT</p>
                  <p className="text-slate-400 text-sm">Arpit Sharma · Lead Engineer</p>
                  <p className="text-xs">
                    <span className="text-cyan-400/80">Status:</span>{' '}
                    <span className="text-emerald-400">Active</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    <span className="text-cyan-400/80">Tech Stack:</span> React, Three.js,
                    WebGL, SGP4 Propagation, TypeScript
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="mt-4 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/60 font-mono text-sm"
                  >
                    <a
                      href="https://github.com/ArpitSharma4"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      OPEN COMMS CHANNEL
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </motion.div>
            </motion.section>
          </div>

          {/* System Log - right side */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:w-80 flex-shrink-0"
          >
            <div className="sticky top-24 border border-cyan-500/20 bg-slate-900/80 rounded-sm overflow-hidden h-[420px] flex flex-col">
              <div className="px-3 py-2 border-b border-cyan-500/20 text-cyan-400/80 text-xs font-mono">
                SYSTEM_LOG // TELEMETRY_STREAM
              </div>
              <div className="flex-1 overflow-hidden relative">
                <div className="log-scroll-inner absolute inset-0 px-3 py-2 text-xs text-emerald-500/80 space-y-0.5 font-mono whitespace-nowrap">
                  {[...TELEMETRY_LINES, ...TELEMETRY_LINES].map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>
        </div>

        {/* Footer - Warning label */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="mt-16 pt-8 border-t border-slate-700/50 text-center"
        >
          <p className="text-amber-500/80 text-xs font-mono tracking-wider uppercase max-w-2xl mx-auto">
            UNAUTHORIZED DISTRIBUTION OF THIS DATA IS A VIOLATION OF SPACE TREATY 1967.
          </p>
          <p className="text-slate-500 text-xs mt-1">Outer Space Treaty · Article VI</p>
        </motion.footer>
      </div>
    </div>
  );
}
