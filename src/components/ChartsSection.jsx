import React, { useRef, useEffect } from 'react';
import { configNames as baseConfigNames } from '../data/eventData';

export default function ChartsSection({ data }) {
    // Refs for synchronizing horizontal scrolls if needed, or targeting the traffic breakdown container
    const trafficScrollRef = useRef(null);

    // Sort data chronologically for charts
    const sortedData = [...data].sort((a, b) => {
        const [da, ma, ya] = a.date.split('.').map(Number);
        const [db, mb, yb] = b.date.split('.').map(Number);
        return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
    });

    // Automatically scroll to the very end (latest event date) on mount or data change
    useEffect(() => {
        if (trafficScrollRef.current) {
            trafficScrollRef.current.scrollLeft = trafficScrollRef.current.scrollWidth;
        }
    }, [sortedData]);

    const maxMovement = Math.max(...sortedData.map(d => d.departures + d.arrivals), 50);
    const maxAtco = Math.max(...sortedData.map(d => d.atco.length), 10);

    // SVG Line Coordinates generator helper for Global Movements
    const points = sortedData.map((item, idx) => {
        const total = item.departures + item.arrivals;
        const x = (idx / (sortedData.length - 1 || 1)) * 100;
        const y = 100 - (total / maxMovement) * 100;
        return { x: isNaN(x) ? 0 : x, y: isNaN(y) ? 100 : y, item };
    });

    // Generate smooth cubic Bézier curve commands
    const smoothPathData = points.reduce((acc, p, idx, arr) => {
        if (idx === 0) return `M ${p.x} ${p.y}`;

        const prev = arr[idx - 1];
        const smoothing = 0.2;
        const prevX = arr[idx - 2] ? arr[idx - 2].x : prev.x;
        const prevY = arr[idx - 2] ? arr[idx - 2].y : prev.y;
        const nextX = arr[idx + 1] ? arr[idx + 1].x : p.x;
        const nextY = arr[idx + 1] ? arr[idx + 1].y : p.y;

        const cpsX = prev.x + (p.x - prevX) * smoothing;
        const cpsY = prev.y + (p.y - prevY) * smoothing;
        const cpeX = p.x - (nextX - prev.x) * smoothing;
        const cpeY = p.y - (nextY - prev.y) * smoothing;

        return `${acc} C ${cpsX} ${cpsY}, ${cpeX} ${cpeY}, ${p.x} ${p.y}`;
    }, '');

    // Process Configuration mapping with SOIR conditions
    const configCounts = {};
    let soirTotalCount = 0;
    let lastSoirDate = null;

    sortedData.forEach(item => {
        let cfgLabel = baseConfigNames[item.config] || `Config ${item.config}`;
        const hasArrW = Array.isArray(item.atco) && item.atco.includes(7);

        if (hasArrW) {
            if (item.config === 2 || item.config === '2') {
                cfgLabel = "SOIR 22";
                soirTotalCount++;
                lastSoirDate = item.date;
            } else if (item.config === 3 || item.config === '3') {
                cfgLabel = "SOIR 04";
                soirTotalCount++;
                lastSoirDate = item.date;
            }
        }

        configCounts[cfgLabel] = (configCounts[cfgLabel] || 0) + 1;
    });

    const sortedConfigEntries = Object.entries(configCounts).sort((a, b) => b[1] - a[1]);
    const totalEvents = sortedData.length || 1;
    const colorPalette = ['from-sky-500 to-indigo-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500', 'from-rose-500 to-pink-500', 'from-purple-500 to-indigo-600'];

    return (
        <div className="grid grid-cols-1 gap-6 mb-8">
            {/* Chart 1: Global Movements Line Chart with ATC Unit Count Background Staples */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Global Movements & ATC Unit Activity</h3>
                    <p className="text-xs text-slate-400 mb-6">Global movements trend line overlaying active ATC unit count background staples</p>
                </div>

                <div className="relative h-64 w-full pt-4 pb-2 border-b border-slate-800 flex flex-col justify-end">
                    {/* Background Staples (ATC Count) */}
                    <div className="absolute inset-x-4 top-4 bottom-8 flex items-end gap-1 pointer-events-none">
                        {sortedData.map((item, idx) => {
                            const heightPct = Math.max((item.atco.length / maxAtco) * 100, 5);
                            return (
                                <div key={`bar-${idx}`} className="flex-1 h-full flex flex-col justify-end">
                                    <div
                                        style={{ height: `${heightPct}%` }}
                                        className="w-full bg-sky-500/15 border-t border-sky-500/30 rounded-t-sm transition-all duration-300"
                                    />
                                </div>
                            );
                        })}
                    </div>

                    {/* SVG Smooth Line Graph (Global Movements) */}
                    <div className="absolute inset-x-4 top-4 bottom-8 pointer-events-none">
                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                            <path
                                d={smoothPathData}
                                fill="none"
                                stroke="#00d492"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                vectorEffect="non-scaling-stroke"
                            />
                        </svg>
                    </div>

                    {/* Interactive Hover Columns & Tooltips */}
                    <div className="absolute inset-x-4 top-4 bottom-8 flex items-end gap-1">
                        {sortedData.map((item, idx) => {
                            const total = item.departures + item.arrivals;
                            let cfgDisplay = baseConfigNames[item.config] || `Config ${item.config}`;
                            const hasArrW = Array.isArray(item.atco) && (item.atco.includes('ARR W') || item.atco[7] === 'ARR W');
                            if (hasArrW) {
                                if (item.config === 2 || item.config === '2') cfgDisplay = "SOIR 22";
                                if (item.config === 3 || item.config === '3') cfgDisplay = "SOIR 04";
                            }

                            return (
                                <div key={`hover-${idx}`} className="flex-1 h-full group relative cursor-pointer">
                                    {/* Adjusted tooltip wrapper with dynamic alignment to stay in bounds on edges */}
                                    <div className={`absolute bottom-full mb-3 ${idx < 5 ? 'left-0' : idx > sortedData.length - 6 ? 'right-0' : 'left-1/2 -translate-x-1/2'} hidden group-hover:flex flex-col bg-slate-950 text-xs text-slate-200 p-2.5 rounded-lg border border-slate-700 shadow-2xl z-30 whitespace-nowrap pointer-events-none`}>
                                        <span className="font-bold text-sky-400 mb-1">{item.date}</span>
                                        <span>Global Movements: <strong className="text-white">{total}</strong> (Deps: {item.departures} | Arrs: {item.arrivals})</span>
                                        <span>Active ATC Units: <strong className="text-sky-300">{item.atco.length}</strong></span>
                                        <span>Config: {cfgDisplay}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* X-Axis Labels */}
                    <div className="flex justify-between text-[10px] text-slate-500 px-4 pt-2">
                        <span>{sortedData[0]?.date}</span>
                        <span>{sortedData[sortedData.length - 1]?.date}</span>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-6 mt-4 text-xs text-slate-400">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 bg-sky-500/20 border border-sky-500/40 rounded-sm"></span> ATC Unit Count (Staples)</span>
                    <span className="flex items-center gap-2"><span className="w-4 h-0.5 bg-emerald-500 rounded-sm"></span> Global Movements (Line)</span>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-6">Traffic Volume Breakdown</h3>
                </div>

                {/* Scrollable container with auto-scroll reference */}
                <div ref={trafficScrollRef} className="w-full flex items-end gap-2 overflow-x-auto pb-14 border-b border-slate-800">
                    {sortedData.map((item, idx) => {
                        const total = item.departures + item.arrivals;
                        const maxFlight = Math.max(...sortedData.map(d => Math.max(d.departures, d.arrivals, d.departures + d.arrivals)), 50);
                        const depPct = (item.departures / (maxFlight * 2)) * 100;
                        const arrPct = (item.arrivals / (maxFlight * 2)) * 100;

                        // Parse date parts to check year changes
                        const [dDay, dMonth, dYear] = item.date.split('.');
                        const prevItem = sortedData[idx - 1];
                        const prevYear = prevItem ? prevItem.date.split('.')[2] : null;
                        const showYear = !prevYear || prevYear !== dYear;

                        return (
                            <div key={idx} className="flex-1 flex flex-col items-center min-w-[30px] group relative">
                                {/* Tooltip with boundary safety classes */}
                                <div className={`absolute top-0 ${idx < 5 ? 'left-0' : idx > sortedData.length - 6 ? 'right-0' : 'left-1/2 -translate-x-1/2'} hidden group-hover:flex flex-col bg-slate-950 text-xs text-slate-200 p-2 rounded-lg border border-slate-700 shadow-2xl z-30 whitespace-nowrap pointer-events-none`}>
                                    <span className="font-bold text-sky-400">{item.date}</span>
                                    <span>Deps: {item.departures} | Arrs: {item.arrivals}</span>
                                    <span>Total: {total}</span>
                                </div>

                                <div className="w-full flex flex-col justify-end h-60 bg-slate-950/40 rounded-t-md p-0.5 gap-0.5">
                                    <div
                                        style={{ height: `${depPct * 2}%` }}
                                        className="w-full bg-cyan-500 rounded-t-sm transition-all duration-300 hover:bg-cyan-400"
                                    />
                                    <div
                                        style={{ height: `${arrPct * 2}%` }}
                                        className="w-full bg-amber-500 rounded-t-sm transition-all duration-300 hover:bg-amber-400"
                                    />
                                </div>
                                <div className="absolute top-full text-[10px] text-slate-500 mt-2 text-center w-full flex flex-col items-center">
                                    <span>{dDay}.{dMonth}</span>
                                    {showYear && <span className="font-semibold mt-1 text-slate-400">{dYear}</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center justify-center gap-6 mt-4 text-xs text-slate-400">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 bg-cyan-400 rounded-sm"></span> Departures</span>
                    <span className="flex items-center gap-2"><span className="w-3 h-3 bg-amber-400 rounded-sm"></span> Arrivals</span>
                </div>
            </div>

            {/* Runway Configuration Distribution (Circle/Donut Diagram + SOIR Metadata) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <h3 className="text-lg font-semibold text-white">Runway Configuration Usage</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-auto">
                    {/* SVG Circle/Donut Chart */}
                    <div className="lg:col-span-5 flex justify-center py-4 flex-col items-center gap-6">
                        <div className="relative w-48 h-48">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                {(() => {
                                    let cumulativePercent = 0;

                                    return sortedConfigEntries.map(([cfgLabel, count], idx) => {
                                        const percentage = (count / totalEvents) * 100;
                                        const strokeDasharray = `${percentage} ${100 - percentage}`;
                                        const strokeDashoffset = -cumulativePercent;
                                        cumulativePercent += percentage;

                                        const colors = ['#38bdf8', '#34d399', '#fbbf24', '#f43f5e', '#a855f7'];
                                        const strokeColor = colors[idx % colors.length];

                                        return (
                                            <circle
                                                key={cfgLabel}
                                                cx="18"
                                                cy="18"
                                                r="15.9155"
                                                fill="transparent"
                                                stroke={strokeColor}
                                                strokeWidth="3.8"
                                                strokeDasharray={strokeDasharray}
                                                strokeDashoffset={strokeDashoffset}
                                                className="transition-all duration-500 hover:opacity-80"
                                            />
                                        );
                                    });
                                })()}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                                <span className="text-2xl font-extrabold text-white">{sortedData.length}</span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Evaluated</span>
                            </div>
                        </div>
                        {soirTotalCount > 0 && (
                            <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-xs flex items-center gap-3">
                                <span className="text-sky-400 font-semibold">SOIR</span>
                                <span className="text-slate-300">Used <strong>{soirTotalCount}</strong> times</span>
                                <span className="text-slate-500">|</span>
                                <span className="text-slate-400">Last: <strong className="text-white">{lastSoirDate}</strong></span>
                            </div>
                        )}
                    </div>

                    {/* Breakdown List (Sorted Most to Least) */}
                    <div className="lg:col-span-7 space-y-3">
                        {sortedConfigEntries.map(([cfgLabel, count], idx) => {
                            const percentage = Math.round((count / totalEvents) * 100);
                            return (
                                <div key={cfgLabel}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-300 font-medium">{cfgLabel}</span>
                                        <span className="text-slate-400">{count} events ({percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                                        <div
                                            className={`bg-gradient-to-r ${colorPalette[idx % colorPalette.length]} h-full rounded-full transition-all duration-500`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}