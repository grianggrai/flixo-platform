import { Nav } from "@/components/Nav";
import { SeriesCard } from "@/components/SeriesCard";
import { getCatalog } from "@/lib/catalog";

export default async function Discover() {
  const result = await getCatalog();
  return <><Nav/><main className="container">
    <span className="kicker">DISCOVER</span><h1>ค้นหาเรื่องที่ใช่</h1>
    <p className="muted">เลือกชมเรื่องสั้นและซีรีส์ที่เผยแพร่บน FLIXO</p>
    {result.source==="sample" && <p className="muted">Sample Catalog — ข้อมูลตัวอย่างสำหรับการพัฒนา</p>}
    {result.error && <p className="muted" role="alert">{result.error}</p>}
    {result.items.length ? <div className="grid" style={{marginTop:28}}>{result.items.map(item=><SeriesCard key={item.slug} item={item}/>)}</div> : <section className="panel" style={{marginTop:28}}><p className="muted">ยังไม่มีซีรีส์ที่เผยแพร่</p></section>}
  </main></>;
}
