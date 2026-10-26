import { useEffect, useState } from 'react';
import { buyerTrips, dateLabel } from '../seller/sellerStore';
import { buyerConversations, createRequest, ensureOrderConversation, requestLabels, sendBuyerMessage, startBuyerConversation } from '../lib/requests';
import { ordersFor } from '../lib/orderStatus';
import { Modal } from '../seller/SellerUI';

export default function Requests({ user }) {
  const params = new URLSearchParams(location.search);
  const [activeId, setActiveId] = useState(params.get('chat') || '');
  const [requesting, setRequesting] = useState(false);
  const [tripId, setTripId] = useState('');
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [, refresh] = useState(0);
  const chats = buyerConversations(user.email);
  const selected = chats.find(chat => chat.id === activeId) || chats[0];
  const trips = buyerTrips();
  const shops = [...new Map(trips.map(trip => [trip.shopId, trip])).values()];
  const options = trips.filter(trip => trip.shopId === selected?.shopId);

  useEffect(() => {
    try {
      let orderChat;
      for (const order of ordersFor(user.email)) {
        const id = ensureOrderConversation(user, order.id);
        if (order.id === params.get('order')) orderChat = id;
      }
      if (params.get('order') && !orderChat) throw new Error('Pesanan tidak ditemukan untuk akun ini.');
      if (orderChat) setActiveId(orderChat);
      else if (params.get('shop')) setActiveId(startBuyerConversation(user, params.get('shop')));
      refresh(value => value + 1);
    } catch (error) { setError(error.message); }
  }, [user.email]);

  useEffect(() => {
    const update = () => refresh(value => value + 1);
    window.addEventListener('storage', update); window.addEventListener('focus', update);
    return () => { window.removeEventListener('storage', update); window.removeEventListener('focus', update); };
  }, []);

  function openShop(shopId) {
    try { setActiveId(startBuyerConversation(user, shopId)); setText(''); setError(''); refresh(value => value + 1); }
    catch (error) { setError(error.message); }
  }
  function submitRequest(event) {
    event.preventDefault();
    try {
      createRequest(user, selected.shopId, { ...Object.fromEntries(new FormData(event.currentTarget)), tripId, chatId: selected.id });
      setRequesting(false); setError(''); refresh(value => value + 1);
    } catch (error) { setError(error.message); }
  }
  function send(event) {
    event.preventDefault();
    try { sendBuyerMessage(user, selected.sellerEmail, selected.id, text); setText(''); setError(''); refresh(value => value + 1); }
    catch (error) { setError(error.message); }
  }

  return <main className="flow-page">
    <header className="flow-heading"><p className="eyebrow">PESAN</p><h1>Chat dengan jastiper</h1><p>Tanyakan perkembangan pesanan atau diskusikan barang yang ingin kamu titipkan.</p></header>
    <p className="seller-demo-note">Demo: percakapan tersimpan di browser ini, belum tersinkron ke perangkat lain.</p>
    <p role="alert" className="error-message">{error}</p>
    <section className="seller-chat-layout buyer-request-chat">
      <aside className="seller-chat-sidebar">
        {chats.map(chat => <button className={`seller-chat-preview ${chat.id === selected?.id ? 'active' : ''}`} key={chat.id} onClick={() => { setActiveId(chat.id); setText(''); setError(''); }}><span className="letter-avatar">{chat.shopName[0]}</span><div><strong>{chat.shopName}</strong><p>{chat.messages.at(-1)?.text || 'Mulai percakapan'}</p><small>{chat.orderId || 'Percakapan umum'}</small></div></button>)}
        {!!shops.length && <div className="chat-shop-picker"><h2>Mulai chat jastiper</h2>{shops.map(shop => <button className="button-outline" key={shop.shopId} onClick={() => openShop(shop.shopId)}>{shop.shopName}</button>)}</div>}
        {!chats.length && !shops.length && <p className="flow-card">Belum ada percakapan atau jastiper yang membuka trip.</p>}
      </aside>
      {selected ? <div className="seller-conversation">
        <header><div><strong>{selected.shopName}</strong><p>{selected.orderId ? `Pesanan ${selected.orderId}` : 'Percakapan dengan jastiper'}</p></div><a className="button-outline" href={`toko.html?shop=${selected.shopId}`}>Lihat toko</a></header>
        {selected.orderId && <div className="chat-order-context"><strong>{selected.orderId}</strong><span>{ordersFor(user.email).find(order => order.id === selected.orderId)?.status}</span><a href={`pesanan.html?order=${selected.orderId}`}>Lihat pesanan →</a></div>}
        <div className="seller-bubbles" role="log" aria-label="Chat dengan jastiper">{selected.messages.map(message => <div className={`seller-bubble ${message.from === 'buyer' ? 'outgoing' : ''}`} key={message.id}><p>{message.text}</p><time>{dateLabel(message.at)}</time></div>)}{!selected.messages.length && <p className="muted">Mulai chat untuk bertanya kepada jastiper.</p>}</div>
        <div className="request-list">{selected.requests?.map(request => <article className="request-card" key={request.id}><strong>{request.name} ×{request.quantity}</strong><p className="seller-status">{requestLabels[request.status]}</p>{request.note && <p>{request.note}</p>}{request.status === 'published' && <a className="button-solid" href={`produk.html?trip=${request.tripId}&shop=${selected.shopId}`}>Lihat barang di katalog toko →</a>}</article>)}</div>
        <div className="chat-request-action"><button className="button-outline" disabled={!options.length} onClick={() => { setTripId(options[0]?.id || ''); setError(''); setRequesting(true); }}>+ Request barang di chat ini</button>{!options.length && <small>Request baru tersedia saat jastiper membuka trip. Chat pesanan tetap bisa digunakan.</small>}</div>
        <form className="seller-message-form" onSubmit={send}><input aria-label="Pesan ke jastiper" placeholder="Tulis pesan untuk jastiper" value={text} onChange={event => setText(event.target.value)} maxLength="2000" required /><button className="button-solid" disabled={!text.trim()}>Kirim</button></form>
      </div> : <div className="empty-state"><h2>Pilih jastiper untuk mulai chat</h2><p>Chat pesanan juga bisa dibuka dari halaman konfirmasi pembayaran dan Pesanan saya.</p></div>}
    </section>
    {requesting && selected && <Modal title="Request barang di chat" subtitle="Seller mengecek regulasi dan stok sebelum menambahkan barang ke katalog." onClose={() => setRequesting(false)}><form className="field-form" onSubmit={submitRequest}>
      <label>Trip jastiper<select required value={tripId} onChange={event => setTripId(event.target.value)}>{options.map(trip => <option value={trip.id} key={trip.id}>{trip.title} · {trip.country}</option>)}</select></label>
      <label>Nama barang<input name="name" required maxLength="150" placeholder="Nama barang dan varian" /></label>
      <label>Jumlah<input name="quantity" type="number" min="1" max="99" defaultValue="1" required /></label>
      <label>Link referensi barang (opsional)<input name="link" type="url" placeholder="https://..." /></label>
      <label>Varian dan catatan<textarea name="notes" maxLength="2000" rows="3" /></label>
      <p role="alert" className="error-message">{error}</p><button className="button-solid">Kirim request di chat</button>
    </form></Modal>}
  </main>;
}
