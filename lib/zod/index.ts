import { z } from "zod";

export const magicLinkSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(8).optional()
}).refine((data) => data.email || data.phone, { message: "Email or phone required" });

export const testimonialSchema = z.object({
  category: z.string().min(2),
  title: z.string().min(2),
  content: z.string().min(10),
  media_urls: z.array(z.string().url()).optional(),
  is_anonymous: z.boolean().default(false),
  consent_public: z.boolean()
});

export const roomBookingSchema = z.object({
  room_slot_id: z.string().uuid(),
  party_size: z.number().int().min(1).max(10),
  notes: z.string().optional()
});

export const mentorBookingSchema = z.object({
  mentor_id: z.string().uuid(),
  availability_id: z.string().uuid().optional(),
  start_at: z.string(),
  end_at: z.string(),
  location_text: z.string().min(2),
  notes: z.string().optional(),
  deposit_required: z.boolean().default(false),
  deposit_amount_cents: z.number().int().min(0).default(0)
});

export const enrollmentSchema = z.object({
  course_session_id: z.string().uuid()
});
