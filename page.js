// Public page content for Zekang Zhang.
const h = React.createElement;

const PROJECTS = [
  {
    n: '01',
    name: 'Image simulation',
    title: 'How to fake a sky?',
    blurb: 'I forward-model galaxy surveys at the pixel level, and use that to study how robust our way of processing the data really is. It requires putting the full observational realism into the simulation, and then using it to push back on our own confidence. A significant part of my time goes into blending, where the light of ever deeper galaxies overlaps in projection.',
    tags: ['survey realism', 'blending', 'selection effects'],
    links: [
      { label: 'blendemu code', href: 'https://github.com/zhangzzk/blendemu' },
      { label: 'redshift-mixing paper', href: 'https://arxiv.org/abs/2507.19130' },
    ],
    figure: 'assets/research/01-image-simulation.svg?v=2',
    figureBare: true,
    figureAlt: 'Grid of simulated galaxy postage stamps with blends',
    figureCaption: 'fig. 01 · simulated blend field',
  },
  {
    n: '02',
    name: 'Redshift estimation',
    title: 'The distance of galaxies',
    blurb: 'It is extremely useful to know how far away galaxies are from us, either individually or as an ensemble, since galaxies carry information about the Universe at different times. I am interested in how to confidently characterise the redshift distribution of a galaxy sample. In particular, I studied how that distribution varies spatially across the sky due to observational systematics, which can be mistaken for a cosmic origin if left unmodelled.',
    tags: ['photo-z', 'n(z)', 'spatial systematics'],
    links: [
      { label: 'redshift-mixing paper', href: 'https://arxiv.org/abs/2507.19130' },
      { label: 'skyvar code', href: 'https://github.com/zhangzzk/skyvar' },
    ],
    figure: 'assets/research/02-redshift.svg?v=2',
    figureAlt: 'Spectroscopic and photometric n(z) distributions',
    figureCaption: 'fig. 02 · redshift mixing',
  },
  {
    n: '03',
    name: 'Shear calibration',
    title: 'Galaxy light distorted by gravity',
    blurb: 'Images of background galaxies are predicted, and observed, to be weakly distorted by the gravitational pull of foreground matter. This phenomenon — weak gravitational lensing — has been used to map the matter of the Universe. Since the effect is tiny, the measurements are prone to imaging systematics. I developed a CNN-based model for shape measurement as part of my master project. At the moment I work on a simulation-based shear inference framework that incorporates detection, selection and blending.',
    tags: ['weak lensing', 'shear response', 'PSF'],
    links: [
      { label: 'FORKLENS code', href: 'https://github.com/zhangzzk/forklens' },
      { label: 'FORKLENS paper', href: 'https://arxiv.org/abs/2301.02986' },
    ],
    figure: 'assets/research/03-shear.svg?v=2',
    figureAlt: 'Tangential shear pattern of ellipses around a central mass',
    figureCaption: 'fig. 03 · shear map',
  },
  {
    n: '04',
    name: 'Machine learning',
    title: '“Machine of loving grace”',
    blurb: 'I work with machines that compress simulations into useful models. Besides the CNN-based shape measurement I built earlier, I am now developing a shear inference framework on top of image simulations, using normalizing flows. It folds detection, selection and blending into a single model, and delivers accurate estimation while remains practical.',
    tags: ['emulation', 'deep learning', 'normalizing flows'],
    links: [
      { label: 'SBSI code', href: 'https://github.com/zhangzzk/SBSI/' },
      { label: 'blendemu code', href: 'https://github.com/zhangzzk/blendemu' },
      { label: 'FORKLENS code', href: 'https://github.com/zhangzzk/forklens' },
    ],
    figure: 'assets/research/04-normalizing-flow.png?v=1',
    figureBare: true,
    figureAlt: 'Simulated bright, typical and faint blends, with the conditional '
      + 'distributions of measured ellipticity, magnitude and radius against the sheared input truth',
    figureCaption: 'fig. 04 · conditional measurements',
  },
  {
    n: '05',
    name: 'Statistical inference',
    title: 'Practical inference from data',
    blurb: 'Alongside images and measurements, I also work on inferring cosmology from (mock) data, particularly when the data vectors are biased by systematics. I looked at spatially varying observing conditions, how they propagate into two-point statistics, and how far that unsettles our confidence in combining clustering and lensing.',
    tags: ['two-point statistics', 'uncertainty budgets', 'model checking'],
    links: [
      { label: 'redshift-mixing paper', href: 'https://arxiv.org/abs/2507.19130' },
    ],
    figure: 'assets/research/05-inference.png?v=1',
    figureBare: true,
    figureFull: true,
    figureAlt: 'Posterior predictive p-value distributions for clean and contaminated '
      + 'data vectors, with and without cosmic shear, against a one per cent rejection region',
    figureCaption: 'fig. 05 · posterior predictive p-values',
  },
];

const PUBLICATIONS = [
  {
    year: '2026',
    venue: 'In prep.',
    title: 'Anisotropic redshift distributions in photometric galaxy clustering and their cosmological impact',
    authors: 'Zhang, Z.; Wang, Y.; Gruen, D.; Kong, H.; Tortorelli, L.; Fischbacher, S.; Yan, Z.',
    note: 'first author · in preparation',
  },
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
    authors: 'Zhang, Z.; Shan, H.; Li, N.; Wei, C.; Yao, J.; Ban, Z.; Fang, Y.; Guo, Q.; et al.',
    note: 'first author · A&A 683, A209 · ascl:2407.004',
    href: 'https://arxiv.org/abs/2301.02986',
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

function OpeningField() {
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
        host: canvas.closest('.opening') || canvas.parentNode,
        seed: 34, nodes: 20, field: 200, step: 31, mirror: true,
        accent: accent, accentRGB: '200,68,42',
      });
    })();
    return () => { alive = false; if (sim && sim.destroy) sim.destroy(); };
  }, []);

  return h('div', { className: 'opening-field', id: 'top' },
    h('canvas', { id: 'cosmo', ref: fieldRef, 'aria-hidden': 'true' }),
  );
}

function SectionHead({ n, title }) {
  return h('div', { className: 'sec-head' },
    h('div', { className: 'num' }, `§ ${n}`),
    h('h2', null, title),
  );
}

function About() {
  return h('section', { className: 'sec opening', id: 'about' },
    h(OpeningField),
    h('h1', { className: 'sr-only' },
      'Zekang Zhang — cosmology and AI: photometric galaxy surveys, weak lensing, ',
      'and the systematics that limit how precisely they can be read.',
    ),
    h('div', { className: 'opening-body reveal' },
    h(SectionHead, { n: '01', title: 'About' }),
    h('div', { className: 'sec-body two about-layout' },
      h('div', { className: 'prose about-prose' },
        h('p', null,
          "I'm a PhD student at the ", h('strong', null, 'University Observatory Munich, LMU'),
          ', in the Astrophysics, Cosmology and Artificial Intelligence group with Daniel Gruen, ',
          h('strong', null, 'finishing in 2027'), '. ',
          'I work on photometric galaxy surveys: how galaxy images, colours, ',
          'positions, redshift distributions, and selections become ',
          'reliable measurements of cosmic structure.',
        ),
        h('p', null,
          'I do: image simulations and systematics, photometric redshift and shear, ',
          'cosmological inference from data, working with (deep) machine learning, ',
          'analytical models, and emulators.',
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
          h('div', { className: 'card-row' }, h('span', { className: 'lbl' }, 'focus'), h('span', null, 'galaxy surveys \u00b7 systematics in data')),
          h('div', { className: 'card-row' }, h('span', { className: 'lbl' }, 'tools'), h('span', null, 'image simulation \u00b7 ML \u00b7 statistics')),
          h('div', { className: 'card-row' }, h('span', { className: 'lbl' }, 'github'),
            h('span', null, h(ExternalLink, { href: 'https://github.com/zhangzzk/' }, 'github.com/zhangzzk')),
          ),
        ),
      ),
    ),
    ),
  );
}

function Research() {
  return h('section', { className: 'sec reveal', id: 'research' },
    h(SectionHead, { n: '02', title: 'Research' }),
    h('div', { className: 'sec-body' },
      h('ul', { className: 'proj' },
        PROJECTS.map((p, i) => h('li', {
          key: p.n,
          className: [
            p.figureFull ? 'fig-full' : (i % 2 === 1 && 'flip'),
            p.figureBare && 'fig-wide',
          ].filter(Boolean).join(' ') || undefined,
        },
          h('div', { className: 'proj-n' }, p.n),
          h('div', { className: 'proj-body' },
            p.name && h('div', { className: 'proj-name' }, p.name),
            h('h3', null, p.title),
            h('p', null, p.blurb),
            h('div', { className: 'tags' }, p.tags.map((t) => h('span', { key: t }, t))),
            h('div', { className: 'proj-links' },
              p.links.map((l) => h(ExternalLink, { key: l.href, href: l.href }, `${l.label} →`)),
            ),
          ),
          p.figure && h('figure', { className: p.figureBare ? 'proj-fig bare' : 'proj-fig' },
            h('div', { className: p.figureBare ? 'proj-fig-frame bare' : 'proj-fig-frame' },
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
    h(SectionHead, { n: '03', title: 'Selected Publications' }),
    h('div', { className: 'sec-body' },
      h('ul', { className: 'pubs' },
        PUBLICATIONS.map((p) => h('li', { key: p.title },
          h('div', { className: 'pub-meta' },
            h('span', { className: 'yr' }, p.year),
            h('span', { className: 'venue' }, p.venue),
          ),
          h('div', { className: 'pub-body' },
            p.href
              ? h(ExternalLink, { className: 'pub-title', href: p.href }, p.title)
              : h('span', { className: 'pub-title' }, p.title),
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
          h('li', null, h('span', { className: 'cv-yr' }, 'current'), h('span', null, h('strong', null, 'finishing PhD student'), ' · University Observatory Munich, LMU · ACAI')),
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
    const sections = document.querySelectorAll('.sec');
    const links = document.querySelectorAll('.hdr-r a');
    if (!sections.length || !links.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach((a) => {
            const href = a.getAttribute('href');
            if (href === '#' + id) {
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
    h(About),
    h(Research),
    h(Publications),
    h(CV),
    h(Contact),
    h(Footer),
  );
}

window.Page = Page;
