export default function Countries({selected, onSelect}) { return (<section className="countries" id="negara">
        <h2>Mau titip dari mana?</h2>
        <p className="countries-subtitle">
          Jelajahi negara, temukan titipan favoritmu.
        </p>

        <div className="country-grid">
          <button className={selected === 'Semua negara' ? 'country-card selected' : 'country-card'} aria-pressed={selected === 'Semua negara'} onClick={() => onSelect('Semua negara')}  type="button">
            <img src="element/world.png" alt="" />
            <span>Semua negara</span>
          </button>
          <button className={selected === 'Jepang' ? 'country-card selected' : 'country-card'} aria-pressed={selected === 'Jepang'} onClick={() => onSelect('Jepang')}  type="button">
            <img src="element/japan.png" alt="" />
            <span>Jepang</span>
          </button>
          <button className={selected === 'Korea Selatan' ? 'country-card selected' : 'country-card'} aria-pressed={selected === 'Korea Selatan'} onClick={() => onSelect('Korea Selatan')}  type="button">
            <img src="element/korsel.png" alt="" />
            <span>Korea Selatan</span>
          </button>
          <button className={selected === 'Singapura' ? 'country-card selected' : 'country-card'} aria-pressed={selected === 'Singapura'} onClick={() => onSelect('Singapura')}  type="button">
            <img src="element/singapore.png" alt="" />
            <span>Singapura</span>
          </button>
          <button className={selected === 'Thailand' ? 'country-card selected' : 'country-card'} aria-pressed={selected === 'Thailand'} onClick={() => onSelect('Thailand')}  type="button">
            <img src="element/thailand.png" alt="" />
            <span>Thailand</span>
          </button>
          <button className={selected === 'Malaysia' ? 'country-card selected' : 'country-card'} aria-pressed={selected === 'Malaysia'} onClick={() => onSelect('Malaysia')}  type="button">
            <img src="element/malaysia.png" alt="" />
            <span>Malaysia</span>
          </button>
          <button className={selected === 'Amerika Serikat' ? 'country-card selected' : 'country-card'} aria-pressed={selected === 'Amerika Serikat'} onClick={() => onSelect('Amerika Serikat')}  type="button">
            <img src="element/as.png" alt="" />
            <span>Amerika Serikat</span>
          </button>
          <button className={selected === 'Australia' ? 'country-card selected' : 'country-card'} aria-pressed={selected === 'Australia'} onClick={() => onSelect('Australia')}  type="button">
            <img src="element/asutralia.png" alt="" />
            <span>Australia</span>
          </button>
        </div>
      </section>); }
