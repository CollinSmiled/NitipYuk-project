import { useState } from 'react';
import { accountKey, read, write } from '../lib/store';
import { markNotificationsRead, notificationsFor } from '../lib/orderStatus';

export default function Notifications({ user, onNotificationsChange }) {
  const [items, setItems] = useState(() => notificationsFor(user.email));
  const [showInfo, setShowInfo] = useState(() => !read(accountKey('notification-info-dismissed', user.email), false));
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [error, setError] = useState('');
  const unread = items.filter(item => !item.read).length;
  function mark(ids) {
    try { markNotificationsRead(user.email, ids); setItems(notificationsFor(user.email)); onNotificationsChange(); return true; }
    catch { setError('Status notifikasi belum bisa disimpan.'); return false; }
  }
  return <main className="flow-page narrow-page"><header className="flow-heading"><p className="eyebrow">KABAR UNTUKMU</p><h1>Notifikasi</h1><p>Ikuti perkembangan pesanan dan barang titipanmu.</p></header>
    {showInfo && <aside className="notification-info"><span className="notice-bell" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg></span><p>Info status pesananmu akan muncul di sini. Buka notifikasi untuk melihat perjalanan titipan.</p><button className="text-button" aria-label="Tutup informasi notifikasi" onClick={() => { write(accountKey('notification-info-dismissed', user.email), true); setShowInfo(false); }}>×</button></aside>}
    <div className="notification-heading"><h2>Status pesanan {unread > 0 && <span className="unread-pill">{unread}</span>}</h2><a href="pesanan.html" className="text-link">Lihat semua pesanan →</a></div>
    <div className="notification-toolbar"><div className="notification-tabs"><button aria-pressed={!onlyUnread} className={!onlyUnread ? 'active' : ''} onClick={() => setOnlyUnread(false)}>Semua</button><button aria-pressed={onlyUnread} className={onlyUnread ? 'active' : ''} onClick={() => setOnlyUnread(true)}>Belum dibaca</button></div><button className="text-button" disabled={!unread} onClick={() => mark(items.map(item => item.id))}>Tandai semua dibaca</button></div>
    <p role="alert" className="error-message">{error}</p>
    {!items.length ? <section className="flow-card empty-state"><h2>Belum ada notifikasi</h2><p>Notifikasi pertama muncul setelah pesananmu dikonfirmasi.</p><a href="produk.html" className="button-solid">Jelajahi produk</a></section> : <div className="notification-list">{items.filter(item => !onlyUnread || !item.read).map(item => <article className={`notification-card ${item.read ? 'read' : 'unread'}`} key={item.id}><a href={`pesanan.html?order=${encodeURIComponent(item.orderId)}#${encodeURIComponent(item.orderId)}`} onClick={event => { if (!mark([item.id])) event.preventDefault(); }}><div><h3>{!item.read && <span className="unread-dot" aria-label="Belum dibaca" />}{item.title}</h3><p>{item.message}</p><p className="notification-product">{item.product} · {item.orderId}</p><time dateTime={item.at}>{new Date(item.at).toLocaleString('id-ID')}</time></div><img src={item.image} alt={item.product} /></a></article>)}</div>}
    {items.length > 0 && onlyUnread && !unread && <section className="flow-card empty-state"><h2>Semua sudah dibaca</h2><p>Kamu sudah mengikuti seluruh kabar titipanmu.</p></section>}
  </main>;
}
