import Requests from './pages/Requests';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import Recommendations from './components/Recommendations';
import Countries from './components/Countries';
import Products from './components/Products';
import Cart from './pages/Cart';
import CheckoutForm from './pages/CheckoutForm';
import Payment from './pages/Payment';
import Orders from './pages/Orders';
import Addresses from './pages/Addresses';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Success from './pages/Success';
import { notificationsFor } from './lib/orderStatus';
import { getCart, read } from './lib/store';
import SellerApp from './seller/SellerApp';
import ShopPage from './seller/ShopPage';
import { isSeller } from './seller/sellerStore';
import './styles.css';
import './flow.css';

export default function App() {
  const [query, setQuery] = useState(new URLSearchParams(location.search).get('q') || '');
  const [, refreshNotifications] = useState(0);
  const onNotificationsChange = () => refreshNotifications(value => value + 1);
  const [country, setCountry] = useState('Semua negara');
  const [cart, setCart] = useState(getCart);
  const [user, setUser] = useState(() => read('nitipyuk-user', null));
  const path = location.pathname.split('/').pop() || 'index.html';
  const page = path === 'profile.html' ? 'profil.html' : path;
  const unreadCount = user?.email ? notificationsFor(user.email).filter(item => !item.read).length : 0;
  const onCartChange = () => setCart(getCart());
  if (isSeller(user) && page !== 'toko.html' && !['request.html', 'chat.html'].includes(page) && !new URLSearchParams(location.search).has('buyer')) {
    const aliases = { 'index.html': 'seller.html', 'NitipYuk.html': 'seller.html', 'pesanan.html': 'seller-pesanan.html', 'profil.html': 'seller-profil.html', 'notif.html': 'seller-notif.html' };
    return <SellerApp user={user} page={aliases[page] || page} onUserChange={setUser} />;
  }
  if (page.startsWith('seller') && !isSeller(user)) return <><Navbar user={user} unreadCount={unreadCount} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} page={page} onSearch={value => { location.href = 'produk.html?q=' + encodeURIComponent(value); }} /><main className="flow-page"><section className="flow-card empty-state"><h1>Masuk sebagai Seller</h1><p>Kelola trip, pesanan, dan tokomu di NitipYuk Seller.</p><a className="button-solid" href={`login.html?role=penitip&return=${encodeURIComponent(page + location.search)}`}>Masuk akun Seller</a></section></main></>;
  const protectedPage = ['request.html', 'chat.html', 'form.html', 'payment.html', 'profil.html', 'alamat.html', 'pesanan.html', 'notif.html', 'berhasil.html'].includes(page);
  let content;
  if (protectedPage && (!user?.email || (['request.html', 'chat.html', 'form.html', 'payment.html'].includes(page) && user.role !== 'buyer'))) {
    const destination = encodeURIComponent(page + location.search);
    content = <main className="flow-page"><section className="flow-card empty-state"><h1>{page === "pesanan.html" ? "Pesananmu masih kosong" : page === "notif.html" ? "Masuk untuk melihat notifikasi" : "Masuk untuk melanjutkan titipanmu"}</h1><p>{page === "pesanan.html" ? "Masuk ke akun Buyer untuk melihat pesanan dan mengikuti perjalanan titipanmu." : "Gunakan akun Buyer untuk checkout dan mengikuti pesananmu."}</p><a className="button-solid" href={`login.html?return=${destination}`}>Masuk / Daftar</a></section></main>;
  } else if (['request.html', 'chat.html'].includes(page)) content = <Requests user={user} />;
  else if (page === 'keranjang.html') content = <Cart cart={cart} onCartChange={onCartChange} />;
  else if (page === 'form.html') content = <CheckoutForm user={user} cart={cart} />;
  else if (page === 'payment.html') content = <Payment user={user} onCartChange={onCartChange} />;
  else if (page === 'pesanan.html') content = <Orders user={user} onNotificationsChange={onNotificationsChange} />;
  else if (page === 'notif.html') content = <Notifications user={user} onNotificationsChange={onNotificationsChange} />;
  else if (page === 'berhasil.html') content = <Success user={user} />;
  else if (page === 'alamat.html') content = <Addresses user={user} />;
  else if (page === 'toko.html') content = <ShopPage user={user} />;
  else if (page === 'profil.html') content = <Profile user={user} onUserChange={setUser} />;
  else content = <main>{page !== 'produk.html' && <><Hero /><Benefits /><Recommendations /></>}<Countries selected={country} onSelect={setCountry} /><Products user={user} country={country} query={query} onCartChange={onCartChange} catalogue={page === 'produk.html'} /></main>;
  return <><Navbar unreadCount={unreadCount} user={user} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} page={page} onSearch={value => { if (page === 'index.html' || page === 'NitipYuk.html' || page === 'produk.html') { setQuery(value); document.getElementById('produk')?.scrollIntoView({ behavior: 'smooth' }); } else location.href = `produk.html?q=${encodeURIComponent(value)}`; }} />{content}<footer className="site-footer"><strong>NitipYuk</strong><span>Dari wishlist, sampai depan pintu.</span><a href="keranjang.html">Keranjang</a><a href="pesanan.html">Pesanan</a><a href="notif.html">Notifikasi</a><a href="seller.html">NitipYuk Seller</a></footer></>;
}
