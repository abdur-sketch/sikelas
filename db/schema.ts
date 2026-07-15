import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  email: text("email").primaryKey(), name: text("name").notNull(), role: text("role").notNull(), classLabel: text("class_label"), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const classes = sqliteTable("classes", {
  id: text("id").primaryKey(), label: text("label").notNull(), short: text("short").notNull(), boys: integer("boys").notNull(), girls: integer("girls").notNull(),
}, (table) => [uniqueIndex("classes_label_idx").on(table.label)]);

export const students = sqliteTable("students", {
  nis: text("nis").primaryKey(), name: text("name").notNull(), classLabel: text("class_label").notNull(), gender: text("gender").notNull(), guardian: text("guardian").notNull(), status: text("status").notNull(), initials: text("initials").notNull(), color: text("color").notNull(), barcodeToken: text("barcode_token").notNull(),
}, (table) => [index("students_class_idx").on(table.classLabel)]);

export const attendanceRecords = sqliteTable("attendance_records", {
  id: text("id").primaryKey(), nis: text("nis").notNull(), classLabel: text("class_label").notNull(), date: text("date").notNull(), status: text("status").notNull(), method: text("method").notNull().default("manual"), scannedAt: text("scanned_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("attendance_student_date_idx").on(table.nis, table.date), index("attendance_class_date_idx").on(table.classLabel, table.date)]);

export const tasksTable = sqliteTable("tasks", {
  id: text("id").primaryKey(), title: text("title").notNull(), classLabel: text("class_label").notNull(), subject: text("subject").notNull(), due: text("due").notNull(), submitted: integer("submitted").notNull(), total: integer("total").notNull(), status: text("status").notNull(), tone: text("tone").notNull(),
}, (table) => [index("tasks_class_idx").on(table.classLabel)]);

export const schedulesTable = sqliteTable("schedules", {
  id: text("id").primaryKey(), classLabel: text("class_label").notNull(), day: text("day").notNull(), startTime: text("start_time").notNull(), subject: text("subject").notNull(), teacher: text("teacher").notNull(), room: text("room").notNull(), tone: text("tone").notNull(),
}, (table) => [index("schedules_class_idx").on(table.classLabel)]);

export const gradesTable = sqliteTable("grades", {
  id: text("id").primaryKey(), nis: text("nis").notNull(), classLabel: text("class_label").notNull(), assignment: integer("assignment").notNull(), practice: integer("practice").notNull(), exam: integer("exam").notNull(), attitude: text("attitude").notNull(), finalScore: integer("final_score").notNull(),
}, (table) => [uniqueIndex("grades_student_class_idx").on(table.nis, table.classLabel)]);

export const settingsTable = sqliteTable("settings", {
  classLabel: text("class_label").primaryKey(), schoolName: text("school_name").notNull(), npsn: text("npsn").notNull(), schoolEmail: text("school_email").notNull(), phone: text("phone").notNull(), address: text("address").notNull(), homeroom: text("homeroom").notNull(), academicYear: text("academic_year").notNull(), room: text("room").notNull(), entryTime: text("entry_time").notNull(), lateTime: text("late_time").notNull(), endTime: text("end_time").notNull(), minAttendance: integer("min_attendance").notNull(), assignmentWeight: integer("assignment_weight").notNull(), practiceWeight: integer("practice_weight").notNull(), examWeight: integer("exam_weight").notNull(), attitudeWeight: integer("attitude_weight").notNull(), kkm: integer("kkm").notNull(),
});

export const announcementsTable = sqliteTable("announcements", {
  id: text("id").primaryKey(), title: text("title").notNull(), category: text("category").notNull(), audience: text("audience").notNull(), date: text("date").notNull(), author: text("author").notNull(), priority: text("priority").notNull(), status: text("status").notNull(), excerpt: text("excerpt").notNull(),
}, (table) => [index("announcements_audience_idx").on(table.audience)]);

export const portfoliosTable = sqliteTable("portfolios", {
  id: text("id").primaryKey(), title: text("title").notNull(), type: text("type").notNull(), nis: text("nis").notNull(), student: text("student").notNull(), classLabel: text("class_label").notNull(), date: text("date").notNull(), status: text("status").notNull(), score: integer("score").notNull(), tone: text("tone").notNull(), description: text("description").notNull().default(""), evidenceKey: text("evidence_key"), evidenceName: text("evidence_name"), evidenceType: text("evidence_type"), evidenceUrl: text("evidence_url"),
}, (table) => [index("portfolios_class_idx").on(table.classLabel), index("portfolios_nis_idx").on(table.nis)]);

export const pointRules = sqliteTable("point_rules", {
  id: text("id").primaryKey(), type: text("type").notNull(), label: text("label").notNull(), points: integer("points").notNull(), active: integer("active", { mode: "boolean" }).notNull().default(true),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(), actorEmail: text("actor_email").notNull(), action: text("action").notNull(), entity: text("entity").notNull(), entityId: text("entity_id").notNull(), detail: text("detail").notNull(), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("audit_created_idx").on(table.createdAt)]);

export const notificationsTable = sqliteTable("notifications", {
  id: text("id").primaryKey(), userEmail: text("user_email").notNull(), title: text("title").notNull(), message: text("message").notNull(), read: integer("read", { mode: "boolean" }).notNull().default(false), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("notifications_user_idx").on(table.userEmail)]);

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
