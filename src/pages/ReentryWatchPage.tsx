import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import * as satellite from "satellite.js";

import { useSatelliteData } from "@/hooks/useSatelliteData";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { AlertTriangle, Flame, Radar, Satellite as SatelliteIcon, Zap } from "lucide-react";
import { ReentryMap } from "@/components/ReentryMap";

type DecayStatus = "CRITICAL" | "WARNING" | "STABLE";

interface DecayingSatellite {
  id: string;
  noradId: string;
  name: string;
  tle1: string;
  tle2: string;
  meanMotion?: number;
  altitudeKm?: number;
  velocityKmh?: number;
  status: DecayStatus;
  type: "active" | "station" | "starlink" | "debris";
}

function parseMeanMotion(tle2?: string): number | undefined {
  if (!tle2) return undefined;
  try {
    // Mean motion in revs per day is columns 53-63 (1-based) in line 2
    const raw = tle2.substring(52, 63).trim();
    const value = parseFloat(raw);
    return Number.isFinite(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

function classifyStatus(altitudeKm?: number): DecayStatus {
  if (altitudeKm == null || !Number.isFinite(altitudeKm)) {
    return "STABLE";
  }

  // Updated safety bands:
  // < 180 km   -> CRITICAL  (High drag, reentry in hours/days)
  // 180–300 km -> WARNING   (Orbital decay, strong drag)
  // > 300 km   -> STABLE    (Low Earth Orbit)
  if (altitudeKm < 180) return "CRITICAL";
  if (altitudeKm < 300) return "WARNING";
  return "STABLE";
}

function formatAltitude(altitudeKm?: number): string {
  if (altitudeKm == null || !Number.isFinite(altitudeKm)) return "—";
  return `${altitudeKm.toFixed(1)} km`;
}

function formatVelocity(velocityKmh?: number): string {
  if (velocityKmh == null || !Number.isFinite(velocityKmh)) return "—";
  return `${velocityKmh.toLocaleString(undefined, { maximumFractionDigits: 0 })} km/h`;
}

export const ReentryWatchPage: React.FC = () => {
  // Pull live TLEs from multiple low-orbit-heavy groups
  const activeData = useSatelliteData("active");
  const stationsData = useSatelliteData("stations");
  const starlinkData = useSatelliteData("starlink");
  const debris1999Data = useSatelliteData("1999-025");
  const iridiumDebrisData = useSatelliteData("iridium-33-debris");

  const [decayers, setDecayers] = useState<DecayingSatellite[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const allSourcesLoading =
    activeData.isLoading &&
    stationsData.isLoading &&
    starlinkData.isLoading &&
    debris1999Data.isLoading &&
    iridiumDebrisData.isLoading;

  // Merge all satellites into a single map with type metadata
  const allSatellites = useMemo(() => {
    const merged = new Map<string, { id: string; data: any }>();

    const addGroup = (group: typeof activeData, type: DecayingSatellite["type"], prefix: string) => {
      if (!group || group.satellites.size === 0 || group.isLoading) return;
      group.satellites.forEach((sat, noradId) => {
        merged.set(`${prefix}-${noradId}`, {
          id: `${prefix}-${noradId}`,
          data: { ...sat, type, noradId },
        });
      });
    };

    addGroup(activeData, "active", "active");
    addGroup(stationsData, "station", "station");
    addGroup(starlinkData, "starlink", "starlink");
    addGroup(debris1999Data, "debris", "debris1999");
    addGroup(iridiumDebrisData, "debris", "iridium");

    return merged;
  }, [activeData, stationsData, starlinkData, debris1999Data, iridiumDebrisData]);

  // Core decayer computation – recomputed when satellite data changes and every 60s for live drift
  useEffect(() => {
    const computeDecayers = () => {
      const now = new Date();
      const gmst = satellite.gstime(now);

      const candidates: DecayingSatellite[] = [];

      allSatellites.forEach(({ id, data }) => {
        const { name, tle1, tle2, type, noradId } = data || {};
        if (!tle1 || !tle2 || !name) return;

        const meanMotion = parseMeanMotion(tle2);

        try {
          const satrec = satellite.twoline2satrec(tle1, tle2);
          const posVel = satellite.propagate(satrec, now);
          if (!posVel.position) return;

          const geo = satellite.eciToGeodetic(posVel.position, gmst);
          const altitudeKm = geo.height;

          let velocityKmh: number | undefined;
          if (posVel.velocity) {
            const { x, y, z } = posVel.velocity;
            const speedKms = Math.sqrt(x * x + y * y + z * z);
            velocityKmh = speedKms * 3600;
          }

          const isVeryLowByMotion = meanMotion !== undefined && meanMotion > 15.5;
          const isVeryLowByAltitude = altitudeKm < 300;

          if (!isVeryLowByMotion && !isVeryLowByAltitude) {
            return;
          }

          const status = classifyStatus(altitudeKm);

          candidates.push({
            id,
            noradId: noradId ?? "UNKNOWN",
            name,
            tle1,
            tle2,
            meanMotion,
            altitudeKm,
            velocityKmh,
            status,
            type: type ?? "active",
          });
        } catch {
          // Skip bad TLEs
        }
      });

      candidates.sort((a, b) => {
        if (a.altitudeKm == null && b.altitudeKm == null) return 0;
        if (a.altitudeKm == null) return 1;
        if (b.altitudeKm == null) return -1;
        return a.altitudeKm - b.altitudeKm;
      });

      const top = candidates.slice(0, 50);
      setDecayers(top);

      if (top.length > 0 && !selectedId) {
        setSelectedId(top[0].id);
      }
    };

    computeDecayers();
    const interval = setInterval(computeDecayers, 60_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSatellites]);

  const selected = useMemo(
    () => decayers.find((s) => s.id === selectedId) ?? decayers[0],
    [decayers, selectedId],
  );

  const heroStatusBadge = (status: DecayStatus) => {
    if (status === "CRITICAL") {
      return (
        <Badge
          variant="outline"
          className="px-2.5 py-0.5 text-[10px] tracking-[0.25em] uppercase bg-slate-900 text-amber-500 border border-amber-700"
        >
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-500" />
          Critical Decay
        </Badge>
      );
    }
    if (status === "WARNING") {
      return (
        <Badge
          variant="outline"
          className="px-2.5 py-0.5 text-[10px] tracking-[0.25em] uppercase bg-amber-900/30 text-amber-500 border border-amber-700"
        >
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-500" />
          High Drag
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="px-2.5 py-0.5 text-[10px] tracking-[0.25em] uppercase bg-slate-900 text-zinc-300 border border-slate-700"
      >
        <span className="mr-1 inline-block h-2 w-2 rounded-full bg-zinc-400" />
        Stable Orbit
      </Badge>
    );
  };

  const statusPillClass = (status: DecayStatus) => {
    if (status === "CRITICAL") {
      return "bg-red-600/20 text-red-200 border-red-500/70";
    }
    if (status === "WARNING") {
      return "bg-amber-500/15 text-amber-200 border-amber-400/70";
    }
    return "bg-sky-500/10 text-sky-200 border-sky-400/60";
  };

  const altitudeColorClass = (status: DecayStatus) => {
    if (status === "CRITICAL") return "text-red-300";
    if (status === "WARNING") return "text-amber-300";
    return "text-sky-300";
  };

  const orbitalPaceSubtext = (status: DecayStatus, altitudeKm?: number) => {
    if (altitudeKm == null || !Number.isFinite(altitudeKm)) return "Drag unknown";
    if (status === "CRITICAL" || status === "WARNING") return "High drag";
    return "Low drag";
  };

  const velocitySubtext = (altitudeKm?: number): string => {
    if (altitudeKm == null || !Number.isFinite(altitudeKm)) return "Velocity unknown";
    if (altitudeKm < 200) return "High drag corridor";
    if (altitudeKm < 300) return "Atmospheric drag detected";
    return "Nominal LEO speed";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-mono pt-24 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header / Hero framing */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-3"
        >
          <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-[0.3em] text-red-400/80">
            <Zap className="w-3 h-3" />
            <span>Reentry Watch // VLEO Decay Monitor</span>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-slate-100">
              ORBITAL DECAY MONITOR
            </h1>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="hidden sm:inline text-slate-500 uppercase tracking-[0.25em]">Filters</span>
              <Badge className="bg-slate-900/80 border-slate-600/80 text-slate-200">
                Mean Motion &gt; 15.5 rev/day
              </Badge>
              <Badge className="bg-slate-900/80 border-slate-600/80 text-slate-200">&lt; 300 km Altitude</Badge>
            </div>
          </div>
        </motion.div>

        {/* Main layout: Hero (top) + Risk table (bottom) */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] gap-6">
          {/* Hero: highest risk object */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="relative overflow-hidden bg-slate-900 border border-slate-800">
              <CardHeader className="pb-3 border-b border-slate-800">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base text-slate-50">
                      <SatelliteIcon className="w-4 h-4 text-slate-300" />
                      <span className="truncate max-w-[18rem] sm:max-w-xs uppercase">
                        {selected ? selected.name : "Awaiting TLE uplink"}
                      </span>
                    </CardTitle>
                    {selected && (
                      <p className="mt-1 text-[11px] text-zinc-400">
                        NORAD {selected.noradId}
                      </p>
                    )}
                  </div>
                  {selected && (
                    <div className="flex-shrink-0">
                      {heroStatusBadge(selected.status)}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-4 pb-4 sm:pb-5">
                {allSourcesLoading && (
                  <div className="flex items-center justify-center py-10 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full border border-red-400/80 border-t-transparent animate-spin" />
                      Fetching decay candidates from Celestrak…
                    </span>
                  </div>
                )}

                {!allSourcesLoading && !selected && (
                  <div className="flex items-center justify-center py-10 text-xs text-slate-400">
                    No decaying objects matched the VLEO filters yet.
                  </div>
                )}

                {selected && (
                  <div className="grid grid-cols-1 divide-y divide-slate-800 text-xs">
                    {/* ALTITUDE */}
                    <div className="flex flex-col gap-2 px-1 sm:px-3 pb-3">
                      <p className="text-[10px] font-bold tracking-[0.25em] text-zinc-400 uppercase">
                        Altitude
                      </p>
                      <div className={`text-4xl font-mono text-white`}>
                        {selected.altitudeKm != null ? selected.altitudeKm.toFixed(1) : "—"}
                        <span className="ml-1 text-sm text-zinc-400">km</span>
                      </div>
                      <div className="mt-1">
                        <div className="relative h-0.5 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0"
                            style={{
                              width: `${
                                selected.altitudeKm != null && Number.isFinite(selected.altitudeKm)
                                  ? Math.max(0, Math.min(1, selected.altitudeKm / 300)) * 100
                                  : 0
                              }%`,
                              backgroundImage:
                                "linear-gradient(to right, #ef4444 0%, #ef4444 50%, rgba(148,163,184,0.4) 100%)",
                            }}
                          />
                        </div>
                        <div className="mt-1 flex justify-between text-[10px] text-zinc-500">
                          <span>0 km</span>
                          <span>300 km</span>
                        </div>
                      </div>
                    </div>

                    {/* VELOCITY */}
                    <div className="flex flex-col gap-2 px-1 sm:px-3 pt-3 pb-3">
                      <p className="text-[10px] font-bold tracking-[0.25em] text-zinc-400 uppercase">
                        Velocity
                      </p>
                      <div className="text-4xl font-mono text-white">
                        {selected.velocityKmh != null
                          ? selected.velocityKmh.toLocaleString(undefined, { maximumFractionDigits: 0 })
                          : "—"}
                        <span className="ml-1 text-sm text-zinc-400">km/h</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        {velocitySubtext(selected.altitudeKm)}
                      </p>
                    </div>

                    {/* ORBITAL PACE */}
                    <div className="flex flex-col gap-2 px-1 sm:px-3 pt-3 pb-1">
                      <p className="text-[10px] font-bold tracking-[0.25em] text-zinc-400 uppercase">
                        Mean Motion
                      </p>
                      <div className="text-4xl font-mono text-white">
                        {selected.meanMotion != null
                          ? selected.meanMotion.toFixed(2)
                          : "—"}
                        <span className="ml-1 text-sm text-zinc-400">revs/day</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        {orbitalPaceSubtext(selected.status, selected.altitudeKm)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Ground track map */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Card className="h-full border border-red-500/40 bg-slate-950/95 overflow-hidden">
              <CardHeader className="pb-2 border-b border-red-500/30 bg-gradient-to-r from-slate-950/80 via-slate-950/70 to-slate-900/60">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-red-50">
                    <Radar className="w-4 h-4 text-red-300" />
                    Ground Track // Next Orbit
                  </CardTitle>
                  <p className="text-[10px] text-slate-400 uppercase tracking-[0.25em]">
                    Is it flying over me?
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pt-3 pb-3 h-[320px] sm:h-[360px] lg:h-[400px]">
                {selected ? (
                  <ReentryMap tle1={selected.tle1} tle2={selected.tle2} satelliteName={selected.name} />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-slate-400">
                    Waiting for a decaying object to lock onto…
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Risk list */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-2"
        >
          <Card className="border border-slate-800/80 bg-slate-950/90">
            <CardHeader className="pb-2 border-b border-slate-800/80 bg-slate-950/80">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm text-slate-100 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-red-400" />
                    Top Decaying Objects
                  </CardTitle>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Sorted by altitude ascending. The object closest to 0 km is the critical threat.
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <p className="uppercase tracking-[0.25em] text-slate-500">Tracking</p>
                  <p>
                    {decayers.length > 0 ? `Top ${Math.min(decayers.length, 20)} of ${decayers.length}` : "—"}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="rounded border border-slate-800/80 bg-slate-950/80 overflow-hidden">
                <Table className="text-xs sm:text-sm">
                  <TableHeader>
                    <TableRow className="bg-slate-900/80 hover:bg-slate-900/80">
                      <TableHead className="w-[40%]">Name</TableHead>
                      <TableHead className="hidden sm:table-cell">Type</TableHead>
                      <TableHead>Altitude</TableHead>
                      <TableHead className="hidden md:table-cell">Velocity</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {decayers.slice(0, 20).map((sat) => (
                      <TableRow
                        key={sat.id}
                        className={`cursor-pointer transition-colors ${
                          selected?.id === sat.id
                            ? "bg-red-900/40 hover:bg-red-900/60"
                            : "hover:bg-slate-900/80"
                        }`}
                        onClick={() => setSelectedId(sat.id)}
                      >
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="truncate text-slate-100">{sat.name}</span>
                            <span className="text-[11px] text-slate-500">
                              NORAD {sat.noradId}
                              {sat.meanMotion != null && (
                                <span className="ml-2">
                                  {sat.meanMotion.toFixed(2)} orbits/day
                                </span>
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell capitalize text-slate-300">
                          {sat.type}
                        </TableCell>
                        <TableCell className="text-red-200">{formatAltitude(sat.altitudeKm)}</TableCell>
                        <TableCell className="hidden md:table-cell text-sky-200">
                          {formatVelocity(sat.velocityKmh)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${statusPillClass(
                              sat.status,
                            )}`}
                          >
                            {sat.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {decayers.length === 0 && !allSourcesLoading && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-[11px] text-slate-500">
                          No VLEO decayers detected in the current TLE catalog. Check back after the next uplink.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
};

export default ReentryWatchPage;

