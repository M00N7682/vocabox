-- ============================================
-- AiVoca Initial Schema
-- 순서: 테이블 생성 → 헬퍼 함수 → RLS 정책 → 인덱스 → 트리거
-- ============================================

-- ============================================
-- STEP 1: 테이블 생성 (FK 의존 순서)
-- ============================================

CREATE TABLE public.academies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  phone text,
  logo_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'teacher')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  name text NOT NULL,
  english_name text,
  phone text,
  parent_phone text,
  school text,
  grade text,
  memo text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.class_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(class_id, student_id)
);

CREATE TABLE public.vocab_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  word_count int DEFAULT 0,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.vocab_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vocab_book_id uuid NOT NULL REFERENCES public.vocab_books(id) ON DELETE CASCADE,
  english text NOT NULL,
  korean text NOT NULL,
  sort_order int NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  vocab_book_id uuid NOT NULL REFERENCES public.vocab_books(id) ON DELETE CASCADE,
  scheduled_date date NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'missed')),
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  vocab_book_id uuid NOT NULL REFERENCES public.vocab_books(id) ON DELETE CASCADE,
  test_date date NOT NULL,
  correct_count int NOT NULL,
  total_count int NOT NULL,
  score_percentage decimal(5,2) NOT NULL,
  test_type text NOT NULL CHECK (test_type IN ('eng_to_kor', 'kor_to_eng')),
  recorded_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.test_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  vocab_book_id uuid NOT NULL REFERENCES public.vocab_books(id) ON DELETE CASCADE,
  test_type text NOT NULL CHECK (test_type IN ('eng_to_kor', 'kor_to_eng')),
  is_shuffled boolean DEFAULT false,
  word_from int,
  word_to int,
  printed_by uuid REFERENCES public.profiles(id),
  printed_at timestamptz DEFAULT now()
);

-- ============================================
-- STEP 2: 헬퍼 함수 (profiles 테이블 생성 후)
-- ============================================

CREATE OR REPLACE FUNCTION public.get_my_academy_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT academy_id FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()
$$;

-- ============================================
-- STEP 3: RLS 활성화 + 정책
-- ============================================

-- academies
ALTER TABLE public.academies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own academy"
  ON public.academies FOR SELECT
  USING (id = public.get_my_academy_id());

CREATE POLICY "Admins can update own academy"
  ON public.academies FOR UPDATE
  USING (id = public.get_my_academy_id() AND public.is_admin());

CREATE POLICY "Authenticated users can create academy"
  ON public.academies FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view profiles in same academy"
  ON public.profiles FOR SELECT
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Authenticated users can create profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (academy_id = public.get_my_academy_id() AND public.is_admin());

-- classes
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view classes in own academy"
  ON public.classes FOR SELECT
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can insert classes in own academy"
  ON public.classes FOR INSERT
  WITH CHECK (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can update classes in own academy"
  ON public.classes FOR UPDATE
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Admins can delete classes"
  ON public.classes FOR DELETE
  USING (academy_id = public.get_my_academy_id() AND public.is_admin());

-- students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view students in own academy"
  ON public.students FOR SELECT
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can insert students in own academy"
  ON public.students FOR INSERT
  WITH CHECK (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can update students in own academy"
  ON public.students FOR UPDATE
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Admins can delete students"
  ON public.students FOR DELETE
  USING (academy_id = public.get_my_academy_id() AND public.is_admin());

-- class_students
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view class_students in own academy"
  ON public.class_students FOR SELECT
  USING (
    class_id IN (SELECT id FROM public.classes WHERE academy_id = public.get_my_academy_id())
  );

CREATE POLICY "Users can insert class_students in own academy"
  ON public.class_students FOR INSERT
  WITH CHECK (
    class_id IN (SELECT id FROM public.classes WHERE academy_id = public.get_my_academy_id())
  );

CREATE POLICY "Users can delete class_students in own academy"
  ON public.class_students FOR DELETE
  USING (
    class_id IN (SELECT id FROM public.classes WHERE academy_id = public.get_my_academy_id())
  );

-- vocab_books
ALTER TABLE public.vocab_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view vocab_books in own academy"
  ON public.vocab_books FOR SELECT
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can insert vocab_books in own academy"
  ON public.vocab_books FOR INSERT
  WITH CHECK (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can update vocab_books in own academy"
  ON public.vocab_books FOR UPDATE
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Admins can delete vocab_books"
  ON public.vocab_books FOR DELETE
  USING (academy_id = public.get_my_academy_id() AND public.is_admin());

-- vocab_words
ALTER TABLE public.vocab_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view vocab_words in own academy"
  ON public.vocab_words FOR SELECT
  USING (
    vocab_book_id IN (SELECT id FROM public.vocab_books WHERE academy_id = public.get_my_academy_id())
  );

CREATE POLICY "Users can insert vocab_words in own academy"
  ON public.vocab_words FOR INSERT
  WITH CHECK (
    vocab_book_id IN (SELECT id FROM public.vocab_books WHERE academy_id = public.get_my_academy_id())
  );

CREATE POLICY "Users can update vocab_words in own academy"
  ON public.vocab_words FOR UPDATE
  USING (
    vocab_book_id IN (SELECT id FROM public.vocab_books WHERE academy_id = public.get_my_academy_id())
  );

CREATE POLICY "Users can delete vocab_words in own academy"
  ON public.vocab_words FOR DELETE
  USING (
    vocab_book_id IN (SELECT id FROM public.vocab_books WHERE academy_id = public.get_my_academy_id())
  );

-- schedules
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view schedules in own academy"
  ON public.schedules FOR SELECT
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can insert schedules in own academy"
  ON public.schedules FOR INSERT
  WITH CHECK (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can update schedules in own academy"
  ON public.schedules FOR UPDATE
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Admins can delete schedules"
  ON public.schedules FOR DELETE
  USING (academy_id = public.get_my_academy_id() AND public.is_admin());

-- scores
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scores in own academy"
  ON public.scores FOR SELECT
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can insert scores in own academy"
  ON public.scores FOR INSERT
  WITH CHECK (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can update scores in own academy"
  ON public.scores FOR UPDATE
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Admins can delete scores"
  ON public.scores FOR DELETE
  USING (academy_id = public.get_my_academy_id() AND public.is_admin());

-- test_records
ALTER TABLE public.test_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view test_records in own academy"
  ON public.test_records FOR SELECT
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can insert test_records in own academy"
  ON public.test_records FOR INSERT
  WITH CHECK (academy_id = public.get_my_academy_id());

-- ============================================
-- STEP 4: 인덱스
-- ============================================

CREATE INDEX idx_profiles_academy ON public.profiles(academy_id);
CREATE INDEX idx_students_academy_active ON public.students(academy_id, is_active);
CREATE INDEX idx_class_students_class ON public.class_students(class_id);
CREATE INDEX idx_class_students_student ON public.class_students(student_id);
CREATE INDEX idx_vocab_words_book_order ON public.vocab_words(vocab_book_id, sort_order);
CREATE INDEX idx_schedules_academy_date ON public.schedules(academy_id, scheduled_date);
CREATE INDEX idx_schedules_student_date ON public.schedules(student_id, scheduled_date);
CREATE INDEX idx_scores_student_date ON public.scores(student_id, test_date);
CREATE INDEX idx_scores_academy_date ON public.scores(academy_id, test_date);
CREATE INDEX idx_test_records_student ON public.test_records(student_id, printed_at);

-- ============================================
-- STEP 5: 트리거
-- ============================================

-- auto-update updated_at on schedules
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_schedules_updated
  BEFORE UPDATE ON public.schedules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- auto-update word_count on vocab_books
CREATE OR REPLACE FUNCTION public.update_word_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.vocab_books SET word_count = (
      SELECT count(*) FROM public.vocab_words WHERE vocab_book_id = OLD.vocab_book_id
    ) WHERE id = OLD.vocab_book_id;
    RETURN OLD;
  ELSE
    UPDATE public.vocab_books SET word_count = (
      SELECT count(*) FROM public.vocab_words WHERE vocab_book_id = NEW.vocab_book_id
    ) WHERE id = NEW.vocab_book_id;
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER on_vocab_words_change
  AFTER INSERT OR DELETE ON public.vocab_words
  FOR EACH ROW EXECUTE FUNCTION public.update_word_count();
