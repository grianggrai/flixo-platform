export type Series = {
  id?: string;
  slug: string;
  title: string;
  genre: string;
  episodes: number;
  synopsis: string;
  tag: string;
  colors: string;
};

type ApiSeries = {
  id: string;
  slug: string;
  title: string;
  genre: string | null;
  synopsis: string | null;
  episodes?: { id: string; episode_number: number; title: string; is_free: boolean; coin_price: number }[];
};

export const catalog: Series[] = [
  { slug: "rak-rai-ceo", title: "รักร้าย CEO", genre: "Romance · Drama", episodes: 24, synopsis: "เมื่อความรักและอำนาจเดินมาบรรจบกัน ความลับในอดีตอาจเปลี่ยนทุกอย่าง", tag: "HOT", colors: "rose" },
  { slug: "ngaow-krachok", title: "เงากระจก", genre: "Thriller · Mystery", episodes: 16, synopsis: "ทุกเงาสะท้อนมีเรื่องจริงซ่อนอยู่ และทุกคนมีบางอย่างที่ไม่อยากให้ใครรู้", tag: "NEW", colors: "indigo" },
  { slug: "khaen-rak", title: "แค้นรัก", genre: "Revenge · Drama", episodes: 20, synopsis: "ความแค้นที่เริ่มต้นจากอดีต กลับกลายเป็นเดิมพันหัวใจในวันนี้", tag: "TRENDING", colors: "red" },
  { slug: "fon-khuen", title: "ฝนคืนสุดท้าย", genre: "Mystery · Romance", episodes: 16, synopsis: "คืนฝนตกคืนหนึ่งทำให้คนแปลกหน้าสองคนต้องเผชิญความจริง", tag: "EDITOR'S PICK", colors: "blue" }
];

const palettes = ["rose", "indigo", "red", "blue"];

function mapSeries(item: ApiSeries, index: number): Series {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    genre: item.genre || "FLIXO Original",
    episodes: item.episodes?.length || 0,
    synopsis: item.synopsis || "",
    tag: "ORIGINAL",
    colors: palettes[index % palettes.length],
  };
}

export async function getCatalog(): Promise<{ items: Series[]; source: "supabase" | "sample"; error?: string }> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) return { items: catalog, source: "sample" };
  try {
    const response = await fetch(`${base.replace(/\/$/, "")}/api/v1/catalog/series`, { cache: "no-store" });
    if (!response.ok) return { items: [], source: "supabase", error: "ไม่สามารถโหลดแคตตาล็อกได้ในขณะนี้" };
    const payload = await response.json() as { items?: ApiSeries[] };
    return { items: (payload.items || []).map(mapSeries), source: "supabase" };
  } catch {
    return { items: [], source: "supabase", error: "เชื่อมต่อ Catalog API ไม่สำเร็จ" };
  }
}

export async function getSeriesBySlug(slug: string): Promise<Series | null> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) return catalog.find((item) => item.slug === slug) || null;
  try {
    const response = await fetch(`${base.replace(/\/$/, "")}/api/v1/catalog/series/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (!response.ok) return null;
    const item = await response.json() as ApiSeries;
    return mapSeries(item, 0);
  } catch {
    return null;
  }
}
