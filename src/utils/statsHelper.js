// Parses "DD.MM.YYYY" into a JS Date object
export function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('.').map(Number);
    return new Date(year, month - 1, day);
}

export function filterDataByTimeframe(data, timeframe) {
    if (timeframe === 'all') return data;

    const dates = data.map(d => parseDate(d.date));
    const latestDate = new Date(Math.max(...dates));

    const threshold = new Date(latestDate);
    threshold.setFullYear(threshold.getFullYear() - 1);

    return data.filter(d => parseDate(d.date) >= threshold);
}

export function computeStats(data) {
    if (!data.length) return null;

    let totalMovements = 0;
    let peakTotal = -1;
    let peakTotalObj = null;

    let peakDeps = -1;
    let peakDepsObj = null;

    let peakArrs = -1;
    let peakArrsObj = null;

    const configCounts = {};
    const atcoCounts = {};
    const monthlyTraffic = {};

    data.forEach(item => {
        const deps = item.departures;
        const arrs = item.arrivals;
        const total = deps + arrs;
        totalMovements += total;

        // Peak total check
        if (total > peakTotal) {
            peakTotal = total;
            peakTotalObj = item;
        }

        // Peak departures check
        if (deps > peakDeps) {
            peakDeps = deps;
            peakDepsObj = item;
        }

        // Peak arrivals check
        if (arrs > peakArrs) {
            peakArrs = arrs;
            peakArrsObj = item;
        }

        // Config tally
        configCounts[item.config] = (configCounts[item.config] || 0) + 1;

        // ATCO tally
        if (Array.isArray(item.atco)) {
            item.atco.forEach(id => {
                atcoCounts[id] = (atcoCounts[id] || 0) + 1;
            });
        }

        // Monthly aggregation
        const dObj = parseDate(item.date);
        const monthKey = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyTraffic[monthKey]) {
            monthlyTraffic[monthKey] = { departures: 0, arrivals: 0, total: 0, events: 0 };
        }
        monthlyTraffic[monthKey].departures += deps;
        monthlyTraffic[monthKey].arrivals += arrs;
        monthlyTraffic[monthKey].total += total;
        monthlyTraffic[monthKey].events += 1;
    });

    return {
        totalMovements,
        peakTotalObj,
        peakDepsObj,
        peakArrsObj,
        configCounts,
        atcoCounts,
        monthlyTraffic
    };
}