import { foreignKey, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const groups = pgTable("groups", {
  id: text().primaryKey().notNull(),
  name: text().notNull(),
  description: text(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { mode: "string" }),
});

export const usersToGroups = pgTable(
  "users_to_groups",
  {
    userId: text("user_id").notNull(),
    groupId: text("group_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "users_to_groups_user_id_user_id_fk",
    }),
    foreignKey({
      columns: [table.groupId],
      foreignColumns: [groups.id],
      name: "users_to_groups_group_id_groups_id_fk",
    }),
  ],
);
