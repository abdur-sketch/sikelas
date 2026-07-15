import { env } from "cloudflare:workers";

export type UserRole = "Admin" | "Wali Kelas" | "Guru" | "Siswa" | "Wali Santri";
export type AppActor = { email: string; name: string; role: UserRole; classLabel: string | null; studentNis: string | null; status: string; active: number; assignedClasses: string[] };
const PRIMARY_ADMIN_EMAIL = "baikganteng88@gmail.com";

const ddl = [
  "CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL, class_label TEXT, student_nis TEXT, status TEXT NOT NULL DEFAULT 'Pending', active INTEGER NOT NULL DEFAULT 0, approved_by TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "CREATE TABLE IF NOT EXISTS user_class_assignments (id TEXT PRIMARY KEY NOT NULL, email TEXT NOT NULL, class_label TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "CREATE UNIQUE INDEX IF NOT EXISTS user_class_assignment_idx ON user_class_assignments (email, class_label)",
  "CREATE INDEX IF NOT EXISTS user_class_email_idx ON user_class_assignments (email)",
  "CREATE TABLE IF NOT EXISTS classes (id TEXT PRIMARY KEY NOT NULL, label TEXT NOT NULL UNIQUE, short TEXT NOT NULL, boys INTEGER NOT NULL, girls INTEGER NOT NULL)",
  "CREATE TABLE IF NOT EXISTS students (nis TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, class_label TEXT NOT NULL, gender TEXT NOT NULL, guardian TEXT NOT NULL, status TEXT NOT NULL, initials TEXT NOT NULL, color TEXT NOT NULL, barcode_token TEXT NOT NULL)",
  "CREATE INDEX IF NOT EXISTS students_class_idx ON students (class_label)",
  "CREATE TABLE IF NOT EXISTS attendance_records (id TEXT PRIMARY KEY NOT NULL, nis TEXT NOT NULL, class_label TEXT NOT NULL, date TEXT NOT NULL, status TEXT NOT NULL, method TEXT NOT NULL DEFAULT 'manual', scanned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "CREATE UNIQUE INDEX IF NOT EXISTS attendance_student_date_idx ON attendance_records (nis, date)",
  "CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY NOT NULL, title TEXT NOT NULL, class_label TEXT NOT NULL, subject TEXT NOT NULL, due TEXT NOT NULL, submitted INTEGER NOT NULL, total INTEGER NOT NULL, status TEXT NOT NULL, tone TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS schedules (id TEXT PRIMARY KEY NOT NULL, class_label TEXT NOT NULL, day TEXT NOT NULL, start_time TEXT NOT NULL, subject TEXT NOT NULL, teacher TEXT NOT NULL, room TEXT NOT NULL, tone TEXT NOT NULL)",
  "CREATE INDEX IF NOT EXISTS schedules_class_idx ON schedules (class_label)",
  "CREATE TABLE IF NOT EXISTS grades (id TEXT PRIMARY KEY NOT NULL, nis TEXT NOT NULL, class_label TEXT NOT NULL, assignment INTEGER NOT NULL, practice INTEGER NOT NULL, exam INTEGER NOT NULL, attitude TEXT NOT NULL, final_score INTEGER NOT NULL)",
  "CREATE UNIQUE INDEX IF NOT EXISTS grades_student_class_idx ON grades (nis, class_label)",
  "CREATE TABLE IF NOT EXISTS academic_periods (id TEXT PRIMARY KEY NOT NULL, label TEXT NOT NULL, semester TEXT NOT NULL, start_date TEXT NOT NULL, end_date TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 0, closed_at TEXT)",
  "CREATE TABLE IF NOT EXISTS task_submissions (id TEXT PRIMARY KEY NOT NULL, task_id TEXT NOT NULL, nis TEXT NOT NULL, status TEXT NOT NULL, score INTEGER, feedback TEXT NOT NULL DEFAULT '', evidence_url TEXT, submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "CREATE UNIQUE INDEX IF NOT EXISTS submissions_task_student_idx ON task_submissions (task_id, nis)",
  "CREATE TABLE IF NOT EXISTS communication_logs (id TEXT PRIMARY KEY NOT NULL, nis TEXT NOT NULL, channel TEXT NOT NULL, message TEXT NOT NULL, status TEXT NOT NULL, actor_email TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "CREATE INDEX IF NOT EXISTS communication_nis_idx ON communication_logs (nis)",
  "CREATE TABLE IF NOT EXISTS deleted_records (id TEXT PRIMARY KEY NOT NULL, entity TEXT NOT NULL, entity_id TEXT NOT NULL, payload TEXT NOT NULL, deleted_by TEXT NOT NULL, deleted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, restored_at TEXT)",
  "CREATE INDEX IF NOT EXISTS deleted_entity_idx ON deleted_records (entity)",
  "CREATE TABLE IF NOT EXISTS settings (class_label TEXT PRIMARY KEY NOT NULL, school_name TEXT NOT NULL, npsn TEXT NOT NULL, school_email TEXT NOT NULL, phone TEXT NOT NULL, address TEXT NOT NULL, homeroom TEXT NOT NULL, academic_year TEXT NOT NULL, room TEXT NOT NULL, entry_time TEXT NOT NULL, late_time TEXT NOT NULL, end_time TEXT NOT NULL, min_attendance INTEGER NOT NULL, assignment_weight INTEGER NOT NULL, practice_weight INTEGER NOT NULL, exam_weight INTEGER NOT NULL, attitude_weight INTEGER NOT NULL, kkm INTEGER NOT NULL)",
  "CREATE TABLE IF NOT EXISTS announcements (id TEXT PRIMARY KEY NOT NULL, title TEXT NOT NULL, category TEXT NOT NULL, audience TEXT NOT NULL, date TEXT NOT NULL, author TEXT NOT NULL, priority TEXT NOT NULL, status TEXT NOT NULL, excerpt TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS portfolios (id TEXT PRIMARY KEY NOT NULL, title TEXT NOT NULL, type TEXT NOT NULL, nis TEXT NOT NULL, student TEXT NOT NULL, class_label TEXT NOT NULL, date TEXT NOT NULL, status TEXT NOT NULL, score INTEGER NOT NULL, tone TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', evidence_key TEXT, evidence_name TEXT, evidence_type TEXT, evidence_url TEXT)",
  "CREATE TABLE IF NOT EXISTS point_rules (id TEXT PRIMARY KEY NOT NULL, type TEXT NOT NULL, label TEXT NOT NULL, points INTEGER NOT NULL, active INTEGER NOT NULL DEFAULT 1)",
  "CREATE TABLE IF NOT EXISTS audit_logs (id TEXT PRIMARY KEY NOT NULL, actor_email TEXT NOT NULL, action TEXT NOT NULL, entity TEXT NOT NULL, entity_id TEXT NOT NULL, detail TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY NOT NULL, user_email TEXT NOT NULL, title TEXT NOT NULL, message TEXT NOT NULL, read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  `CREATE TABLE IF NOT EXISTS development_records (id TEXT PRIMARY KEY NOT NULL, nis TEXT NOT NULL, type TEXT NOT NULL, title TEXT NOT NULL, detail TEXT NOT NULL DEFAULT '', date TEXT NOT NULL, points INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
];

const studentSeed = [
  ["221001","Fahri Ramadhan","X DKV 1","L","081211110001","FR","mint"],["221002","Nadia Safitri","X DKV 1","P","081211110002","NS","peach"],["221003","Dimas Pratama","X DKV 1","L","081211110003","DP","blue"],["221004","Salma Nabila","X DKV 1","P","081211110004","SN","lilac"],["221005","Rafi Maulana","X DKV 1","L","081211110005","RM","yellow"],["221006","Putri Azzahra","X DKV 1","P","081211110006","PA","pink"],
  ["231001","Alya Regina","XI DKV 1","P","081234567890","AR","mint"],["231002","Malikha Abimanyu","XI DKV 1","P","085711223344","MA","peach"],["231003","Rista Ayu Dewi","XI DKV 1","P","081390876543","RD","blue"],["231004","Sinar Lorenza","XI DKV 1","P","082144556677","SL","lilac"],["231005","Zahra Khairunnisa","XI DKV 1","P","089577889900","ZK","yellow"],["231006","Jilan Afifah","XI DKV 1","P","081922334455","JA","pink"],
  ["241001","Rizky Maulana","XII DKV 1","L","081233330001","RM","mint"],["241002","Salsa Nabila","XII DKV 1","P","081233330002","SN","peach"],["241003","Akbar Fauzan","XII DKV 1","L","081233330003","AF","blue"],["241004","Nabila Putri","XII DKV 1","P","081233330004","NP","lilac"],["241005","Ilham Kurnia","XII DKV 1","L","081233330005","IK","yellow"],["241006","Aisyah Rahma","XII DKV 1","P","081233330006","AR","pink"],
] as const;

export function getD1(): D1Database {
  if (!env.DB) throw new Error("Database D1 belum tersedia.");
  return env.DB;
}

export function getR2(): R2Bucket {
  const bucket = (env as unknown as { FILES?: R2Bucket }).FILES;
  if (!bucket) throw new Error("Penyimpanan berkas R2 belum tersedia.");
  return bucket;
}

export function todayJakarta() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export async function ensureDatabase(db = getD1()) {
  await db.batch(ddl.map((sql) => db.prepare(sql)));
  const portfolioColumns = await db.prepare("PRAGMA table_info(portfolios)").all<{ name: string }>();
  const existingPortfolioColumns = new Set(portfolioColumns.results.map((column) => column.name));
  for (const [name, type] of [["evidence_key","TEXT"],["evidence_name","TEXT"],["evidence_type","TEXT"],["evidence_url","TEXT"]] as const) {
    if (!existingPortfolioColumns.has(name)) await db.prepare(`ALTER TABLE portfolios ADD COLUMN ${name} ${type}`).run();
  }
  const userColumns = await db.prepare("PRAGMA table_info(users)").all<{ name: string }>();
  const existingUserColumns = new Set(userColumns.results.map((column) => column.name));
  for (const [name, definition] of [["student_nis","TEXT"],["status","TEXT NOT NULL DEFAULT 'Pending'"],["active","INTEGER NOT NULL DEFAULT 0"],["approved_by","TEXT"],["updated_at","TEXT"]] as const) {
    if (!existingUserColumns.has(name)) await db.prepare(`ALTER TABLE users ADD COLUMN ${name} ${definition}`).run();
  }
  await db.batch([
    db.prepare("INSERT OR IGNORE INTO users (email,name,role,class_label,status,active,approved_by) VALUES (?,?,?,?,'Active',1,?)").bind("guru@nuruliman.sch.id","Abdurohman Yusuf","Wali Kelas","XI DKV 1",PRIMARY_ADMIN_EMAIL),
    db.prepare("UPDATE users SET role='Wali Kelas',class_label='XI DKV 1',status='Active',active=1,approved_by=?,updated_at=CURRENT_TIMESTAMP WHERE email='guru@nuruliman.sch.id'").bind(PRIMARY_ADMIN_EMAIL),
    db.prepare("INSERT OR IGNORE INTO users (email,name,role,status,active,approved_by) VALUES (?,?,?,'Active',1,?)").bind(PRIMARY_ADMIN_EMAIL,"Abdurohman Yusuf","Admin",PRIMARY_ADMIN_EMAIL),
    db.prepare("UPDATE users SET name='Abdurohman Yusuf',role='Admin',status='Active',active=1,approved_by=?,updated_at=CURRENT_TIMESTAMP WHERE email=?").bind(PRIMARY_ADMIN_EMAIL,PRIMARY_ADMIN_EMAIL),
    db.prepare("INSERT OR IGNORE INTO user_class_assignments (id,email,class_label) VALUES (?,?,?)").bind("assign-seed-wali-xi","guru@nuruliman.sch.id","XI DKV 1"),
    ...[["x","X DKV 1","X",3,3],["xi","XI DKV 1","XI",0,6],["xii","XII DKV 1","XII",3,3]].map((c) => db.prepare("INSERT OR IGNORE INTO classes (id,label,short,boys,girls) VALUES (?,?,?,?,?)").bind(...c)),
    ...studentSeed.map((s) => db.prepare("INSERT OR IGNORE INTO students (nis,name,class_label,gender,guardian,status,initials,color,barcode_token) VALUES (?,?,?,?,?,'Aktif',?,?,?)").bind(...s, `NI-${s[0]}-2026`)),
    ...[["t1","Poster Hari Kemerdekaan","XI DKV 1","Desain Grafis","2026-07-16",5,6,"Berjalan","green"],["t2","Foto Produk Lokal","XI DKV 1","Fotografi","2026-07-18",4,6,"Berjalan","gold"],["t3","Esai Budaya Pesantren","XI DKV 1","Bahasa Indonesia","2026-07-20",2,6,"Baru","blue"],["t4","Animasi Logo Sekolah","XI DKV 1","Animasi Dasar","2026-07-11",6,6,"Selesai","purple"]].map((t) => db.prepare("INSERT OR IGNORE INTO tasks (id,title,class_label,subject,due,submitted,total,status,tone) VALUES (?,?,?,?,?,?,?,?,?)").bind(...t)),
    ...["X DKV 1","XI DKV 1","XII DKV 1"].flatMap((classLabel,classIndex) => [["Senin","07:00","Matematika","Ust. Ahmad Fauzi",`Ruang ${classLabel}`,"0"],["Senin","08:30","Desain Grafis","Abdurohman Yusuf","Lab DKV","1"],["Selasa","07:00","Fotografi","Riki Ardian Pratama","Studio Foto","2"],["Rabu","10:15","Animasi Dasar","Abdurohman Yusuf","Lab DKV","3"],["Kamis","12:45","Bahasa Inggris","Miftah Nurul Hikmah",`Ruang ${classLabel}`,"0"],["Jumat","07:00","Proyek Kreatif","Abdurohman Yusuf","Lab DKV","1"]].map((s,index) => db.prepare("INSERT OR IGNORE INTO schedules (id,class_label,day,start_time,subject,teacher,room,tone) VALUES (?,?,?,?,?,?,?,?)").bind(`sch-${classIndex}-${index}`,classLabel,...s))),
    ...studentSeed.map((s,index) => db.prepare("INSERT OR IGNORE INTO grades (id,nis,class_label,assignment,practice,exam,attitude,final_score) VALUES (?,?,?,?,?,?,?,?)").bind(`grade-${s[0]}`,s[0],s[2],82+(index%7),85+(index%6),80+(index%8),"A",83+(index%6))),
    ...["X DKV 1","XI DKV 1","XII DKV 1"].map((classLabel) => db.prepare("INSERT OR IGNORE INTO settings (class_label,school_name,npsn,school_email,phone,address,homeroom,academic_year,room,entry_time,late_time,end_time,min_attendance,assignment_weight,practice_weight,exam_weight,attitude_weight,kkm) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(classLabel,"SMK Nurul Iman","69912345","admin@nuruliman.sch.id","(0251) 8654 321","Kabupaten Bogor, Jawa Barat","Abdurohman Yusuf","2026/2027",`Ruang ${classLabel}`,"07:00","07:15","14:15",80,25,35,30,10,75)),
    db.prepare("INSERT OR IGNORE INTO academic_periods (id,label,semester,start_date,end_date,active) VALUES ('period-2026-1','2026/2027','Ganjil','2026-07-01','2026-12-18',1)"),
    ...[["a1","Seleksi Lomba Kreativitas Siswa","Kegiatan","Semua Kelas","2026-07-17","Abdurohman Yusuf","Penting","Terbit","Setiap siswa DKV diminta membawa satu karya terbaik untuk proses kurasi di Lab DKV."],["a2","Jadwal Penilaian Tengah Semester","Akademik","Semua Kelas","2026-07-20","Wakasek Kurikulum","Penting","Terjadwal","PTS semester ganjil dilaksanakan mulai 3 Agustus."],["a3","Perlengkapan Praktik Fotografi","Perlengkapan","XI DKV 1","2026-07-15","Riki Ardian Pratama","Normal","Terbit","Siswa membawa kamera atau ponsel dan kain latar polos."]].map((a) => db.prepare("INSERT OR IGNORE INTO announcements (id,title,category,audience,date,author,priority,status,excerpt) VALUES (?,?,?,?,?,?,?,?,?)").bind(...a)),
    ...[["p1","Rebranding Kopi Gunung","Desain Grafis","231001","Alya Regina","XI DKV 1","2026-07-12","Terpilih",92,"teal","Identitas visual produk lokal"],["p2","Cerita Pagi di Pesantren","Fotografi","231002","Malikha Abimanyu","XI DKV 1","2026-07-09","Dipublikasi",89,"blue","Seri fotografi dokumenter"],["p3","Animasi Logo Nurul Iman","Animasi","231003","Rista Ayu Dewi","XI DKV 1","2026-07-05","Ditinjau",87,"purple","Animasi identitas sekolah"]].map((p) => db.prepare("INSERT OR IGNORE INTO portfolios (id,title,type,nis,student,class_label,date,status,score,tone,description) VALUES (?,?,?,?,?,?,?,?,?,?,?)").bind(...p)),
    ...[["pr-portfolio","Portofolio","Karya disetujui",15],["pr-prestasi-kelas","Prestasi","Prestasi tingkat kelas",20],["pr-prestasi-kab","Prestasi","Prestasi tingkat kabupaten",50],["pr-pelanggaran-ringan","Pelanggaran","Pelanggaran ringan",-5],["pr-pelanggaran-sedang","Pelanggaran","Pelanggaran sedang",-15]].map((r) => db.prepare("INSERT OR IGNORE INTO point_rules (id,type,label,points,active) VALUES (?,?,?,?,1)").bind(...r)),
    db.prepare("INSERT OR IGNORE INTO notifications (id,user_email,title,message,read) VALUES ('n1','guru@nuruliman.sch.id','Tugas menunggu penilaian','3 tugas menunggu penilaian.',0)"),
    db.prepare("INSERT OR IGNORE INTO notifications (id,user_email,title,message,read) VALUES ('n2','guru@nuruliman.sch.id','Absensi belum dikunci','Absensi hari ini belum dikunci.',0)"),
  ]);
  await db.batch(studentSeed.map((student) => db.prepare("UPDATE students SET barcode_token=? WHERE nis=? AND barcode_token=?").bind(crypto.randomUUID().replaceAll("-",""),student[0],`NI-${student[0]}-2026`)));
  return db;
}

export async function getActor(request: Request): Promise<AppActor> {
  const email = (request.headers.get("oai-authenticated-user-email") || (new URL(request.url).hostname === "localhost" ? "guru@nuruliman.sch.id" : "")).trim().toLowerCase();
  if (!email) throw new Error("Sesi pengguna tidak tersedia.");
  const db = await ensureDatabase();
  const user = await db.prepare("SELECT email,name,role,class_label AS classLabel,student_nis AS studentNis,status,active FROM users WHERE email=?").bind(email).first<Omit<AppActor,"assignedClasses">>();
  if (user) {
    if (!Number(user.active) || user.status !== "Active") throw new Error(user.status === "Pending" ? "Akun menunggu persetujuan Admin Pusat." : "Akun Anda sedang dinonaktifkan.");
    const assignments = await db.prepare("SELECT class_label AS classLabel FROM user_class_assignments WHERE email=? ORDER BY class_label").bind(email).all<{classLabel:string}>();
    return { ...user, active:Number(user.active), assignedClasses:assignments.results.map((item)=>item.classLabel) };
  }
  const nameHeader = request.headers.get("oai-authenticated-user-full-name");
  const name = nameHeader ? decodeURIComponent(nameHeader) : email.split("@")[0];
  await db.prepare("INSERT INTO users (email,name,role,class_label,status,active) VALUES (?,?,'Guru',NULL,'Pending',0)").bind(email,name).run();
  throw new Error("Akun menunggu persetujuan Admin Pusat.");
}

export async function audit(db: D1Database, actor: AppActor, action: string, entity: string, entityId: string, detail: string) {
  await db.prepare("INSERT INTO audit_logs (id,actor_email,action,entity,entity_id,detail) VALUES (?,?,?,?,?,?)").bind(crypto.randomUUID(),actor.email,action,entity,entityId,detail).run();
}

export function requireWriteRole(actor: AppActor) {
  if (!["Admin","Wali Kelas","Guru"].includes(actor.role)) throw new Error("Anda tidak memiliki izin untuk mengubah data.");
}

export function requireAdmin(actor: AppActor) {
  if (actor.role !== "Admin") throw new Error("Operasi ini hanya dapat dilakukan Admin Pusat.");
}

export function requireClassAccess(actor: AppActor, classLabel: string) {
  if (actor.role === "Admin") return;
  const allowed = new Set([actor.classLabel, ...actor.assignedClasses].filter(Boolean));
  if (!classLabel || !allowed.has(classLabel)) throw new Error("Anda tidak ditugaskan pada kelas ini.");
}
