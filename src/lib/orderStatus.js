import { accountKey, list, read, write } from './store.js';

export const trackingSteps = ['Pesanan dikonfirmasi', 'Perjalanan internasional', 'Dalam pengantaran', 'Pesanan diterima'];
const statuses = ['Dikonfirmasi', 'Dalam perjalanan', 'Dalam pengantaran', 'Selesai'];
export function ordersFor(email, storage = globalThis.localStorage) {
  if (!email) return [];
  return list('nitipyuk-orders', storage).filter(order => order.userEmail?.toLowerCase() === email.toLowerCase());
}
export function orderStep(order) {
  const index = statuses.indexOf(order.status);
  return index < 0 ? 0 : index;
}
export function advanceOrder(email, id, storage = globalThis.localStorage) {
  const orders = list('nitipyuk-orders', storage);
  const order = orders.find(item => item.id === id && item.userEmail?.toLowerCase() === email.toLowerCase());
  if (!order) throw new Error('Pesanan tidak ditemukan.');
  const previous = orderStep(order);
  if (previous === 3) return order;
  const step = previous + 1;
  order.history = [...(order.history || [{ step: previous, at: order.createdAt }]), { step, at: new Date().toISOString() }];
  order.status = statuses[step];
  write('nitipyuk-orders', orders, storage);
  return order;
}
export function notificationsFor(email, storage = globalThis.localStorage) {
  const readIds = new Set(list(accountKey('read-notifications', email), storage));
  return ordersFor(email, storage).flatMap(order => {
    const events = order.history?.length ? order.history : [{ step: orderStep(order), at: order.createdAt }];
    return events.map(event => ({
      id: `${order.id}:${event.step}`, orderId: order.id, title: trackingSteps[event.step],
      message: event.step === 3 ? 'Titipanmu sudah diterima. Terima kasih sudah menggunakan NitipYuk.' : event.step === 0 ? 'Pembayaran demo dikonfirmasi. Titipanmu sudah tercatat dan siap diproses.' : `Status titipanmu diperbarui: ${trackingSteps[event.step].toLowerCase()}.`,
      image: order.items?.[0]?.image || 'element/logoNitipYuk.png',
      product: order.items?.map(item => item.name).join(', ') || order.itemName,
      at: event.at, read: readIds.has(`${order.id}:${event.step}`),
    }));
  }).sort((a, b) => new Date(b.at) - new Date(a.at));
}
export function markNotificationsRead(email, ids, storage = globalThis.localStorage) {
  const valid = new Set(notificationsFor(email, storage).map(item => item.id));
  const next = new Set(list(accountKey('read-notifications', email), storage));
  ids.filter(id => valid.has(id)).forEach(id => next.add(id));
  write(accountKey('read-notifications', email), [...next], storage);
}
export function logout(storage = globalThis.localStorage) {
  const user = read('nitipyuk-user', null, storage);
  if (user?.email) {
    try { write(accountKey('profile', user.email), user, storage); } catch { /* Logout remains available when storage is full. */ }
    storage.removeItem(accountKey('checkout', user.email));
    storage.removeItem(accountKey('form', user.email));
  }
  storage.removeItem('nitipyuk-user');
}
