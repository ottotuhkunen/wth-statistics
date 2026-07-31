import React from 'react';
import { atcoNames } from '../data/eventData';

export default function AtcoBreakdown({ stats, totalEvents }) {
    if (!stats) return null;

    const { atcoCounts } = stats;
    const eventCount = totalEvents > 0 ? totalEvents : 1;

    const efhkPositions = [];
    const regionalPositions = [];

    Object.entries(atcoCounts).forEach(([idStr, count]) => {
        const id = Number(idStr);
        const name = atcoNames[id] || `Unknown (${id})`;
        if ((id >= 1 && id <= 9) || id === 10) {
            efhkPositions.push({ id, name, count });
        } else if (id > 10) {
            regionalPositions.push({ id, name, count });
        }
    });

    efhkPositions.sort((a, b) => b.count - a.count);
    regionalPositions.sort((a, b) => b.count - a.count);

    return (
        <div className="grid grid-cols-1 gap-6 items-start">
            {/* EFHK & Area Control Activity */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-6">EFHK & Area Control Activity</h3>
                </div>

                <div className="w-full flex items-end gap-2 overflow-x-auto pb-14 border-b border-slate-800 pt-4">
                    {efhkPositions.map((pos, idx) => {
                        const eventPercentage = Math.round((pos.count / eventCount) * 100);

                        return (
                            <div key={pos.id} className="flex-1 flex flex-col items-center min-w-[45px] group relative">
                                {/* Tooltip */}
                                <div className={`absolute top-0 ${idx < 5 ? 'left-0' : idx > efhkPositions.length - 6 ? 'right-0' : 'left-1/2 -translate-x-1/2'} hidden group-hover:flex flex-col bg-slate-950 text-xs text-slate-200 p-2.5 rounded-lg border border-slate-700 shadow-2xl z-30 whitespace-nowrap pointer-events-none`}>
                                    <span className="font-bold text-sky-400 mb-1">{pos.name}</span>
                                    <span>Shifts: <strong className="text-white">{pos.count}</strong></span>
                                    <span>Uptime: <strong className="text-white">{eventPercentage}%</strong></span>
                                </div>

                                {/* Vertical Staple Bar based on percentage */}
                                <div className="w-full flex flex-col justify-end h-60 bg-slate-950/40 rounded-t-md p-1">
                                    <div
                                        style={{ height: `${Math.max(eventPercentage, 4)}%` }}
                                        className="w-full bg-gradient-to-t from-sky-600 to-sky-400 rounded-t-sm transition-all duration-300 hover:from-sky-500 hover:to-sky-300"
                                    />
                                </div>

                                {/* Position Name, Percentage, and Shifts Below */}
                                <div className="absolute top-full text-[10px] text-slate-400 mt-2 text-center w-full truncate px-0.5" title={pos.name}>
                                    <span className="font-semibold block">{pos.name}</span>
                                    <span className="text-sky-400 font-bold block">{eventPercentage}%</span>
                                    <span className="text-slate-500 block">{pos.count} shifts</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-400">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 bg-sky-400 rounded-sm"></span> EFHK & Area Control Activity</span>
                </div>
            </div>

            {/* Regional Aerodromes Activity */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-6">Regional Aerodromes Activity</h3>
                </div>

                <div className="w-full flex items-end gap-2 overflow-x-auto pb-14 border-b border-slate-800 pt-4">
                    {regionalPositions.map((pos, idx) => {
                        const eventPercentage = Math.round((pos.count / eventCount) * 100);

                        return (
                            <div key={pos.id} className="flex-1 flex flex-col items-center min-w-[45px] group relative">
                                {/* Tooltip */}
                                <div className={`absolute top-0 ${idx < 5 ? 'left-0' : idx > regionalPositions.length - 6 ? 'right-0' : 'left-1/2 -translate-x-1/2'} hidden group-hover:flex flex-col bg-slate-950 text-xs text-slate-200 p-2.5 rounded-lg border border-slate-700 shadow-2xl z-30 whitespace-nowrap pointer-events-none`}>
                                    <span className="font-bold text-indigo-400 mb-1">{pos.name}</span>
                                    <span>Shifts: <strong className="text-white">{pos.count}</strong></span>
                                    <span>Uptime: <strong className="text-white">{eventPercentage}%</strong></span>
                                </div>

                                {/* Vertical Staple Bar based on percentage */}
                                <div className="w-full flex flex-col justify-end h-60 bg-slate-950/40 rounded-t-md p-1">
                                    <div
                                        style={{ height: `${Math.max(eventPercentage, 4)}%` }}
                                        className="w-full bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-sm transition-all duration-300 hover:from-indigo-500 hover:to-purple-400"
                                    />
                                </div>

                                {/* Position Name, Percentage, and Shifts Below */}
                                <div className="absolute top-full text-[10px] text-slate-400 mt-2 text-center w-full truncate px-0.5" title={pos.name}>
                                    <span className="font-semibold block">{pos.name}</span>
                                    <span className="text-indigo-400 font-bold block">{eventPercentage}%</span>
                                    <span className="text-slate-500 block">{pos.count} shifts</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-400">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 bg-indigo-500 rounded-sm"></span> Regional Aerodromes Activity</span>
                </div>
            </div>
        </div>
    );
}