import { useState } from 'react';
import Dashboard from './Dashboard';
import Trips from './Trips';
import Orders from './Orders';
import Finance from './Finance';
import Messages from './Messages';
import Settings from './Settings';
import Notifications from './Notifications';
import { ensureSeller, getSeller } from './sellerStore';
import { SellerNav } from './SellerUI';
import './seller.css';

export default function SellerApp({ user, page, onUserChange }) {
  const [data, setData] = useState(() => ensureSeller(user));
  const onChange = () => setData(getSeller(user.email));
  let content;
  if (page === 'seller-trip.html') content = <Trips user={user} data={data} onChange={onChange} />;
  else if (page === 'seller-pesanan.html') content = <Orders user={user} data={data} onChange={onChange} />;
  else if (page === 'seller-pendapatan.html') content = <Finance user={user} data={data} onChange={onChange} />;
  else if (page === 'seller-pesan.html') content = <Messages user={user} data={data} onChange={onChange} />;
  else if (page === 'seller-notif.html') content = <Notifications user={user} data={data} onChange={onChange} />;
  else if (['seller-profil.html', 'seller-toko.html', 'seller-rekening.html'].includes(page)) content = <Settings user={user} data={data} page={page} onChange={onChange} onUserChange={onUserChange} />;
  else content = <Dashboard user={user} data={data} />;
  return <><SellerNav user={user} data={data} page={page} /><main className="flow-page seller-page"><p className="seller-mode-note">MODE SELLER · DATA CONTOH & SIMULASI LOKAL</p>{content}</main><footer className="site-footer"><strong>NitipYuk Seller</strong><span>Bantu wishlist jadi nyata.</span><a href="seller.html">Dashboard</a><a href={`toko.html?shop=${data.shopId}`}>Lihat toko</a></footer></>;
}
