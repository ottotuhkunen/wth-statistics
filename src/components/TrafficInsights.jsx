import React from 'react';

export default function TrafficInsights({ arrivalsData, departuresData }) {
    if (!arrivalsData && !departuresData) return null;

    // Helper for structured entry sorting and total calculation
    const getPointEntries = (pointsObj) => {
        const entries = Object.entries(pointsObj || {}).sort((a, b) => b[1].count - a[1].count);
        const total = entries.reduce((acc, [, info]) => acc + info.count, 0) || 1;

        const formattedEntries = entries.map(([point, info]) => {
            const percentage = Number(((info.count / total) * 100).toFixed(1));
            return {
                point: point.toUpperCase(),
                count: info.count,
                percentage
            };
        });

        return { entries: formattedEntries, total };
    };

    const getListAdapterEntries = (list, keyName) => {
        const items = list || [];
        const totalCount = items.reduce((acc, item) => acc + (item.count || 0), 0) || 1;

        return items
            .slice(0, 10)
            .map(item => ({
                ...item,
                [keyName]: item[keyName]?.toUpperCase(),
                percentage: Number(((item.count / totalCount) * 100).toFixed(1))
            }));
    };

    const depPoints = getPointEntries(departuresData?.departurePoints);
    const arrPoints = getPointEntries(arrivalsData?.arrivalPoints);

    const topOrigins = getListAdapterEntries(arrivalsData?.topOrigins, "origin");
    const topDestinations = getListAdapterEntries(departuresData?.topDestinations, "destination");
    const topAirlines = getListAdapterEntries(arrivalsData?.topAirlines || departuresData?.topAirlines, "airline");

    // Combine aircraft types from both arrivals and departures and calculate top 10 with percentage
    const combinedAircraftMap = {};
    let totalAircraftCount = 0;

    [...(departuresData?.aircraftTypes || []), ...(arrivalsData?.aircraftTypes || [])].forEach(item => {
        const aircraftName = item.aircraft?.toUpperCase();
        combinedAircraftMap[aircraftName] = (combinedAircraftMap[aircraftName] || 0) + item.count;
        totalAircraftCount += item.count;
    });

    const combinedAircraftTop10 = Object.entries(combinedAircraftMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([aircraft, count]) => ({
            aircraft,
            count,
            percentage: totalAircraftCount > 0 ? Number(((count / totalAircraftCount) * 100).toFixed(2)) : 0
        }));

    // Helper to find percentage for a specific fix name
    const getFixPercentage = (fixName, entries) => {
        const found = entries.find(item => item.point === fixName);
        return found ? `${found.percentage}%` : '0%';
    };

    // Hardcoded color map mapped specifically to fix names
    const fixColorMap = {
        DIVAM: 'bg-[#ffce00]',
        LAKUT: 'bg-[#10B981]',
        LUSEP: 'bg-[#f47a0c]',
        VEPIN: 'bg-[#F43F5E]',
        INTOR: 'bg-[#A855F7]',
        ROPAM: 'bg-[#2563EB]',

        ARVEP: 'bg-[#F43F5E]',
        RENKU: 'bg-[#A855F7]',
        TEVRU: 'bg-[#00ffc2]',
        VALOX: 'bg-[#ffce00]',
        KOIVU: 'bg-[#2563EB]',
        NEPEK: 'bg-[#f47a0c]',
        NUNTO: 'bg-[#2cb200]',
        ADIVO: 'bg-[#10b981]',
        KUVEM: 'bg-[#ff0000]',
        IDEPI: 'bg-[#ff008c]',

    };

    const renderDeparturesSvgCard = (arrPointData) => {
        const { entries, total } = arrPointData;

        // Extract percentages dynamically based on fix name
        const nuntoPct = getFixPercentage('NUNTO', entries);
        const adivoPct = getFixPercentage('ADIVO', entries);
        const tevruPct = getFixPercentage('TEVRU', entries);
        const valoxPct = getFixPercentage('VALOX', entries);
        const koivuPct = getFixPercentage('KOIVU', entries);
        const arvepPct = getFixPercentage('ARVEP', entries);
        const nepekPct = getFixPercentage('NEPEK', entries);
        const renkuPct = getFixPercentage('RENKU', entries);
        const idepiPct = getFixPercentage('IDEPI', entries);
        const kuvemPct = getFixPercentage('KUVEM', entries);

        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-semibold text-white">Departure TMA fixes</h3>
                    <span className="text-xs text-slate-400">
                        Total: <strong className="text-white">{total}</strong>
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center my-auto">
                    {/* SVG Map on the left */}
                    <div className="w-full flex justify-center items-center overflow-hidden">

                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540.6967 433.7693" className="w-full h-auto max-h-[300px]">
                            <g id="a" data-name="bg">
                                <polygon points="192.4467 106.7258 129.2632 190.5392 95.5608 343.3234 118.778 404.8047 243.1705 353.2639 264.3451 351.1532 312.8221 345.9787 389.6908 352.3788 486.3724 278.8463 425.1634 188.7009 382.9503 120.5472 332.635 81.3298 234.1832 84.6661 192.4467 106.7258" fill="#021621" fill-rule="evenodd" stroke="#092c4c" stroke-miterlimit="10"/>
                                <polygon points="132.6675 146.4878 161.8763 147.3049 129.2633 190.5392 95.5609 343.3234 118.7781 404.8047 83.9592 419.5508 54.369 341.1447 63.2202 331.4765 77.1096 316.2934 92.9055 244.6673 101.2801 206.8117 107.1354 180.3264 132.6675 146.4878" fill="#021621" fill-rule="evenodd" stroke="#092c4c" stroke-miterlimit="10"/>
                                <polygon points="325.9627 45.9934 340.4649 57.2276 400.9931 104.3428 405.6909 111.5599 448.4488 149.2793 438.8487 162.2156 511.6322 273.4675 486.3724 278.8463 425.1635 188.7009 382.9504 120.5472 332.6351 81.3299 234.1832 84.6661 276.7368 47.5594 325.9627 45.9934" fill="#021621" fill-rule="evenodd" stroke="#092c4c" stroke-miterlimit="10"/>
                                <g>
                                    <path d="M289.6967,369.9743c-.8167-.3403-1.5654-.7487-2.246-1.4293.6806-.6125,1.4293-1.089,2.246-1.3612.1361-.2042.3403-.3403.4764-.4764.2722-.8167.7486-1.6334,1.4293-2.246.6126.6125,1.089,1.3612,1.3612,2.246.2042.1361.3403.2722.4764.4764.8167.2722,1.6335.7487,2.246,1.3612-.6125.6125-1.4293,1.089-2.246,1.4293-.1361.1361-.2723.3403-.4764.4764-.2722.8167-.7486,1.5654-1.3612,2.1779-.6806-.6125-1.157-1.3612-1.4293-2.1779-.1361-.1361-.3403-.3403-.4764-.4764" fill="#0066b2" fill-rule="evenodd"/>
                                    <path d="M60.4011,359.2208c-.8848.2722-1.7015.7487-2.3821,1.4293.6806.6806,1.4973,1.157,2.3821,1.4293.2722.8848.7487,1.7015,1.4293,2.3821.6806-.6806,1.157-1.4973,1.4293-2.3821.8848-.2722,1.7696-.7487,2.3821-1.4293-.6126-.6806-1.4973-1.157-2.3821-1.4293-.2723-.8848-.7487-1.7696-1.4293-2.3821-.6806.6125-1.157,1.4973-1.4293,2.3821" fill="#0066b2" fill-rule="evenodd"/>
                                    <path d="M104.0278,191.0435c-.8848.2042-1.7696.7487-2.4502,1.3612.6806.6806,1.5654,1.157,2.4502,1.4293.2722.9528.7487,1.7696,1.4293,2.4502.6806-.6806,1.157-1.4973,1.3612-2.4502.9528-.2722,1.7696-.7487,2.4502-1.4293-.6806-.6125-1.4973-1.157-2.4502-1.3612-.2042-.9528-.6806-1.7696-1.3612-2.4502-.6806.6806-1.157,1.4973-1.4293,2.4502" fill="#0066b2" fill-rule="evenodd"/>
                                    <path d="M299.9738,44.9177c-.9529.2042-1.7696.6806-2.4502,1.3612.6806.6806,1.4973,1.157,2.4502,1.4293.2042.8848.6806,1.7696,1.3612,2.4502.6806-.6806,1.157-1.5654,1.4293-2.4502.8848-.2722,1.7696-.7486,2.4502-1.4293-.6806-.6806-1.5654-1.157-2.4502-1.3612-.2722-.9529-.7486-1.7696-1.4293-2.4502-.6806.6806-1.157,1.4973-1.3612,2.4502" fill="#0066b2" fill-rule="evenodd"/>
                                    <path d="M349.1814,279.2498c-.8848.2722-1.7696.7487-2.3821,1.4293.6126.6806,1.4973,1.157,2.3821,1.4293.2723.8848.7486,1.7015,1.4293,2.3821.6806-.6806,1.157-1.4973,1.3612-2.3821.9529-.2723,1.7696-.7487,2.4502-1.4293-.6806-.6806-1.4973-1.157-2.4502-1.4293-.2042-.8848-.6806-1.7015-1.3612-2.3821-.6806.6806-1.157,1.4973-1.4293,2.3821" fill="#0066b2" fill-rule="evenodd"/>
                                    <path d="M450.7276,134.8936c-.9529.2722-1.7696.7487-2.4502,1.4293.6806.6125,1.4973,1.157,2.4502,1.3612.2723.9528.7486,1.7696,1.4293,2.4502.6126-.6806,1.157-1.4973,1.3612-2.4502.9529-.2042,1.7696-.7487,2.4502-1.3612-.6806-.6806-1.4973-1.157-2.4502-1.4293-.2042-.9528-.7486-1.7696-1.3612-2.4502-.6806.6806-1.157,1.4973-1.4293,2.4502" fill="#0066b2" fill-rule="evenodd"/>
                                </g>
                            </g>
                            <g id="b" data-name="fixes">
                                <path id="c" data-name="VALOX" d="M134.2189,393.7112c-1.8729.5763-3.6018,1.5848-5.0425,3.0255,1.4407,1.4407,3.1696,2.4492,5.0425,3.0255.5763,1.8729,1.5848,3.6018,3.0255,5.0425,1.4407-1.4407,2.4492-3.1696,3.0255-5.0425,1.8729-.5763,3.7459-1.5848,5.0425-3.0255-1.2967-1.4407-3.1696-2.4493-5.0425-3.0255-.5763-1.8729-1.5848-3.7459-3.0255-5.0425-1.4407,1.2966-2.4493,3.1696-3.0255,5.0425" fill="#ffce00" fill-rule="evenodd"/>
                                <path id="d" data-name="ADIVO" d="M117.2058,228.0039c-1.8729.5763-3.6018,1.5848-5.0425,3.0255,1.4407,1.4407,3.1696,2.4492,5.0425,3.0255.5763,1.8729,1.5848,3.6018,3.0255,5.0425,1.4407-1.4407,2.4492-3.1696,3.0255-5.0425,1.8729-.5763,3.7459-1.5848,5.0425-3.0255-1.2967-1.4407-3.1696-2.4493-5.0425-3.0255-.5763-1.8729-1.5848-3.7459-3.0255-5.0425-1.4407,1.2966-2.4493,3.1696-3.0255,5.0425" fill="#10b981" fill-rule="evenodd"/>
                                <path id="e" data-name="TEVRU" d="M241.5272,82.8492c-1.8729.5763-3.6018,1.5848-5.0425,3.0255,1.4407,1.4407,3.1696,2.4492,5.0425,3.0255.5763,1.8729,1.5848,3.6018,3.0255,5.0425,1.4407-1.4407,2.4492-3.1696,3.0255-5.0425,1.8729-.5763,3.7459-1.5848,5.0425-3.0255-1.2967-1.4407-3.1696-2.4493-5.0425-3.0255-.5763-1.8729-1.5848-3.7459-3.0255-5.0425-1.4407,1.2966-2.4493,3.1696-3.0255,5.0425" fill="#00ffc2" fill-rule="evenodd"/>
                                <path id="f" data-name="ARVEP" d="M460.1167,241.3348c-1.8729.5763-3.6018,1.5848-5.0425,3.0255,1.4407,1.4407,3.1696,2.4492,5.0425,3.0255.5763,1.8729,1.5848,3.6018,3.0255,5.0425,1.4407-1.4407,2.4492-3.1696,3.0255-5.0425,1.8729-.5763,3.7459-1.5848,5.0425-3.0255-1.2967-1.4407-3.1696-2.4493-5.0425-3.0255-.5763-1.8729-1.5848-3.7459-3.0255-5.0425-1.4407,1.2966-2.4493,3.1696-3.0255,5.0425" fill="#f43f5e" fill-rule="evenodd"/>
                                <path id="g" data-name="RENKU" d="M246.3037,350.1864c-1.8729.5763-3.6018,1.5848-5.0425,3.0255,1.4407,1.4407,3.1696,2.4492,5.0425,3.0255.5763,1.8729,1.5848,3.6018,3.0255,5.0425,1.4407-1.4407,2.4492-3.1696,3.0255-5.0425,1.8729-.5763,3.7459-1.5848,5.0425-3.0255-1.2967-1.4407-3.1696-2.4493-5.0425-3.0255-.5763-1.8729-1.5848-3.7459-3.0255-5.0425-1.4407,1.2966-2.4493,3.1696-3.0255,5.0425" fill="#a855f7" fill-rule="evenodd"/>
                                <path id="h" data-name="KOIVU" d="M214.2978,361.2634c-1.8729.5763-3.6018,1.5848-5.0425,3.0255,1.4407,1.4407,3.1696,2.4492,5.0425,3.0255.5763,1.8729,1.5848,3.6018,3.0255,5.0425,1.4407-1.4407,2.4492-3.1696,3.0255-5.0425,1.8729-.5763,3.7459-1.5848,5.0425-3.0255-1.2967-1.4407-3.1696-2.4493-5.0425-3.0255-.5763-1.8729-1.5848-3.7459-3.0255-5.0425-1.4407,1.2966-2.4493,3.1696-3.0255,5.0425" fill="#2563eb" fill-rule="evenodd"/>
                                <text id="i" data-name="tevru_text" transform="translate(196.6282 60)" fill="#00ffc2" font-family="ArialMT, Arial" font-size="24">{tevruPct}</text>
                                <text id="j" data-name="arvep_text" transform="translate(474.8826 233.7063)" fill="#f43f5e" font-family="ArialMT, Arial" font-size="24">{arvepPct}</text>
                                <text id="k" data-name="koivu_text" transform="translate(187.0521 416)" fill="#2563eb" font-family="ArialMT, Arial" font-size="24">{koivuPct}</text>
                                <text id="l" data-name="renku_text" transform="translate(246 388.6686)" fill="#a855f7" font-family="ArialMT, Arial" font-size="24">{renkuPct}</text>
                                <text id="m" data-name="adivo_text" transform="translate(24 220)" fill="#10b981" font-family="ArialMT, Arial" font-size="24">{adivoPct}</text>
                                <text id="n" data-name="valox_text" transform="translate(120 434)" fill="#ffce00" font-family="ArialMT, Arial" font-size="24">{valoxPct}</text>
                                <path id="o" data-name="KUVEM" d="M109.4616,261.7207c-1.8729.5763-3.6018,1.5848-5.0425,3.0255,1.4407,1.4407,3.1696,2.4492,5.0425,3.0255.5763,1.8729,1.5848,3.6018,3.0255,5.0425,1.4407-1.4407,2.4492-3.1696,3.0255-5.0425,1.8729-.5763,3.7459-1.5848,5.0425-3.0255-1.2967-1.4407-3.1696-2.4493-5.0425-3.0255-.5763-1.8729-1.5848-3.7459-3.0255-5.0425-1.4407,1.2966-2.4493,3.1696-3.0255,5.0425" fill="red" fill-rule="evenodd"/>
                                <text id="p" data-name="kuvem_text" transform="translate(28 269.4872)" fill="red" font-family="ArialMT, Arial" font-size="24">{kuvemPct}</text>
                                <path id="q" data-name="NUNTO" d="M102.1,295.4792c-1.8729.5763-3.6018,1.5848-5.0425,3.0255,1.4407,1.4407,3.1696,2.4492,5.0425,3.0255.5763,1.8729,1.5848,3.6018,3.0255,5.0425,1.4407-1.4407,2.4492-3.1696,3.0255-5.0425,1.8729-.5763,3.7459-1.5848,5.0425-3.0255-1.2967-1.4407-3.1696-2.4493-5.0425-3.0255-.5763-1.8729-1.5848-3.7459-3.0255-5.0425-1.4407,1.2966-2.4493,3.1696-3.0255,5.0425" fill="#2cb200" fill-rule="evenodd"/>
                                <text id="r" data-name="nunto_text" transform="translate(12 316)" fill="#2cb200" font-family="ArialMT, Arial" font-size="24">{nuntoPct}</text>
                                <path id="s" data-name="NEPEK" d="M188.992,103.9089c-1.8729.5763-3.6018,1.5848-5.0425,3.0255,1.4407,1.4407,3.1696,2.4492,5.0425,3.0255.5763,1.8729,1.5848,3.6018,3.0255,5.0425,1.4407-1.4407,2.4492-3.1696,3.0255-5.0425,1.8729-.5763,3.7459-1.5848,5.0425-3.0255-1.2967-1.4407-3.1696-2.4493-5.0425-3.0255-.5763-1.8729-1.5848-3.7459-3.0255-5.0425-1.4407,1.2966-2.4493,3.1696-3.0255,5.0425" fill="#f47a0c" fill-rule="evenodd"/>
                                <text id="t" data-name="nepek_text" transform="translate(120 90)" fill="#f47a0c" font-family="ArialMT, Arial" font-size="24">{nepekPct}</text>
                                <path id="u" data-name="IDEPI" d="M373.5853,112.7261c-1.8729.5763-3.6018,1.5848-5.0425,3.0255,1.4407,1.4407,3.1696,2.4492,5.0425,3.0255.5763,1.8729,1.5848,3.6018,3.0255,5.0425,1.4407-1.4407,2.4492-3.1696,3.0255-5.0425,1.8729-.5763,3.7459-1.5848,5.0425-3.0255-1.2967-1.4407-3.1696-2.4493-5.0425-3.0255-.5763-1.8729-1.5848-3.7459-3.0255-5.0425-1.4407,1.2966-2.4493,3.1696-3.0255,5.0425" fill="#ff008c" fill-rule="evenodd"/>
                                <text id="v" data-name="idepi_text" transform="translate(388.3512 105.0976)" fill="#ff008c" font-family="ArialMT, Arial" font-size="24">{idepiPct}</text>
                            </g>
                        </svg>
                    </div>

                    {/* Progress bars onന്ത് the right */}
                    <div className="space-y-3 my-auto">
                        {entries.map((item) => (
                            <div key={item.point}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-300 font-semibold">{item.point}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-300 font-medium text-[11px]">{item.count} flights</span>
                                        <span className={`font-semibold px-1.5 py-0.5 rounded border text-gray-400 border-gray-500/20 bg-gray-500/10`}>{item.percentage}%</span>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                                    <div
                                        className={`${fixColorMap[item.point] || 'bg-slate-500'} h-full rounded-full transition-all duration-500`}
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderArrivalsSvgCard = (arrPointData) => {
        const { entries, total } = arrPointData;

        // Extract percentages dynamically based on fix name
        const divamPct = getFixPercentage('DIVAM', entries);
        const lakutPct = getFixPercentage('LAKUT', entries);
        const lusepPct = getFixPercentage('LUSEP', entries);
        const vepinPct = getFixPercentage('VEPIN', entries);
        const intorPct = getFixPercentage('INTOR', entries);
        const ropamPct = getFixPercentage('ROPAM', entries);

        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-semibold text-white">Arrival TMA fixes</h3>
                    <span className="text-xs text-slate-400">
                        Total: <strong className="text-white">{total}</strong>
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center my-auto">
                    {/* SVG Map on the left */}
                    <div className="w-full flex justify-center items-center overflow-hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540.6967 433.7693" className="w-full h-auto max-h-[300px]">
                            <g>
                                <polygon points="192.4467 106.7258 129.2632 190.5392 95.5608 343.3234 118.778 404.8047 243.1705 353.2639 264.3451 351.1532 312.8221 345.9787 389.6908 352.3788 486.3724 278.8463 425.1634 188.7009 382.9503 120.5472 332.635 81.3298 234.1832 84.6661 192.4467 106.7258" fill="#021621" fillRule="evenodd" stroke="#092c4c" strokeMiterlimit="10"/>
                                <polygon points="132.6675 146.4878 161.8763 147.3049 129.2633 190.5392 95.5609 343.3234 118.7781 404.8047 83.9592 419.5508 54.369 341.1447 63.2202 331.4765 77.1096 316.2934 92.9055 244.6673 101.2801 206.8117 107.1354 180.3264 132.6675 146.4878" fill="#021621" fillRule="evenodd" stroke="#092c4c" strokeMiterlimit="10"/>
                                <polygon points="325.9627 45.9934 340.4649 57.2276 400.9931 104.3428 405.6909 111.5599 448.4488 149.2793 438.8487 162.2156 511.6322 273.4675 486.3724 278.8463 425.1635 188.7009 382.9504 120.5472 332.6351 81.3299 234.1832 84.6661 276.7368 47.5594 325.9627 45.9934" fill="#021621" fillRule="evenodd" stroke="#092c4c" strokeMiterlimit="10"/>
                                <g>
                                    <g>
                                        <path d="M289.6967,369.9743c-.8167-.3403-1.5654-.7487-2.246-1.4293.6806-.6125,1.4293-1.089,2.246-1.3612.1361-.2042.3403-.3403.4764-.4764.2722-.8167.7486-1.6334,1.4293-2.246.6126.6125,1.089,1.3612,1.3612,2.246.2042.1361.3403.2722.4764.4764.8167.2722,1.6335.7487,2.246,1.3612-.6125.6125-1.4293,1.089-2.246,1.4293-.1361.1361-.2723.3403-.4764.4764-.2722.8167-.7486,1.5654-1.3612,2.1779-.6806-.6125-1.157-1.3612-1.4293-2.1779-.1361-.1361-.3403-.3403-.4764-.4764" fillRule="evenodd"/>
                                        <path d="M60.4011,359.2208c-.8848.2722-1.7015.7487-2.3821,1.4293.6806.6806,1.4973,1.157,2.3821,1.4293.2722.8848.7487,1.7015,1.4293,2.3821.6806-.6806,1.157-1.4973,1.4293-2.3821.8848-.2722,1.7696-.7487,2.3821-1.4293-.6126-.6806-1.4973-1.157-2.3821-1.4293-.2723-.8848-.7487-1.7696-1.4293-2.3821-.6806.6125-1.157,1.4973-1.4293,2.3821" fill="#fff" fillRule="evenodd"/>
                                        <path d="M104.9849,292.9495c-.8848.2042-1.7696.6806-2.3821,1.3612.6125.6806,1.4973,1.157,2.3821,1.4293.2722.8848.7487,1.7696,1.4293,2.4502.6806-.6806,1.157-1.5654,1.4293-2.4502.8848-.2722,1.7015-.7487,2.3821-1.4293-.6806-.6806-1.4973-1.157-2.3821-1.3612-.2723-.9528-.7487-1.7696-1.4293-2.4502-.6806.6806-1.157,1.4973-1.4293,2.4502" fill="#0066b2" fillRule="evenodd"/>
                                        <path d="M118.3205,231.5394c-.9528.2722-1.7696.7487-2.4502,1.4293.6806.6806,1.4973,1.157,2.4502,1.3612.2042.9528.6806,1.7696,1.3612,2.4502.6806-.6806,1.157-1.4973,1.4293-2.4502.8848-.2042,1.7696-.6806,2.4502-1.3612-.6806-.6806-1.5654-1.157-2.4502-1.4293-.2722-.8848-.7487-1.7696-1.4293-2.4502-.6806.6806-1.157,1.5654-1.3612,2.4502" fill="#0066b2" fillRule="evenodd"/>
                                        <path d="M104.0278,191.0435c-.8848.2042-1.7696.7487-2.4502,1.3612.6806.6806,1.5654,1.157,2.4502,1.4293.2722.9528.7487,1.7696,1.4293,2.4502.6806-.6806,1.157-1.4973,1.3612-2.4502.9528-.2722,1.7696-.7487,2.4502-1.4293-.6806-.6125-1.4973-1.157-2.4502-1.3612-.2042-.9528-.6806-1.7696-1.3612-2.4502-.6806.6806-1.157,1.4973-1.4293,2.4502" fill="#fff" fillRule="evenodd"/>
                                        <path d="M299.9738,44.9177c-.9529.2042-1.7696.6806-2.4502,1.3612.6806.6806,1.4973,1.157,2.4502,1.4293.2042.8848.6806,1.7696,1.3612,2.4502.6806-.6806,1.157-1.5654,1.4293-2.4502.8848-.2722,1.7696-.7486,2.4502-1.4293-.6806-.6806-1.5654-1.157-2.4502-1.3612-.2722-.9529-.7486-1.7696-1.4293-2.4502-.6806.6806-1.157,1.4973-1.3612,2.4502" fill="#fff" fillRule="evenodd"/>
                                        <path d="M238.5833,82.8588c-.9529.2042-1.7696.7486-2.4502,1.3612.6806.6806,1.4973,1.157,2.4502,1.4293.2042.9529.6806,1.7696,1.3612,2.4502.6806-.6806,1.157-1.4973,1.4293-2.4502.8848-.2722,1.7696-.7486,2.4502-1.4293-.6806-.6126-1.5654-1.157-2.4502-1.3612-.2722-.9529-.7486-1.7696-1.4293-2.4502-.6806.6806-1.157,1.4973-1.3612,2.4502" fill="#0066b2" fillRule="evenodd"/>
                                        <path d="M190.941,104.8109c-.9528.2723-1.7696.7486-2.4502,1.4293.6806.6806,1.4973,1.157,2.4502,1.4293.2042.8848.7487,1.7696,1.3612,2.3821.6806-.6126,1.157-1.4973,1.4293-2.3821.9528-.2723,1.7696-.7487,2.4502-1.4293-.6806-.6806-1.4973-1.157-2.4502-1.4293-.2042-.8848-.7487-1.7015-1.4293-2.3821-.6125.6806-1.157,1.4973-1.3612,2.3821" fill="#0066b2" fillRule="evenodd"/>
                                        <path d="M248.3159,351.0325c-.8848.2722-1.7015.7487-2.3821,1.4293.6806.6125,1.4973,1.157,2.3821,1.3612.2723.9528.7486,1.7696,1.4293,2.4502.6806-.6806,1.157-1.4973,1.4293-2.4502.8848-.2042,1.7696-.7487,2.3821-1.3612-.6126-.6806-1.4973-1.157-2.3821-1.4293-.2723-.9528-.7487-1.7696-1.4293-2.4502-.6806.6806-1.157,1.4973-1.4293,2.4502" fill="#0066b2" fillRule="evenodd"/>
                                        <path d="M349.1814,279.2498c-.8848.2722-1.7696.7487-2.3821,1.4293.6126.6806,1.4973,1.157,2.3821,1.4293.2723.8848.7486,1.7015,1.4293,2.3821.6806-.6806,1.157-1.4973,1.3612-2.3821.9529-.2723,1.7696-.7487,2.4502-1.4293-.6806-.6806-1.4973-1.157-2.4502-1.4293-.2042-.8848-.6806-1.7015-1.3612-2.3821-.6806.6806-1.157,1.4973-1.4293,2.3821" fill="#fff" fillRule="evenodd"/>
                                        <path d="M374.568,113.3866c-.8848.2723-1.7015.7486-2.3821,1.4293.6806.6806,1.4973,1.157,2.3821,1.4293.2723.8848.7486,1.7015,1.4293,2.3821.6806-.6806,1.157-1.4973,1.4293-2.3821.8848-.2723,1.7015-.7487,2.3821-1.4293-.6806-.6806-1.4973-1.157-2.3821-1.4293-.2723-.8848-.7487-1.7015-1.4293-2.3821-.6806.6806-1.157,1.4973-1.4293,2.3821" fill="#0066b2" fillRule="evenodd"/>
                                        <path d="M450.7276,134.8936c-.9529.2722-1.7696.7487-2.4502,1.4293.6806.6125,1.4973,1.157,2.4502,1.3612.2723.9528.7486,1.7696,1.4293,2.4502.6126-.6806,1.157-1.4973,1.3612-2.4502.9529-.2042,1.7696-.7487,2.4502-1.3612-.6806-.6806-1.4973-1.157-2.4502-1.4293-.2042-.9528-.7486-1.7696-1.3612-2.4502-.6806.6806-1.157,1.4973-1.4293,2.4502" fill="#fff" fillRule="evenodd"/>
                                        <path d="M462.434,244.1306c-.8848.2042-1.7696.6806-2.3821,1.3612.6126.6806,1.4973,1.157,2.3821,1.4293.2723.8848.7486,1.7696,1.4293,2.4502.6806-.6806,1.157-1.5654,1.3612-2.4502.9529-.2722,1.7696-.7487,2.4502-1.4293-.6806-.6806-1.4973-1.157-2.3821-1.3612-.2723-.9528-.7487-1.7696-1.4293-2.4502-.6806.6806-1.157,1.4973-1.4293,2.4502" fill="#0066b2" fillRule="evenodd"/>
                                        <path d="M214.9663,362.6883c-.9529.2042-1.7696.6806-2.4502,1.3612.6806.6806,1.4973,1.157,2.4502,1.4293.2723.8848.7486,1.7696,1.4293,2.4502.6126-.6806,1.157-1.5654,1.3612-2.4502.9529-.2722,1.7696-.7487,2.4502-1.4293-.6806-.6806-1.4973-1.157-2.4502-1.3612-.2042-.9528-.7486-1.7696-1.3612-2.4502-.6806.6806-1.157,1.4973-1.4293,2.4502" fill="#0066b2" fillRule="evenodd"/>
                                        <path d="M138.6025,394.5496c-.8848.2722-1.7015.7487-2.3821,1.4293.6806.6806,1.4973,1.157,2.3821,1.3612.2722.9528.7487,1.7696,1.4293,2.4502.6806-.6806,1.157-1.4973,1.4293-2.4502.8848-.2042,1.7015-.6806,2.3821-1.3612-.6806-.6806-1.4973-1.157-2.3821-1.4293-.2723-.8848-.7487-1.7696-1.4293-2.4502-.6806.6806-1.157,1.5654-1.4293,2.4502" fill="#0066b2" fillRule="evenodd"/>
                                    </g>
                                    <path d="M111.6249,262.0891c-.9528.2722-1.7696.7487-2.4502,1.4293.6806.6806,1.4973,1.157,2.4502,1.3612.2042.9528.6806,1.7696,1.3612,2.4502.6806-.6806,1.157-1.4973,1.4293-2.4502.8848-.2042,1.7696-.6806,2.4502-1.3612-.6806-.6806-1.5654-1.157-2.4502-1.4293-.2722-.8848-.7487-1.7696-1.4293-2.4502-.6806.6806-1.157,1.5654-1.3612,2.4502" fill="#0066b2" fillRule="evenodd"/>
                                </g>
                            </g>
                            <g id="b">
                                <path id="c" d="M57.8288,357.5548c-1.8729.5763-3.6018,1.5848-5.0425,3.0255,1.4407,1.4407,3.1696,2.4492,5.0425,3.0255.5763,1.8729,1.5848,3.6018,3.0255,5.0425,1.4407-1.4407,2.4492-3.1696,3.0255-5.0425,1.8729-.5763,3.7459-1.5848,5.0425-3.0255-1.2967-1.4407-3.1696-2.4493-5.0425-3.0255-.5763-1.8729-1.5848-3.7459-3.0255-5.0425-1.4407,1.2966-2.4493,3.1696-3.0255,5.0425" fill="#ffce00" fillRule="evenodd"/>
                                <path id="d" d="M101.4215,190.4024c-1.8729.5763-3.6018,1.5848-5.0425,3.0255,1.4407,1.4407,3.1696,2.4492,5.0425,3.0255.5763,1.8729,1.5848,3.6018,3.0255,5.0425,1.4407-1.4407,2.4492-3.1696,3.0255-5.0425,1.8729-.5763,3.7459-1.5848,5.0425-3.0255-1.2967-1.4407-3.1696-2.4493-5.0425-3.0255-.5763-1.8729-1.5848-3.7459-3.0255-5.0425-1.4407,1.2966-2.4493,3.1696-3.0255,5.0425" fill="#10b981" fillRule="evenodd"/>
                                <path id="e" d="M298.7201,43.7966c-1.8729.5763-3.6018,1.5848-5.0425,3.0255,1.4407,1.4407,3.1696,2.4492,5.0425,3.0255.5763,1.8729,1.5848,3.6018,3.0255,5.0425,1.4407-1.4407,2.4492-3.1696,3.0255-5.0425,1.8729-.5763,3.7459-1.5848,5.0425-3.0255-1.2967-1.4407-3.1696-2.4493-5.0425-3.0255-.5763-1.8729-1.5848-3.7459-3.0255-5.0425-1.4407,1.2966-2.4493,3.1696-3.0255,5.0425" fill="#f47a0c" fillRule="evenodd"/>
                                <path id="f" d="M449.0973,133.2633c-1.8729.5763-3.6018,1.5848-5.0425,3.0255,1.4407,1.4407,3.1696,2.4492,5.0425,3.0255.5763,1.8729,1.5848,3.6018,3.0255,5.0425,1.4407-1.4407,2.4492-3.1696,3.0255-5.0425,1.8729-.5763,3.7459-1.5848,5.0425-3.0255-1.2967-1.4407-3.1696-2.4493-5.0425-3.0255-.5763-1.8729-1.5848-3.7459-3.0255-5.0425-1.4407,1.2966-2.4493,3.1696-3.0255,5.0425" fill="#f43f5e" fillRule="evenodd"/>
                                <path id="g" d="M288.4595,365.3902c-1.8729.5763-3.6018,1.5848-5.0425,3.0255,1.4407,1.4407,3.1696,2.4492,5.0425,3.0255.5763,1.8729,1.5848,3.6018,3.0255,5.0425,1.4407-1.4407,2.4492-3.1696,3.0255-5.0425,1.8729-.5763,3.7459-1.5848,5.0425-3.0255-1.2967-1.4407-3.1696-2.4493-5.0425-3.0255-.5763-1.8729-1.5848-3.7459-3.0255-5.0425-1.4407,1.2966-2.4493,3.1696-3.0255,5.0425" fill="#a855f7" fillRule="evenodd"/>
                                <path id="h" d="M347.5852,277.6535c-1.8729.5763-3.6018,1.5848-5.0425,3.0255,1.4407,1.4407,3.1696,2.4492,5.0425,3.0255.5763,1.8729,1.5848,3.6018,3.0255,5.0425,1.4407-1.4407,2.4492-3.1696,3.0255-5.0425,1.8729-.5763,3.7459-1.5848,5.0425-3.0255-1.2967-1.4407-3.1696-2.4493-5.0425-3.0255-.5763-1.8729-1.5848-3.7459-3.0255-5.0425-1.4407,1.2966-2.4493,3.1696-3.0255,5.0425" fill="#2563eb" fillRule="evenodd"/>

                                {/* Dynamic Percentage Text Elements inside the SVG */}
                                <text transform="translate(307.12 31.6316)" fill="#f47a0c" fontFamily="ArialMT, Arial" fontSize="24"><tspan x="0" y="0">{lusepPct}</tspan></text>
                                <text transform="translate(463.8632 125.6348)" fill="#f43f5e" fontFamily="ArialMT, Arial" fontSize="24"><tspan x="0" y="0">{vepinPct}</tspan></text>
                                <text transform="translate(359.6864 270.1015)" fill="#2563eb" fontFamily="ArialMT, Arial" fontSize="24"><tspan x="0" y="0">{ropamPct}</tspan></text>
                                <text transform="translate(299.5533 398.1016)" fill="#a855f7" fontFamily="ArialMT, Arial" fontSize="24"><tspan x="0" y="0">{intorPct}</tspan></text>
                                <text transform="translate(54.3692 179.6571)" fill="#10b981" fontFamily="ArialMT, Arial" fontSize="24"><tspan x="0" y="0">{lakutPct}</tspan></text>
                                <text transform="translate(13.6097 395.9449)" fill="#ffce00" fontFamily="ArialMT, Arial" fontSize="24"><tspan x="0" y="0">{divamPct}</tspan></text>
                            </g>
                        </svg>
                    </div>

                    <div className="space-y-3 my-auto">
                        {entries.map((item) => (
                            <div key={item.point}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-300 font-semibold">{item.point}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-300 font-medium text-[11px]">{item.count} flights</span>
                                        <span className={`font-semibold px-1.5 py-0.5 rounded border text-gray-400 border-gray-500/20 bg-gray-500/10`}>{item.percentage}%</span>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                                    <div
                                        className={`${fixColorMap[item.point] || 'bg-slate-500'} h-full rounded-full transition-all duration-500`}
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderProgressBarCard = (title, pointData) => {
        const { entries, total } = pointData;

        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-semibold text-white">{title}</h3>
                    <span className="text-xs text-slate-400">
                        Total: <strong className="text-white">{total}</strong>
                    </span>
                </div>

                <div className="space-y-3 my-auto">
                    {entries.map((item) => (
                        <div key={item.point}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-300 font-semibold">{item.point}</span>
                                <span className="text-slate-400">{item.count} flights ({item.percentage}%)</span>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                                <div
                                    className={`${fixColorMap[item.point] || 'bg-slate-500'} h-full rounded-full transition-all duration-500`}
                                    style={{ width: `${item.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderListCard = (title, items, keyName, badgeColorClass) => (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
                <h3 className="text-base font-semibold text-white mb-4">{title}</h3>
            </div>

            <div className="space-y-2">
                {(items || []).map((item, idx) => (
                    <div key={item[keyName]} className="flex items-center justify-between bg-slate-950/60 border border-slate-800/60 px-3 py-2 rounded-xl">
                        <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold text-slate-500 w-4">#{idx + 1}</span>
                            <span className="text-xs font-bold text-white tracking-wider">{item[keyName]}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[11px]">
                            <span className="text-slate-300 font-medium">{item.count} flights</span>
                            <span className={`font-semibold px-1.5 py-0.5 rounded border ${badgeColorClass}`}>{item.percentage}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 gap-6 my-6">

            <div className="grid grid-cols-1 gap-6 items-stretch">
                {renderDeparturesSvgCard(depPoints)}
                {renderArrivalsSvgCard(arrPoints)}
            </div>

            {/* Row 2: Top Departure Airports & Top Destinations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {renderListCard(
                    "Top 10 Departure Airports",
                    topOrigins,
                    "origin",
                    "text-sky-400 bg-sky-500/10 border-sky-500/20"
                )}
                {renderListCard(
                    "Top 10 Destinations",
                    topDestinations,
                    "destination",
                    "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
                )}
            </div>

            {/* Row 3: Combined Top 10 Aircraft Types & Top 10 Airlines */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {renderListCard(
                    "Top 10 Aircraft Types",
                    combinedAircraftTop10,
                    "aircraft",
                    "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                )}
                {renderListCard(
                    "Top 10 Airlines",
                    topAirlines,
                    "airline",
                    "text-amber-400 bg-amber-500/10 border-amber-500/20"
                )}
            </div>
        </div>
    );
}