import { audit, ensureDatabase, getActor, requireWriteRole } from "../../../db/runtime";

const row = (value: Record<string, unknown>) => Object.fromEntries(Object.entries(value).map(([key, item]) => [key, item]));

export async function GET(request: Request) {
  try {
    const actor = await getActor(request);
    const db = await ensureDatabase();
    const classLabel = new URL(request.url).searchParams.get("class") || actor.classLabel || "XI DKV 1";
    const [classes, students, attendance, tasks, announcements, portfolios, pointRules, auditLogs, notifications] = await Promise.all([
      db.prepare("SELECT id,label,short,boys,girls,(boys+girls) AS students FROM classes ORDER BY id").all(),
      db.prepare("SELECT nis,name,class_label AS classLabel,gender,guardian,status,initials,color,('SIKELAS:'||nis||':'||barcode_token) AS barcodeValue FROM students WHERE class_label=? ORDER BY name").bind(classLabel).all(),
      db.prepare("SELECT nis,status,method,scanned_at AS scannedAt FROM attendance_records WHERE class_label=? AND date=?").bind(classLabel,"2026-07-15").all(),
      db.prepare("SELECT id,title,class_label AS classLabel,subject,due,submitted,total,status,tone FROM tasks WHERE class_label=? ORDER BY due").bind(classLabel).all(),
      db.prepare("SELECT id,title,category,audience,date,author,priority,status,excerpt FROM announcements WHERE audience='Semua Kelas' OR audience=? ORDER BY date DESC").bind(classLabel).all(),
      db.prepare("SELECT id,title,type,nis,student,class_label AS className,date,status,score,tone,description FROM portfolios WHERE class_label=? ORDER BY date DESC").bind(classLabel).all(),
      db.prepare("SELECT id,type,label,points,active FROM point_rules ORDER BY type,label").all(),
      db.prepare("SELECT id,actor_email AS actorEmail,action,entity,entity_id AS entityId,detail,created_at AS createdAt FROM audit_logs ORDER BY created_at DESC LIMIT 30").all(),
      db.prepare("SELECT id,title,message,read,created_at AS createdAt FROM notifications WHERE user_email=? ORDER BY created_at DESC LIMIT 20").bind(actor.email).all(),
    ]);
    return Response.json({ actor, classLabel, classes: classes.results.map(row), students: students.results.map(row), attendance: attendance.results.map(row), tasks: tasks.results.map(row), announcements: announcements.results.map(row), portfolios: portfolios.results.map(row), pointRules: pointRules.results.map(row), auditLogs: auditLogs.results.map(row), notifications: notifications.results.map(row) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Gagal memuat data SIKELAS." }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const actor = await getActor(request);
    requireWriteRole(actor);
    const db = await ensureDatabase();
    const body = await request.json() as Record<string, unknown>;
    const resource = String(body.resource || "");
    const data = (body.data || {}) as Record<string, unknown>;
    const id = crypto.randomUUID();

    if (resource === "attendance") {
      const nis = String(data.nis || ""); const classLabel = String(data.classLabel || ""); const status = String(data.status || "Hadir"); const method = String(data.method || "manual");
      const student = await db.prepare("SELECT barcode_token AS token FROM students WHERE nis=? AND class_label=?").bind(nis,classLabel).first<{ token: string }>();
      if (!student) return Response.json({ error: "Siswa tidak ditemukan pada kelas aktif." }, { status: 404 });
      if (method === "barcode" && String(data.rawCode || "") !== `SIKELAS:${nis}:${student.token}`) return Response.json({ error: "Barcode tidak sah atau sudah tidak berlaku." }, { status: 400 });
      await db.prepare("INSERT INTO attendance_records (id,nis,class_label,date,status,method) VALUES (?,?,?,?,?,?) ON CONFLICT(nis,date) DO UPDATE SET status=excluded.status,method=excluded.method,scanned_at=CURRENT_TIMESTAMP").bind(id,nis,classLabel,String(data.date || "2026-07-15"),status,method).run();
      if (status !== "Hadir") await db.prepare("INSERT INTO notifications (id,user_email,title,message,read) VALUES (?,?,?, ?,0)").bind(crypto.randomUUID(),actor.email,"Perhatian kehadiran",`NIS ${nis} tercatat ${status}.`).run();
      await audit(db,actor,"UPSERT","attendance",nis,`${status} melalui ${method}`);
      return Response.json({ ok: true, nis, status });
    }

    if (resource === "student") {
      const nis=String(data.nis||"").trim(); const name=String(data.name||"").trim(); const classLabel=String(data.classLabel||"");
      if (!nis || !name || !classLabel) return Response.json({ error:"Data siswa belum lengkap." },{status:400});
      const initials=name.split(/\s+/).map((part)=>part[0]).join("").slice(0,2).toUpperCase();
      await db.prepare("INSERT INTO students (nis,name,class_label,gender,guardian,status,initials,color,barcode_token) VALUES (?,?,?,?,?,'Aktif',?,'mint',?)").bind(nis,name,classLabel,String(data.gender||"L"),String(data.guardian||""),initials,crypto.randomUUID().slice(0,12)).run();
      await audit(db,actor,"CREATE","student",nis,name);
      return Response.json({ok:true,nis});
    }

    if (resource === "announcement") {
      await db.prepare("INSERT INTO announcements (id,title,category,audience,date,author,priority,status,excerpt) VALUES (?,?,?,?,?,?,?,?,?)").bind(id,String(data.title),String(data.category),String(data.audience),String(data.date),actor.name,String(data.priority || "Normal"),String(data.status || "Draf"),String(data.excerpt)).run();
      await audit(db,actor,"CREATE","announcement",id,String(data.title));
      return Response.json({ ok: true, id });
    }

    if (resource === "portfolio") {
      const nis=String(data.nis); const student=String(data.student); const title=String(data.title); const score=Number(data.score || 80); const date=String(data.date || "2026-07-15");
      await db.batch([
        db.prepare("INSERT INTO portfolios (id,title,type,nis,student,class_label,date,status,score,tone,description) VALUES (?,?,?,?,?,?,?,?,?,?,?)").bind(id,title,String(data.type),nis,student,String(data.classLabel),date,"Ditinjau",score,String(data.tone || "teal"),String(data.description || "")),
        db.prepare("INSERT INTO development_records (id,nis,type,title,detail,date,points) VALUES (?,?,?,?,?,?,?)").bind(crypto.randomUUID(),nis,"Portofolio",title,String(data.description || "Karya portofolio siswa"),date,15),
      ]);
      await audit(db,actor,"CREATE","portfolio",id,title);
      await db.prepare("INSERT INTO notifications (id,user_email,title,message,read) VALUES (?,?,?, ?,0)").bind(crypto.randomUUID(),actor.email,"Portofolio baru",`${student}: ${title} menunggu peninjauan.`).run();
      return Response.json({ ok: true, id });
    }

    if (resource === "pointRule") {
      await db.prepare("UPDATE point_rules SET points=?,active=? WHERE id=?").bind(Number(data.points),data.active ? 1 : 0,String(data.id)).run();
      await audit(db,actor,"UPDATE","point_rule",String(data.id),`Poin ${data.points}`);
      return Response.json({ ok: true });
    }

    if (resource === "notificationRead") {
      await db.prepare("UPDATE notifications SET read=1 WHERE id=? AND user_email=?").bind(String(data.id),actor.email).run();
      return Response.json({ ok: true });
    }
    return Response.json({ error: "Operasi tidak didukung." }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Operasi gagal." }, { status: 400 });
  }
}
