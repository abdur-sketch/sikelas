import { initialDevelopmentRecords } from "../../development-records";
import { normalizeDevelopmentPoints, type DevelopmentRecord, type DevelopmentType } from "../../student-points";
import { audit, ensureDatabase, getActor, requireClassAccess, requireWriteRole } from "../../../db/runtime";

const allowedTypes: DevelopmentType[] = ["Portofolio", "Prestasi", "Pelanggaran"];

async function prepareDatabase(db: D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS development_records (
      id TEXT PRIMARY KEY NOT NULL,
      nis TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      detail TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL,
      points INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare("CREATE INDEX IF NOT EXISTS development_records_nis_idx ON development_records (nis)"),
  ]);

  const count = await db.prepare("SELECT COUNT(*) AS total FROM development_records").first<{ total: number }>();
  if (Number(count?.total ?? 0) === 0) {
    await db.batch(initialDevelopmentRecords.map((record) => db.prepare(
      "INSERT INTO development_records (id, nis, type, title, detail, date, points) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(record.id, record.nis, record.type, record.title, record.detail, record.date, record.points)));
  }
}

function rowToRecord(row: Record<string, unknown>): DevelopmentRecord {
  return {
    id: String(row.id),
    nis: String(row.nis),
    type: String(row.type) as DevelopmentType,
    title: String(row.title),
    detail: String(row.detail),
    date: String(row.date),
    points: Number(row.points),
  };
}

export async function GET(request: Request) {
  try {
    const actor = await getActor(request);
    const db = await ensureDatabase();
    await prepareDatabase(db);
    const isPortalViewer = actor.role === "Siswa" || actor.role === "Wali Santri";
    if (isPortalViewer && !actor.studentNis) {
      return Response.json({ error: "Akun portal belum terhubung dengan siswa." }, { status: 403 });
    }
    const requestedClass = new URL(request.url).searchParams.get("class") || actor.classLabel || actor.assignedClasses[0] || "";
    if (!isPortalViewer) requireClassAccess(actor, requestedClass);
    const query = isPortalViewer
      ? db.prepare("SELECT id, nis, type, title, detail, date, points FROM development_records WHERE nis = ? ORDER BY date DESC, created_at DESC").bind(actor.studentNis)
      : db.prepare("SELECT d.id, d.nis, d.type, d.title, d.detail, d.date, d.points FROM development_records d JOIN students s ON s.nis=d.nis WHERE s.class_label=? ORDER BY d.date DESC, d.created_at DESC").bind(requestedClass);
    const result = await query.all();
    return Response.json({ records: result.results.map(rowToRecord) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Gagal membaca rekam jejak." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const actor = await getActor(request);
    requireWriteRole(actor);
    const body = await request.json() as Partial<DevelopmentRecord>;
    const type = body.type as DevelopmentType;
    if (!body.nis?.trim() || !body.title?.trim() || !body.date || !allowedTypes.includes(type)) {
      return Response.json({ error: "Data catatan belum lengkap." }, { status: 400 });
    }

    const record: DevelopmentRecord = {
      id: crypto.randomUUID(),
      nis: body.nis.trim(),
      type,
      title: body.title.trim(),
      detail: body.detail?.trim() ?? "",
      date: body.date,
      points: normalizeDevelopmentPoints(type, Number(body.points ?? 0)),
    };
    const db = await ensureDatabase();
    await prepareDatabase(db);
    const student = await db.prepare("SELECT class_label AS classLabel FROM students WHERE nis=?").bind(record.nis).first<{ classLabel: string }>();
    if (!student) return Response.json({ error: "Siswa tidak ditemukan." }, { status: 404 });
    requireClassAccess(actor, student.classLabel);
    await db.prepare("INSERT INTO development_records (id, nis, type, title, detail, date, points) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(record.id, record.nis, record.type, record.title, record.detail, record.date, record.points).run();
    await audit(db, actor, "CREATE", "development_record", record.id, record.title);
    await db.prepare("INSERT INTO notifications (id,user_email,title,message,read) VALUES (?,?,?, ?,0)").bind(crypto.randomUUID(), actor.email, `${record.type} siswa`, `${record.nis}: ${record.title} (${record.points > 0 ? "+" : ""}${record.points} poin)`).run();
    return Response.json({ record }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Gagal menyimpan catatan." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const actor = await getActor(request);
    requireWriteRole(actor);
    const id = new URL(request.url).searchParams.get("id")?.trim();
    if (!id) return Response.json({ error: "ID catatan wajib diisi." }, { status: 400 });
    const db = await ensureDatabase();
    await prepareDatabase(db);
    const record = await db.prepare("SELECT s.class_label AS classLabel FROM development_records d JOIN students s ON s.nis=d.nis WHERE d.id=?").bind(id).first<{ classLabel: string }>();
    if (!record) return Response.json({ error: "Catatan tidak ditemukan." }, { status: 404 });
    requireClassAccess(actor, record.classLabel);
    const result = await db.prepare("DELETE FROM development_records WHERE id = ?").bind(id).run();
    if (!result.meta.changes) return Response.json({ error: "Catatan tidak ditemukan." }, { status: 404 });
    await audit(db, actor, "DELETE", "development_record", id, "Catatan rekam jejak dihapus");
    return Response.json({ deleted: id });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Gagal menghapus catatan." }, { status: 500 });
  }
}
