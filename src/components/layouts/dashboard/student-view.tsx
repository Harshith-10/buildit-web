"use client";

import { CheckCircle, Flame, Play, Trophy } from "lucide-react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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
import { getGreeting } from "@/lib/get-greeting";
import { ChartCard } from "./chart-card";
import { StatsCard } from "./stats-card";

interface StudentViewProps {
  stats: {
    totalSolved: number;
    // Mocking these for now as they might not be passed yet
    streak?: number;
    rank?: number;
    points?: number;
  };
  dailyProblem: {
    problem: {
      id: string;
      title: string;
      difficulty: string;
    };
  } | null;
  upcomingExams: {
    id: string;
    title: string;
    startTime: string | Date;
  }[];
}

const ACTIVITY_DATA = [
  { day: "Mon", solved: 2 },
  { day: "Tue", solved: 4 },
  { day: "Wed", solved: 1 },
  { day: "Thu", solved: 5 },
  { day: "Fri", solved: 3 },
  { day: "Sat", solved: 8 },
  { day: "Sun", solved: 6 },
];

const DIFFICULTY_DATA = [
  { name: "Easy", value: 12, color: "#22c55e" },
  { name: "Medium", value: 8, color: "#eab308" },
  { name: "Hard", value: 3, color: "#ef4444" },
];

export function StudentView({
  stats,
  dailyProblem,
  upcomingExams,
}: StudentViewProps) {
  const greeting = getGreeting();

  return (
    <div className="flex flex-col gap-8 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Welcome & Daily Goal - Spans 2 cols */}
        <div className="md:col-span-2 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 text-white shadow-lg">
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 opacity-90">
                <Flame className="h-5 w-5 animate-pulse" />
                <span className="font-medium tracking-wide text-sm uppercase">
                  Daily Challenge
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{greeting}</h1>
              <p className="text-indigo-100 max-w-lg">
                Consistency is key! Solve today's problem to keep your streak
                alive and climb the leaderboard.
              </p>
            </div>

            <div className="mt-8 bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-colors">
              {dailyProblem ? (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg">
                      {dailyProblem.problem.title}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-black/20 text-white mt-1 border border-white/10`}
                    >
                      {dailyProblem.problem.difficulty}
                    </span>
                  </div>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="font-bold shrink-0"
                    asChild
                  >
                    <Link href={`/problems/${dailyProblem.problem.id}`}>
                      Solve Now <Play className="ml-2 h-4 w-4 fill-current" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <p>No daily problem loaded.</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Column */}
        <div className="flex flex-col gap-4">
          <StatsCard
            title="Current Streak"
            value={stats.streak || 5}
            icon={Flame}
            description="days on fire!"
            className="bg-orange-500/10 border-orange-500/20"
            iconClassName="bg-orange-500/20 text-orange-600"
            trend={{ value: 1, direction: "up" }}
          />
          <StatsCard
            title="Problems Solved"
            value={stats.totalSolved}
            icon={CheckCircle}
            description="total solved"
            className="bg-green-500/10 border-green-500/20"
            iconClassName="bg-green-500/20 text-green-600"
            trend={{ value: 12, direction: "up", label: "this week" }}
          />
          <StatsCard
            title="Global Rank"
            value={`#${stats.rank || 420}`}
            icon={Trophy}
            description="top 15%"
            className="bg-yellow-500/10 border-yellow-500/20"
            iconClassName="bg-yellow-500/20 text-yellow-600"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-7">
        {/* Left Column (Charts) - spans 5 cols */}
        <div className="col-span-7 lg:col-span-5 flex flex-col gap-6">
          <div className="grid gap-6 md:grid-cols-3">
            <ChartCard
              title="Weekly Activity"
              className="md:col-span-2 min-h-[300px] border-primary/20 shadow-sm"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ACTIVITY_DATA}>
                  <defs>
                    <linearGradient
                      id="colorSolved"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    fontSize={12}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                    cursor={{ stroke: "#6366f1", strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="solved"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSolved)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Skills"
              className="min-h-[300px] border-primary/20 shadow-sm"
            >
              <div className="flex flex-col items-center justify-center h-full">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={DIFFICULTY_DATA}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {DIFFICULTY_DATA.map((entry, _index) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-4 justify-center text-xs text-muted-foreground mt-[-20px]">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" /> Easy
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" /> Med
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" /> Hard
                  </div>
                </div>
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Right Column (Upcoming) - spans 2 cols */}
        <div className="col-span-7 lg:col-span-2 flex flex-col gap-6">
          <Card className="h-full border-l-4 border-l-primary shadow-sm bg-card/50 overflow-hidden relative">
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Exams</CardTitle>
              <CardDescription>Stay prepared!</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-12">
              {upcomingExams.length > 0 ? (
                <ExamCarousel exams={upcomingExams} />
              ) : (
                <p className="text-muted-foreground text-sm">
                  No upcoming exams.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

function ExamCarousel({ exams }: { exams: StudentViewProps["upcomingExams"] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % exams.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [exams.length]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % exams.length);
  const prev = () =>
    setCurrentIndex((prev) => (prev - 1 + exams.length) % exams.length);

  const currentExam = exams[currentIndex];

  return (
    <div className="relative w-full">
      <div className="overflow-hidden min-h-[160px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentExam.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-background border border-primary/10 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase text-muted-foreground">
                    {new Date(currentExam.startTime).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-xs text-primary font-medium">
                    {new Date(currentExam.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <h4 className="font-bold text-lg leading-snug line-clamp-2 min-h-[3.5rem]">
                {currentExam.title}
              </h4>

              <Button
                variant="default"
                size="sm"
                asChild
                className="w-full mt-2 group"
              >
                <Link href={`/exams/${currentExam.id}`}>
                  View Details{" "}
                  <ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Indicators */}
      <div className="flex items-center justify-between mt-4 px-2">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="h-8 w-8 rounded-full hover:bg-primary/10"
          onClick={prev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex gap-1.5">
          {exams.map((_, idx) => (
            <button
              key={`dot-${idx}`}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-primary/50"}`}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="h-8 w-8 rounded-full hover:bg-primary/10"
          onClick={next}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
