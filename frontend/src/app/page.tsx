import Link from "next/link";
import { Nav } from "@/components/Nav";
import { SeriesCard } from "@/components/SeriesCard";
import { getCatalog } from "@/lib/catalog";

export default async function Home() {
  const result = await getCatalog();
  return <><Nav/><main className="container">
    <section className="hero"><span className="kicker">FLIXO ORIGINALS · FEATURED</span>
      <h1>เรื่องเล่าที่ทำให้<br/>คุณหยุดดูไม่ได้</h1>
      <p>Vertical stories. Big emotions. พบกับซีรีส์สั้นจากครีเอเตอร์ไทย ดูต่อเนื่องได้ทุกที่ ทุกเวลา</p>
      <div className="actions"><Link className="btn" href={result.items[0] ? `/series/${result.items[0].slug}` : "/discover"}>▶ เริ่มรับชม</Link><Link className="btn secondary" href="/discover">สำรวจเรื่องทั้งหมด</Link></div>
    </section>
    <div className="section-head"><div><span className="kicker">PICKED FOR YOU</span><h2>เรื่องยอดนิยม</h2></div><Link href="/discover">ดูทั้งหมด →</Link></div>
    {result.source==="sample" && <p className="muted">Sample Catalog — ตั้งค่า API URL และ Supabase เพื่อโหลดข้อมูลจริง</p>}
    {result.error && <p className="muted" role="alert">{result.error}</p>}
    {result.items.length ? <div className="grid">{result.items.map(item => <SeriesCard key={item.slug} item={item}/>)}</div> : <section className="panel"><p className="muted">ยังไม่มีซีรีส์ที่เผยแพร่ในขณะนี้</p></section>}
    <section className="panel" style={{marginTop:44,display:"flex",justifyContent:"space-between",gap:20,alignItems:"center",flexWrap:"wrap"}}>
      <div><span className="kicker">CREATOR PROGRAM</span><h2>สร้างเรื่องของคุณให้เป็น FLIXO Original</h2><p className="muted">ส่งผลงานให้ทีมงานตรวจสอบและเผยแพร่ผ่าน Creator Studio</p></div>
      <Link className="btn" href="/creator">เข้าสู่ Creator Studio</Link>
    </section>
  </main></>;
}
