"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

type ReviewItem = {id:string;title:string;slug:string;synopsis:string;genre:string;status:string;rights_verified:boolean;created_at:string;creator_id:string};

export default function Review() {
  const [items,setItems]=useState<ReviewItem[]>([]);
  const [reason,setReason]=useState<Record<string,string>>({});
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState<string|null>(null);
  const [message,setMessage]=useState("");

  async function load() {
    setLoading(true);
    try {const response=await apiRequest<{items:ReviewItem[]}>("/api/v1/admin/reviews");setItems(response.items);}
    catch(error){setMessage(error instanceof Error?error.message:"โหลดรายการไม่สำเร็จ");}
    finally{setLoading(false);}
  }
  useEffect(()=>{void load();},[]);

  async function decide(id:string,decision:"approved"|"rejected"|"revision") {
    setBusy(id);setMessage("");
    try {
      await apiRequest(`/api/v1/admin/reviews/${id}`,{method:"POST",body:JSON.stringify({decision,reason:reason[id]||null})});
      setItems(current=>current.filter(item=>item.id!==id));
    } catch(error){setMessage(error instanceof Error?error.message:"บันทึกผลตรวจสอบไม่สำเร็จ");}
    finally{setBusy(null);}
  }

  return <main className="container" style={{maxWidth:980}}>
    <a href="/admin" className="muted">← Admin</a><h1>Editorial Review Queue</h1>
    {message&&<section className="panel" role="alert">{message}</section>}
    {loading?<p className="muted">กำลังโหลดรายการ…</p>:items.length===0?<section className="panel"><h2>ไม่มีรายการรอตรวจสอบ</h2><p className="muted">รายการที่ Creator ส่งเข้าระบบจะปรากฏที่นี่</p></section>:
      <div className="stack">{items.map(item=><section className="panel stack" key={item.id}>
        <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><h2>{item.title}</h2><strong>{item.status}</strong></div>
        <p className="muted">{item.genre} · Creator ID: {item.creator_id} · Rights verified: {String(item.rights_verified)}</p>
        <p>{item.synopsis}</p>
        <textarea rows={3} value={reason[item.id]||""} onChange={e=>setReason(v=>({...v,[item.id]:e.target.value}))} placeholder="เหตุผลหรือ Feedback สำหรับ Creator"/>
        <div className="actions">
          <button className="btn" disabled={busy===item.id} onClick={()=>void decide(item.id,"approved")}>Approve</button>
          <button className="btn secondary" disabled={busy===item.id} onClick={()=>void decide(item.id,"revision")}>Request Revision</button>
          <button className="btn secondary" disabled={busy===item.id} onClick={()=>void decide(item.id,"rejected")}>Reject</button>
        </div>
        <p className="muted">Approve เปลี่ยนเป็นสถานะ Approved เท่านั้น ไม่ได้ Publish และไม่อนุมัติสิทธิ์ IP โดยอัตโนมัติ</p>
      </section>)}</div>}
  </main>;
}
