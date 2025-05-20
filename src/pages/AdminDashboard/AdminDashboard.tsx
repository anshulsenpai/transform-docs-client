import React, { useEffect, useState } from "react";
import { userRequest } from "../../services/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Link } from "react-router-dom";
import moment from "moment";

// Define proper types for all data structures
interface StatsData {
  total: number;
  verified: number;
  pending: number;
  rejected: number;
  suspicious: number;
}

interface ActivityType {
  _id: string;
  type: 'upload' | 'verification' | 'share' | 'unshare' | 'download';
  user: {
    _id: string;
    name: string;
    email?: string;
  } | string;
  document: {
    _id: string;
    name: string;
    filename: string;
    category?: string;
  } | string;
  status: string;
  details?: string;
  createdAt: string;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface TimelineData {
  name: string;
  dateKey: string;
  uploads: number;
  verifications: number;
  shares: number;
  downloads: number;
}

interface ChartData {
  name: string;
  uploads: number;
  verifications: number;
  shares: number;
  downloads: number;
}

interface PieChartData {
  name: string;
  value: number;
  key: string;
}

interface StatCard {
  key: keyof StatsData;
  label: string;
  description: string;
  icon: string;
  color: string;
  textColor: string;
  path: string;
}

// Dashboard card config
const statCards: StatCard[] = [
  {
    key: "total",
    label: "Total Documents",
    description: "All documents in the system",
    icon: "fa-solid fa-file-lines",
    color: "from-blue-500 to-indigo-600",
    textColor: "text-blue-600",
    path: "/documents",
  },
  {
    key: "verified",
    label: "Verified Documents",
    description: "Documents that passed verification",
    icon: "fa-solid fa-shield-check",
    color: "from-emerald-500 to-green-600",
    textColor: "text-emerald-600",
    path: "/documents?status=verified",
  },
  {
    key: "pending",
    label: "Pending Review",
    description: "Documents awaiting verification",
    icon: "fa-solid fa-clock",
    color: "from-amber-400 to-yellow-500",
    textColor: "text-amber-600",
    path: "/documents?status=pending",
  },
  {
    key: "suspicious",
    label: "Suspicious Documents",
    description: "Documents flagged for review",
    icon: "fa-solid fa-triangle-exclamation",
    color: "from-orange-400 to-amber-500",
    textColor: "text-orange-600",
    path: "/documents?status=suspicious",
  },
  {
    key: "rejected",
    label: "Rejected Documents",
    description: "Documents that failed verification",
    icon: "fa-solid fa-ban",
    color: "from-red-500 to-rose-600",
    textColor: "text-red-600",
    path: "/documents?status=rejected",
  }
];

// Enhanced color palette
const chartColors: Record<string, string> = {
  verified: "#10b981",
  pending: "#f59e0b",
  rejected: "#ef4444",
  suspicious: "#f97316",
};

// Activity type icons and colors
const activityConfig: Record<string, { icon: string; bg: string; text: string }> = {
  upload: {
    icon: "fa-solid fa-file-arrow-up",
    bg: "bg-blue-100",
    text: "text-blue-600"
  },
  verification: {
    icon: "fa-solid fa-clipboard-check",
    bg: "bg-green-100",
    text: "text-green-600"
  },
  share: {
    icon: "fa-solid fa-share-nodes",
    bg: "bg-purple-100",
    text: "text-purple-600"
  },
  unshare: {
    icon: "fa-solid fa-user-slash",
    bg: "bg-orange-100",
    text: "text-orange-600"
  },
  download: {
    icon: "fa-solid fa-file-arrow-down",
    bg: "bg-indigo-100",
    text: "text-indigo-600"
  }
};

// Status badge colors
const statusBadgeColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  verified: "bg-green-100 text-green-800",
  suspicious: "bg-orange-100 text-orange-800",
  rejected: "bg-red-100 text-red-800",
  shared: "bg-purple-100 text-purple-800",
  unshared: "bg-gray-100 text-gray-800",
  downloaded: "bg-blue-100 text-blue-800",
  upload: "bg-indigo-100 text-indigo-800"
};

// Define custom tooltip props interface
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: PieChartData }>;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
    suspicious: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [recentActivities, setRecentActivities] = useState<ActivityType[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [activityData, setActivityData] = useState<ChartData[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryData[]>([]);
  const [categoryLoading, setCategoryLoading] = useState<boolean>(true);

  // Fetch dashboard stats and activity data
  useEffect(() => {
    const fetchDashboardData = async (): Promise<void> => {
      try {
        setLoading(true);
        setActivitiesLoading(true);
        setCategoryLoading(true);

        // Fetch basic stats
        const statsResponse = await userRequest.get("/documents/dashboard-stats");
        setStats(statsResponse.data.data as StatsData);

        // Fetch recent activities
        try {
          // First try to get from dedicated activities endpoint
          let activitiesData: ActivityType[] = [];

          try {
            const activitiesResponse = await userRequest.get("/documents/recent-activities");
            if (activitiesResponse.data?.data?.activities) {
              activitiesData = activitiesResponse.data.data.activities;
            }
          } catch (err) {
            console.log("Activities endpoint not available, falling back to documents", err);
          }

          // If no activities found, convert shared documents to activities
          if (!activitiesData || activitiesData.length === 0) {
            // Fall back to getting shared documents and converting them to activities
            const docsResponse = await userRequest.get("/documents/all-shared-documents");

            if (docsResponse.data?.data?.documents) {
              const documents = docsResponse.data.data.documents;

              // Create a new array to hold activities
              const generatedActivities: ActivityType[] = [];

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              documents.forEach((doc: any) => {
                // Create an upload activity for each document
                generatedActivities.push({
                  _id: doc._id + "-upload",
                  type: 'upload',
                  user: doc.uploadedBy,
                  document: {
                    _id: doc._id,
                    name: doc.name,
                    filename: doc.filename,
                    category: doc.category
                  },
                  status: 'upload',
                  details: '',
                  createdAt: doc.createdAt
                });

                // If document has been verified, add verification activity
                if (doc.verifiedBy) {
                  generatedActivities.push({
                    _id: doc._id + "-verify",
                    type: 'verification',
                    user: typeof doc.verifiedBy === 'object' ? doc.verifiedBy : { _id: doc.verifiedBy, name: "Admin" },
                    document: {
                      _id: doc._id,
                      name: doc.name,
                      filename: doc.filename,
                      category: doc.category
                    },
                    status: doc.fraudStatus,
                    details: doc.fraudReason || `Document marked as ${doc.fraudStatus}`,
                    createdAt: doc.verifiedAt || doc.createdAt
                  });
                }

                // If document is shared, add share activity
                if (doc.isShared && doc.sharedWith && doc.sharedWith.length > 0) {
                  generatedActivities.push({
                    _id: doc._id + "-share",
                    type: 'share',
                    user: doc.sharedBy || doc.uploadedBy,
                    document: {
                      _id: doc._id,
                      name: doc.name,
                      filename: doc.filename,
                      category: doc.category
                    },
                    status: 'shared',
                    details: `Shared with ${doc.sharedWith.length} user${doc.sharedWith.length > 1 ? 's' : ''}`,
                    createdAt: doc.sharedAt || doc.createdAt
                  });
                }
              });

              // Sort activities by date (newest first)
              generatedActivities.sort((a, b) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              });

              // Use the generated activities
              activitiesData = generatedActivities;
            }
          }

          // Use the activities data (either from API or converted from documents)
          if (activitiesData && activitiesData.length > 0) {
            setRecentActivities(activitiesData);
            generateActivityTimelineData(activitiesData);
          } else {
            console.warn("Activities data missing or incorrectly formatted");
            setRecentActivities([]);
            // Initialize empty activity data for the timeline
            generateActivityTimelineData([]);
          }
        } catch (err) {
          console.error("Error fetching activities:", err);
          setRecentActivities([]);
          // Initialize empty activity data for the timeline
          generateActivityTimelineData([]);
        }

        // Fetch category statistics
        try {
          const categoryResponse = await userRequest.get("/documents/category-stats");
          if (categoryResponse.data.data.categories) {
            setCategoryStats(categoryResponse.data.data.categories as CategoryData[]);
          } else {
            // Fallback to mock data if endpoint not implemented
            setCategoryStats([
              { name: 'Medical Records', value: 45, color: 'bg-blue-500' },
              { name: 'Identification', value: 32, color: 'bg-purple-500' },
              { name: 'Financial', value: 18, color: 'bg-emerald-500' },
              { name: 'Legal', value: 12, color: 'bg-amber-500' },
              { name: 'Other', value: 8, color: 'bg-gray-500' },
            ]);
          }
        } catch (err) {
          console.error("Error fetching category stats:", err);
          setCategoryStats([]);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
        setActivitiesLoading(false);
        setCategoryLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Generate activity timeline data based on real activities
  const generateActivityTimelineData = (activities: ActivityType[]): void => {
    // Initialize the data structure based on timeRange
    const data: TimelineData[] = [];
    let days = 7;

    if (timeRange === 'month') days = 30;
    if (timeRange === 'year') days = 12;

    // Create empty buckets for each time period
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));

      // For year range, use months instead of days
      const label = timeRange === 'year'
        ? date.toLocaleString('default', { month: 'short' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Format date for comparison with activity dates
      const dateKey = timeRange === 'year'
        ? date.toISOString().substring(0, 7) // YYYY-MM format
        : date.toISOString().substring(0, 10); // YYYY-MM-DD format

      data.push({
        name: label,
        dateKey,
        uploads: 0,
        verifications: 0,
        shares: 0,
        downloads: 0
      });
    }

    // Count activities for each day/month
    activities.forEach(activity => {
      try {
        const activityDate = new Date(activity.createdAt);
        const dateKey = timeRange === 'year'
          ? activityDate.toISOString().substring(0, 7)
          : activityDate.toISOString().substring(0, 10);

        // Find the matching bucket
        const bucket = data.find(item => item.dateKey === dateKey);
        if (bucket) {
          // Increment the appropriate counter
          if (activity.type === 'upload') bucket.uploads++;
          else if (activity.type === 'verification') bucket.verifications++;
          else if (activity.type === 'share') bucket.shares++;
          else if (activity.type === 'download') bucket.downloads++;
        }
      } catch (err) {
        console.error("Error processing activity for timeline:", err);
      }
    });

    // Remove the dateKey property as it's not needed for the chart
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const finalData: ChartData[] = data.map(({ dateKey, ...rest }) => rest);
    setActivityData(finalData);
  };

  // Effect to regenerate activity timeline when timeRange changes
  useEffect(() => {
    if (recentActivities.length > 0) {
      generateActivityTimelineData(recentActivities);
    }
  }, [timeRange]);

  // Format time ago
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    return moment(date).fromNow();
  };

  // Get user name helper
  const getUserName = (user: ActivityType['user']): string => {
    if (typeof user === 'object' && user !== null && 'name' in user) {
      return user.name;
    }
    return "User";
  };

  // Get document name helper
  const getDocumentName = (document: ActivityType['document']): string => {
    if (typeof document === 'object' && document !== null && 'name' in document) {
      return document.name;
    }
    return "document";
  };

  // Prepare data for the pie chart
  const pieData: PieChartData[] = [
    { name: "Verified", value: stats.verified, key: "verified" },
    { name: "Pending", value: stats.pending, key: "pending" },
    { name: "Rejected", value: stats.rejected, key: "rejected" },
    { name: "Suspicious", value: stats.suspicious, key: "suspicious" },
  ].filter(item => item.value > 0);

  // Compute percentages for quick stats
  const calculatePercentage = (value: number): number => {
    return stats.total > 0 ? Math.round((value / stats.total) * 100) : 0;
  };

  // Custom tooltip for the pie chart
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-gray-600">
            {data.value} documents ({calculatePercentage(data.value)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header with welcome message and date */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl sm:truncate">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Link
                to="/admin/documents"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <i className="fa-solid fa-magnifying-glass mr-2"></i>
                Browse Documents
              </Link>
              <Link
                to="/admin/shared-documents"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <i className="fa-solid fa-share-nodes mr-2"></i>
                Shared Documents
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 mb-8">
          {statCards.map(({ key, label, description, icon, color, textColor, path }) => (
            <Link
              to={path}
              key={key}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
            >
              <div className={`h-2 bg-gradient-to-r ${color}`}></div>
              <div className="p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {loading ? (
                        <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                      ) : (
                        stats[key]
                      )}
                    </h3>
                    {key !== 'total' && (
                      <p className="text-xs text-gray-500 mt-1">
                        {calculatePercentage(stats[key])}% of total
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${textColor.replace('text', 'bg')}-100`}>
                    <i className={`${icon} ${textColor} text-xl`}></i>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 truncate">{description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Verification Distribution */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-900">Verification Distribution</h2>
              <p className="text-sm text-gray-500">Breakdown of document verification statuses</p>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="animate-pulse flex flex-col items-center justify-center h-64">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              ) : pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      innerRadius={60}
                      paddingAngle={2}
                      label={({ name, percent }) =>
                        `${name} (${(percent ? percent * 100 : 0).toFixed(0)}%)`
                      }
                    >
                      {pieData.map((entry) => (
                        <Cell
                          key={`cell-${entry.key}`}
                          fill={chartColors[entry.key] || "#ccc"}
                          strokeWidth={1}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span className="text-sm font-medium text-gray-700">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-500">No data available to display</p>
                </div>
              )}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Document Activity</h2>
                <p className="text-sm text-gray-500">Uploads, verifications, and shares over time</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setTimeRange('week')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${timeRange === 'week'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setTimeRange('month')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${timeRange === 'month'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setTimeRange('year')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${timeRange === 'year'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  Year
                </button>
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="animate-pulse flex flex-col h-64">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="flex-1 bg-gray-200 rounded"></div>
                </div>
              ) : activityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={activityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value: string) => (
                        <span className="text-sm font-medium text-gray-700">
                          {value === 'uploads' ? 'Document Uploads' :
                            value === 'verifications' ? 'Verifications' :
                              value === 'shares' ? 'Shares' : 'Downloads'}
                        </span>
                      )}
                    />
                    <Line
                      type="monotone"
                      dataKey="uploads"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="verifications"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="shares"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="downloads"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-500">No activity data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity and Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories Distribution */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm lg:col-span-1">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-900">Documents by Category</h2>
              <p className="text-sm text-gray-500">Distribution across document types</p>
            </div>
            <div className="p-6">
              {categoryLoading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : categoryStats.length > 0 ? (
                <div className="space-y-4">
                  {categoryStats.map((category) => (
                    <div key={category.name}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{category.name}</span>
                        <span className="text-sm text-gray-500">{category.value}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${category.color}`}
                          style={{ width: `${Math.min(category.value * 2, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No category data available</p>
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
              <Link
                to="/admin/documents"
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center justify-center"
              >
                View All Categories
                <i className="fa-solid fa-arrow-right ml-2"></i>
              </Link>
            </div>
          </div>

          {/* Recent Activity - Now using real data from backend */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm lg:col-span-2">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
              <p className="text-sm text-gray-500">Latest document uploads and verifications</p>
            </div>
            <div className="p-3">
              {activitiesLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex p-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-200 flex-shrink-0"></div>
                      <div className="ml-4 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <div key={activity._id} className="p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start">
                          <div className={`p-2 rounded-lg flex-shrink-0 
                            ${activityConfig[activity.type]?.bg || 'bg-gray-100'} 
                            ${activityConfig[activity.type]?.text || 'text-gray-600'}`}
                          >
                            <i className={`
                              ${activityConfig[activity.type]?.icon || 'fa-solid fa-circle-info'} text-sm`}
                            ></i>
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="flex justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {getUserName(activity.user)}
                              </p>
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(activity.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {activity.type === 'upload' ? 'Uploaded' :
                                activity.type === 'verification' ? 'Verified' :
                                  activity.type === 'share' ? 'Shared' :
                                    activity.type === 'unshare' ? 'Removed access to' :
                                      'Downloaded'} {' '}
                              <span className="font-medium">{getDocumentName(activity.document)}</span>
                              {activity.details && <span className="text-xs text-gray-500 ml-1">- {activity.details}</span>}
                            </p>
                            <div className="flex items-center mt-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                                ${statusBadgeColors[activity.status] || 'bg-gray-100 text-gray-800'}`}
                              >
                                <span className="sr-only">Status:</span>
                                {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">No recent activity found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;