export const waitlistConfig = {
  maxEmailsPerHour: 1,
  honeyPotField: 'website',
  successRedirect: null as string | null,
  emailProvider: 'supabase' as 'supabase' | 'json' | 'resend',
  confirmationEmail: false,
} as const
