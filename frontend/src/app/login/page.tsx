"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : "/profile");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "เข้าสู่ระบบไม่สำเร็จ");
    } finally { setBusy(false); }
  }

  return <main className="container" style={{maxWidth:520}}>
    <Link href="/" className="brand">FLIXO<span>.</span></Link>
    <section className="panel" style={{marginTop:32}}>
      <span className="kicker">WELCOME BACK</span><h1 style={{fontSize:36}}>เข้าสู่ระบบ</h1>
      <form className="stack" onSubmit={submit}>
        <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/></label>
        <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} autoComplete="current-password"/></label>
        <button className="btn" disabled={busy}>{busy?"กำลังเข้าสู่ระบบ…":"เข้าสู่ระบบ"}</button>
      </form>
      {message && <p role="alert" className="muted">{message}</p>}
      <p className="muted">ยังไม่มีบัญชี? <Link href="/signup" style={{color:"#f4b942"}}>สมัครสมาชิก</Link></p>
    </section>
  </main>;
}
