import type { Messages } from './types'

export const en: Messages = {
  nav: {
    howItWorks: 'How it works',
    faq: 'FAQ',
    waitlist: 'Join waitlist',
    ariaLabel: 'Main navigation',
    goToTop: 'Go to top',
  },
  hero: {
    h1: 'Manage your clients\nlike a pro',
    sub: 'Organized clients. Automatic tracking.\nPayments on time. All in one place.',
    hint: 'No commitment · We\'ll notify you before launch',
  },
  pain: {
    sectionTitle: 'Without TrainerBoost,\nhere\'s what a Personal\nTrainer\'s day looks like',
    items: [
      {
        bad: 'Training plans sent as PDFs over WhatsApp',
        good: 'Digital routines clients can view from their phone',
      },
      {
        bad: 'Manual payments and awkward collection reminders',
        good: 'Stripe built-in — payments arrive automatically, no chasing',
      },
      {
        bad: 'Clients drop off because they can\'t see their progress',
        good: 'Automatic charts that keep them committed',
      },
    ],
    closeTitle: 'Everything you need\nto manage better\nand get paid on time.',
  },
  faq: {
    sectionTitle: 'Frequently asked\nquestions from Personal Trainers',
    items: [
      {
        q: 'When will it be available?',
        a: 'We\'re in private beta with selected trainers. The public launch is planned for later in 2026. Join the waitlist to get access before anyone else.',
      },
      {
        q: 'Do I need to install an app?',
        a: 'No. TrainerBoost works from the browser, on any device.',
      },
      {
        q: 'Do my clients need to download anything?',
        a: 'No either. Your clients access their area from their phone or tablet directly, with nothing to download.',
      },
      {
        q: 'What happens to my data if I cancel?',
        a: 'It\'s yours. You can export clients, history and routines at any time, in standard formats.',
      },
      {
        q: 'Does it work for trainers with many clients?',
        a: 'Yes. From 5 to over 100 clients without switching tools. The platform scales with you.',
      },
      {
        q: 'How is it different from a generic fitness app?',
        a: 'Fitness apps are built for the end client. TrainerBoost is built for you: to manage your business, track progress and get paid. No extra noise.',
      },
    ],
  },
  cta: {
    h2: 'Start today.',
    sub: 'Sign up. We\'ll notify you before launch.',
  },
  footer: {
    copy: '© 2026 TrainerBoost',
    ariaLabel: 'Footer',
    legalLinks: 'Legal pages',
    privacy: 'Privacy',
    terms: 'Terms',
    cookies: 'Cookies',
    legalNotice: 'Legal Notice',
  },
  form: {
    placeholder: 'your@email.com',
    buttonText: 'Notify me at launch',
    ariaEmail: 'Your email to join the waitlist',
    ariaSubmit: 'Join the waitlist',
    errorDefault: 'Failed to join. Please try again.',
    errorNetwork: 'No connection. Check your network and try again.',
    successNew: 'Received. We\'ll notify you before launch.',
    successAlready: 'You\'re already on the list. We\'ll let you know when we open.',
    spotsLeft: '{n} people on the waitlist',
  },
  a11y: {
    skipToContent: 'Skip to main content',
    mainContent: 'Main content',
    painLabel: 'The problem',
    ctaLabel: 'Join the waitlist',
  },
}
