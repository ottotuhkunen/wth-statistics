import React, { useEffect, useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  BarController,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { fetchEventData } from '../services/airtable';
import styled from 'styled-components';
import { configNames, atcoNames } from '../utils/constants';
import '../App.css';
import ModernToggle from './ModernToggle'; 
import { atcoPercentageOptions, chartOptions, pieOptions, getChartOptions } from './Options';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  BarController
);

ChartJS.defaults.color = '#b5b7b7'; // Default color for all labels

const ChartContainer = styled.div`
    background-color: #232323;
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 8px;
`;

const PieChartContainer = styled.div`
    display: flex;
    justify-content: center;
    height: 260px;
    margin: 0 auto;
`;

const formatDate = (dateString) => {
  if (!dateString) return '';

  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  return new Intl.DateTimeFormat('en-GB', options).format(new Date(dateString));
};

const Charts = () => {
  const [eventData, setEventData] = useState([]);
  const [timePeriod, setTimePeriod] = useState('all-time'); // 'all-time' or 'rolling-year'

  useEffect(() => {
    const getEventData = async () => {
      try {
        const data = await fetchEventData();
        setEventData(data);
      } catch (error) {
        console.error('Error fetching data from Airtable', error);
      }
    };
    getEventData();
  }, []);

  const calculateAverageGrowth = (data, timePeriod) => {
    if (data.length < 2) return 0; // Not enough data to calculate growth
  
    let growthRates = [];
  
    for (let i = 1; i < data.length; i++) {
      const prevValue = data[i - 1];
      const currValue = data[i];
      const growthRate = currValue - prevValue; // Growth in operations
      growthRates.push(growthRate);
    }
  
    const totalGrowth = growthRates.reduce((acc, rate) => acc + rate, 0);
    const periods = timePeriod === 'rolling-year' ? data.length - 1 : data.length - 1; // Number of periods in a year or months
  
    const averageGrowth = periods > 0 ? totalGrowth / periods : 0;
  
    // Determine the sign for the growth rate
    const sign = averageGrowth > 0 ? '+' : (averageGrowth < 0 ? '-' : '');
  
    // Return the formatted average growth with the sign
    return `${sign}${Math.abs(averageGrowth).toFixed(1)}`;
  };  

  const normalizeMonth = (month) => {
    switch(month) {
      case 'Sept':
      case 'Sep':
        return 'Sep';
      default:
        return month;
    }
  };
  
  const currentMonth = normalizeMonth(new Date().toLocaleString('default', { month: 'short' }));
  
  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const sortedMonthOrder = [
    ...monthOrder.slice(monthOrder.indexOf(currentMonth) + 1),
    ...monthOrder.slice(0, monthOrder.indexOf(currentMonth) + 1)
  ];
  
  const processedData = useMemo(() => {
    
    let filteredEventData = [...eventData];

    if (timePeriod === 'rolling-year') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      filteredEventData = filteredEventData.filter(event => new Date(event.date) >= oneYearAgo);
    }

    const sortedEventData = filteredEventData.sort((a, b) => new Date(a.date) - new Date(b.date));

    const dates = sortedEventData.map(event => event.date);
    const departures = sortedEventData.map(event => event.departures);
    const arrivals = sortedEventData.map(event => event.arrivals);
    const totalMovements = departures.map((dep, index) => dep + arrivals[index]);

    const totalGlobalMovements = totalMovements.reduce((sum, movement) => sum + movement, 0);
    const averageGlobalMovements = Math.round(totalGlobalMovements / totalMovements.length);

    const atcoActivity = sortedEventData.map(event => event.atco.length); // Number of ATCOs online

    const latestDataDate = dates.length ? new Date(Math.max(...dates.map(date => new Date(date).getTime()))).toLocaleDateString() : 'No data available';

    const totalDepartures = departures.reduce((sum, dep) => sum + dep, 0);
    const totalArrivals = arrivals.reduce((sum, arr) => sum + arr, 0);
    const averageDepartures = departures.length ? totalDepartures / departures.length : 0;
    const averageArrivals = arrivals.length ? totalArrivals / arrivals.length : 0;

    // Find the highest peak for departures
    const maxDepartures = Math.max(...departures);
    const maxDeparturesIndex = departures.indexOf(maxDepartures);
    const maxDeparturesDate = new Date(dates[maxDeparturesIndex]).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    // Find the highest peak for arrivals
    const maxArrivals = Math.max(...arrivals);
    const maxArrivalsIndex = arrivals.indexOf(maxArrivals);
    const maxArrivalsDate = new Date(dates[maxArrivalsIndex]).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    const configCounts = Object.keys(configNames)
    .filter(id => configNames[id] !== 'NIL') // Exclude 'NIL'
    .reduce((acc, id) => {
      const name = configNames[id];
      const count = sortedEventData.reduce((total, event) => {
        const configName = configNames[event.config];
        return configName === name ? total + 1 : total;
      }, 0);
      acc[name] = count;
      return acc;
    }, {});

    const atcoCounts = sortedEventData.reduce((acc, event) => {
      event.atco.forEach(atco => {
        if (atcoNames[atco] !== 'NIL') {
          acc[atcoNames[atco]] = (acc[atcoNames[atco]] || 0) + 1;
        }
      });
      return acc;
    }, {});

    const atcoActivityCounts = sortedEventData.reduce((acc, event) => {
        const uniqueAtcos = new Set(event.atco.map(atco => atcoNames[atco])); // Unique ATCO positions for each date
        uniqueAtcos.forEach(atco => {
          acc[atco] = (acc[atco] || 0) + 1;
        });
        return acc;
    }, {});

    // Calculate EFHK ATCO counts as percentages
    const efhkAtcoCounts = Object.keys(atcoActivityCounts)
    .filter((name) => {
      const atcoId = Object.keys(atcoNames).find(id => atcoNames[id] === name);
      return atcoId && parseInt(atcoId) >= 1 && parseInt(atcoId) <= 10; // EFHK
    })
    .sort((a, b) => atcoActivityCounts[b] - atcoActivityCounts[a]) // Sort in descending order by count
    .reduce((acc, name) => {
      const percentage = ((atcoActivityCounts[name] / dates.length) * 100).toFixed(1); // Calculate percentage based on unique dates
      acc[name] = parseFloat(percentage); // Convert to number for charting (no % sign here)
      return acc;
    }, {});
  
  const regionalsAtcoCounts = Object.keys(atcoCounts)
    .filter((name) => {
      const atcoId = Object.keys(atcoNames).find(id => atcoNames[id] === name);
      return atcoId && parseInt(atcoId) >= 11 && parseInt(atcoId) <= 40; // Regionals
    })
    .sort((a, b) => atcoCounts[b] - atcoCounts[a]) // Sort in descending order by value
    .reduce((acc, name) => {
      acc[name] = atcoCounts[name];
      return acc;
    }, {});  

    const monthlyTraffic = sortedEventData.reduce((acc, event) => {
        const month = normalizeMonth(new Date(event.date).toLocaleString('default', { month: 'short' }));
        if (!acc[month]) {
          acc[month] = { departures: 0, arrivals: 0 };
        }
        acc[month].departures += event.departures;
        acc[month].arrivals += event.arrivals;
        return acc;
    }, {});
    
    const monthlyAtcoActivity = sortedEventData.reduce((acc, event) => {
        const month = normalizeMonth(new Date(event.date).toLocaleString('default', { month: 'short' }));
        acc[month] = (acc[month] || 0) + event.atco.length;
        return acc;
    }, {});
    
    const sortedMonthlyTraffic = sortedMonthOrder.reduce((acc, month) => {
        acc[month] = monthlyTraffic[month] || { departures: 0, arrivals: 0 };
        return acc;
    }, {});
    
    const sortedMonthlyAtcoActivity = sortedMonthOrder.reduce((acc, month) => {
        acc[month] = monthlyAtcoActivity[month] || 0;
        return acc;
    }, {});

    const trendline = departures.map((_, i) => {
      const sumX = dates.length * (dates.length - 1) / 2;
      const sumY = departures.reduce((acc, val) => acc + val, 0);
      const sumXY = dates.reduce((acc, _, i) => acc + i * departures[i], 0);
      const sumX2 = dates.reduce((acc, _, i) => acc + i * i, 0);

      const m = (dates.length * sumXY - sumX * sumY) / (dates.length * sumX2 - sumX * sumX);
      const b = (sumY - m * sumX) / dates.length;

      return m * i + b;
    });

    const monthlyTrafficTotals = Object.keys(sortedMonthlyTraffic).reduce((acc, month) => {
        const total = sortedMonthlyTraffic[month].departures + sortedMonthlyTraffic[month].arrivals;
        acc[month] = total;
        return acc;
      }, {});
    
      const monthWithMostTraffic = Object.keys(monthlyTrafficTotals).reduce((maxMonth, month) => {
        return monthlyTrafficTotals[month] > monthlyTrafficTotals[maxMonth] ? month : maxMonth;
    }, Object.keys(monthlyTrafficTotals)[0]);

    const monthWithMostAtcoActivity = Object.keys(sortedMonthlyAtcoActivity).reduce((maxMonth, month) => {
        return sortedMonthlyAtcoActivity[month] > sortedMonthlyAtcoActivity[maxMonth] ? month : maxMonth;
    }, Object.keys(sortedMonthlyAtcoActivity)[0]);

    const totalCounts = departures.map((dep, index) => dep + arrivals[index]);
    const maxTraffic = Math.max(...totalCounts);
    const maxTrafficDate = dates[totalCounts.indexOf(maxTraffic)];

    const parallelApproachATCOs = ['GND', 'TWR E', 'RAD E', 'ARR E', 'TWR W', 'RAD W', 'ARR W'];

    const parallelApproachCount = sortedEventData.reduce((count, event) => {
        const atcos = event.atco.map(atco => atcoNames[atco]);
        // Check if all required ATCOs are present
        const allRequiredATCOsPresent = parallelApproachATCOs.every(requiredATCO => atcos.includes(requiredATCO));
        return allRequiredATCOsPresent ? count + 1 : count;
    }, 0);

    const averageGrowth = calculateAverageGrowth(totalMovements, timePeriod);
      
    return {
      globalData: {
        labels: dates,
        datasets: [
            {
            label: 'Global Movements',
            data: totalMovements,
            borderCapStyle: 'round',
            pointStyle: 'rectRot',
            fill: false,
            tension: 0.3,
            type: 'line'
            }
        ],
        },
        atcoActivityData: {
        labels: dates,
        datasets: [
            {
            label: 'ATCO Activity',
            data: atcoActivity,
            borderWidth: 1,
            type: 'bar',
            }
        ],
      },
      depAndArrData: {
        labels: dates,
        datasets: [
          {
            label: 'Trendline',
            data: trendline,
            borderColor: '#f44336',
            borderDash: [10, 5], // Dashed line for trendline
            type: 'line', // Specify as a line chart
            fill: false,
            borderWidth: 1.5, // Thin line
            pointRadius: 0, // Hide the circles on the line
          },
          {
            label: 'Departures',
            data: departures,
            borderColor: '#2196f3',
            backgroundColor: '#2196f3', // Color for bars
            type: 'bar', // Specify as a bar chart
            fill: false,
            borderWidth: 0,
          },
          {
            label: 'Arrivals',
            data: arrivals,
            borderColor: '#ff9800',
            backgroundColor: '#ff9800', // Color for bars
            type: 'bar', // Specify as a bar chart
            fill: false,
            borderWidth: 0,
          },
        ],
      },      
      configData: {
        labels: Object.keys(configCounts),
        datasets: [{
          data: Object.values(configCounts),
          backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336'],
          borderWidth: 1,
        }],
      },
      efhkAtcoData: {
        labels: Object.keys(efhkAtcoCounts),
        datasets: [{
          data: Object.values(efhkAtcoCounts),
          backgroundColor: '#4caf50',
          borderColor: '#4caf50',
        }],
      },
      regionalsAtcoData: {
        labels: Object.keys(regionalsAtcoCounts),
        datasets: [{
          data: Object.values(regionalsAtcoCounts),
          backgroundColor: '#4caf50',
          borderColor: '#4caf50',
        }],
      },
      barChartData: {
        labels: Object.keys(sortedMonthlyTraffic),
        datasets: [
          {
            label: 'Departures',
            data: Object.values(sortedMonthlyTraffic).map(month => month.departures),
            backgroundColor: '#2196f3',
            borderColor: '#2196f3',
            borderWidth: 1,
          },
          {
            label: 'Arrivals',
            data: Object.values(sortedMonthlyTraffic).map(month => month.arrivals),
            backgroundColor: '#ff9800',
            borderColor: '#ff9800',
            borderWidth: 1,
          },
        ],
      },
      monthlyAtcoActivityData: {
        labels: Object.keys(sortedMonthlyAtcoActivity),
        datasets: [
          {
            label: 'ATCO Activity',
            data: Object.values(sortedMonthlyAtcoActivity),
            backgroundColor: '#4caf50',
            borderColor: '#4caf50',
            borderWidth: 1,
          },
        ],
      },
      maxTrafficDate,
      latestDataDate,
      maxTraffic,
      monthWithMostTraffic,
      monthWithMostAtcoActivity,
      averageGlobalMovements,
      averageGrowth,
      parallelApproachCount,
      averageDepartures,
      averageArrivals,
      maxDepartures,
      maxDeparturesDate,
      maxArrivals,
      maxArrivalsDate
    };
  }, [eventData, timePeriod]); 
  
  const combinedData = {
    labels: processedData.globalData.labels,
    datasets: [
      {
        label: 'Global Movements',
        data: processedData.globalData.datasets[0].data,
        borderColor: 'white',
        borderCapStyle: 'round',
        pointStyle: 'rectRot',
        fill: false,
        tension: 0.3,
        borderWidth: 1.0,
        yAxisID: 'y'
      },
      {
        label: 'ATCO Activity (EFHK + Regionals)',
        data: processedData.atcoActivityData.datasets[0].data,
        backgroundColor: '#265728',
        borderColor: '#265728',
        borderWidth: 1,
        type: 'bar',
        yAxisID: 'y1'
      }
    ]
  };

  return (
    <div className='main-container'>
    <p>Latest data from: {formatDate(processedData.maxTrafficDate)}</p>
    
      <ModernToggle timePeriod={timePeriod} setTimePeriod={setTimePeriod} />

      <ChartContainer>
      <h3>{timePeriod === 'rolling-year' ? 'Activity in the Last 12 Months' : 'Activity'}</h3>
      <Line data={combinedData} options={chartOptions} />
      <p>Average <b>{processedData.averageGlobalMovements}</b> Movements</p>
      </ChartContainer>

      <ChartContainer>
        <h3>{timePeriod === 'rolling-year' ? 'Busiest Day in the Last 12 Months' : 'Busiest Day of All Time'}</h3>
        <p className='max-traffic-title'>The maximum traffic was recorded on {formatDate(processedData.maxTrafficDate)} with</p>
        <p className='max-traffic-text'><b>{processedData.maxTraffic} movements</b></p>
      </ChartContainer>

      <ChartContainer>
      <h3>{timePeriod === 'rolling-year' ? 'Departures and Arrivals in the Last 12 Months' : 'Departures and Arrivals'}</h3>
        <Line data={processedData.depAndArrData} options={getChartOptions('Movements (n)')} />
        <p>Average <b>{processedData.averageDepartures.toFixed(0)}</b> Departures and <b>{processedData.averageArrivals.toFixed(0)}</b> Arrivals</p>
      </ChartContainer>
      
      <ChartContainer>
        <h3>{timePeriod === 'rolling-year' ? 'Departure and Arrival Peaks in the Last 12 Months' : 'Departure and Arrival Peaks'}</h3>
        <p>
            <img src="/departure.png" alt="Departure Icon" style={{ width: '20px', marginRight: '8px', verticalAlign: 'middle' }} />
            <b>{processedData.maxDepartures}</b> departures reached {processedData.maxDeparturesDate}
        </p>
        <p>
            <img src="/arrival.png" alt="Arrival Icon" style={{ width: '20px', marginRight: '8px', verticalAlign: 'middle' }} />
            <b>{processedData.maxArrivals}</b> arrivals reached {processedData.maxArrivalsDate}
        </p>
      </ChartContainer>

      <ChartContainer>
        <h3>
            {timePeriod === 'rolling-year'
                ? 'Average Operations Trend in the Last 12 Months'
                : 'Average Operations Trend'}
        </h3>
        <p>
            The average growth rate is{' '}
                {timePeriod === 'rolling-year'
                ? `${processedData.averageGrowth} ops/month`
                : `${processedData.averageGrowth} ops/year`}
        </p>
      </ChartContainer>

      <ChartContainer>
        <h3>Runway Configuration Usage</h3>
        <PieChartContainer>
          <Pie data={processedData.configData} options={pieOptions} />
        </PieChartContainer>
        <p>Simultaneous Parallel Approaches were established <b>{processedData.parallelApproachCount}</b> times.</p>
      </ChartContainer>

      <ChartContainer>
      <h3>{timePeriod === 'rolling-year' ? 'Helsinki ATCO Activity in the Last 12 Months (%)' : 'Helsinki ATCO Activity (%)'}</h3>
        <Bar data={processedData.efhkAtcoData} options={getChartOptions('Uptime (%)')} />
      </ChartContainer>

      <ChartContainer>
      <h3>{timePeriod === 'rolling-year' ? 'Regionals ATCO Activity in the Last 12 Months (n)' : 'Regionals ATCO Activity (n)'}</h3>
        <Bar data={processedData.regionalsAtcoData} options={getChartOptions('Activity (n)')} />
      </ChartContainer>

      <ChartContainer>
        <h3>Average Traffic Count per Month</h3>
        <Bar data={processedData.barChartData} options={getChartOptions('Movements (n)')} />
        <p>The month with the highest average traffic is <b>{processedData.monthWithMostTraffic}</b>.</p>
      </ChartContainer>

      <ChartContainer>
        <h3>Average ATCO Activity per Month</h3>
        <Bar data={processedData.monthlyAtcoActivityData} options={getChartOptions('ATCO Activity (n)')}  />
        <p>The month with the highest average ATCO activity is <b>{processedData.monthWithMostAtcoActivity}</b>.</p>
      </ChartContainer>

    </div>
  );
};

export default Charts;
