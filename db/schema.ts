import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const developmentRecords = sqliteTable("development_records", {
  id: text("id").primaryKey(),
  nis: text("nis").notNull(),
  type: text("type", { enum: ["Portofolio", "Prestasi", "Pelanggaran"] }).notNull(),
  title: text("title").notNull(),
  detail: text("detail").notNull().default(""),
  date: text("date").notNull(),
  points: integer("points").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("development_records_nis_idx").on(table.nis)]);
