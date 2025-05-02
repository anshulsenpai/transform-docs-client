import { useEffect, useState } from "react";
import { userRequest } from "../../services/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Dashboard card config
const statCards = [
  {
    key: "total",
    label: "Total Documents",
    icon: "fa-solid fa-folder",
    color: "bg-white border border-gray-200 shadow-sm",
  },
  {
    key: "verified",
    label: "Verified",
    icon: "fa-solid fa-circle-check",
    color: "bg-green-50 border border-green-200",
  },
  {
    key: "pending",
    label: "Pending",
    icon: "fa-solid fa-hourglass-half",
    color: "bg-yellow-50 border border-yellow-200",
  },
  {
    key: "rejected",
    label: "Rejected",
    icon: "fa-solid fa-xmark-circle",
    color: "bg-red-50 border border-red-200",
  },
  {
    key: "suspicious",
    label: "Suspicious",
    icon: "fa-solid fa-triangle-exclamation",
    color: "bg-orange-50 border border-orange-200",
  },
];

const chartColors: Record<string, string> = {
  verified: "#22c55e",
  pending: "#eab308",
  rejected: "#ef4444",
  suspicious: "#f97316",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
    suspicious: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await userRequest.get("/documents/dashboard-stats");
        setStats(res.data.data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const pieData = [
    { name: "Verified", value: stats.verified, key: "verified" },
    { name: "Pending", value: stats.pending, key: "pending" },
    { name: "Rejected", value: stats.rejected, key: "rejected" },
    { name: "Suspicious", value: stats.suspicious, key: "suspicious" },
  ];

  return (
    <section className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Insights & verification overview</p>
      </div>

      {/* Stats Section */}
      <div className="space-y-6">
        {/* Row 1 - 2 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {statCards.slice(0, 2).map(({ key, label, icon, color }) => (
            <div
              key={key}
              className={`rounded-xl p-5 ${color} transition-shadow hover:shadow-md`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">{label}</span>
                <i className={`${icon} text-xl text-gray-400`} />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats[key as keyof typeof stats]}
              </div>
            </div>
          ))}
        </div>

        {/* Row 2 - 3 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.slice(2).map(({ key, label, icon, color }) => (
            <div
              key={key}
              className={`rounded-xl p-5 ${color} transition-shadow hover:shadow-md`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">{label}</span>
                <i className={`${icon} text-xl text-gray-400`} />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats[key as keyof typeof stats]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Verification Distribution
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ name, percent }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {pieData.map((entry) => (
                <Cell
                  key={entry.key}
                  fill={chartColors[entry.key]}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
