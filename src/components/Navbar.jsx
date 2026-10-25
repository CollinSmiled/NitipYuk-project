import { logout } from '../lib/orderStatus';

export default function Navbar({ onSearch, user, cartCount, page, unreadCount }) {
  return (<nav className="navbar" aria-label="Navigasi utama">
      <a className="brand" href="/">
        <span className="brand-icon">
          <img src="element/logoNitipYuk.png" alt="Logo NitipYuk" />
        </span>
        <span className="brand-text"><strong>NitipYuk</strong></span>
      </a>

      <form className="search" role="search" onSubmit={event => { event.preventDefault(); onSearch(new FormData(event.currentTarget).get("q") || ""); }}>
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
              <img src={user?.photo || "element/user.png"} alt="" />
            </span>
            <span>{user?.name || user?.email?.split("@")[0] || "Masuk / Daftar"}</span>
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
      </div>
    </nav>);
}
