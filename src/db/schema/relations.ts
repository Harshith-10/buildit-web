// This file contains ONLY the relations that are NOT already defined in their respective schema files
// Relations are now defined alongside their tables in individual schema files for better maintainability

import { relations } from "drizzle-orm/relations";
import { account, session, user } from "./auth";

// Auth relations
export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
