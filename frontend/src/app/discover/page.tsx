import { Nav } from "@/components/Nav";
import { SeriesCard } from "@/components/SeriesCard";
import { catalog } from "@/lib/catalog";
export default function Discover(){return <><Nav/><main className="container"><span className="kicker">DISCOVER</span><h1>ค้นหาเรื่องที่ใช่</h1><p className="muted">เลือกชมเรื่องสั้นและซีรีส์จาก FLIXO Originals</p><div className="grid" style={{marginTop:28}}>{catalog.map(item=><SeriesCard key={item.slug} item={item}/>)}</div></main></>}
