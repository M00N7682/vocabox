-- ============================================
-- Signup helper: creates academy + profile bypassing RLS
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_signup(
  p_user_id uuid,
  p_academy_name text,
  p_slug text,
  p_phone text,
  p_owner_name text,
  p_email text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_academy_id uuid;
BEGIN
  -- Create academy
  INSERT INTO public.academies (name, slug, phone)
  VALUES (p_academy_name, p_slug, p_phone)
  RETURNING id INTO v_academy_id;

  -- Create profile
  INSERT INTO public.profiles (id, academy_id, name, email, role)
  VALUES (p_user_id, v_academy_id, p_owner_name, p_email, 'admin');

  RETURN json_build_object('academy_id', v_academy_id);
END;
$$;
