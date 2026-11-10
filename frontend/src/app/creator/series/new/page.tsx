"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

export default function NewSeries() {
  const [title,setTitle]=useState("");
  const [synopsis,setSynopsis]=useState("");
  const [genre,setGenre]=useState("Romance");
  const [rights,setRights]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");

  async function submit(event:FormEvent) {
    event.preventDefault();setBusy(true);setMessage("");
    const slug = `flixo-${crypto.randomUUID().slice(0,12)}`;
    try {
      const result = await apiRequest<{id:string;status:string;message:string}>("/api/v1/creator/series", {
        method:"POST", body:JSON.stringify({title,slug,synopsis,genre,rights_declaration:rights}),
      });
      setMessage(`${result.message} Reference: ${result.id}`);
      setTitle("");setSynopsis("");setRights(false);
    } catch(error) {
      setMessage(error instanceof Error?error.message:"ส่งซีรีส์ไม่สำเร็จ");
    } finally {setBusy(false);}
  }

  return <main className="container" style={{maxWidth:760}}>
    <Link href="/creator" className="muted">← Creator Studio</Link><h1>ส่งซีรีส์ใหม่</h1>
    <form className="panel stack" onSubmit={submit}>
      <label>ชื่อซีรีส์<input value={title} onChange={e=>setTitle(e.target.value)} required minLength={2} maxLength={160} placeholder="ชื่อผลงาน"/></label>
      <label>เรื่องย่อ<textarea value={synopsis} onChange={e=>setSynopsis(e.target.value)} required minLength={20} maxLength={5000} rows={4} placeholder="อธิบายเรื่องราวโดยย่อ (อย่างน้อย 20 ตัวอักษร)"/></label>
      <label>ประเภท<select value={genre} onChange={e=>setGenre(e.target.value)}><option>Romance</option><option>Drama</option><option>Thriller</option><option>Comedy</option><option>Mystery</option><option>Action</option></select></label>
      <label style={{display:"flex",gap:10,alignItems:"center"}}><input type="checkbox" checked={rights} onChange={e=>setRights(e.target.checked)} required style={{width:"auto"}}/> ข้าพเจ้ามีสิทธิ์ในเนื้อหา เพลง ภาพ และนักแสดงที่ส่งเข้าระบบ</label>
      <button className="btn" disabled={busy}>{busy?"กำลังส่ง…":"ส่งให้ทีม Editorial ตรวจสอบ"}</button>
      {message && <p role="status" className="muted">{message}</p>}
      <p className="muted">รายการจะถูกสร้างในสถานะ Pending และยังไม่สามารถเผยแพร่หรือเปิดรับชมได้โดยอัตโนมัติ</p>
    </form>
  </main>;
}
