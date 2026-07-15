import { audit, ensureDatabase, getActor, getR2, requireClassAccess, requireWriteRole, todayJakarta } from "../../../db/runtime";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);

export async function POST(request: Request) {
  try {
    const actor = await getActor(request);
    requireWriteRole(actor);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.size) return Response.json({ error: "Pilih berkas bukti terlebih dahulu." }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return Response.json({ error: "Ukuran berkas maksimal 10 MB." }, { status: 400 });
    if (!allowedTypes.has(file.type)) return Response.json({ error: "Format berkas harus JPG, PNG, WebP, PDF, DOC, atau DOCX." }, { status: 400 });
    const nis=String(form.get("nis")||""); const student=String(form.get("student")||""); const title=String(form.get("title")||""); const classLabel=String(form.get("classLabel")||"");
    if (!nis || !student || !title || !classLabel) return Response.json({ error: "Data karya belum lengkap." }, { status: 400 });
    requireClassAccess(actor,classLabel);
    const id=crypto.randomUUID(); const key=`portfolio/${classLabel.replaceAll(" ","-")}/${nis}/${id}-${file.name.replace(/[^a-zA-Z0-9._-]/g,"-")}`;
    const bucket=getR2();
    await bucket.put(key,file.stream(),{httpMetadata:{contentType:file.type},customMetadata:{nis,owner:actor.email}});
    try {
      const db=await ensureDatabase(); const date=String(form.get("date")||todayJakarta()); const description=String(form.get("description")||"");
      await db.batch([
        db.prepare("INSERT INTO portfolios (id,title,type,nis,student,class_label,date,status,score,tone,description,evidence_key,evidence_name,evidence_type) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(id,title,String(form.get("type")||"Desain Grafis"),nis,student,classLabel,date,"Ditinjau",Number(form.get("score")||80),"teal",description,key,file.name,file.type),
        db.prepare("INSERT INTO development_records (id,nis,type,title,detail,date,points) VALUES (?,?,?,?,?,?,?)").bind(crypto.randomUUID(),nis,"Portofolio",title,description||"Karya portofolio dengan bukti terlampir",date,15),
      ]);
      await audit(db,actor,"UPLOAD","portfolio",id,`${title} · ${file.name}`);
      return Response.json({ok:true,id,evidenceUrl:`/api/portfolio-file?key=${encodeURIComponent(key)}`},{status:201});
    } catch (error) { await bucket.delete(key); throw error; }
  } catch (error) {
    return Response.json({error:error instanceof Error?error.message:"Unggah bukti gagal."},{status:400});
  }
}
