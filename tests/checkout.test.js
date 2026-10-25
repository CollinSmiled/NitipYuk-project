import test from 'node:test';
import assert from 'node:assert/strict';
import { accountKey, addToCart, completeOrder, createDraft, getCart, read, totals, write } from '../src/lib/store.js';
function storage() { const values = new Map(); return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) }; }
const email = 'demo@example.com';
const address = { id: 'home', label: 'Rumah', recipient: 'Demo', phone: '081234567890', address: 'Alamat contoh' };
test('adding the same product increases quantity and ignores invalid persisted cart entries', () => {
  const db = storage();
  write('nitipyuk-cart', [{ id: 'unknown', quantity: 1 }, { id: 'tas-mini', quantity: -1 }], db);
  addToCart('tas-mini', db); addToCart('tas-mini', db);
  assert.deepEqual(getCart(db), [{ id: 'tas-mini', quantity: 2, selected: true }]);
});
test('draft snapshots quantities, address, and exact total without creating an order', () => {
  const db = storage();
  const draft = createDraft({ email, items: [{ id: 'tas-mini', quantity: 2 }, { id: 'camilan-jepang', quantity: 1 }], address, notes: 'Biru', fromCart: true }, db);
  assert.equal(totals(draft.items).total, 1005000);
  assert.equal(read('nitipyuk-orders', [], db).length, 0);
  address.label = 'Updated';
  assert.equal(draft.address.label, 'Rumah');
});
test('checkout rejects missing address, invalid quantities, and invalid payment methods', () => {
  const db = storage();
  assert.throws(() => createDraft({ email, items: [{ id: 'tas-mini', quantity: 0 }], address }, db));
  assert.throws(() => createDraft({ email, items: [{ id: 'tas-mini', quantity: 1 }], address: null }, db));
  createDraft({ email, items: [{ id: 'tas-mini', quantity: 1 }], address }, db);
  assert.throws(() => completeOrder(email, '', db));
  assert.equal(read('nitipyuk-orders', [], db).length, 0);
});
test('confirmation saves an order and only removes purchased quantities from the cart', () => {
  const db = storage();
  write('nitipyuk-cart', [{ id: 'tas-mini', quantity: 3, selected: true }, { id: 'serum-wajah', quantity: 1, selected: false }], db);
  createDraft({ email, items: [{ id: 'tas-mini', quantity: 2 }], address, notes: '', fromCart: true }, db);
  const order = completeOrder(email, 'qris', db);
  assert.equal(order.pricing.total, 920000);
  assert.equal(read('nitipyuk-orders', [], db).length, 1);
  assert.equal(getCart(db)[0].quantity, 1);
  assert.equal(getCart(db)[1].selected, false);
  assert.equal(read(accountKey('checkout', email), null, db), null);
  assert.throws(() => completeOrder(email, 'qris', db));
  assert.equal(read('nitipyuk-orders', [], db).length, 1);
});
test('buy now keeps cart intact and drafts are isolated by account', () => {
  const db = storage(); addToCart('tas-mini', db);
  createDraft({ email, items: [{ id: 'serum-wajah', quantity: 1 }], address, fromCart: false }, db);
  assert.throws(() => completeOrder('someone@example.com', 'bca', db));
  completeOrder(email, 'bca', db);
  assert.equal(getCart(db)[0].id, 'tas-mini');
});
