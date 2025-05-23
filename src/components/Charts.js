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
import { fetchEventData } from '../services/fetchData';
import styled from 'styled-components';
import { configNames, atcoNames } from '../utils/constants';
import ModernToggle from './ModernToggle';
import { chartOptions, pieOptions, getChartOptions } from './Options';

// Register ChartJS components
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, BarController
);

ChartJS.defaults.color = '#b5b7b7';

// Styled components
const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 14px;
  max-width: 1800px;
  margin: 0 auto;
  margin-top: 50px;
`;

const FullWidthChart = styled.div`
  padding-bottom: 20px;
  padding-top: 20px;
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: #191a1c;
  padding: 20px;
  border-radius: 8px;
  overflow: hidden;
`;

const PieContainer = styled.div`
  height: 300px;
  margin: 0 auto;
`;

const StatCard = styled(ChartCard)`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const StatRow = styled.div`
  display: flex;
  align-items: center;
  align-self: center;
  margin: 8px 0;
`;

const Icon = styled.img`
  width: 20px;
  margin-right: 8px;
`;

const ChartTitle = styled.h3`
  text-align: center;
  margin-bottom: 20px;
`;

const formatDate = (dateInput) => {
  if (!dateInput) return '';
  
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return 'Invalid date';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
  const year = date.getFullYear();
  
  return `${day}.${month}.${year}`;
};

const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split('.');
  return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
};

const Charts = () => {
  const [eventData, setEventData] = useState([]);
  const [timePeriod, setTimePeriod] = useState('all-time');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchEventData();
        setEventData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const processedData = useMemo(() => {
    if (!eventData.length) return {};
    
    // Filter data based on time period
    const filteredData = timePeriod === 'rolling-year'
    ? eventData.filter(event => {
        const now = new Date();
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        return parseDate(event.date) >= oneYearAgo;
      })
    : [...eventData];

    // Sort data by date
    const sortedData = [...filteredData].sort((a, b) => parseDate(a.date) - parseDate(b.date));

    // Basic calculations

    const dates = sortedData.map(event => parseDate(event.date));


    const latestDate = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;

    const departures = sortedData.map(event => event.departures);
    const arrivals = sortedData.map(event => event.arrivals);
    const totalMovements = departures.map((d, i) => d + arrivals[i]);
    const atcoActivity = sortedData.map(event => event.atco.length);

    // Totals and averages
    const totalGlobalMovements = totalMovements.reduce((sum, m) => sum + m, 0);
    const averageGlobalMovements = Math.round(totalGlobalMovements / totalMovements.length);
    const totalDepartures = departures.reduce((sum, d) => sum + d, 0);
    const totalArrivals = arrivals.reduce((sum, a) => sum + a, 0);

    // Peaks
    const maxDepartures = Math.max(...departures);
    const maxArrivals = Math.max(...arrivals);
    const maxTraffic = Math.max(...totalMovements);
    const maxTrafficDate = dates[totalMovements.indexOf(maxTraffic)];

    // Config counts
    const configCounts = Object.entries(configNames)
      .filter(([_, name]) => name !== 'NIL')
      .reduce((acc, [id, name]) => {
        acc[name] = sortedData.filter(event => configNames[event.config] === name).length;
        return acc;
      }, {});

    // ATCO calculations
    const atcoActivityCounts = sortedData.reduce((acc, event) => {
      new Set(event.atco.map(atco => atcoNames[atco])).forEach(atco => {
        acc[atco] = (acc[atco] || 0) + 1;
      });
      return acc;
    }, {});

    const efhkAtcoCounts = Object.entries(atcoActivityCounts)
      .filter(([name]) => {
        const atcoId = Object.keys(atcoNames).find(id => atcoNames[id] === name);
        return atcoId && atcoId >= 1 && atcoId <= 10;
      })
      .sort((a, b) => b[1] - a[1])
      .reduce((acc, [name, count]) => {
        acc[name] = parseFloat(((count / dates.length) * 100).toFixed(1));
        return acc;
      }, {});

    const regionalsAtcoCounts = Object.entries(atcoActivityCounts)
    .filter(([name]) => {
      const atcoId = Object.keys(atcoNames).find(id => atcoNames[id] === name);
      return atcoId && atcoId >= 11 && atcoId <= 40;
    })
    .sort((a, b) => b[1] - a[1])
    .reduce((acc, [name, count]) => {
      acc[name] = count;
      return acc;
    }, {});

    // Monthly calculations
    const monthlyTraffic = sortedData.reduce((acc, event) => {
      const month = event.date.split('.')[1];
      const year = event.date.split('.')[2];
      const key = `${year}-${month.padStart(2, '0')}`;
      
      if (!acc[key]) {
        acc[key] = { departures: 0, arrivals: 0, count: 0 };
      }
      acc[key].departures += event.departures;
      acc[key].arrivals += event.arrivals;
      acc[key].count++;
      return acc;
    }, {});

    const monthlyAtcoActivity = sortedData.reduce((acc, event) => {
      const month = event.date.split('.')[1];
      const year = event.date.split('.')[2];
      const key = `${year}-${month.padStart(2, '0')}`;
      
      if (!acc[key]) {
        acc[key] = { atcoCount: 0, eventCount: 0 };
      }
      acc[key].atcoCount += event.atco.length;
      acc[key].eventCount++;
      return acc;
    }, {});

    // Format monthly data for display
    const monthlyTrafficData = Object.entries(monthlyTraffic).map(([key, value]) => {
      const [year, month] = key.split('-');
      const date = new Date(year, month - 1);
      return {
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        departures: value.departures,
        arrivals: value.arrivals,
        total: value.departures + value.arrivals,
        avg: Math.round((value.departures + value.arrivals) / value.count)
      };
    }).sort((a, b) => new Date(a.month) - new Date(b.month));

    const monthlyAtcoData = Object.entries(monthlyAtcoActivity).map(([key, value]) => {
      const [year, month] = key.split('-');
      const date = new Date(year, month - 1);
      return {
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        avgAtco: Math.round(value.atcoCount / value.eventCount)
      };
    }).sort((a, b) => new Date(a.month) - new Date(b.month));



    // Parallel approaches
    const parallelApproachATCOs = ['GND', 'TWR E', 'RAD E', 'ARR E', 'TWR W', 'RAD W', 'ARR W'];
    const parallelApproachCount = sortedData.filter(event => 
      parallelApproachATCOs.every(atco => 
        event.atco.map(a => atcoNames[a]).includes(atco)
      )
    ).length;

    return {
      dates,
      departures,
      arrivals,
      totalMovements,
      atcoActivity,
      configCounts,
      efhkAtcoCounts,
      regionalsAtcoCounts,
      maxTraffic,
      maxTrafficDate,
      maxDepartures,
      maxArrivals,
      totalDepartures,
      totalArrivals,
      averageGlobalMovements,
      parallelApproachCount,
      latestDataDate: latestDate ? formatDate(latestDate) : 'No data available',
      monthlyTrafficData,
      monthlyAtcoData
    };
  }, [eventData, timePeriod]);

  if (isLoading) {
    return (
      <DashboardContainer>
        <p>Loading data...</p>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <ModernToggle timePeriod={timePeriod} setTimePeriod={setTimePeriod} />

      <FullWidthChart>
        <ChartTitle>{timePeriod === 'rolling-year' ? 'Activity in the Last 12 Months' : 'Activity Since 2021'}</ChartTitle>
        <Line 
          data={{
            labels: processedData.dates.map(date => formatDate(date)),
            datasets: [
              {
                label: 'Global Movements',
                data: processedData.totalMovements,
                borderColor: 'gray',
                tension: 0.2,
                borderWidth: 1,
                pointStyle: 'circle',
                pointRadius: 2,
                pointHoverRadius: 4,
                pointBackgroundColor: 'gray',
                pointBorderColor: 'gray',
                pointBorderWidth: 0
              },
              {
                label: 'ATCO Activity',
                data: processedData.atcoActivity,
                backgroundColor: 'rgba(76, 175, 80, 0.4)',
                type: 'bar',
                borderWidth: 0,
                yAxisID: 'y1'
              }
            ]
          }} 
          options={chartOptions} 
        />
        <p>Average <b>{processedData.averageGlobalMovements}</b> movements per event</p>
      </FullWidthChart>

      <StatCard>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          alignItems: 'flex-start'
        }}>
          {/* Left Column - Busiest Day */}
          <div>
          <ChartTitle style={{ marginBottom: '12px' }}>Busiest Day</ChartTitle>
            <div style={{ lineHeight: '1.4' }}>
              <p style={{ fontWeight: '500', marginBottom: '8px' }}>
                {formatDate(processedData.maxTrafficDate)}
              </p>
              <p style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                color: '#3a86ff',
                margin: '8px 0 0 0'
              }}>
                {processedData.maxTraffic} movements
              </p>
            </div>
          </div>

          {/* Right Column - Totals */}
          <div>
            <ChartTitle style={{ marginBottom: '12px' }}>
              {timePeriod === 'rolling-year' 
                ? 'Total Movements' 
                : 'Total Movements since 2021'}
            </ChartTitle>
            <p style={{ 
              fontSize: '1.8rem', 
              fontWeight: 'bold', 
              color: '#3a86ff',
              margin: '0 0 12px 0'
            }}>
              {(processedData.totalDepartures + processedData.totalArrivals).toLocaleString('fr-FR')}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <StatRow>
                <Icon src="/departure.png" alt="Departures" />
                <span><b>{processedData.totalDepartures.toLocaleString('fr-FR')}</b></span>
                <Icon src="/arrival.png" alt="Arrivals" style={{marginLeft: '20px'}}/>
                <span><b>{processedData.totalArrivals.toLocaleString('fr-FR')}</b></span>
              </StatRow>
            </div>
          </div>
        </div>
      </StatCard>

      <ChartGrid>


        <StatCard>
          <ChartTitle>Runway Configurations</ChartTitle>
          <PieContainer>
            <Pie 
              data={{
                labels: Object.keys(processedData.configCounts),
                datasets: [{
                  data: Object.values(processedData.configCounts),
                  backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336'],
                  borderWidth: 0
                }]
              }} 
              options={pieOptions} 
            />
          </PieContainer>
          <br />
          <p>Simultaneous Parallel Approaches established <b>{processedData.parallelApproachCount}</b> times</p>
        </StatCard>
      </ChartGrid>

      <FullWidthChart>
        <ChartTitle>Departures and Arrivals</ChartTitle>
        <Bar 
          data={{
            labels: processedData.dates.map(date => formatDate(date)),
            datasets: [
              {
                label: 'Departures',
                data: processedData.departures,
                backgroundColor: 'rgba(10, 100, 255, 0.6)',
              },
              {
                label: 'Arrivals',
                data: processedData.arrivals,
                backgroundColor: 'rgba(255, 140, 0, 0.6)',
              }
            ]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { position: 'top' },
            },
            scales: {
              x: { stacked: false },
              y: { beginAtZero: true }
            }
          }}
        />
        
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginTop: '16px',
          fontSize: '14px'
        }}>
          <p style={{ textAlign: 'center' }}>
            Average <b>{Math.round(processedData.totalDepartures / processedData.departures.length).toLocaleString()}</b> departures and{' '}
            <b>{Math.round(processedData.totalArrivals / processedData.arrivals.length).toLocaleString()}</b> arrivals per event
          </p>
          
          <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            marginTop: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon src="/departure.png" alt="Departures" style={{ width: '22px' }} />
              <span style={{textAlign: "left", color: '#3a86ff', fontSize: '1.2rem'}}>
                <b>{processedData.maxDepartures.toLocaleString()}</b> Departures reached {formatDate(processedData.dates[processedData.departures.indexOf(processedData.maxDepartures)])}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon src="/arrival.png" alt="Arrivals" style={{ width: '22px' }} />
              <span style={{textAlign: "left", color: '#3a86ff', fontSize: '1.2rem'}}>
                <b>{processedData.maxArrivals.toLocaleString()}</b> Arrivals reached {formatDate(processedData.dates[processedData.arrivals.indexOf(processedData.maxArrivals)])}
              </span>
            </div>
          </div>
        </div>
      </FullWidthChart>

      <ChartGrid>

        <ChartCard>
          <ChartTitle>Helsinki ATCO Activity</ChartTitle>
          <Bar 
            data={{
              labels: Object.keys(processedData.efhkAtcoCounts),
              datasets: [{
                data: Object.values(processedData.efhkAtcoCounts),
                backgroundColor: 'rgba(76, 175, 80, 0.6)',
                label: 'ATCO Activity EFHK'
              }]
            }} 
            options={{
              ...getChartOptions('Uptime (%)'),
              plugins: {
                legend: { display: false },
                title: { display: false, text: 'Monthly ATCO Activity' }
              }
            }}
          />
        </ChartCard>

        <ChartCard>
          <ChartTitle>Regional ATCO Activity</ChartTitle>
          <Bar 
            data={{
              labels: Object.keys(processedData.regionalsAtcoCounts),
              datasets: [{
                data: Object.values(processedData.regionalsAtcoCounts),
                backgroundColor: 'rgba(76, 175, 80, 0.6)',
                label: 'ATCO Activity Regionals'
              }]
            }} 
            options={{
              ...getChartOptions('Activity (n)'),
              plugins: {
                legend: { display: false },
                title: { display: false, text: 'Monthly ATCO Activity' }
              }
            }}
          />
        </ChartCard>
      </ChartGrid>

      <ChartGrid>
        <ChartCard>
          <ChartTitle>Monthly Traffic</ChartTitle>
          <Bar
            data={{
              labels: processedData.monthlyTrafficData.map(m => m.month),
              datasets: [
                {
                  label: 'Departures',
                  data: processedData.monthlyTrafficData.map(m => m.departures),
                  backgroundColor: 'rgba(10, 100, 255, 0.6)',
                },
                {
                  label: 'Arrivals',
                  data: processedData.monthlyTrafficData.map(m => m.arrivals),
                  backgroundColor: 'rgba(255, 140, 0, 0.6)',
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: false, text: 'Monthly Traffic' }
              },
              scales: {
                x: {
                  stacked: false,
                },
                y: {
                  beginAtZero: true,
                }
              }
            }}
          />
          {/* Note below the chart */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginTop: '16px',
            fontSize: '14px',
            color: '#6e6d6d'
          }}>
            <div style={{ textAlign: 'center', fontStyle: 'italic' }}>
              {(() => {
                const currentPeakDep = processedData.monthlyTrafficData.reduce((max, current) => 
                current.departures > max.departures ? current : max
                );
                const currentPeakArr = processedData.monthlyTrafficData.reduce((max, current) => 
                current.arrivals > max.arrivals ? current : max
                );
                return `Departures peak in ${currentPeakDep.month} (${currentPeakDep.departures.toLocaleString()}); Arrivals in ${currentPeakArr.month} (${currentPeakArr.arrivals.toLocaleString()})`;
              })()}
            </div>
            <div style={{ 
              textAlign: 'center',
              fontWeight: 500,
              color: '#333'
            }}>
            </div>
          </div>

        </ChartCard>

        <ChartCard>
          <ChartTitle>Monthly ATCO Activity</ChartTitle>
          <Bar
            data={{
              labels: processedData.monthlyAtcoData.map(m => m.month),
              datasets: [
                {
                  data: processedData.monthlyAtcoData.map(m => m.avgAtco),
                  backgroundColor: 'rgba(76, 175, 80, 0.6)',
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: false, text: 'Monthly ATCO Activity' }
              },
              scales: {
                x: {
                  stacked: false,
                },
                y: {
                  beginAtZero: true,
                }
              }
            }}
          />
          
          {/* Note below the chart */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginTop: '16px',
            fontSize: '14px',
            color: '#6e6d6d'
          }}>
            <div style={{ textAlign: 'center', fontStyle: 'italic' }}>
              {(() => {
                const currentPeak = processedData.monthlyAtcoData.reduce((max, current) => 
                  current.avgAtco > max.avgAtco ? current : max
                );
                return `Peak activity occurred in ${currentPeak.month} with an average of ${currentPeak.avgAtco.toLocaleString()} units online`;
              })()}
            </div>
            <div style={{ 
              textAlign: 'center',
              fontWeight: 500,
              color: '#333'
            }}>
            </div>
          </div>
        </ChartCard>
      </ChartGrid>

    </DashboardContainer>
  );
};

export default Charts;