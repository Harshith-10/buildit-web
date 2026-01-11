import { relations } from "drizzle-orm";
import { date, pgTable, uuid } from "drizzle-orm/pg-core";
import { problems } from "./problems";

export const dailyProblems = pgTable("daily_problems", {
    id: uuid("id").primaryKey().defaultRandom(),
    date: date("date").notNull().unique(),
    problemId: uuid("problem_id")
        .notNull()
        .references(() => problems.id, { onDelete: "cascade" }),
});

export const dailyProblemsRelations = relations(dailyProblems, ({ one }) => ({
    problem: one(problems, {
        fields: [dailyProblems.problemId],
        references: [problems.id],
    }),
}));
