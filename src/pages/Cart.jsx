import { money, productById, write } from '../lib/store';

export default function Cart({ cart, onCartChange }) {
  const selected = cart.filter(item => item.selected !== false);
  const subtotal = selected.reduce((sum, item) => sum + productById(item.id).price * item.quantity, 0);
  function save(next) { write('nitipyuk-cart', next); onCartChange(); }
  function update(id, changes) { save(cart.map(item => item.id === id ? { ...item, ...changes } : item)); }
  return <main className="flow-page">
    <header className="flow-heading"><p className="eyebrow">BARANG PILIHANMU</p><h1>Keranjang saya</h1><p>Simpan dulu, titip saat kamu sudah siap.</p></header>
    {!cart.length ? <section className="flow-card empty-state"><span aria-hidden="true">🛍</span><h2>Keranjangmu masih kosong</h2><p>Temukan barang favorit dari berbagai negara.</p><a className="button-solid" href="produk.html">Jelajahi produk</a></section> : <>
      <section className="flow-card cart-table-wrap"><table className="cart-table"><thead><tr>
        <th><label className="check-label"><input type="checkbox" aria-label="Pilih semua produk" checked={selected.length === cart.length} onChange={event => save(cart.map(item => ({ ...item, selected: event.target.checked })))} /> Produk</label></th>
        <th>Harga satuan</th><th>Kuantitas</th><th>Total harga</th><th>Aksi</th>
      </tr></thead><tbody>{cart.map(item => { const product = productById(item.id); return <tr key={item.id}>
        <td><div className="cart-product"><input type="checkbox" aria-label={`Pilih ${product.name}`} checked={item.selected !== false} onChange={event => update(item.id, { selected: event.target.checked })} /><img src={product.image} alt={product.name} /><div><span className="muted">{product.flag} {product.country}</span><h2>{product.name}</h2></div></div></td>
        <td>{money(product.price)}</td><td><div className="quantity-control"><button type="button" aria-label={`Kurangi ${product.name}`} disabled={item.quantity <= 1} onClick={() => update(item.id, { quantity: item.quantity - 1 })}>−</button><span aria-live="polite">{item.quantity}</span><button type="button" aria-label={`Tambah ${product.name}`} disabled={item.quantity >= 99} onClick={() => update(item.id, { quantity: item.quantity + 1 })}>+</button></div></td>
        <td className="price-accent">{money(product.price * item.quantity)}</td><td><button className="text-button" onClick={() => save(cart.filter(current => current.id !== item.id))}>Hapus</button></td>
      </tr>; })}</tbody></table></section>
      <section className="flow-card checkout-bar"><div><strong>{selected.reduce((sum, item) => sum + item.quantity, 0)} barang dipilih</strong><p className="muted">Ongkir dan biaya layanan dihitung saat checkout.</p></div><div className="checkout-total"><span>Subtotal <strong>{money(subtotal)}</strong></span><button className="button-solid" disabled={!selected.length} onClick={() => { window.location.href = 'form.html?cart=1'; }}>Checkout</button></div></section>
    </>}
  </main>;
}
