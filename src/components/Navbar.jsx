import { useEffect, useState } from 'react';
import { logout } from '../lib/orderStatus';

export default function Navbar({ onSearch, user, cartCount, page, unreadCount }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = event => { if (event.key === 'Escape') setMenuOpen(false); };
    const onResize = () => { if (window.innerWidth > 900) setMenuOpen(false); };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [menuOpen]);

  const displayName = user?.name || user?.email?.split("@")[0] || "Masuk / Daftar";

  return (
    <>
      <nav className={`navbar${menuOpen ? ' is-menu-open' : ''}`} aria-label="Navigasi utama">
        <a className="brand" href="/">
          <span className="brand-icon">
            <img src="element/logoNitipYuk.png" alt="Logo NitipYuk" />
          </span>
          <span className="brand-text"><strong>NitipYuk</strong></span>
        </a>

        <form className="search" role="search" onSubmit={event => { event.preventDefault(); onSearch(new FormData(event.currentTarget).get("q") || ""); setMenuOpen(false); }}>
          <img className="search-icon" src="element/zoom.png" alt="" />
          <input
            type="search"
            name="q"
            placeholder="Cari produk atau brand..."
            aria-label="Cari produk atau brand"
          />
          <button type="submit" aria-label="Filter pencarian">
            <img src="element/settinghero.png" alt="" />
          </button>
        </form>

        <div className="links">
          <a className={['chat.html', 'request.html'].includes(page) ? 'active' : ''} href="chat.html">Chat jastiper</a>
          <a className={["index.html", "NitipYuk.html"].includes(page) ? "active" : ""} href="/">Beranda</a>
          <a className={page === "produk.html" ? "active" : ""} href="produk.html">Produk</a>
          <a className={page === "pesanan.html" ? "active" : ""} href="pesanan.html">Pesanan</a>
        </div>

        <div className="nav-actions">
          <button className="nav-icon-button" type="button" aria-label={`Keranjang (${cartCount} barang)`} onClick={() => { window.location.href = "keranjang.html"; }}><span className="cart-badge">{cartCount}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 1.9-1.4L22 9H6"
              />
              <circle cx="10" cy="20" r="1.3" />
              <circle cx="18" cy="20" r="1.3" />
            </svg>
          </button>

          <button className="nav-icon-button" type="button" aria-label={`Notifikasi (${unreadCount} belum dibaca)`} onClick={() => { location.href = "notif.html"; }}>{unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>
          </button>

          <div className="account-area">
            <a className="auth-link" href={user ? "profil.html" : "login.html"}>
              <span className="auth-icon">
                <img className={user?.photo ? "is-profile-photo" : ""} src={user?.photo || "element/user.png"} alt="" />
              </span>
              <span>{displayName}</span>
            </a>

            <details className="account-dropdown">
              <summary aria-label="Buka menu akun">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <div className="account-dropdown-menu">
                <a href="profil.html">Profil saya</a><a href="alamat.html">Alamat saya</a><a href="profil.html#metode-pembayaran">Metode pembayaran</a>
                <a href="pesanan.html">Pesanan saya</a><a href="notif.html">Notifikasi</a>{user && <button className="dropdown-logout" onClick={() => { logout(); location.href = "/"; }}>Keluar</button>}
              </div>
            </details>
          </div>

          <button
            className="nav-icon-button nav-menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={menuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            onClick={() => setMenuOpen(open => !open)}
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </svg>
            )}
          </button>
        </div>

        <div id="mobile-nav-drawer" className={`mobile-nav-drawer${menuOpen ? ' open' : ''}`} hidden={!menuOpen}>
          <div className="mobile-nav-section">
            <a className={["index.html", "NitipYuk.html"].includes(page) ? "active" : ""} href="/" onClick={() => setMenuOpen(false)}>Beranda</a>
            <a className={page === "produk.html" ? "active" : ""} href="produk.html" onClick={() => setMenuOpen(false)}>Produk</a>
            <a className={page === "pesanan.html" ? "active" : ""} href="pesanan.html" onClick={() => setMenuOpen(false)}>Pesanan</a>
            <a className={['chat.html', 'request.html'].includes(page) ? 'active' : ''} href="chat.html" onClick={() => setMenuOpen(false)}>Chat jastiper</a>
          </div>

          <div className="mobile-nav-divider" />

          <div className="mobile-nav-account">
            <a className="auth-link" href={user ? "profil.html" : "login.html"} onClick={() => setMenuOpen(false)}>
              <span className="auth-icon">
                <img className={user?.photo ? "is-profile-photo" : ""} src={user?.photo || "element/user.png"} alt="" />
              </span>
              <span>{displayName}</span>
            </a>
            <div className="mobile-nav-section mobile-nav-sublinks">
              <a className={page === "profil.html" ? "active" : ""} href="profil.html" onClick={() => setMenuOpen(false)}>Profil saya</a>
              <a className={page === "alamat.html" ? "active" : ""} href="alamat.html" onClick={() => setMenuOpen(false)}>Alamat saya</a>
              <a href="profil.html#metode-pembayaran" onClick={() => setMenuOpen(false)}>Metode pembayaran</a>
              <a className={page === "notif.html" ? "active" : ""} href="notif.html" onClick={() => setMenuOpen(false)}>Notifikasi{unreadCount > 0 ? ` (${unreadCount})` : ''}</a>
              {user && <button className="dropdown-logout" type="button" onClick={() => { logout(); location.href = "/"; }}>Keluar</button>}
            </div>
          </div>
        </div>
      </nav>
      {menuOpen && <div className="mobile-nav-backdrop" aria-hidden="true" onClick={() => setMenuOpen(false)} />}
    </>
  );
}
