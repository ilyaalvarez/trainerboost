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
