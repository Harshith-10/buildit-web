"use client";

import {
  BookPlus,
  Clock,
  FilePlus,
  FileWarning,
  GraduationCap,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getGreeting } from "@/lib/utils/get-greeting";
import { ChartCard } from "./chart-card";
import { StatsCard } from "./stats-card";

interface FacultyViewProps {
  activeStudents: number;
}

const PERFORMANCE_DATA = [
  { class: "CS101", avg: 85, submitted: 90 },
  { class: "CS102", avg: 72, submitted: 45 },
  { class: "DSA", avg: 68, submitted: 80 },
  { class: "OS", avg: 76, submitted: 60 },
  { class: "DBMS", avg: 82, submitted: 75 },
];

export function FacultyView({ activeStudents }: FacultyViewProps) {
  const greeting = getGreeting();

  return (
    <div className="flex flex-col gap-8 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {greeting}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your courses and track student performance.
          </p>
        </div>
        <Button asChild>
          <Link href="/collections/create">
            <BookPlus className="mr-2 h-4 w-4" />
            New Collection
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Students"
          value={activeStudents}
          icon={Users}
          description="Enrolled in your courses"
          trend={{ value: 5, direction: "up", label: "new this week" }}
        />
        <StatsCard
          title="Active Courses"
          value={5}
          icon={GraduationCap}
          description="Currently running"
        />
        <StatsCard
          title="Pending Reviews"
          value={12}
          icon={Clock}
          description="Submissions to grade"
          trend={{ value: 2, direction: "neutral" }}
        />
        <StatsCard
          title="Flagged Issues"
          value={3}
          icon={FileWarning}
          description="Reported problems"
          trend={{ value: 1, direction: "down", label: "since yesterday" }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Main Chart Area */}
        <div className="col-span-4 lg:col-span-5 flex flex-col gap-6">
          <ChartCard
            title="Class Performance"
            description="Average scores and submission rates per class"
            className="min-h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PERFORMANCE_DATA} barGap={8}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="class"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                />
                <YAxis axisLine={false} tickLine={false} tickMargin={10} />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.1 }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="avg"
                  name="Average Score"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
                <Bar
                  dataKey="submitted"
                  name="Submission Rate %"
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="col-span-3 lg:col-span-2 flex flex-col gap-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequent tasks</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors"
                asChild
              >
                <Link href="/problems/create" className="w-full">
                  <FilePlus className="h-6 w-6 text-primary" />
                  <span className="font-medium">Create Problem</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Add a new challenge
                  </span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors"
                asChild
              >
                <Link href="/collections/create" className="w-full">
                  <BookPlus className="h-6 w-6 text-primary" />
                  <span className="font-medium">Create Collection</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Group problems together
                  </span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="justify-start hidden md:flex"
                asChild
              >
                <Link href="/students">Manage Students</Link>
              </Button>
              <Button
                variant="ghost"
                className="justify-start hidden md:flex"
                asChild
              >
                <Link href="/reports">View Reports</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
