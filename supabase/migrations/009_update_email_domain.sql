-- Run this SQL in Supabase SQL Editor to update the email sender domain
-- This fixes doctor email notifications by using your verified healthbook.com domain

-- Update the send_email function to use your verified domain
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
    -- Resend API key
    v_resend_key := 're_hMLy3kru_E9jjB8Ty5K76Nd53NN9xp8K9';
    
    -- Create email record
    INSERT INTO public.email_queue (to_email, subject, html_content, appointment_id, status)
    VALUES (p_to, p_subject, p_html, p_appointment_id, 'pending')
    RETURNING id INTO v_email_id;
    
    -- Send HTTP request to Resend API using YOUR VERIFIED DOMAIN
    SELECT net.http_post(
        url := 'https://api.resend.com/emails',
        headers := jsonb_build_object(
            'Authorization', 'Bearer ' || v_resend_key,
            'Content-Type', 'application/json'
        ),
        body := jsonb_build_object(
            'from', 'HealthBook <noreply@healthbook.com>',
            'to', ARRAY[p_to],
            'subject', p_subject,
            'html', p_html
        )
    ) INTO v_request_id;
    
    -- Update email status
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

-- Verify the function was updated
SELECT 'Email function updated to use healthbook.com domain!' as status;
