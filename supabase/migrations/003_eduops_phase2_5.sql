-- ============================================
-- EduOps Phase 2~5: Schema Extension
-- ALTER 기존 테이블 + 새 테이블 5개 + RLS + 인덱스
-- ============================================

-- ============================================
-- STEP 1: ALTER 기존 테이블
-- ============================================

-- subjects: icon, grade_weight, is_active 추가, type CHECK 확장 (7종)
ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS icon text,
  ADD COLUMN IF NOT EXISTS grade_weight jsonb,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

ALTER TABLE public.subjects DROP CONSTRAINT IF EXISTS subjects_type_check;
ALTER TABLE public.subjects ADD CONSTRAINT subjects_type_check
  CHECK (type IN ('정규', '특강', '캠프', '수행평가', '프로젝트', '내신관리', '반복테스트'));

-- textbook_chapters: level 컬럼 추가
ALTER TABLE public.textbook_chapters
  ADD COLUMN IF NOT EXISTS level text NOT NULL DEFAULT 'major'
    CHECK (level IN ('major', 'middle', 'minor'));

-- students: pin_code 추가
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS pin_code text;

-- classes: subject_id FK 추가
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL;

-- assessments: 확장 컬럼 추가, type CHECK 확장 (5종)
ALTER TABLE public.assessments
  ADD COLUMN IF NOT EXISTS textbook_id uuid REFERENCES public.textbooks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS template_id uuid,  -- FK added after assessment_templates creation
  ADD COLUMN IF NOT EXISTS scoring_method text NOT NULL DEFAULT 'score'
    CHECK (scoring_method IN ('score', 'grade', 'check')),
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS weight decimal(3,2) NOT NULL DEFAULT 1.00,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id);

ALTER TABLE public.assessments DROP CONSTRAINT IF EXISTS assessments_type_check;
ALTER TABLE public.assessments ADD CONSTRAINT assessments_type_check
  CHECK (type IN ('시험', '퀴즈', '과제', '수행평가', '출석점수'));

-- assessment_scores: score decimal(7,2), grade_value, check_value 추가, status 확장 (6종)
ALTER TABLE public.assessment_scores
  ALTER COLUMN score TYPE decimal(7,2);

ALTER TABLE public.assessment_scores
  ADD COLUMN IF NOT EXISTS grade_value text,
  ADD COLUMN IF NOT EXISTS check_value boolean;

ALTER TABLE public.assessment_scores DROP CONSTRAINT IF EXISTS assessment_scores_status_check;
-- Migrate existing data values
UPDATE public.assessment_scores SET status = '응시' WHERE status = '출석';
UPDATE public.assessment_scores SET status = '결시' WHERE status = '결석';
ALTER TABLE public.assessment_scores ADD CONSTRAINT assessment_scores_status_check
  CHECK (status IN ('응시', '결시', '지각', '미제출', '보강예정', '면제'));

-- attendance: check_method, recorded_by 추가, status에 '인정결석' 추가
ALTER TABLE public.attendance
  ADD COLUMN IF NOT EXISTS check_method text CHECK (check_method IN ('qr', 'pin', 'manual')),
  ADD COLUMN IF NOT EXISTS recorded_by uuid REFERENCES public.profiles(id);

ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS attendance_status_check;
ALTER TABLE public.attendance ADD CONSTRAINT attendance_status_check
  CHECK (status IN ('출석', '지각', '결석', '인정결석'));

-- assignments: 대폭 변경
-- 1) Rename name -> title
ALTER TABLE public.assignments RENAME COLUMN name TO title;
-- 2) Add new columns
ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS chapter_id uuid REFERENCES public.textbook_chapters(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS submission_type text NOT NULL DEFAULT 'check'
    CHECK (submission_type IN ('photo', 'file', 'check')),
  ADD COLUMN IF NOT EXISTS difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')),
  ADD COLUMN IF NOT EXISTS is_required boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id);
-- 3) Change deadline to due_date (timestamptz)
ALTER TABLE public.assignments RENAME COLUMN deadline TO due_date;
ALTER TABLE public.assignments ALTER COLUMN due_date TYPE timestamptz USING due_date::timestamptz;
-- 4) Drop type and status columns
ALTER TABLE public.assignments DROP CONSTRAINT IF EXISTS assignments_type_check;
ALTER TABLE public.assignments DROP CONSTRAINT IF EXISTS assignments_status_check;
ALTER TABLE public.assignments DROP COLUMN IF EXISTS type;
ALTER TABLE public.assignments DROP COLUMN IF EXISTS status;

-- ============================================
-- STEP 2: Drop assignment_submissions, Create assignment_students
-- ============================================

-- Drop RLS policies on assignment_submissions
DROP POLICY IF EXISTS "Users can view assignment_submissions in own academy" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Users can insert assignment_submissions in own academy" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Users can delete assignment_submissions in own academy" ON public.assignment_submissions;

DROP TABLE IF EXISTS public.assignment_submissions;

CREATE TABLE public.assignment_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'not_submitted', 'resubmit')),
  submitted_at timestamptz,
  feedback text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);

-- ============================================
-- STEP 3: 새 테이블 생성
-- ============================================

-- assessment_chapters (평가-단원 N:M)
CREATE TABLE public.assessment_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  chapter_id uuid NOT NULL REFERENCES public.textbook_chapters(id) ON DELETE CASCADE,
  UNIQUE(assessment_id, chapter_id)
);

-- assessment_templates (반복 평가 템플릿)
CREATE TABLE public.assessment_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  name text NOT NULL,
  recurrence text NOT NULL CHECK (recurrence IN ('weekly', 'biweekly', 'monthly')),
  day_of_week int CHECK (day_of_week >= 0 AND day_of_week <= 6),
  assessment_type text NOT NULL DEFAULT '시험' CHECK (assessment_type IN ('시험', '퀴즈', '과제', '수행평가', '출석점수')),
  scoring_method text NOT NULL DEFAULT 'score' CHECK (scoring_method IN ('score', 'grade', 'check')),
  total_points int,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Now add FK from assessments.template_id -> assessment_templates
ALTER TABLE public.assessments
  ADD CONSTRAINT assessments_template_id_fkey
  FOREIGN KEY (template_id) REFERENCES public.assessment_templates(id) ON DELETE SET NULL;

-- notifications (알림 기록)
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('attendance', 'score', 'assignment', 'reminder', 'risk_alert', 'monthly_report')),
  channel text NOT NULL DEFAULT 'in_app' CHECK (channel IN ('in_app', 'email', 'sms', 'kakao')),
  title text NOT NULL,
  message text NOT NULL,
  is_sent boolean NOT NULL DEFAULT false,
  sent_at timestamptz,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- risk_alerts (위험 신호)
CREATE TABLE public.risk_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  risk_level text NOT NULL CHECK (risk_level IN ('concern', 'caution', 'danger')),
  reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

-- academy_settings (학원별 설정)
CREATE TABLE public.academy_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE UNIQUE,
  weak_threshold int NOT NULL DEFAULT 60,
  risk_score_threshold int NOT NULL DEFAULT 60,
  risk_score_count int NOT NULL DEFAULT 3,
  risk_absence_rate int NOT NULL DEFAULT 15,
  risk_missing_count int NOT NULL DEFAULT 3,
  late_threshold_min int NOT NULL DEFAULT 10,
  absent_threshold_min int NOT NULL DEFAULT 30,
  notify_attendance boolean NOT NULL DEFAULT true,
  notify_score boolean NOT NULL DEFAULT true,
  notify_assignment boolean NOT NULL DEFAULT true,
  notify_monthly_report boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- STEP 4: RLS 활성화 + 정책
-- ============================================

-- assignment_students
ALTER TABLE public.assignment_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assignment_students in own academy"
  ON public.assignment_students FOR SELECT
  USING (
    assignment_id IN (SELECT id FROM public.assignments WHERE academy_id = public.get_my_academy_id())
  );

CREATE POLICY "Users can insert assignment_students in own academy"
  ON public.assignment_students FOR INSERT
  WITH CHECK (
    assignment_id IN (SELECT id FROM public.assignments WHERE academy_id = public.get_my_academy_id())
  );

CREATE POLICY "Users can update assignment_students in own academy"
  ON public.assignment_students FOR UPDATE
  USING (
    assignment_id IN (SELECT id FROM public.assignments WHERE academy_id = public.get_my_academy_id())
  );

CREATE POLICY "Users can delete assignment_students in own academy"
  ON public.assignment_students FOR DELETE
  USING (
    assignment_id IN (SELECT id FROM public.assignments WHERE academy_id = public.get_my_academy_id())
  );

-- assessment_chapters
ALTER TABLE public.assessment_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assessment_chapters in own academy"
  ON public.assessment_chapters FOR SELECT
  USING (
    assessment_id IN (SELECT id FROM public.assessments WHERE academy_id = public.get_my_academy_id())
  );

CREATE POLICY "Users can insert assessment_chapters in own academy"
  ON public.assessment_chapters FOR INSERT
  WITH CHECK (
    assessment_id IN (SELECT id FROM public.assessments WHERE academy_id = public.get_my_academy_id())
  );

CREATE POLICY "Users can delete assessment_chapters in own academy"
  ON public.assessment_chapters FOR DELETE
  USING (
    assessment_id IN (SELECT id FROM public.assessments WHERE academy_id = public.get_my_academy_id())
  );

-- assessment_templates
ALTER TABLE public.assessment_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assessment_templates in own academy"
  ON public.assessment_templates FOR SELECT
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can insert assessment_templates in own academy"
  ON public.assessment_templates FOR INSERT
  WITH CHECK (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can update assessment_templates in own academy"
  ON public.assessment_templates FOR UPDATE
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Admins can delete assessment_templates"
  ON public.assessment_templates FOR DELETE
  USING (academy_id = public.get_my_academy_id() AND public.is_admin());

-- notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notifications in own academy"
  ON public.notifications FOR SELECT
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can insert notifications in own academy"
  ON public.notifications FOR INSERT
  WITH CHECK (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can update notifications in own academy"
  ON public.notifications FOR UPDATE
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Admins can delete notifications"
  ON public.notifications FOR DELETE
  USING (academy_id = public.get_my_academy_id() AND public.is_admin());

-- risk_alerts
ALTER TABLE public.risk_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view risk_alerts in own academy"
  ON public.risk_alerts FOR SELECT
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can insert risk_alerts in own academy"
  ON public.risk_alerts FOR INSERT
  WITH CHECK (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can update risk_alerts in own academy"
  ON public.risk_alerts FOR UPDATE
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Admins can delete risk_alerts"
  ON public.risk_alerts FOR DELETE
  USING (academy_id = public.get_my_academy_id() AND public.is_admin());

-- academy_settings
ALTER TABLE public.academy_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view academy_settings in own academy"
  ON public.academy_settings FOR SELECT
  USING (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can insert academy_settings in own academy"
  ON public.academy_settings FOR INSERT
  WITH CHECK (academy_id = public.get_my_academy_id());

CREATE POLICY "Users can update academy_settings in own academy"
  ON public.academy_settings FOR UPDATE
  USING (academy_id = public.get_my_academy_id());

-- ============================================
-- STEP 5: 인덱스
-- ============================================

CREATE INDEX IF NOT EXISTS idx_assignment_students_assignment ON public.assignment_students(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_students_student ON public.assignment_students(student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_chapters_assessment ON public.assessment_chapters(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_chapters_chapter ON public.assessment_chapters(chapter_id);
CREATE INDEX IF NOT EXISTS idx_assessment_templates_academy ON public.assessment_templates(academy_id);
CREATE INDEX IF NOT EXISTS idx_assessment_templates_subject ON public.assessment_templates(subject_id);
CREATE INDEX IF NOT EXISTS idx_notifications_academy ON public.notifications(academy_id);
CREATE INDEX IF NOT EXISTS idx_notifications_student ON public.notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_academy ON public.risk_alerts(academy_id);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_student ON public.risk_alerts(student_id);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_resolved ON public.risk_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_classes_subject ON public.classes(subject_id);
CREATE INDEX IF NOT EXISTS idx_assignments_chapter ON public.assignments(chapter_id);
CREATE INDEX IF NOT EXISTS idx_assessments_textbook ON public.assessments(textbook_id);
CREATE INDEX IF NOT EXISTS idx_assessments_template ON public.assessments(template_id);
