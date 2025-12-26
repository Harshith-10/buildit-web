"use client";

import {
  Activity,
  AlertTriangle,
  CheckSquare,
  FileCode,
  Server,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getGreeting } from "@/lib/utils/get-greeting";
import { ChartCard } from "./chart-card";
import { StatsCard } from "./stats-card";

interface AdminViewProps {
  stats: {
    totalUsers: number;
    totalProblems: number;
    totalSubmissions: number;
    uptime: number;
  };
}

const USER_GROWTH_DATA = [
  { month: "Jan", users: 120 },
  { month: "Feb", users: 150 },
  { month: "Mar", users: 200 },
  { month: "Apr", users: 280 },
  { month: "May", users: 350 },
  { month: "Jun", users: 450 },
  { month: "Jul", users: 500 },
];

const RESOURCE_DATA = [
  { time: "00:00", cpu: 30, memory: 45 },
  { time: "04:00", cpu: 25, memory: 40 },
  { time: "08:00", cpu: 45, memory: 55 },
  { time: "12:00", cpu: 65, memory: 70 },
  { time: "16:00", cpu: 55, memory: 60 },
  { time: "20:00", cpu: 40, memory: 50 },
];

export function AdminView({ stats }: AdminViewProps) {
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    return `${days}d ${hours}h`;
  };

  const greeting = getGreeting();

  return (
    <div className="flex flex-col gap-8 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {greeting}
        </h1>
        <p className="text-muted-foreground mt-1">
          System Overview and Health Status
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend={{ value: 12, direction: "up", label: "this month" }}
        />
        <StatsCard
          title="Total Problems"
          value={stats.totalProblems}
          icon={FileCode}
          trend={{ value: 4, direction: "up", label: "new added" }}
        />
        <StatsCard
          title="Total Submissions"
          value={stats.totalSubmissions}
          icon={CheckSquare}
          trend={{ value: 8, direction: "up", label: "today" }}
        />
        <StatsCard
          title="System Uptime"
          value={formatUptime(stats.uptime || 0)}
          icon={Activity}
          description="Since last restart"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard
          title="User Growth"
          description="New user registrations over time"
          className="min-h-[350px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={USER_GROWTH_DATA}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
                opacity={0.5}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />
              <YAxis axisLine={false} tickLine={false} tickMargin={10} />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Resource Usage"
          description="Server CPU & Memory Metrics (24h)"
          className="min-h-[350px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={RESOURCE_DATA} barGap={4}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
                opacity={0.5}
              />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Bar
                dataKey="cpu"
                name="CPU Load %"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="memory"
                name="Memory Usage %"
                fill="#eab308"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title="Error Rate"
          value="0.12%"
          icon={AlertTriangle}
          className="border-red-500/20"
          description="Last 24 hours"
          trend={{ value: 0.02, direction: "down" }}
        />
        <StatsCard
          title="Active Nodes"
          value="4/4"
          icon={Server}
          description="All systems operational"
        />
        <StatsCard
          title="Pending Approvals"
          value={3} // Mock
          icon={CheckSquare}
          description="Faculty requests"
        />
      </div>
    </div>
  );
}
