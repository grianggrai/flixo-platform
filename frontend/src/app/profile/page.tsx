import Link from "next/link";
import { Nav } from "@/components/Nav";
import { getCurrentProfile } from "@/lib/auth";

export default async function Profile() {
  const profile = await getCurrentProfile();
  return <><Nav/><main className="container" style={{maxWidth:760}}>
    <span className="kicker">ACCOUNT</span><h1>โปรไฟล์ของฉัน</h1>
    <section className="panel">
      {profile ? <>
        <h2>{profile.display_name || "FLIXO Viewer"}</h2>
        <p className="muted">{profile.role} · {profile.status}</p>
        <form action="/auth/signout" method="post"><button className="btn secondary" type="submit">ออกจากระบบ</button></form>
      </> : <>
        <h2>Guest Viewer</h2><p className="muted">เข้าสู่ระบบเพื่อบันทึกประวัติการรับชมและจัดการบัญชี</p>
        <div className="actions"><Link href="/login" className="btn">เข้าสู่ระบบ</Link><Link href="/signup" className="btn secondary">สมัครสมาชิก</Link></div>
      </>}
    </section>
  </main></>;
}
