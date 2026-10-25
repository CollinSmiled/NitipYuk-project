import { useState } from 'react';
import { accountKey, money, productById, read, snapshotItems, validQuantity, write } from '../lib/store';

export default function CheckoutForm({ user, cart }) {
  const params = new URLSearchParams(location.search);
  const fromCart = params.get('cart') === '1';
  const previous = read(accountKey('form', user.email), null);
  const selection = fromCart ? cart.filter(item => item.selected !== false) : [{ id: params.get('barang'), quantity: Number(params.get('jumlah') || 1) }];
  const valid = selection.length > 0 && selection.every(item => productById(item.id) && validQuantity(item.quantity));
  const sameSelection = previous?.fromCart === fromCart && previous?.items?.map(item => item.id).join(',') === selection.map(item => item.id).join(',');
  const [quantity, setQuantity] = useState(String(selection[0]?.quantity || 1));
  const [notes, setNotes] = useState(sameSelection ? previous.notes || '' : '');
  const [error, setError] = useState('');
  if (!valid) return <main className="flow-page"><section className="flow-card empty-state"><h1>Pilih barang terlebih dahulu</h1><p>Keranjang kosong atau produk tidak ditemukan.</p><a className="button-solid" href="produk.html">Kembali ke produk</a></section></main>;
  const selectedItems = fromCart ? selection : [{ id: selection[0].id, quantity: validQuantity(quantity) ? Number(quantity) : 1 }];
  const items = snapshotItems(selectedItems);
  function submit(event) {
    event.preventDefault();
    try {
      if (!fromCart && !validQuantity(quantity)) throw new Error('Jumlah barang harus 1–99.');
      write(accountKey('form', user.email), { items: selectedItems, notes: notes.trim(), fromCart });
      window.location.href = 'alamat.html?checkout=1';
    } catch (error) { setError(error.message); }
  }
  return <main className="flow-page narrow-page"><CheckoutSteps current={1} /><header className="flow-heading"><p className="eyebrow">PESANAN TITIPAN</p><h1>Konfirmasi barang titipan</h1><p>Lengkapi barang pilihanmu, lalu pilih alamat pengiriman.</p></header>
    <form onSubmit={submit} className="flow-card field-form">
      {items.map(item => <div className="checkout-item" key={item.id}><img src={item.image} alt={item.name} /><div><span className="muted">{item.flag} {item.country}</span><h2>{item.name}</h2><strong>{money(item.price)} {fromCart && `× ${item.quantity}`}</strong></div></div>)}
      {!fromCart && <label>Jumlah<input type="number" min="1" max="99" step="1" required value={quantity} onChange={event => setQuantity(event.target.value)} /></label>}
      <label>Catatan barang<textarea rows="3" value={notes} onChange={event => setNotes(event.target.value)} placeholder="Warna, ukuran, atau varian pilihanmu" /></label>
      <p className="soft-notice">Alamat pengiriman dan metode pembayaran dipilih pada langkah berikutnya.</p>
      <p className="error-message" role="alert">{error}</p><div className="form-actions"><a className="button-outline" href={fromCart ? 'keranjang.html' : 'produk.html'}>Kembali</a><button className="button-solid" type="submit">Lanjut pilih alamat →</button></div>
    </form>
  </main>;
}
export function CheckoutSteps({ current }) { return <ol className="checkout-steps" aria-label="Tahapan checkout">{['Detail titipan', 'Alamat', 'Pembayaran', 'Konfirmasi'].map((step, index) => <li key={step} className={current >= index + 1 ? 'current' : ''} aria-current={current === index + 1 ? 'step' : undefined}><span>{index + 1}</span>{step}</li>)}</ol>; }
