import { ordersFor } from '../lib/orderStatus';
import { money, paymentName } from '../lib/store';
import { CheckoutSteps } from './CheckoutForm';

export default function Success({ user }) {
  const id = new URLSearchParams(location.search).get('order');
  const order = ordersFor(user.email).find(item => item.id === id);
  if (!order) return <main className="flow-page"><section className="flow-card empty-state"><h1>Pesanan tidak ditemukan</h1><a className="button-solid" href="pesanan.html">Lihat pesanan saya</a></section></main>;
  return <main className="flow-page narrow-page"><CheckoutSteps current={4} /><section className="flow-card empty-state confirmation"><div className="success-mark" aria-hidden="true">✓</div><p className="eyebrow">KONFIRMASI SAMPEL</p><h1>Titipanmu berhasil dibuat!</h1><p>Pesanan <strong>{order.id}</strong> sudah masuk ke daftar pesananmu.</p><p>{paymentName(order.paymentMethod)} · {money(order.pricing?.total || 0)}</p><p className="muted">Pembayaran ini simulasi. Tidak ada dana yang ditagihkan.</p><div className="success-actions"><a className="button-solid" href={`pesanan.html?order=${order.id}`}>Lihat pesanan saya →</a><a className="button-outline" href="notif.html">Lihat notifikasi</a></div></section></main>;
}
