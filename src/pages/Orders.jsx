import { useState } from 'react';
import { advanceOrder, ordersFor, orderStep, trackingSteps } from '../lib/orderStatus';
import { money, paymentName, productById } from '../lib/store';

export default function Orders({ user, onNotificationsChange }) {
  const [orders, setOrders] = useState(() => ordersFor(user.email).reverse());
  const [error, setError] = useState('');
  const highlight = new URLSearchParams(location.search).get('order');
  function advance(id) {
    try { advanceOrder(user.email, id); setOrders(ordersFor(user.email).reverse()); onNotificationsChange(); }
    catch (error) { setError(error.message); }
  }
  return <main className="flow-page tracking-page"><header className="tracking-heading heading-actions"><div><p className="eyebrow">PERJALANAN TITIPANMU</p><h1>Pesanan saya</h1><p>Dari barang impian, sampai ke tanganmu.</p></div><a className="button-outline" href="produk.html">+ Titipan baru</a></header>
    <p role="alert" className="error-message">{error}</p>
    {!orders.length ? <section className="flow-card empty-state"><span aria-hidden="true">📦</span><h2>Belum ada pesanan</h2><p>Pesanan akan muncul setelah konfirmasi pembayaran demo.</p><a className="button-solid" href="produk.html">Cari barang titipan</a></section> : <div className="order-list">{orders.map(order => {
      const step = orderStep(order);
      const items = order.items || [{ ...productById(order.itemId), id: order.itemId, name: order.itemName, quantity: order.quantity }];
      return <article key={order.id} id={order.id} className={`flow-card tracked-order ${highlight === order.id ? 'highlighted' : ''}`}>
        <div className="tracked-product"><img src={items[0]?.image || 'element/logoNitipYuk.png'} alt={items[0]?.name || 'Barang titipan'} /><div><p className="order-reference">{order.id} · {items[0]?.country || order.country}</p><h2>{items[0]?.name}{items.length > 1 ? ` + ${items.length - 1} produk` : ''}</h2><p>Dipesan: {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p><p className="muted">Pesanan contoh · Pembayaran simulasi.</p></div></div>
        <div className="order-actions"><span className="tracking-status">{order.status}</span><a className="button-outline order-chat-link" href={`chat.html?order=${order.id}`}>Chat jastiper</a></div>
        {order.status !== 'Dibatalkan' && <ol className="order-tracker" aria-label={`Pelacakan pesanan ${order.id}`}>{trackingSteps.map((label, index) => <li key={label} className={index < step ? 'done' : index === step ? 'current' : 'pending'} aria-current={step === index ? 'step' : undefined}><span className="tracking-dot">{index < step ? '✓' : ''}</span><span>{label}</span></li>)}</ol>}
        <details className="order-details"><summary>Detail pesanan <strong>{order.pricing ? money(order.pricing.total) : ''}</strong></summary><div>{items.map(item => <div className="order-line" key={item.id}><strong>{item.name}</strong><span>{item.quantity} barang {item.price ? `· ${money(item.price * item.quantity)}` : ''}</span></div>)}<p><strong>Kirim ke:</strong> {order.shippingAddress?.recipient || order.shippingAddress?.label}</p><p className="muted">{order.shippingAddress?.address}</p>{order.notes && <p className="muted">Catatan: {order.notes}</p>}<p className="muted">{paymentName(order.paymentMethod || '')} · Simulasi lokal</p></div></details>
        {order.status !== 'Dibatalkan' && step < 3 && <details className="demo-tracking"><summary>Coba simulasi perjalanan</summary><p className="muted">Perbarui status contoh untuk melihat perubahan pelacakan dan notifikasi.</p><button className="button-outline" onClick={() => advance(order.id)}>Simulasikan: {trackingSteps[step + 1]}</button></details>}
      </article>;
    })}</div>}
  </main>;
}
