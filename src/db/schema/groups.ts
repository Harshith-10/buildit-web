import { relations } from "drizzle-orm";
import {
  foreignKey,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const userGroups = pgTable("user_group", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const userGroupMembers = pgTable("user_group_member", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => userGroups.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const userGroupsRelations = relations(userGroups, ({ many }) => ({
  members: many(userGroupMembers),
}));

export const userGroupMembersRelations = relations(
  userGroupMembers,
  ({ one }) => ({
    group: one(userGroups, {
      fields: [userGroupMembers.groupId],
      references: [userGroups.id],
    }),
    user: one(user, {
      fields: [userGroupMembers.userId],
      references: [user.id],
    }),
  }),
);

// Legacy groups table for backwards compatibility
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

export const groupsRelations = relations(groups, ({ one, many }) => ({
  usersToGroups: many(usersToGroups),
  createdBy: one(user, {
    fields: [groups.createdBy],
    references: [user.id],
  }),
}));

export const usersToGroupsRelations = relations(usersToGroups, ({ one }) => ({
  user: one(user, {
    fields: [usersToGroups.userId],
    references: [user.id],
  }),
  group: one(groups, {
    fields: [usersToGroups.groupId],
    references: [groups.id],
  }),
}));
