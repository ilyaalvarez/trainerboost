import { PLAN_CONFIG } from '@/lib/plans'

export type Role = 'trainer' | 'client'
export type AppointmentType = 'presencial' | 'online' | 'llamada'
export type AppointmentStatus = 'pending' | 'confirmed' | 'done' | 'cancelled'
export type ClientStatus = 'active' | 'paused' | 'ended'
export type RoutineStatus = 'active' | 'archived'
export type SubscriptionPlan = 'starter' | 'pro' | 'unlimited'
export type SubscriptionStatus = 'active' | 'inactive' | 'past_due' | 'cancelled'

export interface Profile {
  id: string
  role: Role
  full_name: string
  avatar_url: string | null
  phone: string | null
  bio: string | null
  specialties: string[]
  created_at: string
  updated_at: string
}

export interface TrainerClient {
  id: string
  trainer_id: string
  client_id: string
  status: ClientStatus
  started_at: string
  notes: string | null
  tags: string[]
}

export interface Invitation {
  id: string
  trainer_id: string
  code: string
  email: string | null
  used_at: string | null
  expires_at: string
  created_at: string
}

export interface Routine {
  id: string
  trainer_id: string
  client_id: string
  title: string
  description: string | null
  frequency: string | null
  status: RoutineStatus
  starts_at: string | null
  ends_at: string | null
  created_at: string
}

export interface RoutineExercise {
  id: string
  routine_id: string
  name: string
  sets: number | null
  reps: string | null
  rest_seconds: number | null
  notes: string | null
  video_url: string | null
  order_index: number
}

export interface ExerciseCompletion {
  id: string
  exercise_id: string
  client_id: string
  completed_at: string
}

export interface MealPlan {
  id: string
  trainer_id: string
  client_id: string
  title: string
  calories_target: number | null
  protein_target: number | null
  carbs_target: number | null
  fat_target: number | null
  notes: string | null
  status: 'active' | 'archived'
  created_at: string
}

export interface FoodItem {
  name: string
  grams: number
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface Meal {
  id: string
  meal_plan_id: string
  name: string
  time: string | null
  foods: FoodItem[]
  order_index: number
}

export interface ProgressLog {
  id: string
  client_id: string
  trainer_id: string
  logged_at: string
  weight_kg: number | null
  body_fat_pct: number | null
  muscle_mass_kg: number | null
  waist_cm: number | null
  chest_cm: number | null
  arm_cm: number | null
  thigh_cm: number | null
  hip_cm: number | null
  notes: string | null
  photos: string[]
}

export interface Appointment {
  id: string
  trainer_id: string
  client_id: string
  scheduled_at: string
  duration_minutes: number
  type: AppointmentType
  status: AppointmentStatus
  location: string | null
  notes: string | null
  trainer_notes: string | null
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read_at: string | null
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  status: SubscriptionStatus
  plan: SubscriptionPlan | null
  max_clients: number
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export type NotificationType =
  | 'message' | 'routine' | 'meal_plan' | 'appointment' | 'progress' | 'system'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string | null
  link: string | null
  read_at: string | null
  created_at: string
}

export interface SetLog {
  id: string
  exercise_id: string
  client_id: string
  set_number: number
  weight_kg: number | null
  reps: number | null
  logged_at: string
  created_at: string
}

export type RecipeCategory = 'desayuno' | 'comida' | 'cena' | 'snack'
export type DietSlot = 'desayuno' | 'comida' | 'cena' | 'snack'

export interface Receta {
  id: string
  nombre: string
  categoria: RecipeCategory
  calorias: number
  proteinas: number
  carbohidratos: number
  grasas: number
  ingredientes: string
  instrucciones: string
  tiempo_prep: number
  es_publica: boolean
  created_by: string | null
  created_at: string
}

export interface DietAssignment {
  id: string
  trainer_id: string
  client_id: string
  receta_id: string
  slot: DietSlot
  day_date: string
  created_at: string
  receta?: Receta
}

export interface PushSubscriptionRow {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  created_at: string
}

export interface DailyCheckin {
  id: string
  client_id: string
  checkin_date: string
  energy: number | null
  mood: number | null
  sleep_hours: number | null
  note: string | null
  created_at: string
}

// Joined types for common queries
export interface ClientWithProfile extends TrainerClient {
  profile: Profile
}

export interface AppointmentWithProfiles extends Appointment {
  client: Profile
  trainer: Profile
}

export interface MessageWithSender extends Message {
  sender: Profile
}

export interface RoutineWithExercises extends Routine {
  exercises: RoutineExercise[]
  client: Profile
}

export interface MealPlanWithMeals extends MealPlan {
  meals: Meal[]
}

// ─── New tables (migration 023) ──────────────────────────────────────────────

export interface WorkoutTemplate {
  id: string
  trainer_id: string
  name: string
  description: string | null
  category: 'fuerza' | 'cardio' | 'hiit' | 'rehabilitación' | 'funcional' | 'flexibilidad' | null
  difficulty: 'principiante' | 'intermedio' | 'avanzado' | null
  duration_minutes: number | null
  exercises: WorkoutTemplateExercise[]
  tags: string[]
  times_used: number
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface WorkoutTemplateExercise {
  name: string
  sets: number
  reps: string
  weight_kg: number | null
  rest_seconds: number
  notes: string | null
  order: number
}

export interface WorkoutSession {
  id: string
  routine_id: string | null
  client_id: string
  trainer_id: string
  scheduled_for: string | null
  completed_at: string | null
  duration_minutes: number | null
  exercises_log: WorkoutSessionExercise[]
  client_notes: string | null
  trainer_notes: string | null
  effort_level: number | null
  status: 'completed' | 'skipped' | 'cancelled'
  created_at: string
}

export interface WorkoutSessionExercise {
  exercise_id: string | null
  name: string
  sets: Array<{ reps: number | null; weight_kg: number | null; completed: boolean }>
  notes: string | null
}

export interface Challenge {
  id: string
  trainer_id: string
  name: string
  description: string | null
  type: 'individual' | 'group'
  duration_days: number
  start_date: string | null
  end_date: string | null
  price: number
  max_participants: number | null
  workout_template_id: string | null
  goals: string[]
  cover_image_url: string | null
  is_active: boolean
  created_at: string
}

export interface ChallengeParticipant {
  id: string
  challenge_id: string
  client_id: string
  enrolled_at: string
  completed_at: string | null
  progress_pct: number
  payment_status: 'pending' | 'paid' | 'refunded'
}

export interface Habit {
  id: string
  trainer_id: string
  client_id: string
  name: string
  icon: string
  target_days_per_week: number
  reminder_time: string | null
  is_active: boolean
  created_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  client_id: string
  logged_date: string
  completed: boolean
  notes: string | null
  created_at: string
}

export interface WeeklyCheckin {
  id: string
  trainer_id: string
  client_id: string
  week_start: string
  energy_level: number | null
  mood: number | null
  sleep_hours: number | null
  adherence_pct: number | null
  biggest_win: string | null
  biggest_challenge: string | null
  questions_for_trainer: string | null
  trainer_response: string | null
  photos: string[]
  submitted_at: string
  responded_at: string | null
}

export interface TrainerPublicProfile {
  id: string
  trainer_id: string
  slug: string
  headline: string | null
  about: string | null
  services: PublicService[]
  testimonials: PublicTestimonial[]
  gallery_urls: string[]
  booking_enabled: boolean
  contact_method: 'form' | 'whatsapp' | 'email'
  contact_value: string | null
  calendly_url: string | null
  social_links: {
    instagram?: string
    youtube?: string
    tiktok?: string
    web?: string
  }
  seo_title: string | null
  seo_description: string | null
  is_published: boolean
  views_count: number
  leads_count: number
  updated_at: string
}

export interface PublicService {
  name: string
  description: string
  price: number | null
  duration: number | null
  type: 'presencial' | 'online'
}

export interface PublicTestimonial {
  name: string
  text: string
  stars: number
  avatar_url: string | null
  verified: boolean
}

export interface Achievement {
  id: string
  key: string
  name: string
  description: string
  icon: string
  category: 'sesiones' | 'racha' | 'progreso' | 'habitos' | 'social'
  threshold: number | null
  created_at: string
}

export interface ClientAchievement {
  id: string
  client_id: string
  achievement_id: string
  unlocked_at: string
  achievement?: Achievement
}

// Derived from the single source of truth in `@/lib/plans` so prices and
// limits never drift between the pricing page, settings and the Stripe webhook.
export const PLAN_LIMITS: Record<SubscriptionPlan, number> = {
  starter:   PLAN_CONFIG.starter.maxClients,
  pro:       PLAN_CONFIG.pro.maxClients,
  unlimited: PLAN_CONFIG.unlimited.maxClients,
}

export const PLAN_PRICES: Record<SubscriptionPlan, number> = {
  starter:   PLAN_CONFIG.starter.price,
  pro:       PLAN_CONFIG.pro.price,
  unlimited: PLAN_CONFIG.unlimited.price,
}

// SubscriptionPlan and PlanKey (from @/lib/plans) describe the same tiers.
export type { PlanKey } from '@/lib/plans'
