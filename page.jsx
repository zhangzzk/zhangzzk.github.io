// Page content — Swiss-grid editorial layout for Zekang Zhang (astrophysics)

const PROJECTS = [
  {
    n: '01',
    title: 'Image simulation',
    blurb: 'Forward-model galaxy images and catalogues to make selection effects measurable: blending, PSF structure, noise, detection, photometry, and the way observing conditions move galaxies into or out of a survey sample.',
    tags: ['survey realism', 'blending', 'selection effects'],
    links: [
      { label: 'blendemu code', href: 'https://github.com/zhangzzk/blendemu' },
      { label: 'redshift-mixing paper', href: 'https://arxiv.org/abs/2507.19130' },
      { label: 'HybPSF paper', href: 'https://arxiv.org/abs/2308.14065' },
    ],
  },
  {
    n: '02',
    title: 'Redshift calibration',
    blurb: 'Treat redshift distributions as a core survey observable, not a bookkeeping step: effective n_gamma(z), photometric n(z), SOM-based colour-redshift calibration for 4C3R2, and spatially varying n(z, theta).',
    tags: ['photo-z', 'n(z)', '4C3R2'],
    links: [
      { label: '4C3R2', href: 'https://wavesurvey.org/surveys/4c3r2/' },
      { label: 'ESO note', href: 'https://doi.eso.org/10.18727/0722-6691/5307' },
      { label: 'blendemu paper', href: 'https://arxiv.org/abs/2507.19130' },
    ],
  },
  {
    n: '03',
    title: 'Shear calibration',
    blurb: 'Calibrate how galaxy images respond to shear when the measurement pipeline sees finite PSFs, noise, blends, selection effects, and imperfect shape information. This is the lensing-specific side of the same survey-calibration problem.',
    tags: ['weak lensing', 'shear response', 'PSF'],
    links: [
      { label: 'FORKLENS code', href: 'https://github.com/zhangzzk/forklens' },
      { label: 'FORKLENS paper', href: 'https://arxiv.org/abs/2301.02986' },
      { label: 'ASCL', href: 'https://ascl.net/2407.004' },
    ],
  },
  {
    n: '04',
    title: 'Machine learning',
    blurb: 'Use ML where it compresses expensive simulations into reusable calibration machinery: emulators for detection and blending responses, deep-learning shear measurement, and more experimental agentic systems on the side.',
    tags: ['emulation', 'deep learning', 'agents'],
    links: [
      { label: 'blendemu code', href: 'https://github.com/zhangzzk/blendemu' },
      { label: 'FORKLENS code', href: 'https://github.com/zhangzzk/forklens' },
      { label: 'hitchcock code', href: 'https://github.com/zhangzzk/hitchcock' },
    ],
  },
  {
    n: '05',
    title: 'Statistics and inference',
    blurb: 'Study how small survey systematics propagate into two-point functions and cosmological constraints: selection functions, uncertainty budgets, clustering bias, sample definitions, and inference-ready corrections.',
    tags: ['two-point statistics', 'selection functions', 'uncertainty'],
    links: [
      { label: 'skyvar code', href: 'https://github.com/zhangzzk/skyvar' },
      { label: 'DC3R2 reference', href: 'https://academic.oup.com/mnras/article/531/2/2582/7686823' },
      { label: '4C3R2', href: 'https://wavesurvey.org/surveys/4c3r2/' },
    ],
  },
  {
    n: '06',
    title: 'Analytical modeling',
    blurb: 'Build compact models before throwing computation at the problem: perturbative n(z, theta) and b(z, theta), projection kernels for angular clustering, and pairwise response models for blended images.',
    tags: ['formalism', 'projection effects', 'bias models'],
    links: [
      { label: 'skyvar code', href: 'https://github.com/zhangzzk/skyvar' },
      { label: 'redshift-mixing paper', href: 'https://arxiv.org/abs/2507.19130' },
    ],
  },
];

const PUBLICATIONS = [
  {
    year: '2026',
    venue: 'A&A',
    title: 'Emulating redshift mixing due to blending in weak gravitational lensing',
    authors: 'Zhang, Z.; Gruen, D.; Tortorelli, L.; Li, S.-S.; McCullough, J.',
    note: 'first author · A&A 706, A234',
    href: 'https://arxiv.org/abs/2507.19130',
  },
  {
    year: '2024',
    venue: 'A&A',
    title: 'FORKLENS: Accurate weak-lensing shear measurement with deep learning',
    authors: 'Zhang, Z. et al.',
    note: 'first author · A&A 683, A209 · ascl:2407.004',
    href: 'https://arxiv.org/abs/2301.02986',
  },
  {
    year: '2024',
    venue: 'AJ',
    title: 'HybPSF: Hybrid PSF reconstruction for the observed JWST NIRCam image',
    authors: 'Nie, L.; Shan, H.; Li, G.; Wang, L.; Cheng, C.; Tao, C.; Cui, Q.; Xie, Y.; Liu, D.; Zhang, Z.',
    note: 'co-author · AJ 167, 58',
    href: 'https://arxiv.org/abs/2308.14065',
  },
  {
    year: '2022',
    venue: 'MNRAS',
    title: 'Impact of the turnover in the high-z galaxy luminosity function on the 21-cm signal during Cosmic Dawn and Epoch of Reionization',
    authors: 'Zhang, Z.; Shan, H.; Gu, J.; Zheng, Q.; Xu, Y.; Yue, B.; Liu, Y.; Zhu, Z.; Guo, Q.',
    note: 'first author · MNRAS 516, 1573',
    href: 'https://arxiv.org/abs/2208.01492',
  },
];

function Header() {
  return (
    <header className="hdr">
      <div className="hdr-l">
        <div className="mark">ZZ</div>
        <div className="meta">
          <div className="meta-line"><span>Zekang Zhang</span></div>
          <div className="meta-line dim"><span>PhD student · LMU Munich · galaxy surveys</span></div>
        </div>
      </div>
      <nav className="hdr-r">
        <a href="#about">about</a>
        <a href="#research">research</a>
        <a href="#publications">publications</a>
        <a href="#cv">cv</a>
        <a href="#contact">contact</a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-grid">
        <div className="hero-tag">
          <span className="dot" />
          <span>Astrophysics · galaxy surveys · Munich</span>
        </div>
        <h1 className="hero-h">
          A few<br/>
          questions<br/>
          <em>about the</em><br/>
          <span className="hl">universe.</span>
        </h1>
        <div className="hero-sub">
          <p>
            I'm an astrophysics PhD student at LMU working on photometric
            galaxy surveys: redshift calibration, anisotropic clustering,
            weak lensing, and the statistical machinery that turns messy
            survey data into cosmological measurements.
          </p>
          <div className="hero-row">
            <div><span className="lbl">field</span><span>galaxy surveys</span></div>
            <div><span className="lbl">based in</span><span>Munich, DE</span></div>
            <div><span className="lbl">github</span><a href="https://github.com/zhangzzk/" target="_blank" rel="noopener">zhangzzk</a></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="sec" id="about">
      <div className="sec-head">
        <div className="num">§ 01</div>
        <h2>About</h2>
      </div>
      <div className="sec-body two about-layout">
        <div className="prose about-prose">
          <p>
            I'm a PhD student at the <strong>University Observatory Munich, LMU</strong>,
            in the Astrophysics, Cosmology and Artificial Intelligence group.
            I work on photometric galaxy surveys: how galaxy images, colours,
            positions, redshift distributions, and selection effects become
            reliable measurements of cosmic structure.
          </p>
          <p>
            My day-to-day work is mostly calibration and forward modelling:
            image simulations, observing-condition maps, redshift distributions,
            galaxy clustering, shear and PSF systematics, machine-learning
            models, and emulators that can be plugged into survey analyses.
          </p>
          <p>
            Right now I am writing on spatially varying n(z, theta) and its
            impact on angular clustering. The next thread is photometric n(z)
            calibration with 4C3R2, especially selection functions in
            SOM-based colour-redshift calibration. Outside the core research
            lane, I am also obsessed with agentic AI systems, statistics, ML,
            and, as an amateur, game theory.
          </p>
        </div>
        <div className="about-side">
          <figure className="portrait">
            <img src="assets/zekang-portrait.jpg" alt="Portrait of Zekang Zhang" />
          </figure>
          <aside className="card about-card">
            <div className="card-row"><span className="lbl">currently</span><span>PhD, LMU / USM</span></div>
            <div className="card-row"><span className="lbl">group</span><span>ACAI, Daniel Gruen</span></div>
            <div className="card-row"><span className="lbl">focus</span><span>galaxy-survey systematics</span></div>
            <div className="card-row"><span className="lbl">signals</span><span>redshift · shear · clustering</span></div>
            <div className="card-row"><span className="lbl">methods</span><span>statistics · ML · simulation</span></div>
            <div className="card-row"><span className="lbl">side quests</span><span>agentic AI · game theory</span></div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Research() {
  return (
    <section className="sec" id="research">
      <div className="sec-head">
        <div className="num">§ 02</div>
        <h2>Research themes</h2>
      </div>
      <div className="sec-body">
        <ul className="proj">
          {PROJECTS.map((p) => (
            <li key={p.n}>
              <div className="proj-n">{p.n}</div>
              <div className="proj-body">
                <h3>{p.title}</h3>
                <p>{p.blurb}</p>
                <div className="tags">{p.tags.map((t) => <span key={t}>{t}</span>)}</div>
                {p.links && (
                  <div className="proj-links">
                    {p.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noopener">{l.label} →</a>)}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Publications() {
  return (
    <section className="sec" id="publications">
      <div className="sec-head">
        <div className="num">§ 03</div>
        <h2>Publications</h2>
      </div>
      <div className="sec-body">
        <ul className="pubs">
          {PUBLICATIONS.map((p) => (
            <li key={p.title}>
              <div className="pub-meta">
                <span className="yr">{p.year}</span>
                <span className="venue">{p.venue}</span>
              </div>
              <div className="pub-body">
                <a className="pub-title" href={p.href} target="_blank" rel="noopener">{p.title}</a>
                <div className="pub-auth">{p.authors}</div>
                <div className="pub-note">{p.note}</div>
              </div>
            </li>
          ))}
        </ul>
        <p className="dim small">More on <a href="https://ui.adsabs.harvard.edu/search/q=author%3A%22Zhang%2C%20Zekang%22&sort=date%20desc%2C%20bibcode%20desc&p_=0" target="_blank" rel="noopener">NASA ADS</a>, <a href="https://scholar.google.com/scholar?q=%22Zekang+Zhang%22+astrophysics" target="_blank" rel="noopener">Google Scholar</a>, and <a href="https://ascl.net/2407.004" target="_blank" rel="noopener">ASCL</a>.</p>
      </div>
    </section>
  );
}

function CV() {
  return (
    <section className="sec" id="cv">
      <div className="sec-head">
        <div className="num">§ 04</div>
        <h2>CV</h2>
      </div>
      <div className="sec-body">
        <div>
          <h4 className="cv-h">Affiliations</h4>
          <ul className="cv">
            <li><span className="cv-yr">current</span><span><strong>PhD student</strong> · University Observatory Munich, LMU · ACAI</span></li>
            <li><span className="cv-yr">before</span><span>Shanghai Astronomical Observatory, CAS · University of Chinese Academy of Sciences</span></li>
            <li><span className="cv-yr">file</span><span>CV PDF coming soon</span></li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="sec" id="contact">
      <div className="sec-head">
        <div className="num">§ 05</div>
        <h2>Contact</h2>
      </div>
      <div className="sec-body">
        <div className="contact-orbit" aria-label="interactive n-body field">
          <canvas id="nbody-canvas" aria-hidden="true" />
          <aside className="card contact-card">
            <div className="card-row"><span className="lbl">email</span><a href="mailto:zekang.zhang@physik.lmu.de">zekang.zhang@physik.lmu.de</a></div>
            <div className="card-row"><span className="lbl">address</span><span>University Observatory Munich (USM), Scheinerstr. 1, 81679 Munich</span></div>
            <div className="card-row"><span className="lbl">room</span><span>222</span></div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="ft">
      <div>© 2026 Zekang Zhang</div>
      <div className="dim">University Observatory Munich · LMU</div>
      <div><a href="#top">↑ top</a></div>
    </footer>
  );
}

function Page() {
  return (
    <div className="page">
      <Header />
      <Hero />
      <About />
      <Research />
      <Publications />
      <CV />
      <Contact />
      <Footer />
    </div>
  );
}

window.Page = Page;
