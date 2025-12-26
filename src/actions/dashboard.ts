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
  async (userId: string) => {
    const dailyProblem = await ensureDailyProblem();

    // Drizzle count distinct is cleaner with sql:
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

    return {
      dailyProblem,
      stats: realStats || { totalSolved: 0, totalSubmissions: 0 },
      upcomingExams,
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
