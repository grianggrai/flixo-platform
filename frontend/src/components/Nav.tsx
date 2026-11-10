import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";

const links = [["หน้าแรก", "/"], ["ค้นหา", "/discover"], ["คลังของฉัน", "/library"], ["กระเป๋า", "/wallet"], ["Creator", "/creator"]];

export async function Nav() {
  const profile = await getCurrentProfile();
  return <header className="nav"><div className="nav-inner">
    <Link className="brand" href="/">FLIXO<span>.</span></Link>
    <nav>{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav>
    <div className="nav-actions"><Link href="/vip">VIP</Link>{profile ? <Link href="/profile">{profile.display_name || "บัญชี"}</Link> : <Link href="/login">เข้าสู่ระบบ</Link>}</div>
  </div></header>;
}
