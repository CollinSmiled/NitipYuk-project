import { products } from '../products.js';

export function catalogProducts(storage = globalThis.localStorage) {
  let published = [];
  try { published = JSON.parse(storage?.getItem('nitipyuk-catalog') || '[]'); } catch { /* Keep the example catalogue available. */ }
  return [...products, ...(Array.isArray(published) ? published : [])];
}
