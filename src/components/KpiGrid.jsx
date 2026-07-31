import React from 'react';
import { configNames } from '../data/eventData';

export default function KpiGrid({ stats }) {
    if (!stats) return null;

    const { totalMovements, peakTotalObj, peakDepsObj, peakArrsObj, totalDepartures = 0, totalArrivals = 0 } = stats;

    // Calculate percentage breakdown if totals are available from props, otherwise estimate or fallback
    const computedDeps = totalDepartures || (peakTotalObj ? stats.totalDeps : 0);
    const computedArrs = totalArrivals || (peakTotalObj ? stats.totalArrs : 0);

    // Fallback calculation from safe defaults if exact sums aren't direct properties
    const safeTotal = totalMovements || 1;
    const depPct = Math.round(((stats.totalDeps || (totalMovements / 2)) / safeTotal) * 100);
    const arrPct = 100 - depPct;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* All Time Movements */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
                <div>
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Movements</span>
                    <div className="text-3xl font-extrabold text-white mt-2">{totalMovements.toLocaleString("fi")}</div>
                </div>

                {/* Percentage Breakdown Footer */}
                <div className="border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-cyan-400 font-medium">Deps: ~{depPct}%</span>
                    <span className="text-amber-400 fontfc-medium">Arrs: ~{arrPct}%</span>
                </div>
            </div>

            {/* Peak Overall Event */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Peak Traffic</span>
                <div className="text-3xl font-extrabold text-emerald-400 mt-2">
                    {peakTotalObj ? peakTotalObj.departures + peakTotalObj.arrivals : 0} <span className="text-sm font-normal text-slate-400">flights</span>
                </div>
                <div className="text-xs text-slate-300 mt-2">
                    📅 <span className="text-white font-semibold">{peakTotalObj?.date}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                    ATCOs: {peakTotalObj?.atco?.length || 0} | {configNames[peakTotalObj?.config]}
                </div>
            </div>

            {/* Peak Departures */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Peak Departures</span>
                <div className="text-3xl font-extrabold text-cyan-400 mt-2">
                    {peakDepsObj?.departures || 0} <span className="text-sm font-normal text-slate-400">deps</span>
                </div>
                <p className="text-xs text-slate-300 mt-2">
                    📅 <span className="text-white font-semibold">{peakDepsObj?.date}</span>
                </p>
            </div>

            {/* Peak Arrivals */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Peak Arrivals</span>
                <div className="text-3xl font-extrabold text-amber-400 mt-2">
                    {peakArrsObj?.arrivals || 0} <span className="text-sm font-normal text-slate-400">arrs</span>
                </div>
                <p className="text-xs text-slate-300 mt-2">
                    📅 <span className="text-white font-semibold">{peakArrsObj?.date}</span>
                </p>
            </div>
        </div>
    );
}