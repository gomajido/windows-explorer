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
    // ⭐ COMPOSITE INDEX for getChildren queries (most common pattern)
    // Covers: WHERE parent_id = X AND deleted_at IS NULL ORDER BY name
    parentActiveNameIdx: index("parent_active_name_idx")
      .on(table.parentId, table.deletedAt, table.name),
    
    // ⭐ COMPOSITE INDEX for tree building (getFolderTree)
    // Covers: WHERE is_folder = true AND deleted_at IS NULL ORDER BY name
    folderActiveNameIdx: index("folder_active_name_idx")
      .on(table.isFolder, table.deletedAt, table.name),
    
    // ⭐ COMPOSITE INDEX for search queries
    // Covers: WHERE deleted_at IS NULL AND name LIKE '%X%'
    activeNameIdx: index("active_name_idx")
      .on(table.deletedAt, table.name),
    
    // Keep simple indexes for specific lookups
    parentIdIdx: index("parent_id_idx").on(table.parentId),
    nameIdx: index("name_idx").on(table.name),
  })
);

export type FolderRecord = typeof folders.$inferSelect;
export type NewFolderRecord = typeof folders.$inferInsert;
