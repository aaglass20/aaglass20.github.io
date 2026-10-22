// Landing carousel content — one entry per Coach Approach offering.
// Photos are cropped from the promo graphics in public/images/*.jpeg.
// `title` / `tagline` are arrays of { t, accent? } so the orange words stay data-driven.

export const SLIDE_MS = 5000

export const SLIDES = [
  {
    id: 'opener',
    image: '/ca/images/slides/opener.jpg',
    alt: 'Coach talking with a youth soccer team on the field',
    pro: true,
    statement: true,
    title: [
      { t: "They're not just playing for today." },
      { t: "Prepare them for what's next.", accent: true },
    ],
    sub: 'Build a program that lasts. Give your athletes the tools, structure, and consistent training they need to reach the next level.',
    pillars: ['Program Growth', 'Expert Organization', 'Continuous Development'],
    glow: 'teal',
  },
  {
    id: 'adaptive',
    image: '/ca/images/slides/adaptive.jpg',
    alt: 'Coach with a tablet alongside a wheelchair basketball player and a runner with a prosthetic leg',
    title: [{ t: 'Adaptive', accent: true }, { t: 'Sports' }],
    tagline: [{ t: 'Every athlete. ' }, { t: 'Every level.', accent: true }],
    sub: 'Inclusive tools that build pathways to the next level.',
    pillars: ['Custom Practice Plans', 'Adaptive Training', 'Program Growth'],
    glow: 'orange',
  },
  {
    id: 'showcase',
    image: '/ca/images/slides/showcase.jpg',
    alt: 'Coach logging results on a tablet while athletes sprint and scouts take notes',
    title: [{ t: 'Showcase &', accent: true }, { t: 'Pathway' }],
    tagline: [{ t: 'Get them to the ' }, { t: 'next level.', accent: true }],
    sub: 'Track performance, build profiles, and impress scouts.',
    pillars: ['Athletic Metric Tracking', 'Scout-Ready Rosters', 'Recruiting Portfolios'],
    glow: 'teal',
  },
  {
    id: 'adult',
    image: '/ca/images/slides/adult.jpg',
    alt: 'Adult softball team high-fiving by the dugout while a captain checks the lineup on a phone',
    title: [{ t: 'Adult Rec', accent: true }, { t: 'Leagues' }],
    tagline: [{ t: 'Less logistics. ' }, { t: 'More game.', accent: true }],
    sub: 'The easy way to manage playing time, rotations, and subs.',
    pillars: ['Smart Lineup Builders', 'Fair Play Rotations', 'Roster & RSVP Tracking'],
    glow: 'orange',
  },
  {
    id: 'senior',
    image: '/ca/images/slides/senior.jpg',
    alt: 'Smiling seniors playing pickleball and stretching with a coach holding a clipboard',
    title: [{ t: 'Senior', accent: true }, { t: 'Programs' }],
    tagline: [{ t: 'Fitness for life. ' }, { t: 'No age limit.', accent: true }],
    sub: 'Easy-to-use tools to train, engage, and grow active aging communities.',
    pillars: ['Low-Impact Exercise Plans', 'Mobility & Balance Drills', 'Community Engagement'],
    glow: 'teal',
  },
  {
    id: 'pe',
    image: '/ca/images/slides/pe.jpg',
    alt: 'PE teacher with a tablet running agility stations in a school gym',
    title: [{ t: 'Physical', accent: true }, { t: 'Education', accent: true }],
    tagline: [{ t: 'Built for the ' }, { t: 'whole district.', accent: true }],
    sub: 'Curriculum planning and activity tracking made simple.',
    pillars: ['Progressive Unit Builders', 'Class Rotation Timers', 'Fitness & Skill Tracking'],
    glow: 'orange',
  },
]
