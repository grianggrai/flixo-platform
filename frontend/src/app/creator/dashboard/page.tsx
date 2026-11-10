"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

type SeriesItem = {id:string;title:string;slug:string;genre:string;status:string;created_at:string};

export default function Dashboard() {
  const [items,setItems]=useState<SeriesItem[]>([]);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState("");

  useEffect(()=>{
    apiRequest<{items:SeriesItem[]}>("/api/v1/creator/series")
      .then(result=>setItems(result.items))
      .catch(error=>setMessage(error instanceof Error?error.message:"โหลดข้อมูล Creator ไม่สำเร็จ"))
      .finally(()=>setLoading(false));
  },[]);

  const pending=items.filter(item=>item.status==="pending").length;
  const stats=[["ซีรีส์ของฉัน",String(items.length)],["รอตรวจสอบ",String(pending)],["ยอดรับชม","—"],["รายได้โดยประมาณ","—"]];

  return <main className="container">
    <Link href="/creator" className="muted">← Creator Studio</Link><h1>Creator Dashboard</h1>
    <div className="grid" style={{marginTop:24}}>{stats.map(([label,value])=><section className="panel" key={label}><p className="muted">{label}</p><h2>{value}</h2></section>)}</div>
    <section className="panel" style={{marginTop:24}}>
      <h2>ผลงานของฉัน</h2>
      {loading?<p className="muted">กำลังโหลด…</p>:message?<p role="alert" className="muted">{message}</p>:items.length===0?<p className="muted">ยังไม่มีผลงาน ส่งซีรีส์แรกของคุณได้เลย</p>:
        <div className="stack">{items.map(item=><div key={item.id} style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><strong>{item.title}</strong><span className="muted">{item.status}</span></div>)}</div>}
      <div className="actions"><Link className="btn" href="/creator/series/new">+ ส่งซีรีส์ใหม่</Link></div>
    </section>
  </main>;
}
