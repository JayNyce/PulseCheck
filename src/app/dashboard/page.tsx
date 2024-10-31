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
  givenFeedback: {
    totalGiven: number;
    recentFeedbacks: Feedback[];
  };
  courses: Course[];
}

interface Feedback {
  id: number;
  toUser: { name: string };
  topic: { name: string };
  rating: number;
  comment: string; // Added comment field
  created_at: string;
}

interface Course {
  id: number;
  name: string;
  description: string;
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
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [editRating, setEditRating] = useState<number>(0);
  const [editTopic, setEditTopic] = useState<string>('');
  const [editComment, setEditComment] = useState<string>(''); // Added state for editing comments

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/auth/login');
  }, [session, status, router]);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) throw new Error('Failed to fetch data');
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
  }, [session]);

  // Prepare chart data
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

  const ratingChartData = useMemo(() => {
    if (!dashboardData) return { labels: [], datasets: [] };
    const labels = Object.keys(dashboardData.receivedFeedback.ratingDistribution);
    const values = Object.values(dashboardData.receivedFeedback.ratingDistribution);
    const colors = colorPalette.slice(0, labels.length);
    return {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
      }],
    };
  }, [dashboardData]);

  // Calculate average rating
  const averageRating = useMemo(() => {
    if (!dashboardData) return 'N/A';
    return typeof dashboardData.receivedFeedback.averageRating === 'number'
      ? dashboardData.receivedFeedback.averageRating.toFixed(2)
      : 'N/A';
  }, [dashboardData]);

  // Handle Delete Feedback
  const handleDelete = async (feedbackId: number) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    try {
      const res = await fetch(`/api/feedbacks/${feedbackId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete feedback');
      // Update local state
      setDashboardData((prev) => prev && {
        ...prev,
        givenFeedback: {
          ...prev.givenFeedback,
          totalGiven: prev.givenFeedback.totalGiven - 1,
          recentFeedbacks: prev.givenFeedback.recentFeedbacks.filter(fb => fb.id !== feedbackId),
        },
      });
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Failed to delete feedback.');
    }
  };

  // Handle Edit Feedback
  const handleEdit = (feedback: Feedback) => {
    setEditingFeedback(feedback);
    setEditRating(feedback.rating);
    setEditTopic(feedback.topic.name);
    setEditComment(feedback.comment); // Initialize comment state
  };

  // Submit Edited Feedback
  const submitEdit = async () => {
    if (!editingFeedback) return;
    try {
      const res = await fetch(`/api/feedbacks/${editingFeedback.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: editRating, topic: editTopic, comment: editComment }), // Include comment
      });
      if (!res.ok) throw new Error('Failed to update feedback');
      const updatedFeedback: Feedback = await res.json();
      // Update local state
      setDashboardData((prev) => prev && {
        ...prev,
        givenFeedback: {
          ...prev.givenFeedback,
          recentFeedbacks: prev.givenFeedback.recentFeedbacks.map(fb =>
            fb.id === updatedFeedback.id ? updatedFeedback : fb
          ),
        },
      });
      setEditingFeedback(null);
    } catch (error) {
      console.error('Error updating feedback:', error);
      alert('Failed to update feedback.');
    }
  };

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

  const { receivedFeedback, givenFeedback, courses } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      {/* Dashboard Title */}
      <h1 className="text-3xl font-bold mb-6 text-center">Your Feedback Dashboard</h1>
      
      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Received Feedback Section */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
          <h2 className="text-2xl font-semibold mb-4">Feedback Received</h2>
          
          {/* Display Average Rating */}
          <p className="text-lg mb-4">
            Average Rating: <span className="font-bold">{averageRating}</span>
          </p>
          
          {/* Topic Distribution Pie Chart */}
          <h3 className="text-xl font-semibold mb-2">Topic Distribution</h3>
          <div className="w-full h-64 mb-6">
            <Pie 
              data={topicChartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                  title: {
                    display: false,
                  },
                },
              }} 
              className="w-full h-full"
            />
          </div>

          {/* Rating Distribution Bar Chart */}
          <h3 className="text-xl font-semibold mb-2">Rating Distribution</h3>
          <div className="w-full h-64">
            <Bar 
              data={ratingChartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
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
              }} 
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Given Feedback Section */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2 flex flex-col">
          <h2 className="text-2xl font-semibold mb-4">Feedback Given</h2>
          
          {/* Display Total Feedbacks Given */}
          <p className="text-lg mb-4">
            Total Feedbacks Given: <span className="font-bold">{givenFeedback.totalGiven}</span>
          </p>

          {/* Recent Feedbacks Table */}
          <h3 className="text-xl font-semibold mb-2">Recent Feedbacks</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Recipient</th>
                  <th className="px-4 py-2 text-left">Topic</th>
                  <th className="px-4 py-2 text-left">Rating</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {givenFeedback.recentFeedbacks.map((feedback) => (
                  <tr key={feedback.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {new Date(feedback.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      {feedback.toUser?.name || 'Unknown Recipient'}
                    </td>
                    <td className="px-4 py-2">
                      {feedback.topic?.name || 'Unknown Topic'}
                    </td>
                    <td className="px-4 py-2">
                      {feedback.rating}
                    </td>
                    <td className="px-4 py-2">
                      <button 
                        className="mr-2 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        onClick={() => handleEdit(feedback)}
                      >
                        Edit
                      </button>
                      <button 
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => handleDelete(feedback.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Courses/Groups Section */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-3 flex flex-col">
          <h2 className="text-2xl font-semibold mb-4">Your Courses</h2>
          
          {/* Courses List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.isArray(courses) && courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{course.name}</h3>
                    <p className="text-gray-600">{course.description}</p>
                  </div>
                  {/* Optional: Add action buttons here */}
                  {/* <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    View Details
                  </button> */}
                </div>
              ))
            ) : (
              <p className="text-gray-600">You are not enrolled in any courses.</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Feedback Modal */}
      {editingFeedback && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Edit Feedback</h2>
            <form onSubmit={(e) => { e.preventDefault(); submitEdit(); }}>
              {/* Rating Field */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Rating:</label>
                <input 
                  type="number" 
                  min="1" 
                  max="5" 
                  value={editRating} 
                  onChange={(e) => setEditRating(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              {/* Topic Field */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Topic:</label>
                <input 
                  type="text" 
                  value={editTopic} 
                  onChange={(e) => setEditTopic(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              {/* Comment Field */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Comment:</label>
                <textarea 
                  value={editComment} 
                  onChange={(e) => setEditComment(e.target.value)}
                  className="w-full px-3 py-2 border rounded" 
                  rows={4} 
                  required
                />
              </div>
              {/* Modal Actions */}
              <div className="flex justify-end">
                <button 
                  type="button" 
                  className="mr-4 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  onClick={() => setEditingFeedback(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
