export type Series = {
  slug: string; title: string; genre: string; episodes: number;
  synopsis: string; tag: string; colors: string;
};

export const catalog: Series[] = [
  { slug: "rak-rai-ceo", title: "รักร้าย CEO", genre: "Romance · Drama", episodes: 24, synopsis: "เมื่อความรักและอำนาจเดินมาบรรจบกัน ความลับในอดีตอาจเปลี่ยนทุกอย่าง", tag: "HOT", colors: "rose" },
  { slug: "ngaow-krachok", title: "เงากระจก", genre: "Thriller · Mystery", episodes: 16, synopsis: "ทุกเงาสะท้อนมีเรื่องจริงซ่อนอยู่ และทุกคนมีบางอย่างที่ไม่อยากให้ใครรู้", tag: "NEW", colors: "indigo" },
  { slug: "khaen-rak", title: "แค้นรัก", genre: "Revenge · Drama", episodes: 20, synopsis: "ความแค้นที่เริ่มต้นจากอดีต กลับกลายเป็นเดิมพันหัวใจในวันนี้", tag: "TRENDING", colors: "red" },
  { slug: "fon-khuen", title: "ฝนคืนสุดท้าย", genre: "Mystery · Romance", episodes: 16, synopsis: "คืนฝนตกคืนหนึ่งทำให้คนแปลกหน้าสองคนต้องเผชิญความจริง", tag: "EDITOR'S PICK", colors: "blue" }
];
