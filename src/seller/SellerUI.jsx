import { useEffect, useId, useRef } from 'react';
import { logout } from '../lib/orderStatus';
import { dateLabel, sellerNotifications } from './sellerStore';

export function Modal({ title, subtitle, onClose, children }) {
  const ref = useRef(null), id = useId();
  useEffect(() => { if (!ref.current.open) ref.current.showModal(); }, []);
  return <dialog ref={ref} className="seller-modal" aria-labelledby={id} onCancel={onClose} onClose={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}><div className="seller-modal-body"><header><div><h2 id={id}>{title}</h2>{subtitle && <p className="muted">{subtitle}</p>}</div><button className="modal-close" aria-label="Tutup dialog" onClick={onClose}>×</button></header>{children}</div></dialog>;
}
export function SellerNav({ user, data, page }) {
  const links = [['seller.html', 'Dashboard'], ['seller-trip.html', 'Trip'], ['seller-pesanan.html', 'Pesanan'], ['seller-pendapatan.html', 'Pendapatan']];
  const unread = sellerNotifications(user.email).filter(item => !item.read).length;
  const chats = data.chats.reduce((sum, chat) => sum + chat.unread, 0);
  return <nav className="navbar seller-navbar" aria-label="Navigasi seller"><a className="brand" href="seller.html"><span className="brand-icon"><img src="element/logoNitipYuk.png" alt="Logo NitipYuk" /></span><span className="brand-text"><strong>NitipYuk</strong></span><span className="seller-tag">Seller</span></a><div className="links">{links.map(([href, label]) => <a key={href} href={href} className={page === href ? 'active' : ''}>{label}</a>)}</div><div className="nav-actions"><a className="nav-icon-button" aria-label={`Pesan (${chats} belum dibaca)`} href="seller-pesan.html"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v12H9l-5 4Z" /></svg>{chats > 0 && <span className="notification-badge">{chats}</span>}</a><a className="nav-icon-button" aria-label={`Notifikasi seller (${unread} belum dibaca)`} href="seller-notif.html"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>{unread > 0 && <span className="notification-badge">{unread}</span>}</a><div className="account-area"><a className="auth-link" href="seller-profil.html"><span className="auth-icon"><img src={user.photo || 'element/user.png'} alt="" /></span><span>{data.shop.name}</span></a><details className="account-dropdown"><summary aria-label="Buka menu seller">⌄</summary><div className="account-dropdown-menu"><a href="seller-profil.html">Profil saya</a><a href="seller-toko.html">Profil toko</a><a href="seller-rekening.html">Rekening pencairan</a><a href={`toko.html?shop=${data.shopId}`}>Lihat sebagai buyer</a><button className="dropdown-logout" onClick={() => { logout(); location.href = '/'; }}>Keluar</button></div></details></div></div></nav>;
}
export function AccountMenu({ page }) {
  return <aside className="account-sidebar"><p className="eyebrow">AKUN SAYA</p>{[['seller-profil.html', 'Profil saya'], ['seller-toko.html', 'Profil toko'], ['seller-rekening.html', 'Rekening pencairan']].map(([href, label]) => <a className={page === href ? 'active' : ''} href={href} key={href}>{label}</a>)}<button className="text-button" onClick={() => { logout(); location.href = '/'; }}>Keluar</button></aside>;
}
export function PageHeading({ eyebrow, title, text, children }) { return <header className="flow-heading heading-actions"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{text}</p></div>{children}</header>; }
export function Status({ value }) { return <span className={`seller-status status-${value === 'Dikonfirmasi' ? 'plum' : ['Dibuka', 'Cair', 'Selesai', 'Diterima'].includes(value) ? 'green' : value === 'Dibatalkan' ? 'red' : 'soft'}`}>{value}</span>; }
export function Tabs({ options, value, onChange, label = 'Filter' }) { return <div className="seller-tabs" aria-label={label}>{options.map(option => <button key={option} className={value === option ? 'active' : ''} aria-pressed={value === option} onClick={() => onChange(option)}>{option}</button>)}</div>; }
export function Empty({ title, text }) { return <section className="flow-card empty-state"><h2>{title}</h2><p>{text}</p></section>; }
export function Stat({ value, label, detail }) { return <article className="flow-card seller-stat"><strong>{value}</strong><span>{label}</span>{detail && <small>{detail}</small>}</article>; }
export function orderTitle(order) { return order.items.map(item => item.name + (item.quantity > 1 ? ` ×${item.quantity}` : '')).join(', '); }
export function OrderPreview({ order }) { return <a className="seller-order-preview" href={`seller-pesanan.html?order=${order.id}`}><span className="seller-item-icon" aria-hidden="true"><BagIcon /></span><div><small>{order.id} · {order.items[0]?.country}</small><strong>{orderTitle(order)}</strong><small>{order.buyerName || order.shippingAddress?.recipient || 'Buyer'} · {dateLabel(order.createdAt)}</small></div><Status value={order.status} /></a>; }

export function BagIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M6 7h12l1 14H5L6 7Z" /><path d="M9 8V5a3 3 0 0 1 6 0v3" /></svg>; }
