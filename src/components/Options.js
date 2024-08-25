export const atcoPercentageOptions = {
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: 100
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            let value = context.raw;
            return `${value.toFixed(1)}%`;
          }
        }
      }
    }
};

export const pieOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (context.parsed) {
              label += `: ${context.parsed.toFixed(0)}`;
            }
            return label;
          }
        }
      },
      legend: {
        labels: {
          boxWidth: 20
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
};

export const chartOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (context.parsed.y !== null) {
              label += `: ${context.parsed.y.toFixed(0)}`;
            }
            return label;
          }
        }
      },
      legend: {
        labels: {
          boxWidth: 20,
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        title: {
          display: true,
          text: 'Global Movements (n)'
        },
        position: 'left',
        min: 0
      },
      y1: {
        title: {
          display: true,
          text: 'ATCO Activity (n)'
        },
        position: 'right',
        grid: {
          drawOnChartArea: false
        },
        min: 0,
        max: 20
      }
    }
}; 

export const getChartOptions = (yLabelText) => ({
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (context.parsed.y !== null) {
              label += `: ${context.parsed.y.toFixed(0)}`;
            }
            return label;
          }
        }
      },
      legend: {
        labels: {
          boxWidth: 20,
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        title: {
          display: true,
          text: yLabelText
        },
        position: 'left',
        min: 0
      }
    }
  });
  