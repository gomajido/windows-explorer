import { mysqlTable, varchar, boolean, timestamp, int, index } from "drizzle-orm/mysql-core";

export const folders = mysqlTable(
  "folders",
  {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull(),
    parentId: int("parent_id"),
    isFolder: boolean("is_folder").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
    deletedAt: timestamp("deleted_at"), // Soft delete support
  },
  (table) => ({
    parentIdIdx: index("parent_id_idx").on(table.parentId),
    nameIdx: index("name_idx").on(table.name),
    deletedAtIdx: index("deleted_at_idx").on(table.deletedAt), // Index for soft delete queries
  })
);

export type FolderRecord = typeof folders.$inferSelect;
export type NewFolderRecord = typeof folders.$inferInsert;
