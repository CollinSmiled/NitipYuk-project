import { buyerTrips, dateLabel, tripImage } from '../seller/sellerStore';
import { useRef } from 'react';
export default function Recommendations() {
 const carousel = useRef(null);
 function scroll(direction) { const el = carousel.current; el?.scrollBy({left: direction * (el.firstElementChild.offsetWidth + 20), behavior: 'smooth'}); }
 const trips = buyerTrips();
 if (trips.length) return <section className="recommendations"><div className="recommendation-heading"><div><h2>Rekomendasi untukmu</h2><p>Trip yang dibuka seller di demo ini.</p></div><div className="carousel-controls"><button className="carousel-button" aria-label="Geser ke kiri" onClick={() => scroll(-1)}>‹</button><button className="carousel-button" aria-label="Geser ke kanan" onClick={() => scroll(1)}>›</button></div></div><div className="carousel" ref={carousel}>{trips.map(trip => <a className="trip-card" key={trip.id} href={`produk.html?trip=${trip.id}&shop=${trip.shopId}`}><img src={`element/${tripImage(trip.country)}.jpg`} alt={trip.city} /><span className="trip-tag">{new Date(trip.promotedUntil) > new Date() ? 'Trending' : 'Dibuka'}</span><div className="trip-info"><p>{trip.country}</p><h3>{trip.title}</h3><span>{trip.shopName} · Estimasi {dateLabel(trip.arrival)} · {Math.max(0, trip.capacity - trip.used)} slot</span></div></a>)}</div></section>;
 return (<section className="recommendations" id="rekomendasi">
        <div className="recommendation-heading">
          <div>
            <h2>Rekomendasi untukmu</h2>
            <p>Geser untuk lihat trip pilihan minggu ini.</p>
          </div>

          <div className="carousel-controls">
            <button
              type="button"
              className="carousel-button"
              id="previous" onClick={() => scroll(-1)}
              aria-label="Geser ke kiri"
            >
              ‹
            </button>
            <button
              type="button"
              className="carousel-button"
              id="next" onClick={() => scroll(1)}
              aria-label="Geser ke kanan"
            >
              ›
            </button>
          </div>
        </div>

        <div className="carousel" id="trip-carousel" ref={carousel}>
          <article className="trip-card">
            <img onError={event => { event.currentTarget.style.visibility = "hidden"; }} src="element/seoul.jpg" alt="Pemandangan Seoul" />
            <span className="trip-tag">Trending</span>
            <div className="trip-info">
              <p>🇰🇷 Korea Selatan</p>
              <h3>Belanja K-beauty di Seoul</h3>
              <span>Seoulmate · 1–7 Des 2026 · ★ 4.8</span>
            </div>
          </article>

          <article className="trip-card">
            <img onError={event => { event.currentTarget.style.visibility = "hidden"; }}
              src="element/kuala-lumpur.jpg"
              alt="Pemandangan Kuala Lumpur"
            />
            <span className="trip-tag">Promo</span>
            <div className="trip-info">
              <p>🇲🇾 Malaysia</p>
              <h3>Midnight sale Kuala Lumpur</h3>
              <span>KL Runner · 20–23 Nov 2026 · ★ 4.6</span>
            </div>
          </article>

          <article className="trip-card">
            <img onError={event => { event.currentTarget.style.visibility = "hidden"; }} src="element/new-york.jpg" alt="Pemandangan New York" />
            <span className="trip-tag">Terbatas</span>
            <div className="trip-info">
              <p>🇺🇸 Amerika Serikat</p>
              <h3>Holiday shopping New York</h3>
              <span>Big Apple Box · 15–28 Des 2026 · ★ 4.7</span>
            </div>
          </article>

          <article className="trip-card">
            <img onError={event => { event.currentTarget.style.visibility = "hidden"; }} src="element/tokyo.jpg" alt="Pemandangan Tokyo" />
            <span className="trip-tag">Populer</span>
            <div className="trip-info">
              <p>🇯🇵 Jepang</p>
              <h3>Berburu barang unik di Tokyo</h3>
              <span>Tokyo Trip · 5–12 Des 2026 · ★ 4.9</span>
            </div>
          </article>

          <article className="trip-card">
            <img onError={event => { event.currentTarget.style.visibility = "hidden"; }} src="element/seoul.jpg" alt="Pemandangan Seoul" />
            <span className="trip-tag">Favorit</span>
            <div className="trip-info">
              <p>🇰🇷 Korea Selatan</p>
              <h3>Jelajah toko fashion Seoul</h3>
              <span>Seoulmate · 10–16 Des 2026 · ★ 4.8</span>
            </div>
          </article>

          <article className="trip-card">
            <img onError={event => { event.currentTarget.style.visibility = "hidden"; }} src="element/paris.jpg" alt="Pemandangan Paris" />
            <span className="trip-tag">Segera</span>
            <div className="trip-info">
              <p>🇫🇷 Prancis</p>
              <h3>Belanja akhir tahun di Paris</h3>
              <span>Paris Picks · 18–26 Des 2026 · ★ 4.7</span>
            </div>
          </article>

          <article className="trip-card">
            <img onError={event => { event.currentTarget.style.visibility = "hidden"; }} src="element/singapore.jpg" alt="Pemandangan Singapura" />
            <span className="trip-tag">Baru</span>
            <div className="trip-info">
              <p>🇸🇬 Singapura</p>
              <h3>Berburu promo di Singapura</h3>
              <span>Lion City · 2–6 Jan 2027 · ★ 4.6</span>
            </div>
          </article>
        </div>
      </section>);
}
