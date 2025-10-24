import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
);

const TaskChart = ({ type, data, options = {}, height = 300 }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  const defaultColors = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#FF6384',
    '#C9CBCF',
    '#4BC0C0',
    '#FF6384'
  ];

  useEffect(() => {
    if (data) {
      processChartData();
    }
  }, [data, type]);

  const processChartData = () => {
    setLoading(true);
    
    let processedData = {};
    
    switch (type) {
      case 'lifecycle':
        processedData = processLifecycleData();
        break;
      case 'status-distribution':
        processedData = processStatusDistribution();
        break;
      case 'priority-breakdown':
        processedData = processPriorityBreakdown();
        break;
      case 'completion-trend':
        processedData = processCompletionTrend();
        break;
      case 'team-performance':
        processedData = processTeamPerformance();
        break;
      case 'velocity':
        processedData = processVelocityData();
        break;
      case 'burndown':
        processedData = processBurndownData();
        break;
      case 'health-radar':
        processedData = processHealthRadar();
        break;
      default:
        processedData = data;
    }
    
    setChartData(processedData);
    setLoading(false);
  };

  const processLifecycleData = () => {
    const lifecycleStages = ['Created', 'In Progress', 'Review', 'Testing', 'Done'];
    const datasets = [];
    
    if (data.tasks) {
      const stageData = lifecycleStages.map(stage => 
        data.tasks.filter(task => task.status === stage).length
      );
      
      datasets.push({
        label: 'Task Lifecycle',
        data: stageData,
        backgroundColor: defaultColors.slice(0, lifecycleStages.length),
        borderColor: defaultColors.slice(0, lifecycleStages.length).map(color => color + '80'),
        borderWidth: 2,
        fill: true
      });
    }
    
    return {
      labels: lifecycleStages,
      datasets
    };
  };

  const processStatusDistribution = () => {
    const statusCount = {};
    
    if (data.tasks) {
      data.tasks.forEach(task => {
        statusCount[task.status] = (statusCount[task.status] || 0) + 1;
      });
    }
    
    return {
      labels: Object.keys(statusCount),
      datasets: [{
        data: Object.values(statusCount),
        backgroundColor: defaultColors.slice(0, Object.keys(statusCount).length),
        borderColor: '#fff',
        borderWidth: 2
      }]
    };
  };

  const processPriorityBreakdown = () => {
    const priorities = ['Low', 'Medium', 'High', 'Critical'];
    const priorityData = priorities.map(priority =>
      data.tasks ? data.tasks.filter(task => task.priority === priority).length : 0
    );
    
    return {
      labels: priorities,
      datasets: [{
        label: 'Task Priority',
        data: priorityData,
        backgroundColor: [
          '#28a745',
          '#ffc107',
          '#fd7e14',
          '#dc3545'
        ],
        borderColor: '#fff',
        borderWidth: 2
      }]
    };
  };

  const processCompletionTrend = () => {
    const last30Days = Array.from({length: 30}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });
    
    const completionData = last30Days.map(date => {
      return data.tasks ? data.tasks.filter(task => 
        task.completedAt && task.completedAt.startsWith(date)
      ).length : 0;
    });
    
    const cumulativeData = completionData.reduce((acc, curr, index) => {
      acc.push((acc[index - 1] || 0) + curr);
      return acc;
    }, []);
    
    return {
      labels: last30Days.map(date => new Date(date).toLocaleDateString()),
      datasets: [
        {
          label: 'Daily Completions',
          data: completionData,
          borderColor: '#36A2EB',
          backgroundColor: '#36A2EB20',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Cumulative',
          data: cumulativeData,
          borderColor: '#FF6384',
          backgroundColor: '#FF638420',
          fill: false,
          tension: 0.4
        }
      ]
    };
  };

  const processTeamPerformance = () => {
    const teamStats = {};
    
    if (data.tasks) {
      data.tasks.forEach(task => {
        if (task.assignedTo) {
          if (!teamStats[task.assignedTo]) {
            teamStats[task.assignedTo] = {
              total: 0,
              completed: 0,
              inProgress: 0,
              overdue: 0
            };
          }
          
          teamStats[task.assignedTo].total++;
          
          if (task.status === 'Done') {
            teamStats[task.assignedTo].completed++;
          } else if (task.status === 'In Progress') {
            teamStats[task.assignedTo].inProgress++;
          }
          
          if (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done') {
            teamStats[task.assignedTo].overdue++;
          }
        }
      });
    }
    
    const teamNames = Object.keys(teamStats);
    
    return {
      labels: teamNames,
      datasets: [
        {
          label: 'Completed',
          data: teamNames.map(name => teamStats[name].completed),
          backgroundColor: '#28a745',
        },
        {
          label: 'In Progress',
          data: teamNames.map(name => teamStats[name].inProgress),
          backgroundColor: '#ffc107',
        },
        {
          label: 'Overdue',
          data: teamNames.map(name => teamStats[name].overdue),
          backgroundColor: '#dc3545',
        }
      ]
    };
  };

  const processVelocityData = () => {
    const weeks = [];
    const velocityData = [];
    
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      weeks.push(`Week ${8-i}`);
      
      const weeklyCompleted = data.tasks ? data.tasks.filter(task =>
        task.completedAt &&
        new Date(task.completedAt) >= weekStart &&
        new Date(task.completedAt) <= weekEnd
      ).reduce((sum, task) => sum + (task.storyPoints || 1), 0) : 0;
      
      velocityData.push(weeklyCompleted);
    }
    
    const avgVelocity = velocityData.reduce((a, b) => a + b, 0) / velocityData.length;
    
    return {
      labels: weeks,
      datasets: [
        {
          label: 'Story Points Completed',
          data: velocityData,
          backgroundColor: '#36A2EB',
          borderColor: '#36A2EB',
          borderWidth: 2
        },
        {
          label: 'Average Velocity',
          data: Array(weeks.length).fill(avgVelocity),
          type: 'line',
          borderColor: '#FF6384',
          borderDash: [5, 5],
          fill: false
        }
      ]
    };
  };

  const processBurndownData = () => {
    const sprintDuration = 14; // 2 weeks
    const totalStoryPoints = data.tasks ? 
      data.tasks.reduce((sum, task) => sum + (task.storyPoints || 1), 0) : 0;
    
    const idealBurndown = Array.from({length: sprintDuration + 1}, (_, i) => 
      totalStoryPoints - (totalStoryPoints / sprintDuration) * i
    );
    
    const actualBurndown = [];
    let remainingPoints = totalStoryPoints;
    
    for (let i = 0; i <= sprintDuration; i++) {
      actualBurndown.push(remainingPoints);
      // Simulate actual burndown based on completion data
      if (data.tasks && i < sprintDuration) {
        const dayCompleted = data.tasks.filter(task => {
          if (!task.completedAt) return false;
          const completedDay = Math.floor(
            (new Date(task.completedAt) - new Date(data.sprintStart || Date.now())) / (1000 * 60 * 60 * 24)
          );
          return completedDay === i;
        }).reduce((sum, task) => sum + (task.storyPoints || 1), 0);
        
        remainingPoints -= dayCompleted;
      }
    }
    
    return {
      labels: Array.from({length: sprintDuration + 1}, (_, i) => `Day ${i}`),
      datasets: [
        {
          label: 'Ideal Burndown',
          data: idealBurndown,
          borderColor: '#28a745',
          borderDash: [5, 5],
          fill: false,
          tension: 0
        },
        {
          label: 'Actual Burndown',
          data: actualBurndown,
          borderColor: '#dc3545',
          backgroundColor: '#dc354520',
          fill: true,
          tension: 0.4
        }
      ]
    };
  };

  const processHealthRadar = () => {
    const metrics = [
      'Velocity',
      'Quality',
      'On Time Delivery',
      'Team Satisfaction',
      'Technical Debt',
      'Code Coverage'
    ];
    
    // Calculate scores based on task data
    const scores = [
      data.velocity || 75,
      data.quality || 85,
      data.onTimeDelivery || 70,
      data.teamSatisfaction || 80,
      100 - (data.technicalDebt || 30), // Invert technical debt
      data.codeCoverage || 65
    ];
    
    return {
      labels: metrics,
      datasets: [{
        label: 'Project Health',
        data: scores,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
      }]
    };
  };

  const getDefaultOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: !!options.title,
          text: options.title
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        }
      },
      ...options
    };

    // Add specific options based on chart type
    switch (type) {
      case 'completion-trend':
      case 'velocity':
      case 'burndown':
        return {
          ...baseOptions,
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: 'Time Period'
              }
            },
            y: {
              display: true,
              title: {
                display: true,
                text: type === 'burndown' ? 'Story Points Remaining' : 'Count'
              }
            }
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          }
        };
      
      case 'health-radar':
        return {
          ...baseOptions,
          scales: {
            r: {
              beginAtZero: true,
              max: 100,
              ticks: {
                stepSize: 20
              }
            }
          }
        };
      
      case 'team-performance':
        return {
          ...baseOptions,
          scales: {
            x: {
              stacked: true,
            },
            y: {
              stacked: true,
              title: {
                display: true,
                text: 'Number of Tasks'
              }
            }
          }
        };
      
      default:
        return baseOptions;
    }
  };

  const renderChart = () => {
    if (!chartData) return null;

    const chartOptions = getDefaultOptions();

    switch (type) {
      case 'lifecycle':
      case 'completion-trend':
      case 'velocity':
      case 'burndown':
        return <Line data={chartData} options={chartOptions} />;
      
      case 'team-performance':
        return <Bar data={chartData} options={chartOptions} />;
      
      case 'status-distribution':
      case 'priority-breakdown':
        return <Doughnut data={chartData} options={chartOptions} />;
      
      case 'health-radar':
        return <Radar data={chartData} options={chartOptions} />;
      
      default:
        return <Line data={chartData} options={chartOptions} />;
    }
  };

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 rounded-lg"
        style={{ height: `${height}px` }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading chart...</p>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 rounded-lg"
        style={{ height: `${height}px` }}
      >
        <div className="text-center text-gray-500">
          <p>No data available for chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      {renderChart()}
    </div>
  );
};

export default TaskChart;