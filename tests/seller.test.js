import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequest, buyerConversations, ensureOrderConversation, sendBuyerMessage, reviewRequest, publishRequest, startBuyerConversation } from '../src/lib/requests.js';
import { catalogProducts } from '../src/lib/catalog.js';
import { addToCart, completeOrder, createDraft, getCart, totals } from '../src/lib/store.js';
import { notificationsFor } from '../src/lib/orderStatus.js';
import { buyerTrips, earnings, ensureSeller, getSeller, occupiedSlots, promoteTrip, readChat, saveBank, saveTrip, sellerOrders, sendMessage, setTripStatus, updateSellerOrder, withdraw } from '../src/seller/sellerStore.js';
const user = { email: 'seller@example.test', name: 'Seller Demo', role: 'penitip', shopName: 'Toko Contoh' };
const address = { recipient: 'Buyer Demo', phone: '080000000000', address: 'Alamat contoh' };
function database() { const map = new Map(); return { get length() { return map.size; }, key: index => [...map.keys()][index], getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value), removeItem: key => map.delete(key) }; }
function setup() { const db = database(); const data = ensureSeller(user, db); return { db, data, trip: buyerTrips(db).find(item => item.country === 'Korea Selatan') }; }

test('paid orders open one conversation with the correct seller and remain available after a trip closes', () => {
  const { db, data, trip } = setup(), buyer = { role: 'buyer', email: 'buyer@example.test', name: 'Buyer' };
  createDraft({ email: buyer.email, items: [{ id: 'tas-mini', quantity: 1 }], address, trip }, db);
  const order = completeOrder(buyer.email, 'qris', db);
  const chatId = ensureOrderConversation(buyer, order.id, db);
  assert.equal(ensureOrderConversation(buyer, order.id, db), chatId);
  assert.equal(buyerConversations(buyer.email, db)[0].sellerEmail, user.email);
  assert.equal(buyerConversations(buyer.email, db)[0].orderId, order.id);
  const request = createRequest(buyer, data.shopId, { name: 'Barang tambahan', quantity: 1, tripId: trip.id, chatId }, db);
  assert.equal(request.chatId, chatId);
  assert.equal(getSeller(user.email, db).chats.filter(chat => chat.orderId === order.id).length, 1);
  assert.throws(() => ensureOrderConversation({ ...buyer, email: 'stranger@example.test' }, order.id, db));
  setTripStatus(user.email, trip.id, 'closed', db);
  assert.equal(ensureOrderConversation(buyer, order.id, db), chatId);
  sendBuyerMessage(buyer, user.email, chatId, 'Bagaimana kabar pesanan saya?', db);
  assert.equal(getSeller(user.email, db).chats.find(chat => chat.id === chatId).messages.at(-1).from, 'buyer');
});

test('chat can start without a request and legacy example orders have a named demo seller', () => {
  const { db, data } = setup(), buyer = { role: 'buyer', email: 'buyer@example.test' };
  const id = startBuyerConversation(buyer, data.shopId, db);
  assert.equal(startBuyerConversation(buyer, data.shopId, db), id);
  assert.equal(buyerConversations(buyer.email, db)[0].requests.length, 0);
  createDraft({ email: buyer.email, items: [{ id: 'tas-mini', quantity: 1 }], address }, db);
  const order = completeOrder(buyer.email, 'qris', db);
  const orderChat = ensureOrderConversation(buyer, order.id, db);
  assert.equal(ensureOrderConversation(buyer, order.id, db), orderChat);
  assert.equal(buyerConversations(buyer.email, db).find(chat => chat.id === orderChat).shopName, 'NitipYuk Demo');
});

test('request stays in chat until the seller checks regulations and availability and publishes it', () => {
  const { db, data, trip } = setup(), buyer = { role: 'buyer', email: 'request-buyer@example.test', name: 'Buyer' };
  const { chatId, request } = createRequest(buyer, data.shopId, { name: 'Sunscreen SPF 50', quantity: 2, tripId: trip.id }, db);
  assert.equal(sellerOrders(user.email, db).length, 5);
  assert.equal(catalogProducts(db).length, 3);
  assert.equal(buyerConversations(buyer.email, db)[0].requests[0].status, 'pending');
  assert.equal(buyerConversations('other@example.test', db).length, 0);
  assert.throws(() => publishRequest(user.email, chatId, request.id, { name: request.name, category: 'Skincare', price: 100000 }, db));
  assert.throws(() => reviewRequest(user.email, chatId, request.id, { status: 'approved', regulationsChecked: true, available: false, note: 'Belum ada stok' }, db));
  reviewRequest(user.email, chatId, request.id, { status: 'approved', regulationsChecked: true, available: true, note: 'Boleh dititipkan dan tersedia' }, db);
  const product = publishRequest(user.email, chatId, request.id, { name: request.name, category: 'Skincare', price: 100000 }, db);
  assert.equal(catalogProducts(db).at(-1).sellerEmail, user.email);
  assert.equal(buyerConversations(buyer.email, db)[0].requests[0].status, 'published');
  assert.throws(() => publishRequest(user.email, chatId, request.id, { name: request.name, category: 'Skincare', price: 100000 }, db));
  assert.throws(() => createDraft({ email: buyer.email, items: [{ id: product.id, quantity: 2 }], address }, db));
  createDraft({ email: buyer.email, items: [{ id: product.id, quantity: 2 }], address, trip }, db);
  const order = completeOrder(buyer.email, 'qris', db);
  assert.equal(order.pricing.total, 235000);
  assert.equal(sellerOrders(user.email, db).length, 6);
});

test('rejected requests cannot be published; conversations and requests stay with their seller and buyer', () => {
  const { db, data, trip } = setup(), buyer = { role: 'buyer', email: 'buyer@example.test' };
  const { chatId, request } = createRequest(buyer, data.shopId, { name: 'Barang contoh', quantity: 1, tripId: trip.id }, db);
  const other = ensureSeller({ ...user, email: 'other@example.test' }, db);
  assert.throws(() => createRequest(buyer, other.shopId, { name: 'Barang', quantity: 1, tripId: trip.id }, db));
  assert.throws(() => reviewRequest('other@example.test', chatId, request.id, { status: 'approved', regulationsChecked: true, available: true, note: 'ok' }, db));
  assert.throws(() => sendBuyerMessage({ ...buyer, email: 'stranger@example.test' }, user.email, chatId, 'Hi', db));
  sendBuyerMessage(buyer, user.email, chatId, 'Apakah stok ada?', db);
  assert.equal(getSeller(user.email, db).chats[0].messages.length, 2);
  reviewRequest(user.email, chatId, request.id, { status: 'rejected', note: 'Tidak tersedia' }, db);
  assert.throws(() => publishRequest(user.email, chatId, request.id, { name: request.name, category: 'Lainnya', price: 100000 }, db));
  assert.equal(catalogProducts(db).length, 3);
});

test('seller demo persists one store per account and balances match its transactions', () => {
  const { db, data } = setup();
  assert.equal(ensureSeller(user, db).shopId, data.shopId);
  assert.throws(() => ensureSeller({ ...user, role: 'buyer' }, db));
  assert.equal(earnings(user.email, db).available, 528000);
  assert.equal(earnings(user.email, db).held, 1443000);
  assert.equal(sellerOrders('other@example.test', db).length, 0);
});
test('trip editor rejects reversed dates and capacity below reservations; promotion debits once', () => {
  const { db, trip } = setup();
  assert.throws(() => saveTrip(user.email, { ...trip, returnDate: '2026-01-01' }, trip.id, db));
  assert.throws(() => saveTrip(user.email, { ...trip, capacity: 1 }, trip.id, db));
  saveTrip(user.email, { ...trip, shipping: 25000, title: 'Trip diperbarui' }, trip.id, db);
  assert.equal(buyerTrips(db).find(item => item.id === trip.id).shipping, 25000);
  promoteTrip(user.email, trip.id, db);
  assert.equal(earnings(user.email, db).available, 498000);
  assert.throws(() => promoteTrip(user.email, trip.id, db));
  assert.equal(earnings(user.email, db).available, 498000);
});
test('buyer trip checkout uses per-item shipping and seller status updates reach the buyer', () => {
  const { db, trip } = setup();
  const draft = createDraft({ email: 'buyer@example.test', items: [{ id: 'serum-wajah', quantity: 2 }], address, trip }, db);
  assert.equal(totals(draft.items, draft.trip).shipping, 30000);
  const order = completeOrder('buyer@example.test', 'qris', db);
  assert.equal(order.sellerEmail, user.email);
  assert.equal(occupiedSlots(user.email, trip.id, db), 5);
  assert.throws(() => updateSellerOrder('other@example.test', order.id, 'Dalam perjalanan', db));
  assert.throws(() => updateSellerOrder(user.email, order.id, 'Selesai', db));
  updateSellerOrder(user.email, order.id, 'Dalam perjalanan', db);
  updateSellerOrder(user.email, order.id, 'Dalam pengantaran', db);
  updateSellerOrder(user.email, order.id, 'Selesai', db);
  assert.equal(notificationsFor('buyer@example.test', db).length, 4);
  assert.equal(earnings(user.email, db).available, 900000);
});
test('closed or full trips reject stale checkout drafts without adding orders', () => {
  const { db, trip } = setup();
  assert.throws(() => createDraft({ email: 'buyer@example.test', items: [{ id: 'tas-mini', quantity: 20 }], address, trip }, db));
  createDraft({ email: 'buyer@example.test', items: [{ id: 'tas-mini', quantity: 1 }], address, trip }, db);
  setTripStatus(user.email, trip.id, 'closed', db);
  assert.throws(() => completeOrder('buyer@example.test', 'qris', db));
  assert.equal(sellerOrders(user.email, db).length, 5);
});
test('trip cart checkout does not remove the same product from other trips', () => {
  const { db, trip } = setup();
  addToCart('tas-mini', db); addToCart('tas-mini', db, trip);
  createDraft({ email: 'buyer@example.test', items: [{ id: 'tas-mini', quantity: 1 }], address, trip, fromCart: true }, db);
  completeOrder('buyer@example.test', 'bca', db);
  assert.deepEqual(getCart(db), [{ id: 'tas-mini', quantity: 1, selected: true }]);
});
test('bank validation and simulated payouts prevent overspending', () => {
  const { db } = setup();
  assert.throws(() => withdraw(user.email, 1, db));
  assert.throws(() => saveBank(user.email, { bank: 'BCA', holder: 'Demo', number: 'invalid' }, null, db));
  saveBank(user.email, { bank: 'BCA', holder: 'Demo', number: '000000001234' }, null, db);
  assert.throws(() => withdraw(user.email, 528001, db));
  withdraw(user.email, 100000, db);
  assert.equal(earnings(user.email, db).available, 428000);
  assert.equal(getSeller(user.email, db).ledger.at(-1).bank, 'BCA •••• 1234');
});
test('chat replies persist and read state clears without cross-account conversation access', () => {
  const { db, data } = setup(); const id = data.chats[0].id;
  readChat(user.email, id, db); sendMessage(user.email, id, '  Sudah dibelikan ya kak.  ', db);
  assert.equal(getSeller(user.email, db).chats[0].unread, 0);
  assert.equal(getSeller(user.email, db).chats[0].messages.at(-1).text, 'Sudah dibelikan ya kak.');
  assert.throws(() => sendMessage(user.email, id, '   ', db));
  const second = { ...user, email: 'second@example.test' }; ensureSeller(second, db);
  assert.throws(() => sendMessage(second.email, id, 'No access', db));
});

test('legacy cart checkout also preserves unselected trip-specific copies of the same product', () => {
  const { db, trip } = setup();
  addToCart('tas-mini', db); addToCart('tas-mini', db, trip);
  createDraft({ email: 'buyer@example.test', items: [{ id: 'tas-mini', quantity: 1 }], address, fromCart: true }, db);
  completeOrder('buyer@example.test', 'qris', db);
  assert.equal(getCart(db).length, 1);
  assert.equal(getCart(db)[0].tripId, trip.id);
});
