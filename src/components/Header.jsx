import React from 'react';

export default function Header({ timeframe, setTimeframe }) {
    return (
        <header className="flex flex-col md:flex-row justify-between items-center bg-slate-900 border-b border-slate-800 px-6 py-3 mb-8">
            <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <span className="text-white">WTH Event Analytics</span>
                </h1>
            </div>

            <div className="mt-4 md:mt-0 flex items-center select-none bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                    onClick={() => setTimeframe('year')}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        timeframe === 'year'
                            ? 'bg-sky-600 text-white'
                            : 'text-slate-400 hover:text-white'
                    }`}
                >
                    Rolling Year
                </button>
                <button
                    onClick={() => setTimeframe('all')}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        timeframe === 'all'
                            ? 'bg-sky-600 text-white'
                            : 'text-slate-400 hover:text-white'
                    }`}
                >
                    Since 2021
                </button>
            </div>
        </header>
    );
}