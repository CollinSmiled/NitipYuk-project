import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cpSync } from 'node:fs';
import { resolve } from 'node:path';

const reactPages = ['NitipYuk.html', 'produk.html', 'keranjang.html', 'form.html', 'payment.html', 'profil.html', 'alamat.html', 'pesanan.html', 'notif.html', 'berhasil.html', 'profile.html', "seller.html", "seller-trip.html", "seller-pesanan.html", "seller-pendapatan.html", "seller-pesan.html", "seller-notif.html", "seller-profil.html", "seller-toko.html", "seller-rekening.html", "toko.html"];
const legacyAuthFiles = ['login.html', 'register.html', 'login.css', 'register.css', 'NitipYuk.css', 'register.js', 'authentication.js'];
export default defineConfig({
  plugins: [react(), {
    name: 'react-pages-and-legacy-auth',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const url = new URL(request.url, 'http://localhost');
        if (reactPages.includes(url.pathname.slice(1))) request.url = '/index.html' + url.search;
        next();
      });
    },
    closeBundle() {
      const root = process.cwd();
      // Publish only the remaining auth pages and their dependencies.
      for (const file of legacyAuthFiles) cpSync(resolve(root, file), resolve(root, 'dist', file));
      for (const page of reactPages) cpSync(resolve(root, 'dist/index.html'), resolve(root, 'dist', page));
      cpSync(resolve(root, 'element'), resolve(root, 'dist/element'), { recursive: true });
    },
  }],
});
