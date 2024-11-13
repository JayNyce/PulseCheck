// src/app/dashboard/page.tsx

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// TypeScript interfaces
interface DashboardData {
  receivedFeedback: {
    averageRating: number | null;
    topicDistribution: Record<string, number>;
    ratingDistribution: Record<string, number>;
  };
}

const colorPalette = [
  '#3366cc', '#dc3912', '#ff9900', '#109618', '#990099',
  '#0099c6', '#dd4477', '#66aa00', '#b82e2e', '#316395',
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/login');
    }
  }, [session, status, router]);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        const data: DashboardData = await res.json();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session?.user?.id]);

  // Prepare Pie Chart Data
  const topicChartData = useMemo(() => {
    if (!dashboardData) return { labels: [], datasets: [] };
    const labels = Object.keys(dashboardData.receivedFeedback.topicDistribution);
    const values = Object.values(dashboardData.receivedFeedback.topicDistribution);
    const colors = colorPalette.slice(0, labels.length);
    return {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
      }],
    };
  }, [dashboardData]);

  // Prepare Bar Chart Data
  const ratingChartData = useMemo(() => {
    if (!dashboardData) return { labels: [], datasets: [] };
    const labels = Object.keys(dashboardData.receivedFeedback.ratingDistribution);
    const values = Object.values(dashboardData.receivedFeedback.ratingDistribution);
    const colors = colorPalette.slice(0, labels.length);
    return {
      labels,
      datasets: [{
        label: 'Number of Feedbacks',
        data: values,
        backgroundColor: colors,
      }],
    };
  }, [dashboardData]);

  // Calculate Average Rating
  const averageRating = useMemo(() => {
    if (!dashboardData) return 'N/A';
    return typeof dashboardData.receivedFeedback.averageRating === 'number'
      ? dashboardData.receivedFeedback.averageRating.toFixed(2)
      : 'N/A';
  }, [dashboardData]);

  // Chart Options
  const pieChartOptions: ChartOptions<'pie'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000, // 1 second
      easing: 'easeOutQuart' as const, // Explicitly typed
    },
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: false,
      },
    },
  }), []);

  const barChartOptions: ChartOptions<'bar'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000, // 1 second
      easing: 'easeOutQuart' as const, // Explicitly typed
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Feedbacks',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Rating',
        },
      },
    },
    plugins: {
      legend: {
        display: false, // Hide legend for bar chart
      },
      title: {
        display: false,
      },
    },
  }), []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-xl">No data available.</div>
      </div>
    );
  }

  const { receivedFeedback } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex flex-col">
      {/* Dashboard Title */}
      <h1 className="text-3xl font-bold mb-6 text-center">Your Feedback Dashboard</h1>

      {/* Average Rating */}
      <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center mb-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Average Rating</h2>
          <p className="text-4xl font-bold">
            {averageRating !== 'N/A' ? averageRating : 'N/A'}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
        {/* Topic Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Topic Distribution</h2>
          <div className="w-full h-64">
            <Pie 
              data={topicChartData} 
              options={pieChartOptions} 
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Rating Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Rating Distribution</h2>
          <div className="w-full h-64">
            <Bar 
              data={ratingChartData} 
              options={barChartOptions} 
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
