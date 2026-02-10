-- ==========================================
-- PAYMENT RPC FUNCTIONS
-- ==========================================

-- Function to securely record a payment for a student
CREATE OR REPLACE FUNCTION record_student_payment(
    p_amount DECIMAL,
    p_purpose TEXT,
    p_reference TEXT
)
RETURNS JSON AS $$
DECLARE
    v_student_id UUID;
    v_payment_id UUID;
    result JSON;
BEGIN
    -- 1. Verify Authentication
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Access denied: Authentication required';
    END IF;

    -- 2. Get Student ID from Profile
    SELECT id INTO v_student_id
    FROM students
    WHERE user_id = auth.uid() AND deleted_at IS NULL;

    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Access denied: Student profile not found';
    END IF;

    -- 3. Insert Payment Record
    INSERT INTO payments (
        student_id,
        amount,
        currency,
        purpose,
        status,
        reference,
        payment_date
    ) VALUES (
        v_student_id,
        p_amount,
        'NGN',
        p_purpose,
        'successful', -- Simulating instant success for this demo
        p_reference,
        NOW()
    )
    RETURNING id INTO v_payment_id;

    -- 4. Return Success Response
    SELECT json_build_object(
        'success', true,
        'message', 'Payment recorded successfully',
        'data', json_build_object(
            'payment_id', v_payment_id,
            'reference', p_reference,
            'amount', p_amount,
            'status', 'successful',
            'date', NOW()
        )
    ) INTO result;

    RETURN result;

EXCEPTION WHEN OTHERS THEN
    -- Handle errors (e.g., duplicate reference)
    RETURN json_build_object(
        'success', false,
        'message', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION record_student_payment(DECIMAL, TEXT, TEXT) TO authenticated;
