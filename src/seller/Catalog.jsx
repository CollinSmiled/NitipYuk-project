import { catalogProducts } from '../lib/catalog';
import { money } from '../lib/store';
import { Empty, PageHeading } from './SellerUI';

export default function Catalog({ user, data }) {
  const products = catalogProducts().filter(product => product.sellerEmail === user.email.toLowerCase());
  return <><PageHeading eyebrow="KATALOG TOKO" title="Barang dari request buyer" text="Barang diterbitkan setelah pengecekan regulasi dan ketersediaan di chat." ><a className="button-solid" href="seller-pesan.html">Buka request di chat →</a></PageHeading><div className="catalog-grid">{products.map(product => <article className="product-card" key={product.id}><img className="product-photo" src={product.image} alt={product.name} /><div className="product-details"><p className="product-country">{data.trips.find(trip => trip.id === product.tripId)?.title}</p><h3>{product.name}</h3><p>{money(product.price)}</p><a className="button-outline" href={`produk.html?buyer=1&trip=${product.tripId}`}>Lihat sebagai buyer</a></div></article>)}</div>{!products.length && <Empty title="Belum ada barang dari request" text="Buka chat buyer, cek regulasi dan stok, setujui request, lalu tambahkan barang ke katalog toko." />}</>;
}
