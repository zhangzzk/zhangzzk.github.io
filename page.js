// Public page content for Zekang Zhang.
const h = React.createElement;

const PROJECTS = [
  {
    n: '01',
    title: 'How to fake a sky honestly',
    blurb: 'Forward-model galaxy images and catalogues to make observational systematics measurable: blending, PSF, noise, detection, photometry, and the way observing conditions move galaxies into or out of a survey sample.',
    tags: ['survey realism', 'blending', 'selection effects'],
    links: [
      { label: 'blendemu code', href: 'https://github.com/zhangzzk/blendemu' },
      { label: 'redshift-mixing paper', href: 'https://arxiv.org/abs/2507.19130' },
      { label: 'HybPSF paper', href: 'https://arxiv.org/abs/2308.14065' },
    ],
    figure: 'assets/research/01-image-simulation.svg?v=2',
    figureAlt: 'Grid of simulated galaxy postage stamps with blends',
    figureCaption: 'fig. 01 · simulated blend field',
  },
  {
    n: '02',
    title: 'The distance of galaxies',
    blurb: 'Distances turn a sky map into cosmology, and they are rarely known as cleanly as we wish. Treat redshift distributions as a core survey observable, not a bookkeeping step: effective n(z), SOM-based colour-redshift calibration, and spatially varying n(z, theta).',
    tags: ['photo-z', 'n(z)', '4C3R2'],
    links: [
      { label: '4C3R2', href: 'https://wavesurvey.org/surveys/4c3r2/' },
      { label: 'ESO note', href: 'https://doi.eso.org/10.18727/0722-6691/5307' },
      { label: 'redshift-mixing paper', href: 'https://arxiv.org/abs/2507.19130' },
    ],
    figure: 'assets/research/02-redshift.svg?v=2',
    figureAlt: 'Spectroscopic and photometric n(z) distributions',
    figureCaption: 'fig. 02 · redshift mixing',
  },
  {
    n: '03',
    title: 'Light, gently bent',
    blurb: 'Weak lensing lives in tiny coherent distortions. Calibrate how galaxy images and sample selections respond to shear when the measurement pipeline sees finite PSFs, noise, and blends. This is the lensing-specific side of the same survey-calibration problem.',
    tags: ['weak lensing', 'shear response', 'PSF'],
    links: [
      { label: 'FORKLENS code', href: 'https://github.com/zhangzzk/forklens' },
      { label: 'FORKLENS paper', href: 'https://arxiv.org/abs/2301.02986' },
      { label: 'ASCL', href: 'https://ascl.net/2407.004' },
    ],
    figure: 'assets/research/03-shear.svg?v=2',
    figureAlt: 'Tangential shear pattern of ellipses around a central mass',
    figureCaption: 'fig. 03 · shear response map',
  },
  {
    n: '04',
    title: '"Machine of loving grace"',
    blurb: 'Use ML/DL where it compresses expensive simulations into reusable machinery: emulators for detection and blending responses, deep-learning shear measurement, and more experimental agentic systems on the side.',
    tags: ['emulation', 'deep learning', 'agents'],
    links: [
      { label: 'blendemu code', href: 'https://github.com/zhangzzk/blendemu' },
      { label: 'FORKLENS code', href: 'https://github.com/zhangzzk/forklens' },
      { label: 'hitchcock code', href: 'https://github.com/zhangzzk/hitchcock' },
    ],
    figure: 'assets/research/04-machine-learning.svg?v=2',
    figureAlt: 'Smooth emulator response fit through scattered training points',
    figureCaption: 'fig. 04 · emulator response',
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
    figure: 'assets/research/05-statistics.svg?v=2',
    figureAlt: 'Two-point measurement with error bars and one-sigma model band',
    figureCaption: 'fig. 05 · cosmology shift',
  },
  // {
  //   n: '06',
  //   title: 'Analytical modeling',
  //   blurb: 'Build compact models before throwing computation at the problem: perturbative n(z, theta) and b(z, theta), projection kernels for angular clustering, and pairwise response models for blended images.',
  //   tags: ['formalism', 'projection effects', 'bias models'],
  //   links: [
  //     { label: 'skyvar code', href: 'https://github.com/zhangzzk/skyvar' },
  //     { label: 'redshift-mixing paper', href: 'https://arxiv.org/abs/2507.19130' },
  //   ],
  //   figure: 'assets/research/06-analytical.svg?v=2',
  //   figureAlt: 'Equation for projected two-point terms with redshift and selection perturbations',
  //   figureCaption: 'fig. 06 · projected two-point expansion',
  // },
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

function ExternalLink({ href, className, children }) {
  return h('a', { href, className, target: '_blank', rel: 'noopener' }, children);
}

function Header() {
  return h('header', { className: 'hdr' },
    h('div', { className: 'hdr-seal', 'aria-hidden': 'true' },
      h('img', { src: 'assets/seal-zhang.png?v=2', alt: '' }),
      h('img', { src: 'assets/seal-ze.png?v=2', alt: '' }),
      h('img', { src: 'assets/seal-kang.png?v=2', alt: '' }),
    ),
    h('div', { className: 'hdr-l' },
      h('div', { className: 'mark' }, 'ZZ'),
      h('div', { className: 'meta' },
        h('div', { className: 'meta-line' }, h('span', null, 'Zekang Zhang')),
        h('div', { className: 'meta-line dim' }, h('span', null, 'PhD student · LMU Munich · galaxy surveys')),
      ),
    ),
    h('nav', { className: 'hdr-r' },
      h('a', { href: '#about' }, 'about'),
      h('a', { href: '#research' }, 'research'),
      h('a', { href: '#publications' }, 'publications'),
      h('a', { href: '#cv' }, 'cv'),
      h('a', { href: '#contact' }, 'contact'),
    ),
  );
}

function Hero() {
  const fieldRef = React.useRef(null);
  React.useEffect(() => {
    const canvas = fieldRef.current;
    if (!canvas || !window.CosmoSim) return;
    let sim;
    let alive = true;
    (function boot() {
      if (!alive) return;
      if (!canvas.clientHeight) { requestAnimationFrame(boot); return; }
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#c8442a';
      sim = window.CosmoSim(canvas, {
        host: document.getElementById('top'),
        seed: 34, nodes: 20, field: 200, step: 31,
        accent: accent, accentRGB: '200,68,42',
      });
    })();
    return () => { alive = false; if (sim && sim.destroy) sim.destroy(); };
  }, []);

  return h('section', { className: 'hero', id: 'top' },
    h('div', { className: 'hero-field' },
      h('canvas', { id: 'cosmo', ref: fieldRef, 'aria-hidden': 'true' }),
    ),
    h('div', { className: 'hero-inner' },
      h('div', { className: 'hero-tag' },
        h('span', { className: 'dot' }),
        h('span', null, 'Astrophysics · Cosmology · galaxy surveys'),
      ),
      h('h1', { className: 'hero-h' },
        'Mapping evolving ', h('span', { className: 'hl' }, 'cosmic'), ' structure.',
      ),
      h('p', { className: 'hero-lede' },
        'Photometric galaxy surveys trace how matter clusters across cosmic time; ',
        'weak lensing maps the unseen mass in between. I work on ',
        h('span', { className: 'focus-em' }, 'the systematics that limit how precisely the two can be read.'),
      ),
    ),
    h('div', { className: 'hero-hint' },
      'galaxy clustering ⊕ weak-lensing shear', h('br'),
      h('span', { className: 'k' }, 'drag'), ' across the field to disturb the dark matter',
    ),
  );
}

function SectionHead({ n, title }) {
  return h('div', { className: 'sec-head' },
    h('div', { className: 'num' }, `§ ${n}`),
    h('h2', null, title),
  );
}

function About() {
  return h('section', { className: 'sec reveal', id: 'about' },
    h(SectionHead, { n: '01', title: 'About' }),
    h('div', { className: 'sec-body two about-layout' },
      h('div', { className: 'prose about-prose' },
        h('p', null,
          "I'm a PhD student at the ", h('strong', null, 'University Observatory Munich, LMU'),
          ', in the Astrophysics, Cosmology and Artificial Intelligence group with Daniel Gruen. ',
          'I work on photometric galaxy surveys: how galaxy images, colours, ',
          'positions, redshift distributions, and selections become ',
          'reliable measurements of cosmic structure.',
        ),
        h('p', null,
          'My day-to-day work is mostly modelling: ',
          'image simulations, systematics, summary statistics, ',
          'redshifts, gravitational lensing, (deep) machine learning, ',
          'analytical models, and emulators that can be plugged into survey analyses.',
        ),
        h('p', null,
          'Right now I am writing on spatially varying n(z, theta) and its ',
          'impact on angular clustering. The next thread is photometric n(z) ',
          'calibration with 4C3R2, especially selection functions in ',
          'SOM-based colour-redshift calibration. Outside the core research ',
          'lane, as an amateur, I am also obsessed with agentic AI systems.',
        ),
      ),
      h('div', { className: 'about-side' },
        h('figure', { className: 'portrait' },
          h('img', { src: 'assets/zekang-portrait.jpg', alt: 'Portrait of Zekang Zhang' }),
        ),
        h('aside', { className: 'card about-card' },
          h('div', { className: 'card-row' }, h('span', { className: 'lbl' }, 'currently'),
            h('span', null,
              'PhD, ',
              h(ExternalLink, { href: 'https://www.lmu.de/en/' }, 'LMU'),
              ' / ',
              h(ExternalLink, { href: 'https://www.physik.lmu.de/observatory/en/' }, 'USM'),
            ),
          ),
          h('div', { className: 'card-row' }, h('span', { className: 'lbl' }, 'advisor'),
            h('span', null,
              h(ExternalLink, { href: 'https://www.physik.lmu.de/observatory/en/people/contact-page/daniel-gruen-ba89d54b.html' }, 'Daniel Gruen'),
              ' / ',
              h(ExternalLink, { href: 'https://www.physik.lmu.de/observatory/en/research/cosmology/acai-group/' }, 'ACAI'),
            ),
          ),
          h('div', { className: 'card-row' }, h('span', { className: 'lbl' }, 'focus'), h('span', null, 'galaxy-survey systematics')),
          h('div', { className: 'card-row' }, h('span', { className: 'lbl' }, 'signals'), h('span', null, 'redshift · shear · clustering')),
          h('div', { className: 'card-row' }, h('span', { className: 'lbl' }, 'methods'), h('span', null, 'statistics · ML · simulation')),
          h('div', { className: 'card-row' }, h('span', { className: 'lbl' }, 'side quests'), h('span', null, 'agentic AI')),
        ),
      ),
    ),
  );
}

function Research() {
  return h('section', { className: 'sec reveal', id: 'research' },
    h(SectionHead, { n: '02', title: 'Research themes' }),
    h('div', { className: 'sec-body' },
      h('ul', { className: 'proj' },
        PROJECTS.map((p) => h('li', { key: p.n },
          h('div', { className: 'proj-n' }, p.n),
          h('div', { className: 'proj-body' },
            h('h3', null, p.title),
            h('p', null, p.blurb),
            h('div', { className: 'tags' }, p.tags.map((t) => h('span', { key: t }, t))),
            h('div', { className: 'proj-links' },
              p.links.map((l) => h(ExternalLink, { key: l.href, href: l.href }, `${l.label} →`)),
            ),
          ),
          p.figure && h('figure', { className: 'proj-fig' },
            h('div', { className: 'proj-fig-frame' },
              h('img', { src: p.figure, alt: p.figureAlt || `Figure for ${p.title}`, loading: 'lazy' }),
            ),
            h('figcaption', null, p.figureCaption || `fig. ${p.n} · placeholder`),
          ),
        )),
      ),
    ),
  );
}

function Publications() {
  return h('section', { className: 'sec reveal', id: 'publications' },
    h(SectionHead, { n: '03', title: 'Publications' }),
    h('div', { className: 'sec-body' },
      h('ul', { className: 'pubs' },
        PUBLICATIONS.map((p) => h('li', { key: p.title },
          h('div', { className: 'pub-meta' },
            h('span', { className: 'yr' }, p.year),
            h('span', { className: 'venue' }, p.venue),
          ),
          h('div', { className: 'pub-body' },
            h(ExternalLink, { className: 'pub-title', href: p.href }, p.title),
            h('div', { className: 'pub-auth' }, p.authors),
            h('div', { className: 'pub-note' }, p.note),
          ),
        )),
      ),
      h('p', { className: 'dim small' },
        'More on ',
        h(ExternalLink, { href: 'https://ui.adsabs.harvard.edu/search/q=author%3A%22Zhang%2C%20Zekang%22&sort=date%20desc%2C%20bibcode%20desc&p_=0' }, 'NASA ADS'),
        ', ',
        h(ExternalLink, { href: 'https://scholar.google.com/scholar?q=%22Zekang+Zhang%22+astrophysics' }, 'Google Scholar'),
        ', and ',
        h(ExternalLink, { href: 'https://ascl.net/2407.004' }, 'ASCL'),
        '.',
      ),
    ),
  );
}

function CV() {
  const fieldRef = React.useRef(null);
  React.useEffect(() => {
    const canvas = fieldRef.current;
    if (!canvas || !window.RandomWalk) return;
    let sim;
    let alive = true;
    (function boot() {
      if (!alive) return;
      if (!canvas.clientHeight) { requestAnimationFrame(boot); return; }
      sim = window.RandomWalk(canvas, { seed: 11, accentRGB: '200,68,42' });
    })();
    return () => { alive = false; if (sim && sim.destroy) sim.destroy(); };
  }, []);

  return h('section', { className: 'sec reveal', id: 'cv' },
    h('div', { className: 'cv-field' },
      h('canvas', { id: 'cv-walk', ref: fieldRef, 'aria-hidden': 'true' }),
    ),
    h(SectionHead, { n: '04', title: 'CV' }),
    h('div', { className: 'sec-body' },
      h('div', null,
        h('h4', { className: 'cv-h' }, 'Affiliations'),
        h('ul', { className: 'cv' },
          h('li', null, h('span', { className: 'cv-yr' }, 'current'), h('span', null, h('strong', null, 'PhD student'), ' · University Observatory Munich, LMU · ACAI')),
          h('li', null, h('span', { className: 'cv-yr' }, 'before'), h('span', null, 'Shanghai Astronomical Observatory, CAS · University of Chinese Academy of Sciences')),
          h('li', null, h('span', { className: 'cv-yr' }, 'file'), h('span', null, 'CV PDF coming soon')),
        ),
      ),
    ),
  );
}

function Contact() {
  return h('section', { className: 'sec reveal', id: 'contact' },
    h(SectionHead, { n: '05', title: 'Contact' }),
    h('div', { className: 'sec-body' },
      h('div', { className: 'contact-orbit', 'aria-label': 'interactive particle field' },
        h('canvas', { id: 'nbody-canvas', 'aria-hidden': 'true' }),
        h('aside', { className: 'card contact-card' },
          h('div', { className: 'card-row' }, h('span', { className: 'lbl' }, 'email'), h('a', { href: 'mailto:zekang.zhang@physik.lmu.de' }, 'zekang.zhang@physik.lmu.de')),
          h('div', { className: 'card-row' }, h('span', { className: 'lbl' }, 'address'), h('span', null, 'University Observatory Munich (USM), Scheinerstr. 1, 81679 Munich')),
          h('div', { className: 'card-row' }, h('span', { className: 'lbl' }, 'room'), h('span', null, '222')),
        ),
      ),
    ),
  );
}

function Footer() {
  return h('footer', { className: 'ft' },
    h('div', null, '© 2026 Zekang Zhang'),
    h('div', { className: 'dim' }, 'University Observatory Munich · LMU'),
    h('div', null, h('a', { href: '#top' }, '↑ top')),
  );
}

function useScrollReveal() {
  React.useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function useActiveNav() {
  React.useEffect(() => {
    const sections = document.querySelectorAll('.sec, .hero');
    const links = document.querySelectorAll('.hdr-r a');
    if (!sections.length || !links.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach((a) => {
            const href = a.getAttribute('href');
            if (href === '#' + id || (id === 'top' && href === '#about')) {
              a.classList.add('active');
            } else {
              a.classList.remove('active');
            }
          });
        }
      });
    }, { threshold: 0, rootMargin: '-30% 0px -50% 0px' });
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);
}

function Page() {
  useScrollReveal();
  useActiveNav();

  return h('div', { className: 'page' },
    h(Header),
    h(Hero),
    h(About),
    h(Research),
    h(Publications),
    h(CV),
    h(Contact),
    h(Footer),
  );
}

window.Page = Page;
