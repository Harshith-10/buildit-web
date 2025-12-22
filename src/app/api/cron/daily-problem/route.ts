import { NextResponse } from "next/server";
import { ensureDailyProblem } from "@/actions/dashboard";

export async function GET() {
  try {
    const dailyProblem = await ensureDailyProblem();
    return NextResponse.json({ success: true, daileyProblem: dailyProblem });
  } catch (error) {
    console.error("Failed to ensure daily problem:", error);
    return NextResponse.json(
      { success: false, error: "Failed to ensure daily problem" },
      { status: 500 },
    );
  }
}
