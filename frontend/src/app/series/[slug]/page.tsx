import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { getSeriesBySlug } from "@/lib/catalog";

export default async function SeriesDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getSeriesBySlug(slug);
  if (!item) notFound();

  return <><Nav/><main className="container">
    <Link href="/discover" className="muted">← กลับไปหน้าค้นหา</Link>
    <section className={`hero poster-${item.colors}`} style={{marginTop:20}}>
      <span className="kicker">FLIXO SERIES · {item.tag}</span>
      <h1>{item.title}</h1><p>{item.genre} · {item.episodes} ตอน</p><p>{item.synopsis}</p>
      <div className="actions"><Link className="btn" href="/watch/episode-1">▶ ดูตอนที่ 1</Link></div>
    </section>
    <h2 style={{marginTop:40}}>รายการตอน</h2>
    {item.episodes>0 ? <div className="stack">{Array.from({length:item.episodes},(_,i)=>
      <Link className="panel" key={i} href={`/watch/episode-${i+1}`}>ตอนที่ {i+1} <span className="muted"> · ตอนที่ {i+1}</span></Link>
    )}</div> : <p className="muted">ยังไม่มีตอนที่เผยแพร่</p>}
  </main></>;
}
