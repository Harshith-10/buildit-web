import { foreignKey, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const groups = pgTable(
  "groups",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    description: text(),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"),
  },
  (table) => [
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [user.id],
      name: "groups_created_by_user_id_fk",
    }),
  ],
);

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
