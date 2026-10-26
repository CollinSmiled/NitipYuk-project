import { buyerTrips } from '../seller/sellerStore';
import { useState } from 'react';
import { products } from '../products';
import { addToCart, money } from '../lib/store';

export default function Products({ country = 'Semua negara', query = '', onCartChange, catalogue = false, user }) {
  const tripId = new URLSearchParams(location.search).get('trip');
  const trip = buyerTrips().find(item => item.id === tripId);
  const [category, setCategory] = useState('Semua produk');
  const [notice, setNotice] = useState('');
  const visible = products.filter(product =>
    (!tripId || trip && product.country === trip.country) &&
    (category === 'Semua produk' || product.category === category) &&
    (country === 'Semua negara' || product.country === country) &&
    `${product.name} ${product.category} ${product.country}`.toLowerCase().includes(query.trim().toLowerCase()));
  function add(product) {
    try {
      addToCart(product.id, undefined, trip || null);
      onCartChange();
      setNotice(`${product.name} ditambahkan ke keranjang.`);
    } catch { setNotice('Keranjang belum bisa disimpan. Periksa penyimpanan browser.'); }
  }
  return <section className="product-categories" id="produk">
    <div className="product-categories__header">
      <div><h2>{catalogue ? 'Semua barang titipan' : 'Mau titip apa?'}</h2><p>{trip ? `${trip.title} · ${trip.shopName}` : "Pilihan produk jastip · Katalog contoh"}</p></div>
      {!catalogue && <a className="product-categories__all" href="produk.html">Semua produk <span aria-hidden="true">→</span></a>}
      {catalogue && <span>{visible.length} produk</span>}
    </div>
    <div className="product-categories__filters" aria-label="Kategori produk">
      {['Semua produk', 'Fashion', 'Makanan', 'Skincare'].map(value => <button key={value} className={category === value ? 'product-filter is-active' : 'product-filter'} type="button" aria-pressed={category === value} onClick={() => setCategory(value)}>{value}</button>)}
    </div>
    <p className="inline-notice" role="status">{notice}</p>
    <div className="catalog-grid">{visible.map(product => <article className="product-card" key={product.id}>
      <img className="product-photo" src={product.image} alt={product.name} />
      <div className="product-details"><p className="product-country">{product.flag} {product.country}</p><h3>{product.name}</h3>
        <p className="product-price">Mulai dari <strong>{money(product.price)}</strong></p>
        <div className="product-actions">
          <button className="button-outline" type="button" onClick={() => add(product)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M2 3h3l3 13h11l3-10H6M12 8v5M9.5 10.5h5" /><circle cx="10" cy="21" r="1" /><circle cx="18" cy="21" r="1" /></svg> Masukkan Keranjang</button>
          <a className="button-solid" href={user?.role === "buyer" ? `form.html?barang=${product.id}${trip ? `&trip=${trip.id}` : ""}` : `login.html?return=${encodeURIComponent(`form.html?barang=${product.id}${trip ? `&trip=${trip.id}` : ""}`)}`}>Titip sekarang</a>
        </div>
      </div>
    </article>)}</div>
    {!visible.length && <p role="status">Belum ada produk yang cocok. Coba kata kunci, kategori, atau negara lainnya.</p>}
  </section>;
}
