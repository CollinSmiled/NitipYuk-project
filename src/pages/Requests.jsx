import { useEffect, useState } from 'react';
import { buyerTrips, dateLabel } from '../seller/sellerStore';
import { buyerConversations, createRequest, requestLabels, sendBuyerMessage } from '../lib/requests';

export function RequestSteps() {
  return <ol className="request-steps"><li><strong>1. Chat jastiper</strong><span>Ceritakan barang, varian, jumlah, dan link referensi.</span></li><li><strong>2. Seller cek barang</strong><span>Jastiper memeriksa regulasi dan ketersediaan.</span></li><li><strong>3. Masuk katalog</strong><span>Jika disetujui, seller menerbitkan barang di katalog tokonya.</span></li></ol>;
}

export default function Requests({ user, chatPage = false }) {
  const params = new URLSearchParams(location.search), trips = buyerTrips();
  const options = trips.filter(trip => !params.get('shop') || trip.shopId === params.get('shop'));
  const [tripId, setTripId] = useState(params.get('trip') || options[0]?.id || '');
  const [error, setError] = useState(''), [text, setText] = useState(''), [, refresh] = useState(0);
  useEffect(() => { const update = () => refresh(value => value + 1); window.addEventListener('storage', update); window.addEventListener('focus', update); return () => { window.removeEventListener('storage', update); window.removeEventListener('focus', update); }; }, []);
  const chats = buyerConversations(user.email), selected = chats.find(chat => chat.id === params.get('chat')) || chats[0];
  function submit(event) {
    event.preventDefault(); setError('');
    try {
      const values = Object.fromEntries(new FormData(event.currentTarget));
      const trip = trips.find(item => item.id === tripId);
      const result = createRequest(user, trip?.shopId, { ...values, tripId });
      location.href = `chat.html?chat=${result.chatId}`;
    } catch (error) { setError(error.message); }
  }
  function send(event) {
    event.preventDefault();
    try { sendBuyerMessage(user, selected.sellerEmail, selected.id, text); setText(''); setError(''); refresh(value => value + 1); } catch (error) { setError(error.message); }
  }
  return <main className="flow-page"><header className="flow-heading heading-actions"><div><p className="eyebrow">REQUEST TITIPAN</p><h1>{chatPage ? 'Chat dengan jastiper' : 'Mau request barang baru?'}</h1><p>Diskusikan dulu dengan jastiper, lalu checkout setelah barang tersedia di katalog.</p></div><a className="button-outline" href={chatPage ? 'request.html' : 'chat.html'}>{chatPage ? '+ Request baru' : 'Lihat chat saya'}</a></header><RequestSteps /><p className="seller-demo-note">Demo: chat dan katalog tersimpan di browser ini, belum tersinkron ke perangkat lain.</p>
    {!chatPage ? options.length ? <form className="flow-card field-form request-form" onSubmit={submit}><label>Pilih jastiper dan trip<select required value={tripId} onChange={event => setTripId(event.target.value)}>{options.map(trip => <option value={trip.id} key={trip.id}>{trip.shopName} · {trip.title} · {trip.country}</option>)}</select></label><label>Nama barang<input name="name" required maxLength="150" placeholder="Contoh: sunscreen SPF 50 varian 50 ml" /></label><label>Jumlah<input name="quantity" type="number" min="1" max="99" defaultValue="1" required /></label><label>Link referensi barang (opsional)<input name="link" type="url" placeholder="https://..." /></label><label>Varian dan catatan<textarea name="notes" maxLength="2000" rows="3" placeholder="Warna, ukuran, budget, atau pertanyaan untuk jastiper" /></label><p className="soft-notice">Mengirim request membuka chat. Harga dan kelayakan barang dikonfirmasi oleh seller sebelum masuk katalog.</p><p role="alert" className="error-message">{error}</p><button className="button-solid">Kirim request lewat chat</button></form> : <section className="flow-card empty-state"><h2>Belum ada trip jastiper yang dibuka</h2><p>Request memerlukan toko dan trip aktif. Untuk mencoba demo, masuk sebagai Seller dan buat trip, lalu kembali sebagai Buyer di browser yang sama.</p><a className="button-outline" href="seller.html">Buka NitipYuk Seller</a></section> : <section className="seller-chat-layout buyer-request-chat"><aside className="seller-chat-sidebar">{chats.map(chat => <a className={`seller-chat-preview ${chat.id === selected?.id ? 'active' : ''}`} key={chat.id} href={`chat.html?chat=${chat.id}`}><span className="letter-avatar">{chat.shopName[0]}</span><div><strong>{chat.shopName}</strong><p>{chat.messages.at(-1)?.text}</p></div></a>)}{!chats.length && <p className="flow-card">Belum ada chat. Mulai dengan request baru.</p>}</aside>{selected && <div className="seller-conversation"><header><strong>{selected.shopName}</strong><a className="button-outline" href={`toko.html?shop=${selected.shopId}`}>Lihat toko</a></header><div className="seller-bubbles" role="log" aria-label="Chat dengan jastiper">{selected.messages.map(message => <div className={`seller-bubble ${message.from === 'buyer' ? 'outgoing' : ''}`} key={message.id}><p>{message.text}</p><time>{dateLabel(message.at)}</time></div>)}</div><div className="request-list">{selected.requests?.map(request => <article className="request-card" key={request.id}><strong>{request.name} ×{request.quantity}</strong><p className="seller-status">{requestLabels[request.status]}</p>{request.note && <p>{request.note}</p>}{request.status === 'published' && <a className="button-solid" href={`produk.html?trip=${request.tripId}&shop=${selected.shopId}`}>Lihat barang di katalog toko →</a>}</article>)}</div><form className="seller-message-form" onSubmit={send}><input aria-label="Pesan ke jastiper" placeholder="Tulis pesan untuk jastiper" value={text} onChange={event => setText(event.target.value)} maxLength="2000" required /><button className="button-solid" disabled={!text.trim()}>Kirim</button></form><p role="alert" className="error-message">{error}</p></div>}</section>}
  </main>;
}
