import Link from "next/link";
import { Nav } from "@/components/Nav";
import { SeriesCard } from "@/components/SeriesCard";
import { catalog } from "@/lib/catalog";

export default function Home() {
  return <><Nav/><main className="container">
    <section className="hero"><span className="kicker">FLIXO ORIGINALS · FEATURED</span>
      <h1>เรื่องเล่าที่ทำให้<br/>คุณหยุดดูไม่ได้</h1>
      <p>Vertical stories. Big emotions. พบกับซีรีส์สั้นจากครีเอเตอร์ไทย ดูต่อเนื่องได้ทุกที่ ทุกเวลา</p>
      <div className="actions"><Link className="btn" href="/series/rak-rai-ceo">▶ เริ่มรับชม</Link><Link className="btn secondary" href="/discover">สำรวจเรื่องทั้งหมด</Link></div>
    </section>
    <div className="section-head"><div><span className="kicker">PICKED FOR YOU</span><h2>เรื่องยอดนิยม</h2></div><Link href="/discover">ดูทั้งหมด →</Link></div>
    <div className="grid">{catalog.map(item => <SeriesCard key={item.slug} item={item}/>)}</div>
    <section className="panel" style={{marginTop:44,display:"flex",justifyContent:"space-between",gap:20,alignItems:"center",flexWrap:"wrap"}}>
      <div><span className="kicker">CREATOR PROGRAM</span><h2>สร้างเรื่องของคุณให้เป็น FLIXO Original</h2><p className="muted">ส่งผลงานให้ทีมงานตรวจสอบและเผยแพร่ผ่าน Creator Studio</p></div>
      <Link className="btn" href="/creator">เข้าสู่ Creator Studio</Link>
    </section>
  </main></>;
}
