import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGateway } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

export const generateAppointmentSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ appointmentId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const { supabase, userId } = context;

    const { data: appt, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", data.appointmentId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    if (!appt) throw new Error("Appointment not found");

    const gateway = createLovableAiGateway(key);
    const prompt = `You are a friendly healthcare assistant. Write a short, patient-friendly summary of this doctor visit.

Patient: ${appt.patient_name}
Doctor: ${appt.doctor_name}
Visit: ${appt.title}
Date/Time: ${new Date(appt.scheduled_at).toLocaleString()}
Notes from visit: ${appt.notes ?? "(none)"}

Structure your reply as short markdown with these sections:
- **Visit overview** (1-2 sentences)
- **What this means** (plain-English explanation)
- **Medicine / care instructions** (bullets if applicable)
- **Follow-up advice** (bullets)
Keep it under 200 words. Do not invent medical facts that aren't in the notes; if information is missing, say so gently.`;

    const { text } = await generateText({
      model: gateway(MODEL),
      prompt,
    });

    const { data: saved, error: insertErr } = await supabase
      .from("ai_summaries")
      .insert({
        user_id: userId,
        appointment_id: appt.id,
        summary: text,
        model: MODEL,
      })
      .select()
      .single();
    if (insertErr) throw insertErr;

    return saved;
  });
