import { useState } from 'react';
import { accountKey, createDraft, list, read, write } from '../lib/store';
import { logout } from '../lib/orderStatus';
import { CheckoutSteps } from './CheckoutForm';

export function AccountSidebar({ active }) { return <aside className="account-sidebar"><p className="eyebrow">AKUN SAYA</p><a className={active === 'profile' ? 'active' : ''} href="profil.html">Profil saya</a><a className={active === 'address' ? 'active' : ''} href="alamat.html">Alamat saya</a><a href="profil.html#metode-pembayaran">Metode pembayaran</a><a href="notif.html">Notifikasi</a><button className="text-button" onClick={() => { logout(); location.href = '/'; }}>Keluar</button></aside>; }
export default function Addresses({ user }) {
  const storageKey = accountKey('addresses', user.email);
  const [addresses, setAddresses] = useState(() => list(storageKey));
  const [editing, setEditing] = useState(new URLSearchParams(location.search).get('edit'));
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(() => list(storageKey).find(item => item.primary)?.id || list(storageKey)[0]?.id || '');
  const checkout = new URLSearchParams(location.search).get('checkout') === '1';
  const savedForm = read(accountKey('form', user.email), null);
  const draft = read(accountKey('checkout', user.email), null);
  const pending = savedForm?.items ? savedForm : draft ? { items: draft.items, notes: draft.notes, fromCart: draft.fromCart, trip: draft.trip } : null;
  const candidate = new URLSearchParams(location.search).get('return') || '';
  const returnTo = /^form\.html(\?[\w=&%-]*)?$/.test(candidate) ? candidate : '';
  const backToForm = pending?.fromCart ? 'form.html?cart=1' : `form.html?barang=${pending?.items?.[0]?.id || ''}&jumlah=${pending?.items?.[0]?.quantity || 1}${pending?.trip ? '&trip=' + pending.trip.id : ''}`;
  function persist(next) { write(storageKey, next); setAddresses(next); }
  function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, value.trim()]));
    if (Object.values(values).some(value => !value)) { setNotice('Lengkapi seluruh kolom alamat.'); return; }
    const address = { ...values, id: editing || crypto.randomUUID(), primary: addresses.length === 0 || addresses.find(item => item.id === editing)?.primary || false };
    try {
      persist(editing ? addresses.map(item => item.id === editing ? address : item) : [...addresses, address]);
      if (!selected) setSelected(address.id);
      setEditing(null); form.reset(); setNotice('Alamat berhasil disimpan.');
    } catch { setNotice('Alamat belum bisa disimpan. Periksa penyimpanan browser.'); }
  }
  function continueCheckout() {
    try {
      if (!pending?.items?.length) throw new Error('Lengkapi detail barang terlebih dahulu.');
      createDraft({ email: user.email, items: pending.items, notes: pending.notes, fromCart: pending.fromCart, trip: pending.trip, address: addresses.find(item => item.id === selected) });
      location.href = 'payment.html';
    } catch (error) { setError(error.message); }
  }
  if (checkout && !pending?.items?.length) return <main className="flow-page"><section className="flow-card empty-state"><h1>Lengkapi detail titipan terlebih dahulu</h1><a className="button-solid" href="produk.html">Pilih barang</a></section></main>;
  return <main className={`flow-page ${checkout ? 'narrow-page' : 'account-layout'}`}>{!checkout && <AccountSidebar active="address" />}<div>{checkout && <CheckoutSteps current={2} />}<header className="flow-heading"><p className="eyebrow">{checkout ? 'PENGIRIMAN TITIPAN' : 'PENGATURAN AKUN'}</p><h1>{checkout ? 'Pilih alamat pengiriman' : 'Alamat saya'}</h1><p>{checkout ? 'Pilih alamat tujuan, atau tambahkan alamat baru di bawah.' : 'Kelola alamat tujuan barang titipanmu.'}</p></header>
    <div className="address-list">{addresses.map(address => <article key={address.id} className={`flow-card address-card ${checkout && selected === address.id ? 'selected-address' : ''}`}>
      {checkout && <label className="address-selection"><input type="radio" name="delivery-address" checked={selected === address.id} onChange={() => setSelected(address.id)} />Gunakan {address.label}</label>}
      <div className="heading-actions"><h2>{address.label}</h2>{address.primary && <span className="status-pill">Utama</span>}</div><strong>{address.recipient} · {address.phone}</strong><p>{address.address}</p><div className="address-actions"><button className="text-button" onClick={() => { setEditing(address.id); document.getElementById('address-editor')?.scrollIntoView({ behavior: 'smooth' }); }}>Ubah</button>{!address.primary && <button className="text-button" onClick={() => persist(addresses.map(item => ({ ...item, primary: item.id === address.id })))}>Jadikan utama</button>}<button className="text-button" onClick={() => { const next = addresses.filter(item => item.id !== address.id); if (next.length && !next.some(item => item.primary)) next[0].primary = true; persist(next); if (editing === address.id) setEditing(null); if (selected === address.id) setSelected(next[0]?.id || ''); }}>Hapus</button></div></article>)}</div>
    {checkout && <section className="flow-card checkout-address-actions"><p role="alert" className="error-message">{error}</p>{!addresses.length && <p className="soft-notice">Belum ada alamat. Simpan alamat baru untuk melanjutkan.</p>}<div className="form-actions"><a className="button-outline" href={backToForm}>← Detail titipan</a><button className="button-solid" disabled={!addresses.some(item => item.id === selected)} onClick={continueCheckout}>Gunakan alamat & lanjut pembayaran →</button></div></section>}
    <form key={editing || 'new'} id="address-editor" className="flow-card field-form" onSubmit={submit}><h2>{editing ? 'Ubah alamat' : 'Tambah alamat baru'}</h2><div className="form-grid"><label>Label alamat<input name="label" placeholder="Rumah / Kantor" defaultValue={addresses.find(item => item.id === editing)?.label || ''} required maxLength="60" /></label><label>Nama penerima<input name="recipient" autoComplete="name" defaultValue={addresses.find(item => item.id === editing)?.recipient || user.name || ''} required maxLength="100" /></label></div><label>Nomor telepon<input name="phone" type="tel" autoComplete="tel" defaultValue={addresses.find(item => item.id === editing)?.phone || user.phone || ''} required pattern="[+0-9 ()-]{8,20}" title="Masukkan nomor telepon 8–20 karakter" /></label><label>Alamat lengkap<textarea name="address" rows="3" autoComplete="street-address" placeholder="Jalan, nomor rumah, kecamatan, kota, provinsi, kode pos" defaultValue={addresses.find(item => item.id === editing)?.address || ''} required maxLength="500" /></label><div className="form-actions">{editing && <button className="button-outline" type="button" onClick={() => setEditing(null)}>Batal</button>}<button className="button-solid" type="submit">Simpan alamat</button></div><p role="status">{notice}</p></form>
    {returnTo && <a className="button-solid" href={returnTo}>Kembali ke form titipan →</a>}
  </div></main>;
}
