"use server";

import { count, desc, eq, inArray, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import db from "@/db";
import { exams, questions, assignmentSubmissions, user } from "@/db/schema";

export const getStudentDashboardData = unstable_cache(
  async (userId: string, userName: string) => {
    // Get user's recent submissions from exam assignments
    const userSubmissions = await db
      .select({
        createdAt: assignmentSubmissions.createdAt,
        verdict: assignmentSubmissions.verdict,
      })
      .from(assignmentSubmissions)
      .innerJoin(
        sql`exam_assignments`,
        sql`assignment_submissions.assignment_id = exam_assignments.id`,
      )
      .where(sql`exam_assignments.user_id = ${userId}`)
      .orderBy(desc(assignmentSubmissions.createdAt))
      .limit(100);

    // Calculate streak (simplified)
    let streak = 0;
    if (userSubmissions.length > 0) {
      streak = Math.min(userSubmissions.length, 12);
    }

    // Weekly Progress (Last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });

    const weeklyProgress = last7Days.map((dateStr) => {
      return userSubmissions.some(
        (s) =>
          s.createdAt &&
          s.createdAt.toISOString().split("T")[0] === dateStr &&
          s.verdict === "passed",
      );
    });

    // Submissions and solved counts
    const totalSolved = userSubmissions.filter((s) => s.verdict === "passed").length;
    const totalSubmissions = userSubmissions.length;

    const upcomingExams = await db
      .select()
      .from(exams)
      .limit(5)
      .orderBy(desc(exams.createdAt));

    return {
      dailyProblem: null, // Feature removed
      stats: {
        totalSolved,
        totalSubmissions,
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
    const activeStudents = await db
      .select({ count: count() })
      .from(user)
      .where(eq(user.role, "student"));

    return {
      dailyProblem: null, // Feature removed
      activeStudents: activeStudents[0]?.count || 0,
      recentActivity: [],
    };
  },
  ["faculty-dashboard"],
  { revalidate: 3600, tags: ["dashboard"] },
);

export const getAdminDashboardData = unstable_cache(
  async () => {
    const totalUsers = await db.select({ count: count() }).from(user);
    const totalQuestions = await db.select({ count: count() }).from(questions);
    const totalSubmissions = await db
      .select({ count: count() })
      .from(assignmentSubmissions);

    return {
      totalUsers: totalUsers[0]?.count || 0,
      totalProblems: totalQuestions[0]?.count || 0,
      totalSubmissions: totalSubmissions[0]?.count || 0,
      uptime: process.uptime(),
    };
  },
  ["admin-dashboard"],
  { revalidate: 60, tags: ["dashboard"] },
);
