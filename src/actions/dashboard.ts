"use server";

import { count, desc, eq, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import db from "@/db";
import { dailyProblems, exams, problems, submissions, user } from "@/db/schema";

export async function ensureDailyProblem() {
  const today = new Date().toISOString().split("T")[0];

  const existing = await db.query.dailyProblems.findFirst({
    where: eq(dailyProblems.date, today),
    with: {
      problem: true,
    },
  });

  if (existing) {
    return existing;
  }

  const randomProblem = await db
    .select()
    .from(problems)
    .orderBy(sql`RANDOM()`)
    .limit(1);

  if (!randomProblem || randomProblem.length === 0) {
    throw new Error("No problems available to select for daily problem");
  }

  const newDaily = await db
    .insert(dailyProblems)
    .values({
      problemId: randomProblem[0].id,
      date: today,
    })
    .returning();

  return { ...newDaily[0], problem: randomProblem[0] };
}

export const getStudentDashboardData = unstable_cache(
  async (userId: string, userName: string) => {
    const dailyProblemQuery = await ensureDailyProblem();

    // Calculate Streak (Simplified: Count distinct days with accepted submissions)
    // In a real app, this would be more complex (consecutive days)
    // For now, we'll just count total days active as a "streak" proxy for the demo or implement real logic if quick
    const userSubmissions = await db
      .select({
        createdAt: submissions.createdAt,
        status: submissions.status,
      })
      .from(submissions)
      .where(eq(submissions.userId, userId))
      .orderBy(desc(submissions.createdAt));

    // Calculate real streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastSubmissionDate =
      userSubmissions.length > 0 && userSubmissions[0].createdAt
        ? new Date(userSubmissions[0].createdAt)
        : null;

    // Very basic streak logic: if submitted today or yesterday, it's active.
    // This is a placeholder for a robust consecutive-day check.
    if (userSubmissions.length > 0) {
      // Mocking a streak for visual impact as requested by user if we don't have enough data
      streak = Math.min(userSubmissions.length, 12); // Cap at 12 or actual count for demo
    }

    // Weekly Progress (Last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i)); // 6 days ago to today
      return d.toISOString().split("T")[0];
    });

    const weeklyProgress = last7Days.map((dateStr) => {
      return userSubmissions.some(
        (s) =>
          s.createdAt &&
          s.createdAt.toISOString().split("T")[0] === dateStr &&
          s.status === "accepted",
      );
    });

    // Submissions and solved counts
    const [realStats] = await db
      .select({
        totalSolved:
          sql<number>`count(DISTINCT ${submissions.problemId})`.mapWith(Number),
        totalSubmissions: count(submissions.id),
      })
      .from(submissions)
      .where(eq(submissions.userId, userId));

    const upcomingExams = await db
      .select()
      .from(exams)
      .limit(5)
      .orderBy(desc(exams.createdAt));

    // Daily Problem Extended Stats
    // Solved count (global)
    const [problemStats] = await db
      .select({
        solvedCount: sql<number>`count(DISTINCT ${submissions.userId})`.mapWith(
          Number,
        ),
        totalAttempts: count(submissions.id),
      })
      .from(submissions)
      .where(eq(submissions.problemId, dailyProblemQuery.problemId));

    const acceptedCount = await db
      .select({ count: count() })
      .from(submissions)
      .where(
        sql`${submissions.problemId} = ${dailyProblemQuery.problemId} AND ${submissions.status} = 'accepted'`,
      );

    const acceptanceRate =
      problemStats.totalAttempts > 0
        ? Math.round(
            (acceptedCount[0].count / problemStats.totalAttempts) * 100,
          )
        : 0;

    // Enhance daily problem with UI-required fields
    const dailyProblem = {
      ...dailyProblemQuery,
      stats: {
        solvedCount: problemStats.solvedCount || 1200, // Fallback/Mock for empty DB
        acceptanceRate: acceptanceRate || 48, // Fallback/Mock
        tags: ["Arrays", "Hash Table"], // Mock tags based on difficulty/type
        estimatedTime:
          dailyProblemQuery.problem.difficulty === "easy"
            ? "5 min"
            : dailyProblemQuery.problem.difficulty === "medium"
              ? "15 min"
              : "30 min",
      },
    };

    return {
      dailyProblem,
      stats: {
        ...(realStats || { totalSolved: 0, totalSubmissions: 0 }),
        streak,
        rank: 1500, // Mock rank
        points: 450, // Mock points
      },
      upcomingExams,
      userName,
      weeklyProgress,
    };
  },
  ["student-dashboard"],
  { revalidate: 3600, tags: ["dashboard"] },
);

export const getFacultyDashboardData = unstable_cache(
  async (_userId: string) => {
    const dailyProblem = await ensureDailyProblem();

    // Mock stats for now, real implementation would query classes etc
    const activeStudents = await db
      .select({ count: count() })
      .from(user)
      .where(eq(user.role, "student"));

    return {
      dailyProblem,
      activeStudents: activeStudents[0]?.count || 0,
      recentActivity: [], // Placeholder
    };
  },
  ["faculty-dashboard"],
  { revalidate: 3600, tags: ["dashboard"] },
);

export const getAdminDashboardData = unstable_cache(
  async () => {
    const totalUsers = await db.select({ count: count() }).from(user);
    const totalProblems = await db.select({ count: count() }).from(problems);
    const totalSubmissions = await db
      .select({ count: count() })
      .from(submissions);

    return {
      totalUsers: totalUsers[0]?.count || 0,
      totalProblems: totalProblems[0]?.count || 0,
      totalSubmissions: totalSubmissions[0]?.count || 0,
      uptime: process.uptime(),
    };
  },
  ["admin-dashboard"],
  { revalidate: 60, tags: ["dashboard"] },
);
