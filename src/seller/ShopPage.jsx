import { buyerTrips, dateLabel, publicShop, tripImage } from './sellerStore';
import { money } from '../lib/store';
import { Reviews } from './Settings';
import { Empty } from './SellerUI';

export default function ShopPage({ user }) {
  const shopId = new URLSearchParams(location.search).get('shop'), data = publicShop(shopId);
  if (!data) return <main className="flow-page"><Empty title="Toko belum tersedia" text="Profil toko demo hanya tersedia di browser tempat seller membuatnya." /></main>;
  const trips = buyerTrips().filter(trip => trip.shopId === shopId);
  return <main className="flow-page"><section className="flow-card seller-shop-banner"><span className="shop-monogram">{data.shop.name.slice(0, 2).toUpperCase()}</span><div><p className="eyebrow">TOKO JASTIP</p><h1>{data.shop.name}</h1><p>{data.shop.countries}</p></div>{user?.email?.toLowerCase() === data.email && <a className="button-outline" href="seller-toko.html">Kembali ke pengaturan toko</a>}</section><section className="flow-card"><a className="button-solid" href={`chat.html?shop=${shopId}`}>Chat jastiper</a><h2>Tentang toko</h2><p>{data.shop.description}</p><h3>Kebijakan toko</h3><p>{data.shop.policy}</p></section><h2>Trip yang sedang dibuka</h2><div className="seller-trip-grid">{trips.map(trip => <article className="flow-card buyer-trip-card" key={trip.id}><img src={`element/${tripImage(trip.country)}.jpg`} alt={trip.city} /><h2>{trip.title}</h2><p>{trip.country} · Estimasi tiba {dateLabel(trip.arrival)}</p><p>{money(trip.shipping)}/barang · {Math.max(0, trip.capacity - trip.used)} slot tersisa</p><a className="button-solid" href={`produk.html?buyer=1&trip=${trip.id}&shop=${data.shopId}`}>Lihat produk trip →</a></article>)}</div>{!trips.length && <p>Toko ini belum membuka trip.</p>}<Reviews /></main>;
}
