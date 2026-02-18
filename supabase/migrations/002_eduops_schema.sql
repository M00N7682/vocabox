-- ============================================
-- EduOps Phase 2: Schema Extension
-- 기존 테이블 ALTER + 새 테이블 9개 + RLS + 인덱스
-- ============================================

-- ============================================
-- STEP 1: ALTER 기존 테이블
-- ============================================

ALTER TABLE public.academies
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS operating_hours_start time DEFAULT '14:00',
  ADD COLUMN IF NOT EXISTS operating_hours_end time DEFAULT '22:00';

-- ============================================
-- STEP 2: 새 테이블 생성 (FK 의존 순서)
-- ============================================

-- subjects (과목)
CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT '정규' CHECK (type IN ('정규', '특강')),
  color text NOT NULL DEFAULT '#3B82F6',
  instructor_id uuid REFERENCES public.profiles(id),
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- subject_students (과목-학생 매핑)
CREATE TABLE public.subject_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(subject_id, student_id)
);

-- textbooks (교재)
CREATE TABLE public.textbooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  name text NOT NULL,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  year int DEFAULT EXTRACT(YEAR FROM now()),
  grade text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- textbook_chapters (교재 단원 - self-referencing)
CREATE TABLE public.textbook_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  textbook_id uuid NOT NULL REFERENCES public.textbooks(id) ON DELETE CASCADE,
  title text NOT NULL,
  parent_chapter_id uuid REFERENCES public.textbook_chapters(id) ON DELETE CASCADE,
  sort_order int DEFAULT 0,
  status text NOT NULL DEFAULT '미진행' CHECK (status IN ('완료', '진행중', '미진행')),
  created_at timestamptz DEFAULT now()
);

-- assessments (평가)
CREATE TABLE public.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  name text NOT NULL,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT '시험' CHECK (type IN ('시험', '퀴즈', '과제')),
  date date NOT NULL,
  total_points int NOT NULL DEFAULT 100,
  status text NOT NULL DEFAULT '예정' CHECK (status IN ('완료', '진행중', '예정')),
  created_at timestamptz DEFAULT now()
);

-- assessment_scores (평가 점수)
CREATE TABLE public.assessment_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  score int,
  status text NOT NULL DEFAULT '출석' CHECK (status IN ('출석', '결석')),
  note text,
  recorded_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(assessment_id, student_id)
);

-- attendance (출결)
CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  date date NOT NULL,
  class_time_start time,
  class_time_end time,
  check_in_time time,
  status text NOT NULL DEFAULT '출석' CHECK (status IN ('출석', '지각', '결석')),
  reason text,
  created_at timestamptz DEFAULT now()
);

-- assignments (과제)
CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  name text NOT NULL,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT '필수' CHECK (type IN ('필수', '선택')),
  deadline date,
  status text NOT NULL DEFAULT '진행중' CHECK (status IN ('진행중', '완료')),
  created_at timestamptz DEFAULT now()
);

-- assignment_submissions (과제 제출)
CREATE TABLE public.assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  submitted_at timestamptz DEFAULT now(),
  note text,
  UNIQUE(assignment_id, student_id)
);

-- ============================================
-- STEP 3: RLS 활성화 + 정책
-- ============================================

-- subjects
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view subjects in own academy"
  ON public.subjects FOR SELECT
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can insert subjects in own academy"
  ON public.subjects FOR INSERT
  WITH CHECK (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can update subjects in own academy"
  ON public.subjects FOR UPDATE
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Admins can delete subjects"
  ON public.subjects FOR DELETE
  USING (academy_id = public.get_my_academy_id() AND public.is_admin());

-- subject_students (junction: 부모 서브쿼리 패턴)
ALTER TABLE public.subject_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view subject_students in own academy"
  ON public.subject_students FOR SELECT
  USING (
    subject_id IN (SELECT id FROM public.subjects WHERE academy_id = public.get_my_academy_id())
  );

CREATE POLICY "Users can insert subject_students in own academy"
  ON public.subject_students FOR INSERT
  WITH CHECK (
    subject_id IN (SELECT id FROM public.subjects WHERE academy_id = public.get_my_academy_id())
  );

CREATE POLICY "Users can delete subject_students in own academy"
  ON public.subject_students FOR DELETE
  USING (
    subject_id IN (SELECT id FROM public.subjects WHERE academy_id = public.get_my_academy_id())
  );

-- textbooks
ALTER TABLE public.textbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view textbooks in own academy"
  ON public.textbooks FOR SELECT
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can insert textbooks in own academy"
  ON public.textbooks FOR INSERT
  WITH CHECK (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can update textbooks in own academy"
  ON public.textbooks FOR UPDATE
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Admins can delete textbooks"
  ON public.textbooks FOR DELETE
  USING (academy_id = public.get_my_academy_id() AND public.is_admin());

-- textbook_chapters (junction: 부모 서브쿼리 패턴)
ALTER TABLE public.textbook_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view textbook_chapters in own academy"
  ON public.textbook_chapters FOR SELECT
  USING (
    textbook_id IN (SELECT id FROM public.textbooks WHERE academy_id = public.get_my_academy_id())
  );

CREATE POLICY "Users can insert textbook_chapters in own academy"
  ON public.textbook_chapters FOR INSERT
  WITH CHECK (
    textbook_id IN (SELECT id FROM public.textbooks WHERE academy_id = public.get_my_academy_id())
  );

CREATE POLICY "Users can update textbook_chapters in own academy"
  ON public.textbook_chapters FOR UPDATE
  USING (
    textbook_id IN (SELECT id FROM public.textbooks WHERE academy_id = public.get_my_academy_id())
  );

CREATE POLICY "Users can delete textbook_chapters in own academy"
  ON public.textbook_chapters FOR DELETE
  USING (
    textbook_id IN (SELECT id FROM public.textbooks WHERE academy_id = public.get_my_academy_id())
  );

-- assessments
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assessments in own academy"
  ON public.assessments FOR SELECT
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can insert assessments in own academy"
  ON public.assessments FOR INSERT
  WITH CHECK (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can update assessments in own academy"
  ON public.assessments FOR UPDATE
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Admins can delete assessments"
  ON public.assessments FOR DELETE
  USING (academy_id = public.get_my_academy_id() AND public.is_admin());

-- assessment_scores (junction: 부모 서브쿼리 패턴)
ALTER TABLE public.assessment_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assessment_scores in own academy"
  ON public.assessment_scores FOR SELECT
  USING (
    assessment_id IN (SELECT id FROM public.assessments WHERE academy_id = public.get_my_academy_id())
  );

CREATE POLICY "Users can insert assessment_scores in own academy"
  ON public.assessment_scores FOR INSERT
  WITH CHECK (
    assessment_id IN (SELECT id FROM public.assessments WHERE academy_id = public.get_my_academy_id())
  );

CREATE POLICY "Users can update assessment_scores in own academy"
  ON public.assessment_scores FOR UPDATE
  USING (
    assessment_id IN (SELECT id FROM public.assessments WHERE academy_id = public.get_my_academy_id())
  );

CREATE POLICY "Users can delete assessment_scores in own academy"
  ON public.assessment_scores FOR DELETE
  USING (
    assessment_id IN (SELECT id FROM public.assessments WHERE academy_id = public.get_my_academy_id())
  );

-- attendance
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attendance in own academy"
  ON public.attendance FOR SELECT
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can insert attendance in own academy"
  ON public.attendance FOR INSERT
  WITH CHECK (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can update attendance in own academy"
  ON public.attendance FOR UPDATE
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Admins can delete attendance"
  ON public.attendance FOR DELETE
  USING (academy_id = public.get_my_academy_id() AND public.is_admin());

-- assignments
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assignments in own academy"
  ON public.assignments FOR SELECT
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can insert assignments in own academy"
  ON public.assignments FOR INSERT
  WITH CHECK (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can update assignments in own academy"
  ON public.assignments FOR UPDATE
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Admins can delete assignments"
  ON public.assignments FOR DELETE
  USING (academy_id = public.get_my_academy_id() AND public.is_admin());

-- assignment_submissions (junction: 부모 서브쿼리 패턴)
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assignment_submissions in own academy"
  ON public.assignment_submissions FOR SELECT
  USING (
    assignment_id IN (SELECT id FROM public.assignments WHERE academy_id = public.get_my_academy_id())
  );

CREATE POLICY "Users can insert assignment_submissions in own academy"
  ON public.assignment_submissions FOR INSERT
  WITH CHECK (
    assignment_id IN (SELECT id FROM public.assignments WHERE academy_id = public.get_my_academy_id())
  );

CREATE POLICY "Users can delete assignment_submissions in own academy"
  ON public.assignment_submissions FOR DELETE
  USING (
    assignment_id IN (SELECT id FROM public.assignments WHERE academy_id = public.get_my_academy_id())
  );

-- ============================================
-- STEP 4: 인덱스
-- ============================================

CREATE INDEX idx_subjects_academy ON public.subjects(academy_id);
CREATE INDEX idx_subjects_instructor ON public.subjects(instructor_id);
CREATE INDEX idx_subject_students_subject ON public.subject_students(subject_id);
CREATE INDEX idx_subject_students_student ON public.subject_students(student_id);
CREATE INDEX idx_textbooks_academy ON public.textbooks(academy_id);
CREATE INDEX idx_textbooks_subject ON public.textbooks(subject_id);
CREATE INDEX idx_textbook_chapters_textbook ON public.textbook_chapters(textbook_id, sort_order);
CREATE INDEX idx_textbook_chapters_parent ON public.textbook_chapters(parent_chapter_id);
CREATE INDEX idx_assessments_academy_date ON public.assessments(academy_id, date);
CREATE INDEX idx_assessments_subject ON public.assessments(subject_id);
CREATE INDEX idx_assessment_scores_assessment ON public.assessment_scores(assessment_id);
CREATE INDEX idx_assessment_scores_student ON public.assessment_scores(student_id);
CREATE INDEX idx_attendance_academy_date ON public.attendance(academy_id, date);
CREATE INDEX idx_attendance_student ON public.attendance(student_id, date);
CREATE INDEX idx_attendance_subject ON public.attendance(subject_id);
CREATE INDEX idx_assignments_academy ON public.assignments(academy_id);
CREATE INDEX idx_assignments_subject ON public.assignments(subject_id);
CREATE INDEX idx_assignment_submissions_assignment ON public.assignment_submissions(assignment_id);
CREATE INDEX idx_assignment_submissions_student ON public.assignment_submissions(student_id);
