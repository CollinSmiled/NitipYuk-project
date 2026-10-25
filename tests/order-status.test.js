import test from 'node:test';
import assert from 'node:assert/strict';
import { accountKey, createDraft, completeOrder, read, write } from '../src/lib/store.js';
import { advanceOrder, logout, markNotificationsRead, notificationsFor, ordersFor, orderStep } from '../src/lib/orderStatus.js';
const email = 'demo@example.com';
function database() { const data = new Map(); return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) }; }
function order(db) { createDraft({ email, items: [{ id: 'tas-mini', quantity: 1 }], address: { recipient: 'Demo', phone: '080000000000', address: 'Alamat uji' } }, db); return completeOrder(email, 'qris', db); }

test('confirmation generates one account-scoped unread notification with persisted read state', () => {
  const db = database(); const saved = order(db);
  assert.equal(notificationsFor(email, db).length, 1);
  assert.equal(notificationsFor('other@example.com', db).length, 0);
  markNotificationsRead(email, [`${saved.id}:0`, 'unrelated'], db);
  assert.equal(notificationsFor(email.toUpperCase(), db)[0].read, true);
  assert.deepEqual(read(accountKey('read-notifications', email), [], db), [`${saved.id}:0`]);
});
test('tracking advances through all four states and generates one notification per event', () => {
  const db = database(); const saved = order(db);
  for (let step = 1; step <= 3; step++) assert.equal(orderStep(advanceOrder(email, saved.id, db)), step);
  assert.equal(advanceOrder(email, saved.id, db).status, 'Selesai');
  assert.equal(notificationsFor(email, db).length, 4);
  assert.equal(ordersFor(email, db).length, 1);
  assert.throws(() => advanceOrder('other@example.com', saved.id, db));
});
test('logout clears active account and checkout while keeping profile, addresses and orders', () => {
  const db = database(); order(db);
  write('nitipyuk-user', { email, name: 'Demo', role: 'buyer' }, db);
  write(accountKey('form', email), { notes: 'unfinished' }, db);
  write(accountKey('checkout', email), { id: 'pending' }, db);
  write(accountKey('addresses', email), [{ id: 'address' }], db);
  logout(db);
  assert.equal(read('nitipyuk-user', null, db), null);
  assert.equal(read(accountKey('checkout', email), null, db), null);
  assert.equal(read(accountKey('form', email), null, db), null);
  assert.equal(read(accountKey('profile', email), null, db).name, 'Demo');
  assert.equal(ordersFor(email, db).length, 1);
  assert.equal(read(accountKey('addresses', email), [], db).length, 1);
});
