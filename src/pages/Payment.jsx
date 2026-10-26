import { useState } from 'react';
import { accountKey, completeOrder, money, paymentMethods, paymentName, read, totals } from '../lib/store';
import { CheckoutSteps } from './CheckoutForm';

export default function Payment({ user, onCartChange }) {
  const draft = read(accountKey('checkout', user.email), null);
  const [method, setMethod] = useState(read(accountKey('payment', user.email), ''));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (!draft) return <main className="flow-page"><section className="flow-card empty-state"><h1>Belum ada pembayaran aktif</h1><p>Lengkapi form titipan untuk melanjutkan.</p><a className="button-solid" href="produk.html">Pilih barang titipan</a></section></main>;
  const pricing = totals(draft.items, draft.trip);
  function confirm(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try { const order = completeOrder(user.email, method); onCartChange(); location.href = `berhasil.html?order=${order.id}`; }
    catch (error) { setError(error.message); setBusy(false); }
  }
  return <main className="flow-page"><CheckoutSteps current={3} /><header className="flow-heading"><p className="eyebrow">SATU LANGKAH LAGI</p><h1>Pembayaran</h1><p>Pilih metode pembayaran dan periksa ringkasan titipanmu.</p></header>
    <form className="payment-layout" onSubmit={confirm}><div className="payment-main">
      <section className="flow-card"><div className="heading-actions"><h2>Alamat pengiriman</h2><a className="text-link" href="alamat.html?checkout=1">Ubah alamat</a></div><strong>{draft.address.recipient} · {draft.address.phone}</strong><p>{draft.address.label} — {draft.address.address}</p>{draft.notes && <p className="muted">Catatan: {draft.notes}</p>}</section>
      <section className="flow-card"><h2>Barang titipan</h2>{draft.trip && <p className="muted">{draft.trip.title} · {draft.trip.shopName} · Bea cukai: {draft.trip.customs}</p>}{draft.items.map(item => <div className="checkout-item" key={item.id}><img src={item.image} alt={item.name} /><div><h3>{item.name}</h3><p className="muted">{item.quantity} × {money(item.price)}</p></div><strong>{money(item.quantity * item.price)}</strong></div>)}</section>
      <section className="flow-card"><h2>Metode pembayaran</h2><p className="muted">Pilihan tersimpan di profil akan dipilih secara otomatis.</p>
        <fieldset className="method-group"><legend>Virtual account transfer</legend>{paymentMethods.filter(item => item.id !== 'qris').map(item => <label className={`payment-option ${method === item.id ? 'selected' : ''}`} key={item.id}><span className="bank-icon">{item.id.toUpperCase()}</span><span>{item.name}</span><input type="radio" name="payment" value={item.id} checked={method === item.id} onChange={() => setMethod(item.id)} required /></label>)}</fieldset>
        <fieldset className="method-group"><legend>QRIS</legend><label className={`payment-option ${method === 'qris' ? 'selected' : ''}`}><span className="bank-icon">QR</span><span>QRIS <small>Bayar dengan e-wallet atau mobile banking</small></span><input type="radio" name="payment" value="qris" checked={method === 'qris'} onChange={() => setMethod('qris')} required /></label></fieldset>
        {method && <p className="soft-notice">Mode demo {paymentName(method)}. Klik konfirmasi untuk membuat pesanan contoh; tidak perlu transfer atau memindai QR.</p>}
        <a className="text-link" href="profil.html#metode-pembayaran">Kelola preferensi pembayaran</a>
      </section>
    </div><aside className="flow-card order-summary"><h2>Ringkasan pesanan</h2><details open><summary>Subtotal produk <strong>{money(pricing.subtotal)}</strong></summary><div className="summary-row muted"><span>Harga produk ({draft.items.reduce((sum, item) => sum + item.quantity, 0)} barang)</span><span>{money(pricing.subtotal)}</span></div><div className="summary-row muted"><span>Diskon produk</span><span>{money(0)}</span></div></details>
      <details open><summary>Subtotal pengiriman <strong>{money(pricing.shipping)}</strong></summary><div className="summary-row muted"><span>Ongkos kirim (estimasi demo)</span><span>{money(pricing.shipping)}</span></div></details>
      <div className="summary-row"><span>Diskon metode pembayaran</span><strong>{money(0)}</strong></div><div className="summary-row"><span>Biaya layanan</span><strong>{money(pricing.service)}</strong></div><div className="summary-total"><strong>Total pembayaran</strong><strong>{money(pricing.total)}</strong></div>
      <p className="muted">Harga dan ongkir merupakan contoh untuk simulasi lokal.</p><p role="alert" className="error-message">{error}</p><button className="button-solid" type="submit" disabled={!method || busy}>{busy ? 'Memproses…' : 'Konfirmasi pembayaran demo'}</button><a className="text-link" href={draft.fromCart ? 'form.html?cart=1' : `form.html?barang=${draft.items[0].id}&jumlah=${draft.items[0].quantity}${draft.trip ? `&trip=${draft.trip.id}` : ""}`}>← Ubah detail titipan</a>
    </aside></form>
  </main>;
}
