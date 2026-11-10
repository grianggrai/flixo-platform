import Link from "next/link";

const links = [["หน้าแรก", "/"], ["ค้นหา", "/discover"], ["คลังของฉัน", "/library"], ["กระเป๋า", "/wallet"], ["Creator", "/creator"]];

export function Nav() {
  return <header className="nav"><div className="nav-inner">
    <Link className="brand" href="/">FLIXO<span>.</span></Link>
    <nav>{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav>
    <div className="nav-actions"><Link href="/vip">VIP</Link><Link href="/profile">บัญชี</Link></div>
  </div></header>;
}
