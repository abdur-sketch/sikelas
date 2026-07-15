import { ensureDatabase, getActor, getR2, requireClassAccess } from "../../../db/runtime";

export async function GET(request: Request) {
  try {
    const actor=await getActor(request);
    const key=new URL(request.url).searchParams.get("key")||"";
    if (!key) return Response.json({error:"Berkas tidak ditemukan."},{status:404});
    const db=await ensureDatabase();
    const metadata=await db.prepare("SELECT nis,class_label AS classLabel,evidence_name AS name,evidence_type AS type FROM portfolios WHERE evidence_key=?").bind(key).first<{nis:string;classLabel:string;name:string;type:string}>();
    if (!metadata) return Response.json({error:"Berkas tidak terdaftar."},{status:404});
    if ((actor.role==="Siswa"||actor.role==="Wali Santri") && (!actor.studentNis||actor.studentNis!==metadata.nis)) {
      return Response.json({error:"Anda tidak dapat membuka berkas siswa lain."},{status:403});
    }
    if (actor.role!=="Siswa"&&actor.role!=="Wali Santri") requireClassAccess(actor,metadata.classLabel);
    const object=await getR2().get(key);
    if (!object) return Response.json({error:"Berkas tidak ditemukan."},{status:404});
    const headers=new Headers({"content-type":metadata.type||"application/octet-stream","content-disposition":`inline; filename="${metadata.name.replaceAll('"','')}"`,"cache-control":"private, max-age=300","x-content-type-options":"nosniff"});
    return new Response(object.body,{headers});
  } catch (error) {
    return Response.json({error:error instanceof Error?error.message:"Berkas tidak dapat dibuka."},{status:401});
  }
}
