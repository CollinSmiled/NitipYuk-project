# NitipYuk React version

React + Vite migration on `react-version`. See [DEPLOYMENT.md](DEPLOYMENT.md) for Vercel setup using the CollinSmiled fork.

## Run

```sh
npm install
npm run dev
```

Use the URL printed by Vite. The current development server uses http://127.0.0.1:5174/.

```sh
npm test
npm run build
npm run preview
```

## Pages and flow

- `/` and `/NitipYuk.html`: homepage with search, category/country filters, carousel, and two product actions.
- `/produk.html`: catalogue; add to cart or open the titipan form directly.
- `/keranjang.html`: selected items, quantities, removal, per-item totals, and multi-product checkout.
- `/form.html?barang=tas-mini`: buy-now form. `/form.html?cart=1` checks out selected cart items.
- `/alamat.html`: add, edit, delete, and choose a primary delivery address; saved addresses also appear on the profile. Checkout opens this page in address-selection mode.
- `/payment.html`: order breakdown, BCA/BNI/Mandiri virtual account or QRIS selection, and sample confirmation.
- `/profil.html`: editable profile, photo, order counts, and saved preferred payment method.
- `/pesanan.html`: illustrated order cards, a four-stage tracking timeline, delivery details, and payment totals. Expand the demo controls to simulate international travel, delivery, and receipt.
- `/notif.html`: per-account order notifications with unread badges, read/unread filters, and links to the relevant order.
- `/berhasil.html?order=...`: a reloadable success page for a confirmed order.
- `/profile.html`: alias of `/profil.html`.

Vite serves the React entry point for these `.html` paths. The build writes corresponding HTML entry files into `dist/`. Login and registration retain their original HTML with updated return destinations.

## Local demo data

The existing demo login accepts a Gmail address and a nonempty password; no password is saved or validated by a server. A Buyer account is required for checkout. Payment is a local simulation: there is no bank integration, transfer, QR charge, or real payment confirmation. Shipping is a sample Rp15,000 and the service fee is Rp5,000 per order.

Cart data uses `nitipyuk-cart`; completed orders use `nitipyuk-orders`. Addresses, checkout drafts, and payment preferences are stored per email in localStorage. Orders are filtered by email. This is browser-local demo persistence, not production authentication or account security.

Checkout follows item details → address selection → payment → success. Orders are only saved after payment confirmation. Buy-now leaves the cart unchanged. Cart checkout removes only purchased quantities and retains unselected products. Reloading or revisiting payment cannot duplicate a completed checkout.

## Sources and structure

- `src/components/`: shared navigation and homepage sections.
- `src/pages/`: cart, form, payment, addresses, profile, and orders.
- `src/lib/store.js`: storage, price calculations, cart operations, and order confirmation.
- `src/products.js`: shared sample product catalogue.
- `tests/checkout.test.js`: cart, totals, validation, and confirmation regression checks.
- `element/PHOTO-SOURCES.md`: photo source pages and license information.

The implementation follows the requested two-button, cart-table, and payment-summary layouts from the supplied revision document while retaining NitipYuk's plum color palette. Original static page sources remain in the repository for reference; the React routes replace them when served by Vite or from the production build.

## Added revision requirements

All shared navigation bars link the cart icon to `keranjang.html` and the bell to `notif.html`. Profile shows saved addresses with add/edit links. Order status events generate in-app notifications; this demo does not request browser push permissions or send external notifications.

Logout returns to the guest homepage, clears active checkout details, and hides account orders and notifications. Guest product purchase links open login with a safe local return path. Addresses, profile details, payment preference, completed orders, and notification read state remain available when the same demo email logs in again. These are local demo behaviors, not server-backed account verification.

## Seller area

Select **Seller / Penjual** on the login page, or register with the seller role. Seller accounts open a dedicated dashboard and navigation inspired by the supplied reference screenshots.

- `seller.html`: summary cards, latest orders, and active trips.
- `seller-trip.html`: trip filters, create/edit modal, trip state, capacity, per-item shipping, and a simulated 7-day promotion.
- `seller-pesanan.html`: incoming orders, buyer/ID search, status filters, timeline updates, and buyer chat links.
- `seller-pendapatan.html`: available/held/released balances, 5% product commission, transaction filters, and simulated withdrawals.
- `seller-pesan.html`: local conversation list, unread counts, quick replies, and persisted replies.
- `seller-notif.html`: account-scoped order, funds, review, and trip notifications with read state.
- `seller-profil.html`, `seller-toko.html`, `seller-rekening.html`: personal details/photo, store profile and policies, and bank preferences.
- `toko.html?shop=...`: public-view store preview with currently open trips.

A new seller account gets an explicitly labeled set of sample orders, trips, reviews, conversations, and ledger entries. Profiles and operational data are stored under `nitipyuk-seller:<email>` in the browser. No real bank transfers, external messages, identity verification, or server-backed password changes are performed.

Open trips from seller accounts in the same browser appear in buyer recommendations. Buying from a specific trip retains its seller and trip through the cart/form/address/payment flow, uses the trip's per-item shipping fee, and creates an order visible to that seller. Capacity and availability are checked again at confirmation. Each checkout groups products from one trip; unselected cart items and the same product from other trips are preserved.

Seller status updates to those local buyer orders also update buyer tracking and notifications. The earnings ledger releases demo proceeds only after an order reaches `Selesai`. Cross-device/multi-user synchronization would require a backend.

## Request barang melalui chat

Buyer memilih jastiper/trip di `request.html` dan mengirim nama, jumlah, link referensi, serta varian sebagai pesan pertama. `chat.html` menyimpan percakapan dan menampilkan hasil pengecekan. Request belum menjadi pesanan dan belum dapat dibeli.

Seller membuka `seller-pesan.html`, memeriksa regulasi dan ketersediaan, lalu menyetujui atau menolak disertai catatan. Penerbitan diblokir sebelum kedua pengecekan dikonfirmasi. Request yang disetujui bisa ditambahkan ke katalog dengan nama, kategori, dan harga. Foto kategori dipakai sebagai ilustrasi. Halaman `seller-katalog.html` menampilkan barang yang sudah diterbitkan; buyer mendapatkan link katalog melalui chat dan dapat melanjutkan checkout biasa. Barang terikat pada seller dan trip asalnya.

Navbar buyer dan seller tetap terlihat saat scroll. Untuk pengujian demo, bergantian login Buyer dan Seller menggunakan browser yang sama; backend tetap diperlukan untuk chat lintas perangkat.
