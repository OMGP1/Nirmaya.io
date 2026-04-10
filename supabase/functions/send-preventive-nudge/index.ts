// Supabase Edge Function: send-preventive-nudge
// Finds patients who haven't completed a health assessment in 90+ days
// and logs a nudge notification (console placeholder for Resend).
//
// Deploy: supabase functions deploy send-preventive-nudge
// Trigger: pg_cron schedule — first day of every month at 9 AM

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Calculate cutoff date (90 days ago)
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 90);
        const cutoffISO = cutoff.toISOString();

        console.log(
            `[nudge] Looking for patients without assessment since ${cutoffISO}`
        );

        // Step 1: Get all patients
        const { data: patients, error: pErr } = await supabase
            .from("users")
            .select("id, email, full_name")
            .eq("role", "patient")
            .eq("is_active", true);

        if (pErr) {
            throw new Error(`Failed to query patients: ${pErr.message}`);
        }

        if (!patients || patients.length === 0) {
            console.log("[nudge] No active patients found.");
            return new Response(
                JSON.stringify({ sent: 0, message: "No active patients" }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                }
            );
        }

        // Step 2: For each patient check latest assessment date
        const nudgeTargets: Array<{
            id: string;
            email: string;
            full_name: string;
        }> = [];

        for (const patient of patients) {
            const { data: latest } = await supabase
                .from("health_assessments")
                .select("created_at")
                .eq("patient_id", patient.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            // Nudge if NO assessment ever, or last assessment older than 90 days
            if (!latest || new Date(latest.created_at) < cutoff) {
                nudgeTargets.push(patient);
            }
        }

        console.log(
            `[nudge] Found ${nudgeTargets.length} patient(s) needing a nudge`
        );

        // Step 3: Log nudge emails (placeholder for Resend integration)
        for (const patient of nudgeTargets) {
            // ─── PLACEHOLDER ─────────────────────────────────────
            // When Resend API key is available, replace this block
            // with an actual fetch() to https://api.resend.com/emails
            // ─────────────────────────────────────────────────────
            console.log(`[nudge] 📧 Would send email to: ${patient.email}`);
            console.log(`        Name: ${patient.full_name}`);
            console.log(
                `        Subject: ⏰ Time for Your Preventive Health Checkup`
            );
            console.log(
                `        Body: Hi ${patient.full_name}, it's been over 3 months since your last health assessment. Take 2 minutes to complete your risk assessment at /risk-assessment.`
            );
            console.log("        ---");
        }

        const result = {
            sent: nudgeTargets.length,
            targets: nudgeTargets.map((p) => ({
                email: p.email,
                name: p.full_name,
            })),
            cutoff_date: cutoffISO,
            message: `Nudge logged for ${nudgeTargets.length} patient(s). Resend integration pending.`,
        };

        console.log("[nudge] ✓ Done.", JSON.stringify(result));

        return new Response(JSON.stringify(result), {
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("[nudge] Error:", error);
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            {
                status: 500,
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json",
                },
            }
        );
    }
});
