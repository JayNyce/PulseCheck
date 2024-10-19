// src/app/dashboard/page.tsx

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Import Chart.js components
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
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Register the required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Define the structure of the aggregated data returned by the API
interface AggregatedData {
  averageRatings: {
    created_at: string; // Date in YYYY-MM-DD format
    _avg: { rating: number | null };
  }[];
  topicCounts: {
    topic: string;
    count: number;
  }[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [aggregatedData, setAggregatedData] = useState<AggregatedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    if (!session) router.push('/auth/login');
  }, [session, status, router]);

  // Fetch aggregated data
  useEffect(() => {
    if (session?.user?.id) {
      const fetchAggregatedData = async () => {
        try {
          const res = await fetch(`/api/feedbacks/aggregated`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (!res.ok) {
            throw new Error(`Failed to fetch aggregated data: ${res.statusText}`);
          }
          const data: AggregatedData = await res.json();
          setAggregatedData(data);
        } catch (error) {
          console.error('Error fetching aggregated data:', error);
          setError('Failed to load aggregated feedback data.');
        } finally {
          setLoading(false);
        }
      };
      fetchAggregatedData();
    }
  }, [session]);

  if (status === 'loading' || loading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  if (!aggregatedData) {
    return <div className="p-8">No data available.</div>;
  }

  // Prepare data for the Average Ratings Over Time chart
  const dates = aggregatedData.averageRatings.map((item) =>
    new Date(item.created_at).toLocaleDateString()
  );
  const averageRatings = aggregatedData.averageRatings.map((item) => item._avg.rating || 0);

  // Prepare data for the Top Feedback Topics chart
  const topics = aggregatedData.topicCounts.map((item) => item.topic);
  const topicCounts = aggregatedData.topicCounts.map((item) => item.count);

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Average Ratings Over Time */}
        <div className="bg-white p-6 shadow-md rounded">
          <h2 className="text-xl font-semibold mb-4">Average Ratings Over Time</h2>
          <Line
            data={{
              labels: dates,
              datasets: [
                {
                  label: 'Average Rating',
                  data: averageRatings,
                  fill: false,
                  backgroundColor: 'rgba(75,192,192,0.6)',
                  borderColor: 'rgba(75,192,192,1)',
                  tension: 0.1,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: true,
                  text: 'Average Ratings Over Time',
                },
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Date',
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: 'Average Rating',
                  },
                  suggestedMin: 1,
                  suggestedMax: 5,
                  ticks: {
                    stepSize: 1,
                  },
                },
              },
            }}
          />
        </div>

        {/* Top Feedback Topics */}
        <div className="bg-white p-6 shadow-md rounded">
          <h2 className="text-xl font-semibold mb-4">Top Feedback Topics</h2>
          <Bar
            data={{
              labels: topics,
              datasets: [
                {
                  label: 'Feedback Count',
                  data: topicCounts,
                  backgroundColor: 'rgba(153,102,255,0.6)',
                  borderColor: 'rgba(153,102,255,1)',
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              responsive: true,
              indexAxis: 'y' as const, // Horizontal bar chart
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: true,
                  text: 'Top Feedback Topics',
                },
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Feedback Count',
                  },
                  beginAtZero: true,
                },
                y: {
                  title: {
                    display: true,
                    text: 'Topics',
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
