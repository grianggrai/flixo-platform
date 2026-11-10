import Link from "next/link";
import type { Series } from "@/lib/catalog";

export function SeriesCard({ item }: { item: Series }) {
  return <Link href={`/series/${item.slug}`} className={`series-card poster-${item.colors}`}>
    <span className="tag">{item.tag}</span>
    <div className="poster-copy"><h3>{item.title}</h3><p>{item.genre}</p></div>
    <div className="series-meta"><strong>{item.title}</strong><span>{item.episodes} ตอน</span></div>
  </Link>;
}
