import { accountKey, list, productById, read, write } from '../lib/store.js';

export const isSeller = user => ['penitip', 'seller'].includes(user?.role);
export const sellerKey = email => accountKey('seller', email);
export const orderStatuses = ['Dikonfirmasi', 'Dalam perjalanan', 'Dalam pengantaran', 'Selesai', 'Dibatalkan'];
export const tripStatuses = { open: 'Dibuka', ongoing: 'Sedang berjalan', completed: 'Selesai', closed: 'Ditutup' };
export const countries = ['Korea Selatan', 'Jepang', 'Singapura', 'Malaysia', 'Thailand', 'Amerika Serikat', 'Australia', 'Prancis'];
export const tripImage = country => ({ 'Korea Selatan': 'seoul', Jepang: 'tokyo', Singapura: 'singapore', Malaysia: 'kuala-lumpur', Prancis: 'paris', 'Amerika Serikat': 'new-york' }[country] || 'fuji');
export const dateLabel = value => value ? new Date(value.length === 10 ? value + 'T12:00:00+07:00' : value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' }) : '—';
export const dateRange = trip => `${dateLabel(trip.departure)} – ${dateLabel(trip.returnDate)}`;
export function sellerOrders(email, storage = globalThis.localStorage) {
  const data = read(sellerKey(email), null, storage);
  return [...(data?.orders || []), ...list('nitipyuk-orders', storage).filter(order => order.sellerEmail?.toLowerCase() === email.toLowerCase())].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
export function occupiedSlots(email, tripId, storage = globalThis.localStorage) {
  return sellerOrders(email, storage).filter(order => order.tripId === tripId && order.status !== 'Dibatalkan').reduce((sum, order) => sum + order.items.reduce((count, item) => count + item.quantity, 0), 0);
}
export function ensureSeller(user, storage = globalThis.localStorage) {
  if (!isSeller(user) || !user.email) throw new Error('Gunakan akun Seller.');
  const existing = read(sellerKey(user.email), null, storage);
  if (existing) return existing;
  const shopId = crypto.randomUUID();
  const trips = [
    { id: crypto.randomUUID(), title: 'Belanja K-beauty di Seoul', country: 'Korea Selatan', city: 'Seoul', departure: '2026-12-01', returnDate: '2026-12-07', arrival: '2026-12-14', capacity: 20, shipping: 15000, status: 'open', promotedUntil: '', customs: 'Ditanggung buyer', notes: 'Barang dibeli di toko resmi, disertai foto struk.' },
    { id: crypto.randomUUID(), title: 'Haul drugstore Tokyo', country: 'Jepang', city: 'Tokyo', departure: '2027-01-18', returnDate: '2027-01-25', arrival: '2027-02-03', capacity: 15, shipping: 20000, status: 'open', customs: 'Ditanggung buyer', notes: '' },
    { id: crypto.randomUUID(), title: 'Busan weekend haul', country: 'Korea Selatan', city: 'Busan', departure: '2026-10-12', returnDate: '2026-10-18', arrival: '2026-10-30', capacity: 12, shipping: 15000, status: 'ongoing', customs: 'Ditanggung buyer', notes: '' },
    { id: crypto.randomUUID(), title: 'Seoul summer sale', country: 'Korea Selatan', city: 'Seoul', departure: '2026-08-04', returnDate: '2026-08-10', arrival: '2026-08-18', capacity: 18, shipping: 15000, status: 'completed', customs: 'Ditanggung buyer', notes: '' },
  ];
  const rows = [ ['Eve', 'tas-mini', 1, 0, 0, '2026-10-26'], ['Rina', 'serum-wajah', 2, 0, 0, '2026-10-25'], ['Sarah', 'serum-wajah', 1, 1, 2, '2026-10-14'], ['Dimas', 'tas-mini', 1, 2, 2, '2026-10-13'], ['Maya', 'serum-wajah', 3, 3, 3, '2026-10-25'] ];
  const orders = rows.map(([buyerName, id, quantity, step, tripIndex, date], index) => {
    const product = productById(id), subtotal = product.price * quantity, shipping = trips[tripIndex].shipping * quantity;
    const createdAt = date + 'T05:56:00+07:00';
    return { id: `DEMO-${shopId.slice(0, 4).toUpperCase()}-${index + 1}`, buyerName, userEmail: `${buyerName.toLowerCase()}@example.test`, sellerEmail: user.email, tripId: trips[tripIndex].id, tripTitle: trips[tripIndex].title, items: [{ ...product, quantity }], status: orderStatuses[step], pricing: { subtotal, shipping, service: 5000, total: subtotal + shipping + 5000 }, shippingAddress: { recipient: buyerName, address: 'Alamat buyer contoh · Jakarta' }, createdAt, history: [{ step: 0, at: createdAt }, ...(step ? [{ step, at: createdAt }] : [])], demo: true };
  });
  const chats = orders.map((order, index) => ({ id: crypto.randomUUID(), orderId: order.id, buyer: order.buyerName, unread: index === 0 ? 1 : 0, messages: [{ id: crypto.randomUUID(), from: 'buyer', text: index === 0 ? 'Kak, tasnya yang warna krem logo hijau ya.' : 'Halo kak, boleh minta kabar titipan saya?', at: order.createdAt }] }));
  chats.splice(1, 0, { id: crypto.randomUUID(), buyer: 'Putri', unread: 1, messages: [{ id: crypto.randomUUID(), from: 'buyer', text: 'Kak, trip Seoul bisa titip parfum juga?', at: '2026-10-25T09:00:00+07:00' }] });
  const data = { shopId, shop: { name: user.shopName || 'Seoulmate', countries: 'Korea Selatan, Jepang', description: 'Jastip rutin Korea dan Jepang. Fokus skincare dan fashion, dibeli langsung di toko resmi dan selalu dikirim foto struk.', policy: 'Bea masuk ditanggung buyer. Barang yang habis di toko akan direfund penuh paling lambat 3 hari.', joinedAt: '2025-01-01' }, trips, orders, chats, banks: [], ledger: [{ id: crypto.randomUUID(), kind: 'withdrawal', amount: 30000, title: 'Penarikan saldo contoh', at: '2026-10-20T10:00:00+07:00', bank: 'Rekening contoh' }], events: [{ id: 'review-' + shopId, category: 'Ulasan', title: 'Ulasan baru dari buyer', message: 'Maya memberi 5 bintang untuk titipan contoh. Lihat ulasan di profil toko.', href: 'seller-toko.html', at: '2026-10-25T11:00:00+07:00' }], readNotifications: ['new-' + orders[2].id, 'new-' + orders[3].id, 'new-' + orders[4].id, 'review-' + shopId] };
  write(sellerKey(user.email), data, storage);
  return data;
}
export function getSeller(email, storage = globalThis.localStorage) {
  const data = read(sellerKey(email), null, storage);
  if (!data) throw new Error('Toko belum tersedia. Masuk sebagai Seller.');
  return data;
}
function update(email, mutate, storage) {
  const data = structuredClone(getSeller(email, storage));
  mutate(data);
  write(sellerKey(email), data, storage);
  return data;
}
function addEvent(data, category, title, message, href) { data.events.push({ id: crypto.randomUUID(), category, title, message, href, at: new Date().toISOString() }); }
export function saveTrip(email, values, id, storage = globalThis.localStorage) {
  const used = id ? occupiedSlots(email, id, storage) : 0;
  if (!values.title?.trim() || !values.city?.trim() || !countries.includes(values.country)) throw new Error('Lengkapi judul, negara, dan kota tujuan.');
  for (const key of ['departure', 'returnDate', 'arrival']) if (!/^\d{4}-\d{2}-\d{2}$/.test(values[key]) || Number.isNaN(Date.parse(values[key]))) throw new Error('Lengkapi seluruh tanggal trip.');
  if (values.returnDate < values.departure || values.arrival < values.returnDate) throw new Error('Tanggal pulang dan estimasi sampai harus berurutan.');
  if (!Number.isInteger(Number(values.capacity)) || Number(values.capacity) < Math.max(1, used) || Number(values.capacity) > 999) throw new Error(`Slot harus ${Math.max(1, used)}–999, dan tidak boleh kurang dari barang yang sudah dipesan.`);
  if (!Number.isInteger(Number(values.shipping)) || Number(values.shipping) < 0 || Number(values.shipping) > 10000000) throw new Error('Ongkir harus berupa rupiah 0–10.000.000.');
  if (!tripStatuses[values.status || 'open']) throw new Error('Status trip tidak valid.');
  return update(email, data => {
    const previous = data.trips.find(trip => trip.id === id);
    if (id && !previous) throw new Error('Trip tidak ditemukan.');
    const trip = { ...previous, ...values, id: id || crypto.randomUUID(), title: values.title.trim(), city: values.city.trim(), capacity: Number(values.capacity), shipping: Number(values.shipping), status: values.status || 'open' };
    data.trips = id ? data.trips.map(item => item.id === id ? trip : item) : [trip, ...data.trips];
    addEvent(data, 'Trip', id ? 'Trip diperbarui' : 'Trip baru dibuka', trip.title, 'seller-trip.html');
  }, storage);
}
export function setTripStatus(email, id, status, storage = globalThis.localStorage) {
  if (!tripStatuses[status]) throw new Error('Status trip tidak valid.');
  return update(email, data => { const trip = data.trips.find(item => item.id === id); if (!trip) throw new Error('Trip tidak ditemukan.'); trip.status = status; addEvent(data, 'Trip', `Trip ${tripStatuses[status].toLowerCase()}`, trip.title, 'seller-trip.html'); }, storage);
}
export function earnings(email, storage = globalThis.localStorage) {
  const data = getSeller(email, storage);
  const rows = sellerOrders(email, storage).filter(order => order.status !== 'Dibatalkan').map(order => {
    const subtotal = order.pricing.subtotal, commission = Math.round(subtotal * .05), gross = subtotal + order.pricing.shipping;
    return { id: order.id, title: order.id, detail: `${order.buyerName || order.shippingAddress?.recipient || 'Buyer'} · ${order.items.map(item => item.name).join(', ')}`, gross, commission, net: gross - commission, at: order.createdAt, status: order.status === 'Selesai' ? 'Cair' : 'Ditahan', kind: 'order' };
  });
  const released = rows.filter(row => row.status === 'Cair').reduce((sum, row) => sum + row.net, 0);
  const held = rows.filter(row => row.status === 'Ditahan').reduce((sum, row) => sum + row.net, 0);
  const spent = data.ledger.reduce((sum, entry) => sum + entry.amount, 0);
  return { available: released - spent, held, released, rows: [...rows, ...data.ledger.map(item => ({ ...item, status: item.kind === 'withdrawal' ? 'Penarikan' : 'Biaya', net: -item.amount }))].sort((a, b) => new Date(b.at) - new Date(a.at)) };
}
export function promoteTrip(email, id, storage = globalThis.localStorage) {
  if (earnings(email, storage).available < 30000) throw new Error('Saldo demo minimal Rp30.000 untuk promosi.');
  return update(email, data => { const trip = data.trips.find(item => item.id === id); if (!trip || trip.status !== 'open') throw new Error('Hanya trip dibuka yang bisa dipromosikan.'); if (new Date(trip.promotedUntil) > new Date()) throw new Error('Promosi trip ini masih aktif.'); trip.promotedUntil = new Date(Date.now() + 7 * 86400000).toISOString(); data.ledger.push({ id: crypto.randomUUID(), kind: 'fee', amount: 30000, title: 'Promosi trip · ' + trip.title, at: new Date().toISOString() }); addEvent(data, 'Trip', 'Promosi trip aktif', `${trip.title} ditampilkan selama 7 hari.`, 'seller-trip.html'); }, storage);
}
export function updateSellerOrder(email, id, status, storage = globalThis.localStorage) {
  const order = sellerOrders(email, storage).find(item => item.id === id);
  if (!order) throw new Error('Pesanan tidak ditemukan.');
  const step = orderStatuses.indexOf(order.status), next = orderStatuses.indexOf(status);
  if (!(next === step + 1 && next <= 3) && !(status === 'Dibatalkan' && step >= 0 && step < 3)) throw new Error('Status pesanan harus maju berurutan.');
  const history = [...(order.history || [{ step, at: order.createdAt }]), { step: status === 'Dibatalkan' ? -1 : next, at: new Date().toISOString() }];
  if (order.demo) update(email, data => { const target = data.orders.find(item => item.id === id); target.status = status; target.history = history; }, storage);
  else { const all = list('nitipyuk-orders', storage); write('nitipyuk-orders', all.map(item => item.id === id ? { ...item, status, history } : item), storage); }
  return getSeller(email, storage);
}
export function saveShop(email, values, storage = globalThis.localStorage) {
  if (!values.name?.trim() || !values.countries?.trim() || !values.description?.trim()) throw new Error('Lengkapi nama, negara layanan, dan deskripsi toko.');
  return update(email, data => { data.shop = { ...data.shop, ...Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value).trim()])) }; }, storage);
}
export function saveBank(email, values, id, storage = globalThis.localStorage) {
  if (!['BCA', 'BNI', 'Mandiri', 'BRI'].includes(values.bank) || !values.holder?.trim() || !/^\d{8,20}$/.test(values.number)) throw new Error('Lengkapi bank, nama pemilik, dan nomor rekening 8–20 digit.');
  return update(email, data => {
    if (id && !data.banks.some(item => item.id === id)) throw new Error('Rekening tidak ditemukan.');
    const account = { id: id || crypto.randomUUID(), ...values, holder: values.holder.trim(), primary: !data.banks.length || data.banks.find(item => item.id === id)?.primary || false };
    data.banks = id ? data.banks.map(item => item.id === id ? account : item) : [...data.banks, account];
  }, storage);
}
export function primaryBank(email, id, storage = globalThis.localStorage) { return update(email, data => { if (!data.banks.some(item => item.id === id)) throw new Error('Rekening tidak ditemukan.'); data.banks.forEach(item => { item.primary = item.id === id; }); }, storage); }
export function withdraw(email, amount, storage = globalThis.localStorage) {
  amount = Number(amount);
  const bank = getSeller(email, storage).banks.find(item => item.primary);
  if (!bank) throw new Error('Tambahkan rekening pencairan terlebih dahulu.');
  if (!Number.isInteger(amount) || amount <= 0 || amount > earnings(email, storage).available) throw new Error('Jumlah penarikan harus lebih dari nol dan tidak melebihi saldo tersedia.');
  return update(email, data => { data.ledger.push({ id: crypto.randomUUID(), kind: 'withdrawal', amount, bank: `${bank.bank} •••• ${bank.number.slice(-4)}`, title: 'Penarikan saldo demo', at: new Date().toISOString() }); addEvent(data, 'Dana', 'Penarikan demo berhasil', `Saldo contoh ditarik ke ${bank.bank} •••• ${bank.number.slice(-4)}.`, 'seller-pendapatan.html'); }, storage);
}
export function openConversation(email, orderId, storage = globalThis.localStorage) {
  return update(email, data => { if (data.chats.some(chat => chat.orderId === orderId)) return; const order = sellerOrders(email, storage).find(item => item.id === orderId); if (!order) throw new Error('Pesanan tidak ditemukan.'); data.chats.unshift({ id: crypto.randomUUID(), orderId, buyer: order.buyerName || order.shippingAddress?.recipient || 'Buyer', unread: 0, messages: [] }); }, storage);
}
export function readChat(email, id, storage = globalThis.localStorage) { return update(email, data => { const chat = data.chats.find(item => item.id === id); if (chat) chat.unread = 0; }, storage); }
export function sendMessage(email, id, text, storage = globalThis.localStorage) {
  if (!text?.trim() || text.trim().length > 2000) throw new Error('Pesan harus berisi 1–2.000 karakter.');
  return update(email, data => { const chat = data.chats.find(item => item.id === id); if (!chat) throw new Error('Percakapan tidak ditemukan.'); chat.messages.push({ id: crypto.randomUUID(), from: 'seller', text: text.trim(), at: new Date().toISOString() }); }, storage);
}
export function sellerNotifications(email, storage = globalThis.localStorage) {
  const data = getSeller(email, storage);
  const events = sellerOrders(email, storage).flatMap(order => [{ id: 'new-' + order.id, category: 'Pesanan', title: 'Pesanan baru masuk', message: `${order.buyerName || order.shippingAddress?.recipient || 'Buyer'} memesan ${order.items.map(item => item.name).join(', ')}.`, href: `seller-pesanan.html?order=${order.id}`, at: order.createdAt }, ...(order.status === 'Selesai' ? [{ id: 'released-' + order.id, category: 'Dana', title: 'Dana pesanan cair', message: `${order.id} sudah diterima buyer. Saldo demo tersedia untuk ditarik.`, href: 'seller-pendapatan.html', at: order.history?.at(-1)?.at || order.createdAt }] : [])]);
  return [...events, ...data.events].map(item => ({ ...item, read: data.readNotifications.includes(item.id) })).sort((a, b) => new Date(b.at) - new Date(a.at));
}
export function readSellerNotifications(email, ids, storage = globalThis.localStorage) { return update(email, data => { const allowed = new Set(sellerNotifications(email, storage).map(item => item.id)); data.readNotifications = [...new Set([...data.readNotifications, ...ids.filter(id => allowed.has(id))])]; }, storage); }
export function buyerTrips(storage = globalThis.localStorage) {
  const result = [];
  for (let i = 0; i < storage.length; i++) { const key = storage.key(i); if (!key?.startsWith('nitipyuk-seller:')) continue; const data = read(key, null, storage); if (!data?.trips) continue; const email = key.slice('nitipyuk-seller:'.length); for (const trip of data.trips.filter(trip => trip.status === 'open')) result.push({ ...trip, sellerEmail: email, shopId: data.shopId, shopName: data.shop.name, used: occupiedSlots(email, trip.id, storage) }); }
  return result.sort((a, b) => (new Date(b.promotedUntil) > new Date() ? 1 : 0) - (new Date(a.promotedUntil) > new Date() ? 1 : 0));
}
export function publicShop(shopId, storage = globalThis.localStorage) {
  for (let i = 0; i < storage.length; i++) { const key = storage.key(i); if (!key?.startsWith('nitipyuk-seller:')) continue; const data = read(key, null, storage); if (data?.shopId === shopId) return { ...data, email: key.slice('nitipyuk-seller:'.length) }; }
  return null;
}
