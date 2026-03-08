-- Migration: Parent Report Tokens & Payments (수납 관리)
-- Description: Add parent report token system for public student reports,
--              and payment tracking for academies.

---------------------------------------------------------------------------
-- 1. Parent Report Tokens
---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.parent_report_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz, -- null = never expires
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: teachers can manage their academy's tokens
ALTER TABLE public.parent_report_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Academy members can manage report tokens"
  ON public.parent_report_tokens FOR ALL
  USING (academy_id = get_my_academy_id());

---------------------------------------------------------------------------
-- 2. Payments (수납 관리)
---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount integer NOT NULL, -- in KRW
  description text NOT NULL, -- e.g. "3월 수업료", "교재비"
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  paid_at timestamptz,
  payment_method text
    CHECK (payment_method IN ('cash', 'transfer', 'card', 'auto', 'other')),
  memo text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Academy members can manage payments"
  ON public.payments FOR ALL
  USING (academy_id = get_my_academy_id());

-- Indexes for common queries
CREATE INDEX idx_payments_student ON public.payments(student_id, due_date);
CREATE INDEX idx_payments_status ON public.payments(academy_id, status, due_date);

---------------------------------------------------------------------------
-- 3. Public token lookup function (SECURITY DEFINER — bypasses RLS)
---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_report_by_token(p_token text)
RETURNS TABLE (
  student_id uuid,
  academy_id uuid,
  student_name text,
  academy_name text
)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT t.student_id, t.academy_id, s.name, a.name
  FROM public.parent_report_tokens t
  JOIN public.students s ON s.id = t.student_id
  JOIN public.academies a ON a.id = t.academy_id
  WHERE t.token = p_token
    AND t.is_active = true
    AND (t.expires_at IS NULL OR t.expires_at > now());
$$;

---------------------------------------------------------------------------
-- 4. SECURITY DEFINER functions for public student data by token
---------------------------------------------------------------------------

-- Get attendance for a student (last 30 days)
CREATE OR REPLACE FUNCTION public.get_student_attendance_by_token(p_token text)
RETURNS TABLE (
  date date,
  status text,
  subject_name text
)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT a.date::date, a.status::text, s.name
  FROM public.attendance a
  JOIN public.subjects s ON s.id = a.subject_id
  WHERE a.student_id = (
    SELECT t.student_id FROM public.parent_report_tokens t
    WHERE t.token = p_token AND t.is_active = true
    AND (t.expires_at IS NULL OR t.expires_at > now())
  )
  AND a.date >= (CURRENT_DATE - INTERVAL '30 days')
  ORDER BY a.date DESC;
$$;

-- Get assignment status for a student (last 30 days)
CREATE OR REPLACE FUNCTION public.get_student_assignments_by_token(p_token text)
RETURNS TABLE (
  title text,
  due_date timestamptz,
  status text,
  subject_name text
)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT asg.title, asg.due_date, ast.status::text, s.name
  FROM public.assignment_students ast
  JOIN public.assignments asg ON asg.id = ast.assignment_id
  JOIN public.subjects s ON s.id = asg.subject_id
  WHERE ast.student_id = (
    SELECT t.student_id FROM public.parent_report_tokens t
    WHERE t.token = p_token AND t.is_active = true
    AND (t.expires_at IS NULL OR t.expires_at > now())
  )
  AND asg.due_date >= (CURRENT_DATE - INTERVAL '30 days')::timestamptz
  ORDER BY asg.due_date DESC;
$$;

-- Get quick records for a student (last 30 days)
CREATE OR REPLACE FUNCTION public.get_student_records_by_token(p_token text)
RETURNS TABLE (
  record_date date,
  category text,
  label text,
  value text,
  numeric_value double precision
)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT qr.record_date::date, qr.category, qr.label, qr.value, qr.numeric_value::double precision
  FROM public.quick_records qr
  WHERE qr.student_id = (
    SELECT t.student_id FROM public.parent_report_tokens t
    WHERE t.token = p_token AND t.is_active = true
    AND (t.expires_at IS NULL OR t.expires_at > now())
  )
  AND qr.record_date >= (CURRENT_DATE - INTERVAL '30 days')
  ORDER BY qr.record_date DESC;
$$;

-- Get assessment scores for a student (last 3 months)
CREATE OR REPLACE FUNCTION public.get_student_scores_by_token(p_token text)
RETURNS TABLE (
  assessment_name text,
  assessment_date date,
  assessment_type text,
  score double precision,
  total_points integer,
  status text,
  subject_name text
)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT a.name, a.date::date, a.type::text, sc.score::double precision, a.total_points, sc.status::text, s.name
  FROM public.assessment_scores sc
  JOIN public.assessments a ON a.id = sc.assessment_id
  JOIN public.subjects s ON s.id = a.subject_id
  WHERE sc.student_id = (
    SELECT t.student_id FROM public.parent_report_tokens t
    WHERE t.token = p_token AND t.is_active = true
    AND (t.expires_at IS NULL OR t.expires_at > now())
  )
  AND a.date >= (CURRENT_DATE - INTERVAL '90 days')
  ORDER BY a.date DESC;
$$;

-- Get payment info for a student (last 3 months)
CREATE OR REPLACE FUNCTION public.get_student_payments_by_token(p_token text)
RETURNS TABLE (
  description text,
  amount integer,
  due_date date,
  status text,
  paid_at timestamptz
)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT p.description, p.amount, p.due_date, p.status, p.paid_at
  FROM public.payments p
  WHERE p.student_id = (
    SELECT t.student_id FROM public.parent_report_tokens t
    WHERE t.token = p_token AND t.is_active = true
    AND (t.expires_at IS NULL OR t.expires_at > now())
  )
  AND p.due_date >= (CURRENT_DATE - INTERVAL '90 days')
  ORDER BY p.due_date DESC;
$$;
