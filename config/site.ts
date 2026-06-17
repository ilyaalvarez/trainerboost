export const siteConfig = {
  name: 'TrainerBoost',
  tagline: 'Sube de nivel tu negocio de entrenamiento personal',
  url: 'https://trainerboost.es',
  description: 'La plataforma SaaS para entrenadores personales en España. Clientes, rutinas, nutrición y cobros. En español. Desde 19€/mes.',
  themeColor: '#8FD43A',
  social: {
    instagram: 'https://instagram.com/trainerboost.es',
    tiktok: 'https://tiktok.com/@trainerboost',
    twitter: 'https://twitter.com/trainerboost',
  },
  waitlist: {
    totalSpots: 100,
    seedCount: 47,
    storageKey: 'tb_waitlist_count',
  },
  pricing: {
    starter: 19,
    pro: 39,
    business: 79,
    currency: 'EUR',
  },
  launch: {
    targetDate: null as string | null,
    showCountdown: false,
  },
} as const
