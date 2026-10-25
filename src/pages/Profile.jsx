import { useState } from 'react';
import { accountKey, list, paymentMethods, paymentName, read, write } from '../lib/store';
import { AccountSidebar } from './Addresses';

export default function Profile({ user, onUserChange }) {
  const [notice, setNotice] = useState('');
  const [paymentNotice, setPaymentNotice] = useState('');
  const [photo, setPhoto] = useState(user.photo || '');
  const [method, setMethod] = useState(() => read(accountKey('payment', user.email), ''));
  const addresses = list(accountKey('addresses', user.email));
  const orders = list('nitipyuk-orders').filter(order => order.userEmail?.toLowerCase() === user.email.toLowerCase());
  function save(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (!data.name.trim()) throw new Error('Masukkan nama lengkap.');
      const updated = { ...user, name: data.name.trim(), phone: data.phone.trim(), photo, ...(data.shopName !== undefined ? { shopName: data.shopName.trim() } : {}) };
      write(accountKey('profile', user.email), updated); write('nitipyuk-user', updated); onUserChange(updated); setNotice('Perubahan profil berhasil disimpan.');
    } catch (error) { setNotice(error.message || 'Profil belum bisa disimpan.'); }
  }
  function upload(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) { setNotice('Pilih gambar maksimal 2 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => { setPhoto(reader.result); setNotice('Pratinjau foto siap. Klik Simpan perubahan.'); };
    reader.onerror = () => setNotice('Foto tidak bisa dibaca.');
    reader.readAsDataURL(file);
  }
  return <main className="flow-page account-layout"><AccountSidebar active="profile" /><div><header className="flow-heading"><p className="eyebrow">PENGATURAN AKUN</p><h1>Profil saya</h1><p>Kelola informasi, alamat, dan preferensi pembayaranmu.</p></header>
    <section className="flow-card profile-banner-react"><img className="profile-avatar" src={photo || 'element/user.png'} alt="Foto profil" /><div><h2>{user.name || user.email.split('@')[0]}</h2><p>{user.role === 'penitip' ? 'Penitip' : 'Buyer'}</p></div><label className="button-outline upload-button">Ganti foto<input type="file" accept="image/*" onChange={upload} /></label></section>
    <div className="profile-summary"><div className="flow-card"><strong>{orders.length}</strong><span>Total titipan</span></div><div className="flow-card"><strong>{orders.filter(order => order.status !== 'Selesai').length}</strong><span>Sedang berjalan</span></div><div className="flow-card"><strong>{orders.filter(order => order.status === 'Selesai').length}</strong><span>Selesai</span></div></div>
    <form className="flow-card field-form" onSubmit={save}><h2>Informasi pribadi</h2><div className="form-grid"><label>Nama lengkap<input name="name" required defaultValue={user.name || ''} maxLength="100" /></label><label>Nomor telepon<input name="phone" type="tel" defaultValue={user.phone || ''} autoComplete="tel" /></label></div><label>Email<input value={user.email} type="email" readOnly /></label>{user.role === 'penitip' && <label>Nama toko<input name="shopName" defaultValue={user.shopName || ''} /></label>}<button className="button-solid" type="submit">Simpan perubahan</button><p role="status">{notice}</p></form>
    <section className="flow-card profile-addresses" id="alamat"><div className="heading-actions"><div><p className="eyebrow">PENGIRIMAN</p><h2>Alamat saya</h2></div><a className="text-link" href="alamat.html">Kelola alamat →</a></div>
      <a className="add-address-row" href="alamat.html#address-editor"><span aria-hidden="true">＋</span> Tambah alamat baru <span aria-hidden="true">›</span></a>
      {!addresses.length && <p className="muted">Belum ada alamat tersimpan.</p>}
      {addresses.map(address => <article className="profile-address-row" key={address.id}><div><strong>{address.recipient}</strong> {address.primary && <span className="status-pill">Utama</span>}<p>{address.label} · {address.phone}</p><p className="muted">{address.address}</p></div><a className="text-link" href={`alamat.html?edit=${encodeURIComponent(address.id)}#address-editor`}>Ubah</a></article>)}
    </section>
    <section className="flow-card" id="metode-pembayaran"><p className="eyebrow">PEMBAYARAN</p><h2>Metode pembayaran</h2><p className="muted">Simpan metode pilihanmu agar otomatis terpilih saat checkout.</p><form className="field-form" onSubmit={event => { event.preventDefault(); try { write(accountKey('payment', user.email), method); setPaymentNotice(`${paymentName(method)} berhasil disimpan.`); } catch { setPaymentNotice('Metode belum bisa disimpan.'); } }}><label>Metode pembayaran pilihan<select value={method} onChange={event => setMethod(event.target.value)} required><option value="">Pilih metode pembayaran</option>{paymentMethods.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><div className="form-actions"><button className="button-solid" type="submit">Simpan metode pembayaran</button>{method && <button className="button-outline" type="button" onClick={() => { localStorage.removeItem(accountKey('payment', user.email)); setMethod(''); setPaymentNotice('Preferensi pembayaran dihapus.'); }}>Hapus preferensi</button>}</div><p role="status">{paymentNotice}</p>{read(accountKey('checkout', user.email), null) && <a className="text-link" href="payment.html">Kembali ke pembayaran →</a>}</form></section>
  </div></main>;
}
