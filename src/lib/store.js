import { catalogProducts } from './catalog.js';

export const money = value => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
export const productById = (id, storage = globalThis.localStorage) => catalogProducts(storage).find(product => product.id === id);
export const accountKey = (name, email) => `nitipyuk-${name}:${String(email).toLowerCase()}`;
export function read(key, fallback, storage = globalThis.localStorage) {
  try { const value = JSON.parse(storage.getItem(key)); return value ?? fallback; } catch { return fallback; }
}
export function list(key, storage = globalThis.localStorage) {
  const value = read(key, [], storage);
  return Array.isArray(value) ? value : [];
}
export function write(key, value, storage = globalThis.localStorage) {
  storage.setItem(key, JSON.stringify(value));
}
export function validQuantity(value) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 99;
}
export function getCart(storage = globalThis.localStorage) {
  return list('nitipyuk-cart', storage).filter(item => productById(item.id, storage) && validQuantity(item.quantity));
}
export const cartItemKey = item => `${item.id}:${item.tripId || ""}`;
export function addToCart(id, storage = globalThis.localStorage, trip = null) {
  const product = productById(id, storage);
  if (!product) throw new Error('Produk tidak ditemukan.');
  if (product.tripId && (product.tripId !== trip?.id || product.sellerEmail !== trip?.sellerEmail)) throw new Error('Pilih trip milik seller produk ini.');
  const cart = getCart(storage);
  const existing = cart.find(item => item.id === id && (item.tripId || "") === (trip?.id || ""));
  if (existing) { existing.quantity = Math.min(99, existing.quantity + 1); existing.selected = true; }
  else cart.push({ id, quantity: 1, selected: true, ...(trip ? { tripId: trip.id, sellerEmail: trip.sellerEmail, tripTitle: trip.title } : {}) });
  write('nitipyuk-cart', cart, storage);
  return cart;
}
export const totals = (items, trip = null) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = trip ? items.reduce((sum, item) => sum + item.quantity, 0) * trip.shipping : items.length ? 15000 : 0;
  const service = items.length ? 5000 : 0;
  return { subtotal, shipping, service, total: subtotal + shipping + service };
};
export function snapshotItems(items, storage = globalThis.localStorage) {
  if (!items.length || items.some(item => !productById(item.id, storage) || !validQuantity(item.quantity))) throw new Error('Periksa barang dan jumlah pesanan (1–99).');
  return items.map(item => ({ ...productById(item.id, storage), quantity: Number(item.quantity) }));
}
export function createDraft({ email, items, address, notes, fromCart, trip }, storage = globalThis.localStorage) {
  if (!email || !address?.address?.trim() || !address?.recipient?.trim() || !address?.phone?.trim()) throw new Error('Lengkapi alamat pengiriman terlebih dahulu.');
  const snapshots = snapshotItems(items, storage);
  if (!trip && snapshots.some(item => item.tripId)) throw new Error('Pilih trip seller untuk barang ini.');
  const tripSnapshot = trip ? validateTrip(items, trip, storage) : null;
  const draft = { trip: tripSnapshot, id: crypto.randomUUID(), userEmail: email, items: snapshots, address: { ...address }, notes, fromCart, createdAt: new Date().toISOString() };
  write(accountKey('checkout', email), draft, storage);
  return draft;
}
export function completeOrder(email, method, storage = globalThis.localStorage) {
  const draft = read(accountKey('checkout', email), null, storage);
  if (!draft || draft.userEmail.toLowerCase() !== email.toLowerCase()) throw new Error('Tidak ada checkout aktif. Silakan lengkapi form titipan.');
  if (!['qris', 'bca', 'bni', 'mandiri'].includes(method)) throw new Error('Pilih metode pembayaran.');
  const orders = list('nitipyuk-orders', storage);
  const existing = orders.find(order => order.draftId === draft.id);
  if (existing) return existing;
  if (draft.trip) validateTrip(draft.items, draft.trip, storage);
  const order = { ...(draft.trip ? { sellerEmail: draft.trip.sellerEmail, tripId: draft.trip.id, tripTitle: draft.trip.title } : {}), buyerName: draft.address.recipient, id: 'NY-' + crypto.randomUUID().slice(0, 8).toUpperCase(), draftId: draft.id, userEmail: email, items: draft.items, shippingAddress: draft.address, notes: draft.notes, paymentMethod: method, pricing: totals(draft.items, draft.trip), status: 'Dikonfirmasi', paymentStatus: 'Dikonfirmasi (simulasi)', createdAt: new Date().toISOString() };
  write('nitipyuk-orders', [...orders, order], storage);
  if (draft.fromCart) {
    const cart = getCart(storage).flatMap(item => {
      const purchased = draft.items.find(product => product.id === item.id && ((item.tripId || "") === (draft.trip?.id || "")));
      if (!purchased) return [item];
      const quantity = item.quantity - purchased.quantity;
      return quantity > 0 ? [{ ...item, quantity }] : [];
    });
    write('nitipyuk-cart', cart, storage);
  }
  storage.removeItem(accountKey('checkout', email));
  storage.removeItem(accountKey('form', email));
  return order;
}
export const paymentMethods = [
  { id: 'bca', name: 'BCA Virtual Account', type: 'Virtual account transfer' },
  { id: 'bni', name: 'BNI Virtual Account', type: 'Virtual account transfer' },
  { id: 'mandiri', name: 'Mandiri Virtual Account', type: 'Virtual account transfer' },
  { id: 'qris', name: 'QRIS', type: 'QRIS' },
];
export const paymentName = id => paymentMethods.find(method => method.id === id)?.name || id;

function validateTrip(items, requested, storage) {
  const data = read(accountKey('seller', requested.sellerEmail), null, storage);
  const trip = data?.trips?.find(item => item.id === requested.id);
  if (!trip || trip.status !== 'open') throw new Error('Trip tidak lagi dibuka. Pilih trip lainnya.');
  const orders = [...(data.orders || []), ...list('nitipyuk-orders', storage).filter(order => order.sellerEmail?.toLowerCase() === requested.sellerEmail.toLowerCase())];
  const used = orders.filter(order => order.tripId === trip.id && order.status !== 'Dibatalkan').reduce((sum, order) => sum + order.items.reduce((count, item) => count + item.quantity, 0), 0);
  if (items.some(item => { const product = productById(item.id, storage); return product?.country !== trip.country || product?.tripId && (product.tripId !== trip.id || product.sellerEmail !== requested.sellerEmail.toLowerCase()); })) throw new Error('Pilih barang dari katalog seller dan negara tujuan trip ini.');
  if (used + items.reduce((sum, item) => sum + Number(item.quantity), 0) > trip.capacity) throw new Error('Slot trip tidak cukup. Kurangi jumlah barang atau pilih trip lain.');
  return { id: trip.id, title: trip.title, country: trip.country, shipping: trip.shipping, arrival: trip.arrival, customs: trip.customs, sellerEmail: requested.sellerEmail, shopId: data.shopId, shopName: data.shop.name };
}
