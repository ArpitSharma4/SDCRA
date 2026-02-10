import React from "react";
import { Activity, BarChart2, Globe2, Lock, ExternalLink } from "lucide-react";

const AnalyticsDashboardPage: React.FC = () => {
  const dashboardUrl = import.meta.env.VITE_ANALYTICS_DASHBOARD_URL as string | undefined;
  const beaconUrl = import.meta.env.VITE_ANALYTICS_BEACON_URL as string | undefined;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-mono pt-24 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-cyan-400/80">
              <Lock className="w-3 h-3" />
              <span>Owner Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-cyan-300">
              VISITOR ANALYTICS // PRIVATE DASHBOARD
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              This view is not linked from navigation. Only anyone who knows the{" "}
              <span className="text-cyan-300">/admin/analytics</span> route can see it.
              For real access control use upstream auth (e.g. your hosting provider or a backend).
            </p>
          </div>
        </header>

        {/* High-level status (static shell; real data comes from your backend/provider) */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 border border-cyan-500/20 rounded-lg p-4 flex items-start gap-3">
            <div className="mt-0.5">
              <Globe2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">
                Live Pageviews
              </div>
              <div className="text-xl font-semibold text-cyan-200">—</div>
              <div className="text-[11px] text-slate-500">
                Populate from your analytics provider or beacon backend.
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-cyan-500/20 rounded-lg p-4 flex items-start gap-3">
            <div className="mt-0.5">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">
                24h Active Sessions
              </div>
              <div className="text-xl font-semibold text-cyan-200">—</div>
              <div className="text-[11px] text-slate-500">
                Hook this up to Plausible, Umami, PostHog, etc.
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-cyan-500/20 rounded-lg p-4 flex items-start gap-3">
            <div className="mt-0.5">
              <BarChart2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">
                Top Route (24h)
              </div>
              <div className="text-sm font-semibold text-cyan-200">—</div>
              <div className="text-[11px] text-slate-500">
                This card is a placeholder for your own API.
              </div>
            </div>
          </div>
        </section>

        {/* Embedded provider dashboard, if configured */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm uppercase tracking-[0.2em] text-slate-400">
              External analytics dashboard
            </h2>
            {dashboardUrl && (
              <a
                href={dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-cyan-300 hover:text-cyan-200"
              >
                Open in new tab
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {dashboardUrl ? (
            <div className="bg-slate-900/70 border border-cyan-500/20 rounded-lg overflow-hidden h-[480px]">
              <iframe
                src={dashboardUrl}
                title="Analytics Dashboard"
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            <div className="bg-slate-900/70 border border-cyan-500/20 rounded-lg p-4 text-xs text-slate-300 space-y-2">
              <p className="text-cyan-200">
                No external dashboard configured yet.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>
                  Create a site in a provider like <span className="text-cyan-300">Plausible</span>,
                  <span className="text-cyan-300"> Umami</span>, or <span className="text-cyan-300">PostHog</span>.
                </li>
                <li>
                  Enable a shared/read-only dashboard URL and set{" "}
                  <code className="px-1 py-0.5 rounded bg-slate-800 text-[11px]">
                    VITE_ANALYTICS_DASHBOARD_URL
                  </code>{" "}
                  in your environment.
                </li>
                <li>
                  Optionally configure{" "}
                  <code className="px-1 py-0.5 rounded bg-slate-800 text-[11px]">
                    VITE_ANALYTICS_BEACON_URL
                  </code>{" "}
                  to receive pageview beacons from this app.
                </li>
              </ul>
              {beaconUrl && (
                <p className="text-[11px] text-cyan-300/90">
                  Beacons are currently being sent to{" "}
                  <span className="break-all">{beaconUrl}</span>.
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;

