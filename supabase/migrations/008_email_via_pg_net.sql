-- Migration: Create email sending via Supabase pg_net
-- This sends emails server-side using database triggers, avoiding CORS issues

-- Enable the pg_net extension for HTTP requests from database
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create email queue table to track sent emails
CREATE TABLE IF NOT EXISTS public.email_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    error_message TEXT,
    appointment_id UUID REFERENCES appointments(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

-- Enable RLS on email_queue
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- Only allow admins to view email queue
CREATE POLICY "Admins can view email queue"
    ON public.email_queue
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Create function to send email via Resend API using pg_net
CREATE OR REPLACE FUNCTION public.send_email_via_resend(
    p_to TEXT,
    p_subject TEXT,
    p_html TEXT,
    p_appointment_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_request_id BIGINT;
    v_email_id UUID;
    v_resend_key TEXT;
BEGIN
    -- Get Resend API key from secrets (set via Supabase Dashboard > Settings > Vault)
    -- For now, we'll use a hardcoded key (you should move this to vault in production)
    v_resend_key := 're_Secgsho7_FYojaTqkAe3QeWD1sjrRmJ8J';
    
    -- Create email record
    INSERT INTO public.email_queue (to_email, subject, html_content, appointment_id, status)
    VALUES (p_to, p_subject, p_html, p_appointment_id, 'pending')
    RETURNING id INTO v_email_id;
    
    -- Send HTTP request to Resend API
    SELECT net.http_post(
        url := 'https://api.resend.com/emails',
        headers := jsonb_build_object(
            'Authorization', 'Bearer ' || v_resend_key,
            'Content-Type', 'application/json'
        ),
        body := jsonb_build_object(
            'from', 'Niramaya <onboarding@resend.dev>',
            'to', ARRAY[p_to],
            'subject', p_subject,
            'html', p_html
        )
    ) INTO v_request_id;
    
    -- Update email status (mark as sent for now, could implement callback later)
    UPDATE public.email_queue 
    SET status = 'sent', sent_at = NOW()
    WHERE id = v_email_id;
    
    RETURN v_email_id;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    UPDATE public.email_queue 
    SET status = 'failed', error_message = SQLERRM
    WHERE id = v_email_id;
    
    RETURN v_email_id;
END;
$$;

-- Create function to generate patient confirmation email HTML
CREATE OR REPLACE FUNCTION public.generate_patient_email_html(
    p_patient_name TEXT,
    p_doctor_name TEXT,
    p_department_name TEXT,
    p_appointment_date TIMESTAMPTZ,
    p_reason TEXT,
    p_appointment_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN format(
        '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Appointment Confirmed</title></head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa;">
<div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
<div style="background: linear-gradient(135deg, #4F46E5 0%%, #7C3AED 100%%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
<h1 style="color: white; margin: 0; font-size: 28px;">✅ Appointment Confirmed!</h1>
</div>
<div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
<p style="font-size: 16px; color: #374151;">Hi <strong>%s</strong>,</p>
<p style="font-size: 16px; color: #374151;">Your appointment has been successfully booked:</p>
<div style="background: #F3F4F6; border-radius: 12px; padding: 20px; margin: 20px 0;">
<p style="margin: 10px 0;"><strong>Doctor:</strong> Dr. %s</p>
<p style="margin: 10px 0;"><strong>Department:</strong> %s</p>
<p style="margin: 10px 0;"><strong>Date:</strong> %s</p>
<p style="margin: 10px 0;"><strong>Reason:</strong> %s</p>
<p style="margin: 10px 0; color: #4F46E5;"><strong>Confirmation:</strong> %s</p>
</div>
<p style="font-size: 14px; color: #6B7280;">Please arrive 10-15 minutes early.</p>
<div style="text-align: center; margin-top: 30px;">
<a href="https://healthcare-appointment-sigma.vercel.app/appointments" style="background: linear-gradient(135deg, #4F46E5 0%%, #7C3AED 100%%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Appointment</a>
</div>
</div>
</div>
</body>
</html>',
        p_patient_name,
        p_doctor_name,
        p_department_name,
        to_char(p_appointment_date, 'Day, Month DD, YYYY at HH12:MI AM'),
        p_reason,
        upper(substring(p_appointment_id::text from 1 for 8))
    );
END;
$$;

-- Create trigger function to send email when appointment is created
CREATE OR REPLACE FUNCTION public.on_appointment_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_patient_email TEXT;
    v_patient_name TEXT;
    v_doctor_email TEXT;
    v_doctor_name TEXT;
    v_department_name TEXT;
    v_patient_email_html TEXT;
    v_doctor_email_html TEXT;
BEGIN
    -- Get patient info
    SELECT email, full_name INTO v_patient_email, v_patient_name
    FROM public.users
    WHERE id = NEW.patient_id;
    
    -- Get doctor and department info (including doctor's email)
    SELECT 
        u.full_name,
        u.email,
        COALESCE(d.name, 'General')
    INTO v_doctor_name, v_doctor_email, v_department_name
    FROM public.doctors doc
    LEFT JOIN public.users u ON doc.user_id = u.id
    LEFT JOIN public.departments d ON doc.department_id = d.id
    WHERE doc.id = NEW.doctor_id;
    
    -- Generate patient email HTML
    v_patient_email_html := public.generate_patient_email_html(
        v_patient_name,
        v_doctor_name,
        v_department_name,
        NEW.start_time,
        COALESCE(NEW.reason, 'Consultation'),
        NEW.id
    );
    
    -- Send email to patient (async via pg_net)
    PERFORM public.send_email_via_resend(
        v_patient_email,
        'Appointment Confirmed - ' || to_char(NEW.start_time, 'Month DD, YYYY'),
        v_patient_email_html,
        NEW.id
    );
    
    -- Generate and send doctor notification email
    IF v_doctor_email IS NOT NULL THEN
        v_doctor_email_html := format(
            '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Appointment</title></head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa;">
<div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
<div style="background: linear-gradient(135deg, #10B981 0%%, #059669 100%%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
<h1 style="color: white; margin: 0; font-size: 28px;">📅 New Appointment Booked</h1>
</div>
<div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
<p style="font-size: 16px; color: #374151;">Hi <strong>Dr. %s</strong>,</p>
<p style="font-size: 16px; color: #374151;">A new appointment has been booked with you:</p>
<div style="background: #F3F4F6; border-radius: 12px; padding: 20px; margin: 20px 0;">
<p style="margin: 10px 0;"><strong>Patient:</strong> %s</p>
<p style="margin: 10px 0;"><strong>Date:</strong> %s</p>
<p style="margin: 10px 0;"><strong>Reason:</strong> %s</p>
</div>
<div style="text-align: center; margin-top: 30px;">
<a href="https://healthcare-appointment-sigma.vercel.app/doctor/appointments" style="background: linear-gradient(135deg, #10B981 0%%, #059669 100%%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Schedule</a>
</div>
</div>
</div>
</body>
</html>',
            v_doctor_name,
            v_patient_name,
            to_char(NEW.start_time, 'Day, Month DD, YYYY at HH12:MI AM'),
            COALESCE(NEW.reason, 'Consultation')
        );
        
        -- Send email to doctor
        PERFORM public.send_email_via_resend(
            v_doctor_email,
            'New Appointment: ' || v_patient_name || ' - ' || to_char(NEW.start_time, 'Month DD, YYYY'),
            v_doctor_email_html,
            NEW.id
        );
    END IF;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Don't fail the appointment creation if email fails
    RAISE WARNING 'Email sending failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger on appointments table
DROP TRIGGER IF EXISTS trigger_appointment_email ON public.appointments;
CREATE TRIGGER trigger_appointment_email
    AFTER INSERT ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.on_appointment_created();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA net TO postgres, authenticated, service_role;
GRANT EXECUTE ON FUNCTION net.http_post TO postgres, authenticated, service_role;

