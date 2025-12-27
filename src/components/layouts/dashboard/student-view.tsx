"use client";

import {
  Activity,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Hash,
  Play,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, Pie, PieChart, XAxis } from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getGreeting } from "@/lib/utils/get-greeting";
import { StatsCard } from "./stats-card";

interface StudentViewProps {
  stats: {
    totalSolved: number;
    totalSubmissions: number;
    streak?: number;
    rank?: number;
    points?: number;
  };
  dailyProblem: {
    problem: {
      id: string;
      title: string;
      difficulty: string;
      slug: string;
    };
    stats: {
      solvedCount: number;
      acceptanceRate: number;
      tags: string[];
      estimatedTime: string;
    };
  } | null;
  upcomingExams: {
    id: string;
    title: string;
    startTime: string | Date;
  }[];
  userName: string;
  weeklyProgress: boolean[];
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
  { name: "Easy", value: 12, fill: "var(--color-easy)" },
  { name: "Medium", value: 8, fill: "var(--color-medium)" },
  { name: "Hard", value: 3, fill: "var(--color-hard)" },
];

const activityChartConfig = {
  solved: {
    label: "Problems Solved:\u00A0",
    color: "#6366f1",
  },
} satisfies ChartConfig;

const difficultyChartConfig = {
  value: {
    label: "Problems",
  },
  easy: {
    label: "Easy",
    color: "hsl(142.1 76.2% 36.3%)",
  },
  medium: {
    label: "Medium",
    color: "hsl(47.9 95.8% 53.1%)",
  },
  hard: {
    label: "Hard",
    color: "hsl(0 84.2% 60.2%)",
  },
} satisfies ChartConfig;

export function StudentView({
  stats,
  dailyProblem,
  upcomingExams,
  userName,
  weeklyProgress,
}: StudentViewProps) {
  const greeting = getGreeting();

  return (
    <div className="flex flex-col gap-8 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Section */}
      <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-7">
        {/* Welcome & Daily Goal - Spans 5 cols */}
        <div className="col-span-1 md:col-span-5 rounded-3xl bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600 dark:from-sky-950 dark:via-teal-900 dark:to-emerald-900 p-8 text-white relative overflow-hidden group ring-1 ring-white/10">
          {/* Background Texture & Effects */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col h-full justify-between gap-8">
            {/* Header Row */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-1.5">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-white to-indigo-100">
                  {greeting}, {userName}!
                </h1>
                <p className="text-indigo-50 text-sm md:text-base flex items-center gap-2 font-medium">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  You are in the top{" "}
                  <span className="font-bold text-white">5%</span> of solvers
                  today. Keep it up!
                </p>
              </div>

              {/* Streak Counter */}
              <div className="bg-white/10 backdrop-blur-md rounded-full pl-4 pr-5 py-2 flex items-center gap-3 border border-white/20 hover:bg-white/15 transition-all">
                <div className="p-1.5 bg-orange-500/20 rounded-full">
                  <Flame className="h-5 w-5 text-orange-400 fill-orange-400 animate-pulse" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-xl font-bold">{stats.streak || 0}</span>
                  <span className="text-[10px] uppercase font-bold text-indigo-100 tracking-wider">
                    Day Streak
                  </span>
                </div>
              </div>
            </div>

            {/* Weekly Progress & Tip */}
            <div className="flex flex-col sm:flex-row gap-6 items-end justify-between border-t border-white/5 pt-6">
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase text-indigo-200 tracking-widest">
                  Weekly Progress
                </p>
                <div className="flex items-center gap-3">
                  {weeklyProgress.map((active, i) => (
                    <div
                      key={i}
                      className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 ${active ? "bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-300 scale-105" : "bg-white/5 border-white/10"}`}
                      title={active ? "Problem Solved" : "No Activity"}
                    >
                      {active && <CheckCircle className="w-5 h-5 text-white" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tip of the Day */}
              <div className="hidden md:block max-w-[280px] text-right">
                <div className="inline-flex items-center gap-1.5 bg-indigo-950/30 border border-indigo-500/30 px-3 py-1 rounded-full text-[10px] font-bold text-indigo-200 mb-2 uppercase tracking-wide">
                  <span className="text-yellow-400">💡</span> Tip of the Day
                </div>
                <p className="text-sm font-medium text-white/90 leading-relaxed">
                  "Hash Maps provide{" "}
                  <code className="bg-white/20 rounded px-1 py-0.5 text-xs">
                    O(1)
                  </code>{" "}
                  average time complexity for lookups."
                </p>
              </div>
            </div>

            {/* Daily Problem Card */}
            <div className="mt-2 group/card relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl transition-all duration-300 hover:bg-white/15 hover:border-white/30">
              {dailyProblem ? (
                <div className="flex flex-col md:flex-row items-stretch">
                  <div className="flex-1 p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span
                            className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm
                                        ${
                                          dailyProblem.problem.difficulty ===
                                          "easy"
                                            ? "bg-emerald-500/20 text-emerald-100 border-emerald-500/30"
                                            : dailyProblem.problem
                                                  .difficulty === "medium"
                                              ? "bg-amber-500/20 text-amber-100 border-amber-500/30"
                                              : "bg-rose-500/20 text-rose-100 border-rose-500/30"
                                        }`}
                          >
                            {dailyProblem.problem.difficulty}
                          </span>
                          {dailyProblem.stats.estimatedTime && (
                            <span className="flex items-center gap-1.5 text-xs font-medium text-indigo-100 bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                              <Clock className="w-3 h-3" />{" "}
                              {dailyProblem.stats.estimatedTime}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-2xl text-white group-hover/card:text-indigo-50 transition-colors tracking-tight">
                          {dailyProblem.problem.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-indigo-100 font-medium">
                      <div
                        className="flex items-center gap-2"
                        title="Users Solved"
                      >
                        <Users className="w-4 h-4 text-indigo-300" />
                        <span>
                          <span className="text-white font-bold">
                            {dailyProblem.stats.solvedCount.toLocaleString()}
                          </span>{" "}
                          Solved
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-2"
                        title="Acceptance Rate"
                      >
                        <Activity className="w-4 h-4 text-indigo-300" />
                        <span>
                          <span className="text-white font-bold">
                            {dailyProblem.stats.acceptanceRate}%
                          </span>{" "}
                          Acceptance
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      {dailyProblem.stats.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium bg-black/20 border border-white/5 hover:bg-black/30 hover:border-white/10 px-2.5 py-1 rounded-md text-indigo-200 transition-all cursor-default backdrop-blur-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    className="p-6 bg-black/5 md:border-l border-white/10 flex flex-col gap-4 items-center justify-center md:w-48 group-hover/card:bg-black/10 transition-colors"
                    href={`/problem/${dailyProblem.problem.slug}`}
                  >
                    <Play className="h-8 w-8 fill-white" />
                    <span>Start Challenge</span>
                  </Link>
                </div>
              ) : (
                <div className="p-8 text-center text-indigo-200 bg-white/5">
                  <p>No daily problem loaded.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Column - Spans 2 cols */}
        <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
          <StatsCard
            title="Total Solved"
            value={stats.totalSolved}
            icon={CheckCircle}
            description={`${stats.totalSubmissions || 0} submissions`}
            className="bg-green-500/5 border-green-500/20"
            iconClassName="bg-green-500/10 text-green-600"
          />
          <StatsCard
            title="Global Rank"
            value={stats.rank ? `#${stats.rank}` : "-"}
            icon={Trophy}
            description="Top 15%"
            className="bg-yellow-500/5 border-yellow-500/20"
            iconClassName="bg-yellow-500/10 text-yellow-600"
          />
          <StatsCard
            title="Total Points"
            value={stats.points || 0}
            icon={Hash} // Using Hash as a placeholder for points/coin icon if Coin is not available
            description="Lifetime earnings"
            className="bg-indigo-500/5 border-indigo-500/20"
            iconClassName="bg-indigo-500/10 text-indigo-600"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-7">
        {/* Left Column (Charts) - spans 5 cols */}
        <div className="col-span-5 flex flex-col gap-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Weekly Activity Chart */}
            <Card className="md:col-span-2 h-full border-primary/20 shadow-sm flex flex-col overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Problems solved this week</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pt-0 pb-2 overflow-hidden">
                <ChartContainer
                  config={activityChartConfig}
                  className="aspect-auto! h-[200px] w-full"
                >
                  <AreaChart
                    accessibilityLayer
                    data={ACTIVITY_DATA}
                    margin={{ left: 14, right: 14, top: 8, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorSolved"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--color-solved)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-solved)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={4}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Area
                      type="monotone"
                      dataKey="solved"
                      stroke="var(--color-solved)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSolved)"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Solved Problems Pie Chart */}
            <Card className="h-full border-primary/20 shadow-sm flex flex-col">
              <CardHeader className="pb-0">
                <CardTitle>Solved Problems</CardTitle>
                <CardDescription>By difficulty level</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <ChartContainer
                  config={difficultyChartConfig}
                  className="mx-auto aspect-square h-[180px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={DIFFICULTY_DATA}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={70}
                      strokeWidth={2}
                      paddingAngle={3}
                    />
                  </PieChart>
                </ChartContainer>
                <div className="flex gap-4 justify-center text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: "hsl(142.1 76.2% 36.3%)" }}
                    />
                    <span>Easy</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: "hsl(47.9 95.8% 53.1%)" }}
                    />
                    <span>Med</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: "hsl(0 84.2% 60.2%)" }}
                    />
                    <span>Hard</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column (Upcoming) - spans 2 cols */}
        <div className="col-span-2 flex flex-col gap-6">
          <Card className="flex flex-col h-full shadow-sm bg-card/50 overflow-hidden relative">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Upcoming Exams</CardTitle>
              <CardDescription>Stay prepared!</CardDescription>
            </CardHeader>
            <CardContent className="px-6 flex-1">
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
    <div className="relative w-full h-full flex flex-col">
      <div className="overflow-hidden flex-1 flex items-stretch">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentExam.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <Link
              href={`/exam/${currentExam.id}`}
              className="flex flex-col gap-2 p-4 rounded-xl bg-background border border-muted-foreground/40 shadow-sm cursor-pointer h-full group"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Calendar className="h-4 w-4" />
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

              <h4 className="font-semibold text-base leading-12 line-clamp-2 group-hover:text-primary transition-all">
                {currentExam.title}
              </h4>

              <Button>
                View Details
                <ChevronRight className="group-hover:translate-x-1 transition-all" />
              </Button>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Indicators */}
      <div className="flex items-center justify-between px-2 pt-2">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="h-6 w-6 rounded-full hover:bg-primary/10"
          onClick={prev}
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>

        <div className="flex gap-1.5">
          {exams.map((exam, idx) => (
            <button
              key={`dot-${exam.id}`}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-muted-foreground/30 hover:bg-primary/50"
              }`}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="h-6 w-6 rounded-full hover:bg-primary/10"
          onClick={next}
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
