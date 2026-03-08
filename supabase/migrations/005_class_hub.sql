-- 005_class_hub.sql
-- Add class-centric features: class_textbooks, quick_records, class_id on assessments/assignments

-- 1. class_textbooks junction table (교재-반 연결)
CREATE TABLE IF NOT EXISTS public.class_textbooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  textbook_id uuid NOT NULL REFERENCES public.textbooks(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(class_id, textbook_id)
);
ALTER TABLE public.class_textbooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "class_textbooks_academy" ON public.class_textbooks
  USING (class_id IN (SELECT id FROM public.classes WHERE academy_id = public.get_my_academy_id()));

-- 2. quick_records table (수시 기록)
CREATE TABLE IF NOT EXISTS public.quick_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  record_date date NOT NULL,
  category text NOT NULL DEFAULT '단어시험',
  label text,
  value text,
  numeric_value decimal(7,2),
  note text,
  recorded_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quick_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quick_records_academy" ON public.quick_records
  USING (academy_id = public.get_my_academy_id());
CREATE INDEX idx_quick_records_class ON public.quick_records(class_id);
CREATE INDEX idx_quick_records_student ON public.quick_records(student_id);
CREATE INDEX idx_quick_records_date ON public.quick_records(record_date);
CREATE UNIQUE INDEX idx_quick_records_upsert ON public.quick_records(class_id, student_id, record_date, category, COALESCE(label, ''));

-- 3. Add class_id to assessments
DO $$ BEGIN
  ALTER TABLE public.assessments ADD COLUMN class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS idx_assessments_class ON public.assessments(class_id);

-- 4. Add class_id to assignments
DO $$ BEGIN
  ALTER TABLE public.assignments ADD COLUMN class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS idx_assignments_class ON public.assignments(class_id);
