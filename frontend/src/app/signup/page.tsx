"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [name,setName]=useState("");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");

  async function submit(event:FormEvent) {
    event.preventDefault();setBusy(true);setMessage("");
    try {
      const supabase=createClient();
      const {error}=await supabase.auth.signUp({
        email,password,
        options:{data:{name},emailRedirectTo:`${window.location.origin}/auth/callback`}
      });
      if(error) throw error;
      setMessage("ส่งคำขอสมัครแล้ว หากเปิด Email Confirmation กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี");
    } catch(error) {
      setMessage(error instanceof Error?error.message:"สมัครสมาชิกไม่สำเร็จ");
    } finally {setBusy(false);}
  }

  return <main className="container" style={{maxWidth:520}}>
    <Link href="/" className="brand">FLIXO<span>.</span></Link>
    <section className="panel" style={{marginTop:32}}>
      <span className="kicker">JOIN FLIXO</span><h1 style={{fontSize:36}}>สมัครสมาชิก</h1>
      <form className="stack" onSubmit={submit}>
        <label>ชื่อที่แสดง<input value={name} onChange={e=>setName(e.target.value)} required maxLength={80}/></label>
        <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/></label>
        <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} autoComplete="new-password"/></label>
        <button className="btn" disabled={busy}>{busy?"กำลังสมัคร…":"สร้างบัญชี"}</button>
      </form>
      {message && <p role="status" className="muted">{message}</p>}
      <p className="muted">มีบัญชีแล้ว? <Link href="/login" style={{color:"#f4b942"}}>เข้าสู่ระบบ</Link></p>
      <p className="muted">บัญชีใหม่จะเริ่มด้วยสิทธิ์ Viewer เท่านั้น การเปิดสิทธิ์ Creator/Admin ต้องได้รับการกำหนดโดยผู้ดูแลระบบ</p>
    </section>
  </main>;
}
