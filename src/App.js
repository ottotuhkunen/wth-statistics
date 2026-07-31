import React, { useState, useMemo } from 'react';
import { rawEventData } from './data/eventData';
import { filterDataByTimeframe, computeStats } from './utils/statsHelper';
import arrivalsJson from './data/arrivals.json';
import departuresJson from './data/departures.json';


import Header from './components/Header';
import KpiGrid from './components/KpiGrid';
import ChartsSection from './components/ChartsSection';
import AtcoBreakdown from './components/AtcoBreakdown';
import TrafficInsightsSection from "./components/TrafficInsights";
import MonthsSection from "./components/MonthsSection";

export default function App() {
    const [timeframe, setTimeframe] = useState('all'); // 'all' or 'month'

    // Filter and compute statistics dynamically based on toggle filter state
    const filteredData = useMemo(() => {
        return filterDataByTimeframe(rawEventData, timeframe);
    }, [timeframe]);

    const stats = useMemo(() => {
        return computeStats(filteredData);
    }, [filteredData]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-sky-500 selection:text-white pb-16">
            <Header timeframe={timeframe} setTimeframe={setTimeframe} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <KpiGrid stats={stats} />
                <ChartsSection data={filteredData} />
                <AtcoBreakdown stats={stats} totalEvents={filteredData.length} />
                <TrafficInsightsSection arrivalsData={arrivalsJson} departuresData={departuresJson} />
                <MonthsSection data={filteredData} />
            </main>
        </div>
    );
}