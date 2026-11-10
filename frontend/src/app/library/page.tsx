import Link from "next/link";
import { Nav } from "@/components/Nav";
export default function Library(){return <><Nav/><main className="container"><span className="kicker">MY LIBRARY</span><h1>คลังของฉัน</h1><section className="panel"><h2>ยังไม่มีประวัติการรับชม</h2><p className="muted">เมื่อเชื่อมต่อ Supabase Auth และ Watch History แล้ว รายการที่ดูล่าสุดจะแสดงที่นี่</p><Link href="/discover" className="btn">เลือกดูซีรีส์</Link></section></main></>}
