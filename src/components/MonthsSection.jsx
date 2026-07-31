import React, { useRef, useEffect } from 'react';

export default function MonthsSection({ data }) {
    const trafficScrollRef = useRef(null);
    const atcoScrollRef = useRef(null);

    // Aggregate data by month (JAN - DEC)
    const monthsOrder = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthNamesFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const monthlyDataMap = {};
    monthsOrder.forEach((m, idx) => {
        monthlyDataMap[m] = {
            monthNum: idx + 1,
            monthName: monthNamesFull[idx],
            totalTraffic: 0,
            departures: 0,
            arrivals: 0,
            atcoCountSum: 0,
            eventCount: 0
        };
    });

    (data || []).forEach(item => {
        if (!item.date) return;
        const parts = item.date.split('.');
        if (parts.length < 3) return;
        const monthNum = parseInt(parts[1], 10);
        const monthKey = monthsOrder[monthNum - 1];

        if (monthKey && monthlyDataMap[monthKey]) {
            const deps = item.departures || 0;
            const arrs = item.arrivals || 0;
            const atcoLen = Array.isArray(item.atco) ? item.atco.length : 0;

            monthlyDataMap[monthKey].totalTraffic += (deps + arrs);
            monthlyDataMap[monthKey].departures += deps;
            monthlyDataMap[monthKey].arrivals += arrs;
            monthlyDataMap[monthKey].atcoCountSum += atcoLen;
            monthlyDataMap[monthKey].eventCount += 1;
        }
    });

    const monthlyStats = monthsOrder.map(m => monthlyDataMap[m]);

    const maxTraffic = Math.max(...monthlyStats.map(d => d.totalTraffic), 50);
    const maxAtcoAvg = Math.max(...monthlyStats.map(d => d.eventCount > 0 ? d.atcoCountSum / d.eventCount : 0), 10);

    return (
        <div className="grid grid-cols-1 gap-6 items-start mb-8">
            {/* Chart 1: Monthly Traffic Volume */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-6">Monthly Traffic Volume</h3>
                </div>

                <div ref={trafficScrollRef} className="w-full flex items-end gap-2 overflow-x-auto pb-16 border-b border-slate-800 pt-4">
                    {monthlyStats.map((item, idx) => {
                        const heightPct = Math.round((item.totalTraffic / maxTraffic) * 100);

                        return (
                            <div key={item.monthName} className="flex-1 flex flex-col items-center min-w-[45px] group relative">
                                {/* Tooltip with boundary safety and top alignment to prevent clipping */}
                                <div className={`absolute top-0 ${idx < 3 ? 'left-0' : idx > monthlyStats.length - 4 ? 'right-0' : 'left-1/2 -translate-x-1/2'} hidden group-hover:flex flex-col bg-slate-950 text-xs text-slate-200 p-2.5 rounded-lg border border-slate-700 shadow-2xl z-50 whitespace-nowrap pointer-events-none`}>
                                    <span className="font-bold text-sky-400 mb-1">{item.monthName}</span>
                                    <span>Total Traffic: <strong className="text-white">{item.totalTraffic}</strong></span>
                                    <span>Deps: {item.departures} | Arrs: {item.arrivals}</span>
                                    <span>Evaluated Events: {item.eventCount}</span>
                                </div>

                                {/* Vertical Staple Bar */}
                                <div className="w-full flex flex-col justify-end h-60 bg-slate-950/40 rounded-t-md p-1">
                                    <div
                                        style={{ height: `${Math.max(heightPct, 4)}%` }}
                                        className="w-full bg-gradient-to-t from-sky-600 to-sky-400 rounded-t-sm transition-all duration-300 hover:from-sky-500 hover:to-sky-300"
                                    />
                                </div>

                                {/* Label Below */}
                                <div className="absolute top-full text-[10px] text-slate-400 mt-2 text-center w-full truncate px-0.5">
                                    <span className="font-semibold block">{monthsOrder[idx]}</span>
                                    <span className="text-sky-400 font-bold block">{item.totalTraffic}</span>
                                    <span className="text-slate-500 block">{item.eventCount} events</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-400">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 bg-sky-400 rounded-sm"></span> Monthly Traffic Volume (Deps + Arrs)</span>
                </div>
            </div>

            {/* Chart 2: Monthly ATC Activity */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-6">Monthly ATC Activity</h3>
                </div>

                <div ref={atcoScrollRef} className="w-full flex items-end gap-2 overflow-x-auto pb-16 border-b border-slate-800 pt-4">
                    {monthlyStats.map((item, idx) => {
                        const avgAtco = item.eventCount > 0 ? item.atcoCountSum / item.eventCount : 0;
                        const heightPct = Math.round((avgAtco / maxAtcoAvg) * 100);

                        return (
                            <div key={item.monthName} className="flex-1 flex flex-col items-center min-w-[45px] group relative">
                                {/* Tooltip with boundary safety and top alignment to prevent clipping */}
                                <div className={`absolute top-0 ${idx < 3 ? 'left-0' : idx > monthlyStats.length - 4 ? 'right-0' : 'left-1/2 -translate-x-1/2'} hidden group-hover:flex flex-col bg-slate-950 text-xs text-slate-200 p-2.5 rounded-lg border border-slate-700 shadow-2xl z-50 whitespace-nowrap pointer-events-none`}>
                                    <span className="font-bold text-emerald-400 mb-1">{item.monthName}</span>
                                    <span>Average Active Units: <strong className="text-white">{avgAtco.toFixed(1)}</strong></span>
                                    <span>Evaluated Events: {item.eventCount}</span>
                                </div>

                                {/* Vertical Staple Bar */}
                                <div className="w-full flex flex-col justify-end h-60 bg-slate-950/40 rounded-t-md p-1">
                                    <div
                                        style={{ height: `${Math.max(heightPct, 4)}%` }}
                                        className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-sm transition-all duration-300 hover:from-emerald-500 hover:to-teal-300"
                                    />
                                </div>

                                {/* Label Below */}
                                <div className="absolute top-full text-[10px] text-slate-400 mt-2 text-center w-full truncate px-0.5">
                                    <span className="font-semibold block">{monthsOrder[idx]}</span>
                                    <span className="text-emerald-400 font-bold block">{avgAtco.toFixed(1)}</span>
                                    <span className="text-slate-500 block">avg units</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-400">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 bg-emerald-500 rounded-sm"></span> Average Active ATC Units</span>
                </div>
            </div>
        </div>
    );
}