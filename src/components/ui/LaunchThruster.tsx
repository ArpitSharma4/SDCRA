import React, { useEffect, useRef, useState } from "react";
import { ChevronRight, Rocket } from "lucide-react";

const LaunchThruster = () => {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isLaunched, setIsLaunched] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const requestRef = useRef<number>();
  const holdingRef = useRef(false);
  const launchedRef = useRef(false);

  useEffect(() => {
    holdingRef.current = isHolding;
  }, [isHolding]);

  useEffect(() => {
    launchedRef.current = isLaunched;
  }, [isLaunched]);

  const animate = () => {
    if (!launchedRef.current) {
      if (holdingRef.current) {
        setProgress((prev) => {
          const next = Math.min(100, prev + 2);
          if (next >= 100) {
            setIsLaunched(true);
            setBurstKey((k) => k + 1);
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              (navigator as Navigator).vibrate?.([40, 30, 40]);
            }
            setTimeout(() => {
              setProgress(0);
              setIsLaunched(false);
              setIsHolding(false);
            }, 900);
          }
          return next;
        });
      } else {
        setProgress((prev) => Math.max(0, prev - 4));
      }
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative group">
      <button
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setIsHolding(true);
        }}
        onPointerUp={() => setIsHolding(false)}
        onPointerLeave={() => setIsHolding(false)}
        onPointerCancel={() => setIsHolding(false)}
        className={`relative overflow-hidden w-40 h-10 rounded-full border border-slate-700 bg-slate-950/80 backdrop-blur-md transition-all duration-100 flex items-center justify-between px-1 cursor-pointer select-none
          ${isHolding ? "scale-[0.98] border-slate-300/50" : "hover:border-slate-500"}
          ${isLaunched ? "border-emerald-500 bg-emerald-900/20" : ""}
        `}
      >
        <div
          className="absolute inset-0 bg-gradient-to-r from-slate-200/10 via-slate-200/15 to-slate-200/10 transition-transform duration-75 ease-linear origin-left"
          style={{ transform: `scaleX(${progress / 100})` }}
        />

        {isLaunched && (
          <div
            key={burstKey}
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute inset-0 rounded-full ignition-flash" />
            <div className="absolute inset-0 rounded-full ignition-ring" />
            <span className="spark spark-1" />
            <span className="spark spark-2" />
            <span className="spark spark-3" />
            <span className="spark spark-4" />
            <span className="spark spark-5" />
            <span className="spark spark-6" />
          </div>
        )}

        <div
          className={`z-10 w-8 h-8 rounded-full flex items-center justify-center bg-slate-900 border border-slate-700 transition-all duration-300
          ${isLaunched ? "bg-emerald-500 text-black border-emerald-400 translate-x-[110px] rotate-45" : "text-slate-200"}
        `}
        >
          {isLaunched ? <Rocket className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>

        {isLaunched && (
          <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 w-24 h-10 overflow-hidden">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-20 h-3 rounded-full flame" />
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className={`font-mono text-[10px] font-bold tracking-[0.2em] transition-all duration-300
            ${isLaunched ? "opacity-0" : "opacity-100"}
            ${isHolding ? "text-white" : "text-slate-400"}
          `}
          >
            {isHolding ? "HOLD..." : "LAUNCH"}
          </span>
        </div>
      </button>

      <style>{`
        @keyframes rumble {
          0% { transform: translate(0, 0); }
          25% { transform: translate(-1px, 1px); }
          50% { transform: translate(1px, -1px); }
          75% { transform: translate(-1px, -1px); }
          100% { transform: translate(1px, 1px); }
        }

        @keyframes ignitionFlash {
          0% { opacity: 0; transform: scale(0.98); }
          10% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.03); }
        }

        @keyframes ignitionRing {
          0% { opacity: 0.9; transform: scale(0.6); }
          100% { opacity: 0; transform: scale(1.35); }
        }

        @keyframes spark {
          0% { opacity: 0; transform: translate(0, 0) scale(0.9); }
          10% { opacity: 1; }
          100% { opacity: 0; transform: translate(var(--sx), var(--sy)) scale(0.4); }
        }

        @keyframes flame {
          0% { transform: translateX(0) scaleX(0.9); opacity: 0.9; }
          50% { transform: translateX(-4px) scaleX(1.1); opacity: 1; }
          100% { transform: translateX(-10px) scaleX(0.6); opacity: 0; }
        }

        .ignition-flash {
          background: radial-gradient(circle at 70% 50%, rgba(255,255,255,0.35) 0%, rgba(16,185,129,0.18) 35%, rgba(2,6,23,0) 70%);
          animation: ignitionFlash 700ms ease-out both;
        }

        .ignition-ring {
          border: 2px solid rgba(16,185,129,0.35);
          box-shadow: 0 0 25px rgba(16,185,129,0.22);
          animation: ignitionRing 650ms ease-out both;
        }

        .spark {
          position: absolute;
          left: 70%;
          top: 50%;
          width: 6px;
          height: 2px;
          background: rgba(226,232,240,0.9);
          border-radius: 999px;
          box-shadow: 0 0 10px rgba(16,185,129,0.25);
          transform: translate(-50%, -50%);
          animation: spark 520ms ease-out both;
        }

        .spark-1 { --sx: 22px; --sy: -14px; transform: translate(-50%, -50%) rotate(10deg); }
        .spark-2 { --sx: 26px; --sy: 0px; transform: translate(-50%, -50%) rotate(0deg); }
        .spark-3 { --sx: 20px; --sy: 16px; transform: translate(-50%, -50%) rotate(-10deg); }
        .spark-4 { --sx: -18px; --sy: -14px; transform: translate(-50%, -50%) rotate(170deg); }
        .spark-5 { --sx: -22px; --sy: 0px; transform: translate(-50%, -50%) rotate(180deg); }
        .spark-6 { --sx: -16px; --sy: 16px; transform: translate(-50%, -50%) rotate(190deg); }

        .flame {
          background: linear-gradient(90deg, rgba(16,185,129,0) 0%, rgba(16,185,129,0.25) 35%, rgba(248,250,252,0.55) 70%, rgba(248,250,252,0) 100%);
          filter: blur(0.4px);
          animation: flame 520ms ease-out both;
        }
      `}</style>

      {isHolding && !isLaunched && (
        <div className="absolute inset-0 rounded-full border-2 border-slate-300/20 animate-[rumble_0.1s_infinite]" />
      )}
    </div>
  );
};

export default LaunchThruster;
