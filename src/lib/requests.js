import { accountKey, list, read, write, validQuantity } from './store.js';
import { buyerTrips, getSeller, publicShop } from '../seller/sellerStore.js';

export const requestLabels = { pending: 'Menunggu pengecekan', approved: 'Lolos pengecekan', rejected: 'Tidak bisa dititipkan', published: 'Sudah masuk katalog' };

export function createRequest(buyer, shopId, values, storage = globalThis.localStorage) {
  const shop = publicShop(shopId, storage);
  const trip = buyerTrips(storage).find(item => item.id === values.tripId && item.shopId === shopId);
  if (buyer?.role !== 'buyer' || !buyer.email) throw new Error('Masuk sebagai Buyer untuk mengirim request.');
  if (!shop || !trip) throw new Error('Pilih jastiper dengan trip yang masih dibuka.');
  if (shop.email === buyer.email.toLowerCase()) throw new Error('Pilih toko jastiper lain.');
  if (!values.name?.trim() || values.name.length > 150 || !validQuantity(values.quantity)) throw new Error('Isi nama barang dan jumlah 1–99.');
  if (values.link && !/^https?:\/\/\S+$/i.test(values.link)) throw new Error('Link barang harus menggunakan http atau https.');
  const data = getSeller(shop.email, storage);
  const request = { id: crypto.randomUUID(), name: values.name.trim(), quantity: Number(values.quantity), link: values.link || '', notes: (values.notes || '').trim().slice(0, 2000), tripId: trip.id, status: 'pending', createdAt: new Date().toISOString() };
  let chat = data.chats.find(item => item.buyerEmail === buyer.email.toLowerCase() && !item.orderId);
  if (!chat) { chat = { id: crypto.randomUUID(), buyer: buyer.name || buyer.email.split('@')[0], buyerEmail: buyer.email.toLowerCase(), unread: 0, buyerUnread: 0, messages: [], requests: [] }; data.chats.unshift(chat); }
  chat.requests ||= [];
  chat.requests.push(request);
  chat.messages.push({ id: crypto.randomUUID(), from: 'buyer', text: `Request barang: ${request.name} ×${request.quantity}${request.link ? '\n' + request.link : ''}${request.notes ? '\n' + request.notes : ''}`, at: request.createdAt });
  chat.unread += 1;
  write(accountKey('seller', shop.email), data, storage);
  return { chatId: chat.id, request };
}

export function buyerConversations(email, storage = globalThis.localStorage) {
  const chats = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key?.startsWith('nitipyuk-seller:')) continue;
    const data = read(key, null, storage);
    for (const chat of data?.chats || []) if (chat.buyerEmail === email.toLowerCase()) chats.push({ ...chat, shopId: data.shopId, shopName: data.shop.name, sellerEmail: key.slice('nitipyuk-seller:'.length) });
  }
  return chats;
}

export function sendBuyerMessage(buyer, sellerEmail, chatId, text, storage = globalThis.localStorage) {
  if (buyer?.role !== 'buyer' || !text?.trim() || text.length > 2000) throw new Error('Isi pesan 1–2.000 karakter.');
  const data = getSeller(sellerEmail, storage), chat = data.chats.find(item => item.id === chatId && item.buyerEmail === buyer.email.toLowerCase());
  if (!chat) throw new Error('Percakapan tidak ditemukan.');
  chat.messages.push({ id: crypto.randomUUID(), from: 'buyer', text: text.trim(), at: new Date().toISOString() });
  chat.unread += 1;
  write(accountKey('seller', sellerEmail), data, storage);
}

export function reviewRequest(email, chatId, requestId, values, storage = globalThis.localStorage) {
  const data = getSeller(email, storage), chat = data.chats.find(item => item.id === chatId), request = chat?.requests?.find(item => item.id === requestId);
  if (!request || request.status === 'published') throw new Error('Request tidak dapat diubah.');
  if (!['approved', 'rejected'].includes(values.status)) throw new Error('Pilih hasil pengecekan.');
  if (values.status === 'approved' && (!values.regulationsChecked || !values.available)) throw new Error('Konfirmasi regulasi dan ketersediaan sebelum menyetujui.');
  if (!values.note?.trim()) throw new Error('Tulis hasil pengecekan untuk buyer.');
  Object.assign(request, { ...values, reviewedAt: new Date().toISOString() });
  chat.messages.push({ id: crypto.randomUUID(), from: 'seller', text: `${requestLabels[request.status]}: ${request.name}. ${values.note.trim()}`, at: request.reviewedAt });
  chat.buyerUnread = (chat.buyerUnread || 0) + 1;
  write(accountKey('seller', email), data, storage);
}

export function publishRequest(email, chatId, requestId, values, storage = globalThis.localStorage) {
  const data = getSeller(email, storage), chat = data.chats.find(item => item.id === chatId), request = chat?.requests?.find(item => item.id === requestId);
  if (!request || request.status !== 'approved' || !request.regulationsChecked || !request.available) throw new Error('Request harus lolos pengecekan regulasi dan stok terlebih dahulu.');
  const trip = buyerTrips(storage).find(item => item.id === request.tripId && item.sellerEmail === email.toLowerCase());
  if (!trip) throw new Error('Trip sudah ditutup. Buka trip sebelum menerbitkan barang.');
  if (!values.name?.trim() || !Number.isInteger(Number(values.price)) || Number(values.price) <= 0 || Number(values.price) > 100000000 || !['Fashion', 'Makanan', 'Skincare', 'Lainnya'].includes(values.category)) throw new Error('Lengkapi nama, kategori, dan harga barang yang valid.');
  const product = { id: 'request-' + request.id, requestId, sellerEmail: email.toLowerCase(), shopId: data.shopId, shopName: data.shop.name, tripId: trip.id, country: trip.country, flag: '', name: values.name.trim().slice(0, 150), category: values.category, price: Number(values.price), image: { Fashion: 'element/bag.jpg', Makanan: 'element/snack.jpg', Skincare: 'element/skincare.jpg', Lainnya: 'element/shopping.png' }[values.category] };
  const catalog = list('nitipyuk-catalog', storage);
  write('nitipyuk-catalog', [...catalog, product], storage);
  request.status = 'published'; request.productId = product.id;
  chat.messages.push({ id: crypto.randomUUID(), from: 'seller', text: `${product.name} sudah tersedia di katalog toko. Silakan cek harga dan checkout dari katalog.`, at: new Date().toISOString() });
  chat.buyerUnread = (chat.buyerUnread || 0) + 1;
  write(accountKey('seller', email), data, storage);
  return product;
}
