import { audit, ensureDatabase, getActor, requireWriteRole, todayJakarta } from "../../../db/runtime";

const row = (value: Record<string, unknown>) => Object.fromEntries(Object.entries(value));
const attendanceStatuses = new Set(["Hadir", "Sakit", "Izin", "Alpa", "Terlambat"]);

export async function GET(request: Request) {
  try {
    const actor = await getActor(request);
    const db = await ensureDatabase();
    const url = new URL(request.url);
    const classLabel = url.searchParams.get("class") || actor.classLabel || "XI DKV 1";
    const attendanceDate = url.searchParams.get("date") || todayJakarta();
    const scopeNis=["Siswa","Wali Santri"].includes(actor.role)?actor.studentNis:null; const canManage=["Admin","Wali Kelas","Guru"].includes(actor.role);
    const rangeFrom=url.searchParams.get("from")||`${attendanceDate.slice(0,8)}01`; const rangeTo=url.searchParams.get("to")||attendanceDate;
    const [classes, students, attendance, attendanceHistory, tasks, schedules, grades, settings, announcements, portfolios, pointRules, auditLogs, notifications, periods, submissions, communications, deletedRecords] = await Promise.all([
      db.prepare("SELECT id,label,short,boys,girls,(boys+girls) AS students FROM classes ORDER BY id").all(),
      db.prepare("SELECT nis,name,class_label AS classLabel,gender,guardian,status,initials,color,('SIKELAS:'||nis||':'||barcode_token) AS barcodeValue FROM students WHERE class_label=? AND (? IS NULL OR nis=?) ORDER BY name").bind(classLabel,scopeNis,scopeNis).all(),
      db.prepare("SELECT nis,status,method,scanned_at AS scannedAt FROM attendance_records WHERE class_label=? AND date=? AND (? IS NULL OR nis=?)").bind(classLabel,attendanceDate,scopeNis,scopeNis).all(),
      db.prepare("SELECT nis,date,status,method,scanned_at AS scannedAt FROM attendance_records WHERE class_label=? AND date BETWEEN ? AND ? AND (? IS NULL OR nis=?) ORDER BY date DESC").bind(classLabel,rangeFrom,rangeTo,scopeNis,scopeNis).all(),
      db.prepare("SELECT id,title,class_label AS classLabel,subject,due,submitted,total,status,tone FROM tasks WHERE class_label=? ORDER BY due").bind(classLabel).all(),
      db.prepare("SELECT id,class_label AS classLabel,day,start_time AS startTime,subject,teacher,room,tone FROM schedules WHERE class_label=? ORDER BY CASE day WHEN 'Senin' THEN 1 WHEN 'Selasa' THEN 2 WHEN 'Rabu' THEN 3 WHEN 'Kamis' THEN 4 ELSE 5 END,start_time").bind(classLabel).all(),
      db.prepare("SELECT id,nis,class_label AS classLabel,assignment,practice,exam,attitude,final_score AS finalScore FROM grades WHERE class_label=? AND (? IS NULL OR nis=?) ORDER BY nis").bind(classLabel,scopeNis,scopeNis).all(),
      db.prepare("SELECT class_label AS classLabel,school_name AS schoolName,npsn,school_email AS schoolEmail,phone,address,homeroom,academic_year AS academicYear,room,entry_time AS entryTime,late_time AS lateTime,end_time AS endTime,min_attendance AS minAttendance,assignment_weight AS assignmentWeight,practice_weight AS practiceWeight,exam_weight AS examWeight,attitude_weight AS attitudeWeight,kkm FROM settings WHERE class_label=?").bind(classLabel).first(),
      db.prepare("SELECT id,title,category,audience,date,author,priority,status,excerpt FROM announcements WHERE audience='Semua Kelas' OR audience=? ORDER BY date DESC").bind(classLabel).all(),
      db.prepare("SELECT id,title,type,nis,student,class_label AS className,date,status,score,tone,description,evidence_key AS evidenceKey,evidence_name AS evidenceName,evidence_type AS evidenceType,evidence_url AS evidenceUrl FROM portfolios WHERE class_label=? AND (? IS NULL OR nis=?) ORDER BY date DESC").bind(classLabel,scopeNis,scopeNis).all(),
      db.prepare("SELECT id,type,label,points,active FROM point_rules ORDER BY type,label").all(),
      canManage?db.prepare("SELECT id,actor_email AS actorEmail,action,entity,entity_id AS entityId,detail,created_at AS createdAt FROM audit_logs ORDER BY created_at DESC LIMIT 30").all():Promise.resolve({results:[]}),
      db.prepare("SELECT id,title,message,read,created_at AS createdAt FROM notifications WHERE user_email=? ORDER BY created_at DESC LIMIT 20").bind(actor.email).all(),
      db.prepare("SELECT id,label,semester,start_date AS startDate,end_date AS endDate,active,closed_at AS closedAt FROM academic_periods ORDER BY start_date DESC").all(),
      db.prepare("SELECT ts.id,ts.task_id AS taskId,ts.nis,ts.status,ts.score,ts.feedback,ts.evidence_url AS evidenceUrl,ts.submitted_at AS submittedAt,t.title AS taskTitle FROM task_submissions ts JOIN tasks t ON t.id=ts.task_id WHERE t.class_label=? AND (? IS NULL OR ts.nis=?) ORDER BY ts.submitted_at DESC").bind(classLabel,scopeNis,scopeNis).all(),
      canManage?db.prepare("SELECT c.id,c.nis,c.channel,c.message,c.status,c.actor_email AS actorEmail,c.created_at AS createdAt,s.name AS student FROM communication_logs c LEFT JOIN students s ON s.nis=c.nis WHERE s.class_label=? ORDER BY c.created_at DESC LIMIT 30").bind(classLabel).all():Promise.resolve({results:[]}),
      canManage?db.prepare("SELECT id,entity,entity_id AS entityId,payload,deleted_by AS deletedBy,deleted_at AS deletedAt FROM deleted_records WHERE restored_at IS NULL ORDER BY deleted_at DESC LIMIT 30").all():Promise.resolve({results:[]}),
    ]);
    return Response.json({ actor, classLabel, attendanceDate, rangeFrom, rangeTo, classes: classes.results.map(row), students: students.results.map(row), attendance: attendance.results.map(row), attendanceHistory: attendanceHistory.results.map(row), tasks: tasks.results.map(row), schedules: schedules.results.map(row), grades: grades.results.map(row), settings: settings ?? null, announcements: announcements.results.map(row), portfolios: portfolios.results.map(row), pointRules: pointRules.results.map(row), auditLogs: auditLogs.results.map(row), notifications: notifications.results.map(row), periods:periods.results.map(row), submissions:submissions.results.map(row), communications:communications.results.map(row), deletedRecords:deletedRecords.results.map(row) });
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
    const operation = String(body.operation || "create");
    const data = (body.data || {}) as Record<string, unknown>;
    const id = crypto.randomUUID();

    if (resource === "attendance") {
      const nis = String(data.nis || ""); const classLabel = String(data.classLabel || ""); const status = String(data.status || "Hadir"); const method = String(data.method || "manual"); const date = String(data.date || todayJakarta());
      if (!attendanceStatuses.has(status)) return Response.json({ error: "Status kehadiran tidak valid." }, { status: 400 });
      const student = await db.prepare("SELECT barcode_token AS token FROM students WHERE nis=? AND class_label=?").bind(nis,classLabel).first<{ token: string }>();
      if (!student) return Response.json({ error: "Siswa tidak ditemukan pada kelas aktif." }, { status: 404 });
      if (method === "barcode" && String(data.rawCode || "") !== `SIKELAS:${nis}:${student.token}`) return Response.json({ error: "Barcode tidak sah atau sudah tidak berlaku." }, { status: 400 });
      await db.prepare("INSERT INTO attendance_records (id,nis,class_label,date,status,method) VALUES (?,?,?,?,?,?) ON CONFLICT(nis,date) DO UPDATE SET status=excluded.status,method=excluded.method,scanned_at=CURRENT_TIMESTAMP").bind(id,nis,classLabel,date,status,method).run();
      if (status !== "Hadir") await db.prepare("INSERT INTO notifications (id,user_email,title,message,read) VALUES (?,?,?,?,0)").bind(crypto.randomUUID(),actor.email,"Perhatian kehadiran",`NIS ${nis} tercatat ${status}.`).run();
      await audit(db,actor,"UPSERT","attendance",nis,`${status} melalui ${method} pada ${date}`);
      return Response.json({ ok: true, nis, status, date });
    }

    if (resource === "student") {
      const nis=String(data.nis||"").trim(); const name=String(data.name||"").trim(); const classLabel=String(data.classLabel||"");
      if (!nis || !name || !classLabel) return Response.json({ error:"Data siswa belum lengkap." },{status:400});
      const initials=name.split(/\s+/).map((part)=>part[0]).join("").slice(0,2).toUpperCase();
      await db.prepare("INSERT INTO students (nis,name,class_label,gender,guardian,status,initials,color,barcode_token) VALUES (?,?,?,?,?,'Aktif',?,'mint',?)").bind(nis,name,classLabel,String(data.gender||"L"),String(data.guardian||""),initials,crypto.randomUUID().replaceAll("-","")).run();
      await db.prepare("INSERT OR IGNORE INTO grades (id,nis,class_label,assignment,practice,exam,attitude,final_score) VALUES (?,?,?,0,0,0,'B',0)").bind(crypto.randomUUID(),nis,classLabel).run();
      await audit(db,actor,"CREATE","student",nis,name);
      return Response.json({ok:true,nis});
    }

    if (resource === "barcodeRegenerate") {
      const nis=String(data.nis||""); const token=crypto.randomUUID().replaceAll("-","");
      const result=await db.prepare("UPDATE students SET barcode_token=? WHERE nis=?").bind(token,nis).run();
      if (!result.meta.changes) return Response.json({error:"Siswa tidak ditemukan."},{status:404});
      await audit(db,actor,"ROTATE","student_barcode",nis,"Token barcode diperbarui");
      return Response.json({ok:true,barcodeValue:`SIKELAS:${nis}:${token}`});
    }

    if (resource === "task") {
      const taskId=String(data.id||id);
      if (operation === "delete") { const existing=await db.prepare("SELECT * FROM tasks WHERE id=?").bind(taskId).first<Record<string,unknown>>(); if(existing)await db.batch([db.prepare("INSERT INTO deleted_records (id,entity,entity_id,payload,deleted_by) VALUES (?,?,?,?,?)").bind(crypto.randomUUID(),"task",taskId,JSON.stringify(existing),actor.email),db.prepare("DELETE FROM tasks WHERE id=?").bind(taskId)]); }
      else if (operation === "update") await db.prepare("UPDATE tasks SET title=?,subject=?,due=?,submitted=?,total=?,status=? WHERE id=?").bind(String(data.title),String(data.subject),String(data.due),Number(data.submitted),Number(data.total),String(data.status),taskId).run();
      else await db.prepare("INSERT INTO tasks (id,title,class_label,subject,due,submitted,total,status,tone) VALUES (?,?,?,?,?,0,?,'Baru','green')").bind(taskId,String(data.title),String(data.classLabel),String(data.subject),String(data.due),Number(data.total||0)).run();
      await audit(db,actor,operation.toUpperCase(),"task",taskId,String(data.title||"Tugas"));
      return Response.json({ok:true,id:taskId});
    }

    if (resource === "schedule") {
      const scheduleId=String(data.id||id);
      if (operation === "delete") { const existing=await db.prepare("SELECT * FROM schedules WHERE id=?").bind(scheduleId).first<Record<string,unknown>>(); if(existing)await db.batch([db.prepare("INSERT INTO deleted_records (id,entity,entity_id,payload,deleted_by) VALUES (?,?,?,?,?)").bind(crypto.randomUUID(),"schedule",scheduleId,JSON.stringify(existing),actor.email),db.prepare("DELETE FROM schedules WHERE id=?").bind(scheduleId)]); }
      else await db.prepare("INSERT INTO schedules (id,class_label,day,start_time,subject,teacher,room,tone) VALUES (?,?,?,?,?,?,?,'0')").bind(scheduleId,String(data.classLabel),String(data.day),String(data.startTime),String(data.subject),String(data.teacher),String(data.room)).run();
      await audit(db,actor,operation.toUpperCase(),"schedule",scheduleId,String(data.subject||"Jadwal"));
      return Response.json({ok:true,id:scheduleId});
    }

    if (resource === "grade") {
      const classLabel=String(data.classLabel); const assignment=Number(data.assignment||0), practice=Number(data.practice||0), exam=Number(data.exam||0); const weights=await db.prepare("SELECT assignment_weight AS assignmentWeight,practice_weight AS practiceWeight,exam_weight AS examWeight,attitude_weight AS attitudeWeight FROM settings WHERE class_label=?").bind(classLabel).first<{assignmentWeight:number;practiceWeight:number;examWeight:number;attitudeWeight:number}>(); const attitudeScore=({A:100,B:85,C:70,D:55} as Record<string,number>)[String(data.attitude||"B")]??85; const finalScore=Math.round((assignment*Number(weights?.assignmentWeight??25)+practice*Number(weights?.practiceWeight??35)+exam*Number(weights?.examWeight??30)+attitudeScore*Number(weights?.attitudeWeight??10))/100);
      await db.prepare("INSERT INTO grades (id,nis,class_label,assignment,practice,exam,attitude,final_score) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(nis,class_label) DO UPDATE SET assignment=excluded.assignment,practice=excluded.practice,exam=excluded.exam,attitude=excluded.attitude,final_score=excluded.final_score").bind(id,String(data.nis),classLabel,assignment,practice,exam,String(data.attitude||"B"),finalScore).run();
      await audit(db,actor,"UPSERT","grade",String(data.nis),`Nilai akhir ${finalScore}`);
      return Response.json({ok:true,finalScore});
    }

    if (resource === "settings") {
      await db.prepare("INSERT INTO settings (class_label,school_name,npsn,school_email,phone,address,homeroom,academic_year,room,entry_time,late_time,end_time,min_attendance,assignment_weight,practice_weight,exam_weight,attitude_weight,kkm) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(class_label) DO UPDATE SET school_name=excluded.school_name,npsn=excluded.npsn,school_email=excluded.school_email,phone=excluded.phone,address=excluded.address,homeroom=excluded.homeroom,academic_year=excluded.academic_year,room=excluded.room,entry_time=excluded.entry_time,late_time=excluded.late_time,end_time=excluded.end_time,min_attendance=excluded.min_attendance,assignment_weight=excluded.assignment_weight,practice_weight=excluded.practice_weight,exam_weight=excluded.exam_weight,attitude_weight=excluded.attitude_weight,kkm=excluded.kkm").bind(String(data.classLabel),String(data.schoolName),String(data.npsn),String(data.schoolEmail),String(data.phone),String(data.address),String(data.homeroom),String(data.academicYear),String(data.room),String(data.entryTime),String(data.lateTime),String(data.endTime),Number(data.minAttendance),Number(data.assignmentWeight),Number(data.practiceWeight),Number(data.examWeight),Number(data.attitudeWeight),Number(data.kkm)).run();
      await audit(db,actor,"UPDATE","settings",String(data.classLabel),"Pengaturan kelas diperbarui");
      return Response.json({ok:true});
    }

    if (resource === "announcement") {
      await db.prepare("INSERT INTO announcements (id,title,category,audience,date,author,priority,status,excerpt) VALUES (?,?,?,?,?,?,?,?,?)").bind(id,String(data.title),String(data.category),String(data.audience),String(data.date||todayJakarta()),actor.name,String(data.priority||"Normal"),String(data.status||"Draf"),String(data.excerpt)).run();
      await audit(db,actor,"CREATE","announcement",id,String(data.title)); return Response.json({ok:true,id});
    }

    if (resource === "portfolio") {
      const nis=String(data.nis), student=String(data.student), title=String(data.title), score=Number(data.score||80), date=String(data.date||todayJakarta());
      await db.batch([db.prepare("INSERT INTO portfolios (id,title,type,nis,student,class_label,date,status,score,tone,description,evidence_url) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)").bind(id,title,String(data.type),nis,student,String(data.classLabel),date,"Ditinjau",score,String(data.tone||"teal"),String(data.description||""),String(data.evidenceUrl||"")||null),db.prepare("INSERT INTO development_records (id,nis,type,title,detail,date,points) VALUES (?,?,?,?,?,?,?)").bind(crypto.randomUUID(),nis,"Portofolio",title,String(data.description||"Karya portofolio siswa"),date,15)]);
      await audit(db,actor,"CREATE","portfolio",id,title); return Response.json({ok:true,id});
    }

    if(resource==="period"){
      const periodId=String(data.id||id);
      if(operation==="close"){await db.prepare("UPDATE academic_periods SET active=0,closed_at=CURRENT_TIMESTAMP WHERE id=?").bind(periodId).run();}
      else{await db.batch([db.prepare("UPDATE academic_periods SET active=0 WHERE active=1"),db.prepare("INSERT INTO academic_periods (id,label,semester,start_date,end_date,active) VALUES (?,?,?,?,?,1)").bind(periodId,String(data.label),String(data.semester),String(data.startDate),String(data.endDate))]);}
      await audit(db,actor,operation.toUpperCase(),"academic_period",periodId,`${data.label||"Periode"} ${data.semester||""}`);return Response.json({ok:true,id:periodId});
    }

    if(resource==="submission"){
      const taskId=String(data.taskId),nis=String(data.nis);const score=data.score==null||data.score===""?null:Number(data.score);
      await db.prepare("INSERT INTO task_submissions (id,task_id,nis,status,score,feedback,evidence_url) VALUES (?,?,?,?,?,?,?) ON CONFLICT(task_id,nis) DO UPDATE SET status=excluded.status,score=excluded.score,feedback=excluded.feedback,evidence_url=excluded.evidence_url,submitted_at=CURRENT_TIMESTAMP").bind(id,taskId,nis,String(data.status||"Dikumpulkan"),score,String(data.feedback||""),String(data.evidenceUrl||"")||null).run();
      await audit(db,actor,"UPSERT","submission",`${taskId}:${nis}`,`Status ${data.status||"Dikumpulkan"}`);return Response.json({ok:true});
    }

    if(resource==="promoteStudents"){
      const from=String(data.from),to=String(data.to);if(!from||!to||from===to)return Response.json({error:"Kelas tujuan tidak valid."},{status:400});
      const selected=Array.isArray(data.nis)?data.nis.map(String):[];if(!selected.length)return Response.json({error:"Pilih minimal satu siswa."},{status:400});
      const placeholders=selected.map(()=>"?").join(",");await db.batch([db.prepare(`UPDATE students SET class_label=? WHERE class_label=? AND nis IN (${placeholders})`).bind(to,from,...selected),db.prepare(`UPDATE grades SET class_label=? WHERE class_label=? AND nis IN (${placeholders})`).bind(to,from,...selected)]);
      await audit(db,actor,"PROMOTE","students",from,`${selected.length} siswa dipindahkan ke ${to}`);return Response.json({ok:true,count:selected.length});
    }

    if(resource==="importStudents"){
      const rows=Array.isArray(data.rows)?data.rows.slice(0,200) as Record<string,unknown>[]:[];if(!rows.length)return Response.json({error:"Tidak ada data siswa untuk diimpor."},{status:400});
      const statements=rows.filter(item=>String(item.nis||"")&&String(item.name||"")).map(item=>{const name=String(item.name).trim(),nis=String(item.nis).trim();const initials=name.split(/\s+/).map(part=>part[0]).join("").slice(0,2).toUpperCase();return db.prepare("INSERT OR IGNORE INTO students (nis,name,class_label,gender,guardian,status,initials,color,barcode_token) VALUES (?,?,?,?,?,'Aktif',?,'mint',?)").bind(nis,name,String(item.classLabel||data.classLabel),String(item.gender||"L"),String(item.guardian||""),initials,crypto.randomUUID().replaceAll("-",""));});
      if(statements.length)await db.batch(statements);await audit(db,actor,"IMPORT","students",String(data.classLabel),`${statements.length} baris diproses`);return Response.json({ok:true,count:statements.length});
    }

    if(resource==="portfolioApproval"){
      const portfolioId=String(data.id),status=String(data.status);if(!["Ditinjau","Disetujui","Ditolak","Dipublikasi","Terpilih"].includes(status))return Response.json({error:"Status persetujuan tidak valid."},{status:400});
      await db.prepare("UPDATE portfolios SET status=? WHERE id=?").bind(status,portfolioId).run();await audit(db,actor,"APPROVE","portfolio",portfolioId,`${status} oleh ${actor.name}`);return Response.json({ok:true});
    }

    if(resource==="communication"){
      const nis=String(data.nis),channel=String(data.channel),message=String(data.message);await db.prepare("INSERT INTO communication_logs (id,nis,channel,message,status,actor_email) VALUES (?,?,?,?,?,?)").bind(id,nis,channel,message,"Dicatat",actor.email).run();await audit(db,actor,"SEND","communication",nis,`${channel}: ${message.slice(0,60)}`);return Response.json({ok:true,id});
    }

    if(resource==="accountMapping"){
      const email=String(data.email||"").trim().toLowerCase(),role=String(data.role),nis=String(data.nis||"");if(!email||!["Siswa","Wali Santri"].includes(role)||!nis)return Response.json({error:"Email, peran, dan siswa wajib dipilih."},{status:400});const student=await db.prepare("SELECT name,class_label AS classLabel FROM students WHERE nis=?").bind(nis).first<{name:string;classLabel:string}>();if(!student)return Response.json({error:"Siswa tidak ditemukan."},{status:404});
      await db.prepare("INSERT INTO users (email,name,role,class_label,student_nis) VALUES (?,?,?,?,?) ON CONFLICT(email) DO UPDATE SET name=excluded.name,role=excluded.role,class_label=excluded.class_label,student_nis=excluded.student_nis").bind(email,role==="Wali Santri"?`Wali ${student.name}`:student.name,role,student.classLabel,nis).run();await audit(db,actor,"MAP","portal_account",email,`${role} untuk NIS ${nis}`);return Response.json({ok:true});
    }

    if(resource==="restore"){
      const archiveId=String(data.id);const archived=await db.prepare("SELECT entity,payload FROM deleted_records WHERE id=? AND restored_at IS NULL").bind(archiveId).first<{entity:string;payload:string}>();if(!archived)return Response.json({error:"Arsip tidak ditemukan."},{status:404});const payload=JSON.parse(archived.payload) as Record<string,unknown>;
      if(archived.entity==="task")await db.prepare("INSERT OR REPLACE INTO tasks (id,title,class_label,subject,due,submitted,total,status,tone) VALUES (?,?,?,?,?,?,?,?,?)").bind(payload.id,payload.title,payload.class_label,payload.subject,payload.due,payload.submitted,payload.total,payload.status,payload.tone).run();
      else if(archived.entity==="schedule")await db.prepare("INSERT OR REPLACE INTO schedules (id,class_label,day,start_time,subject,teacher,room,tone) VALUES (?,?,?,?,?,?,?,?)").bind(payload.id,payload.class_label,payload.day,payload.start_time,payload.subject,payload.teacher,payload.room,payload.tone).run();
      else return Response.json({error:"Jenis arsip belum didukung."},{status:400});await db.prepare("UPDATE deleted_records SET restored_at=CURRENT_TIMESTAMP WHERE id=?").bind(archiveId).run();await audit(db,actor,"RESTORE",archived.entity,String(payload.id),"Data dipulihkan dari arsip");return Response.json({ok:true});
    }

    if (resource === "pointRule") { await db.prepare("UPDATE point_rules SET points=?,active=? WHERE id=?").bind(Number(data.points),data.active?1:0,String(data.id)).run(); await audit(db,actor,"UPDATE","point_rule",String(data.id),`Poin ${data.points}`); return Response.json({ok:true}); }
    if (resource === "notificationRead") { await db.prepare("UPDATE notifications SET read=1 WHERE id=? AND user_email=?").bind(String(data.id),actor.email).run(); return Response.json({ok:true}); }
    return Response.json({error:"Operasi tidak didukung."},{status:400});
  } catch (error) {
    return Response.json({error:error instanceof Error?error.message:"Operasi gagal."},{status:400});
  }
}
