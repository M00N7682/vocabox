import { z } from "zod";

// ─── Helpers ────────────────────────────────────────────────────────────────

const requiredString = (label: string) =>
  z.string().min(1, `${label}을(를) 입력하세요.`);

const optionalString = z.string().optional().or(z.literal(""));

const uuid = z.string().uuid("올바른 ID 형식이 아닙니다.");

const optionalUuid = z.string().uuid().optional().or(z.literal(""));

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식이 올바르지 않습니다 (YYYY-MM-DD).");

const emailString = z.string().email("올바른 이메일 형식이 아닙니다.");

const passwordString = z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다.");

/** Extract form data into a plain object for Zod parsing */
export function formDataToObject(formData: FormData): Record<string, string> {
  const obj: Record<string, string> = {};
  formData.forEach((value, key) => {
    obj[key] = value as string;
  });
  return obj;
}

/** Validate and return parsed data or error response */
export function validate<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstIssue = result.error.issues[0];
  return { success: false, error: firstIssue?.message || "입력값이 올바르지 않습니다." };
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailString,
  password: z.string().min(1, "비밀번호를 입력하세요."),
});

export const signupSchema = z.object({
  email: emailString,
  password: passwordString,
  academyName: requiredString("학원 이름"),
  ownerName: requiredString("이름"),
  phone: optionalString,
});

// ─── Students ───────────────────────────────────────────────────────────────

export const createStudentSchema = z.object({
  name: requiredString("이름").max(50, "이름은 50자 이내로 입력하세요."),
  english_name: optionalString,
  phone: optionalString,
  parent_phone: optionalString,
  school: optionalString,
  grade: optionalString,
  pin_code: optionalString,
  memo: optionalString,
});

export const updateStudentSchema = createStudentSchema.extend({
  is_active: z.enum(["true", "false"]).optional(),
});

// ─── Classes ────────────────────────────────────────────────────────────────

export const classSchema = z.object({
  name: requiredString("반 이름").max(50, "반 이름은 50자 이내로 입력하세요."),
  description: optionalString,
});

// ─── Subjects ───────────────────────────────────────────────────────────────

export const subjectSchema = z.object({
  name: requiredString("과목 이름").max(50),
  type: z.enum(["정규", "특강", "캠프", "수행평가", "프로젝트", "내신관리", "반복테스트"]).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "올바른 색상 코드가 아닙니다.").optional(),
  icon: optionalString,
  grade_weight: optionalString,
  instructor_id: optionalString,
  is_active: z.enum(["true", "false", "1", "0"]).optional(),
});

// ─── Assessments ────────────────────────────────────────────────────────────

export const createAssessmentSchema = z.object({
  name: requiredString("평가 이름").max(100),
  subject_id: uuid,
  textbook_id: optionalUuid,
  template_id: optionalUuid,
  type: z.enum(["시험", "퀴즈", "과제", "수행평가", "출석점수"]).optional(),
  date: dateString,
  total_points: z.coerce.number().int().min(1, "총점은 1 이상이어야 합니다.").max(10000).optional(),
  scoring_method: z.enum(["score", "grade", "check"]).optional(),
  is_public: z.enum(["true", "false"]).optional(),
  weight: z.coerce.number().min(0).max(100).optional(),
  status: z.enum(["완료", "진행중", "예정"]).optional(),
  chapter_ids: optionalString,
});

export const assessmentScoreSchema = z.object({
  student_id: uuid,
  score: z.number().nullable().optional(),
  grade_value: z.string().nullable().optional(),
  check_value: z.boolean().nullable().optional(),
  status: z.enum(["응시", "결시", "지각", "미제출", "보강예정", "면제"]),
  note: z.string().optional(),
});

export const assessmentTemplateSchema = z.object({
  name: requiredString("템플릿 이름").max(100),
  subject_id: uuid,
  recurrence: z.enum(["weekly", "biweekly", "monthly"]).optional(),
  day_of_week: z.coerce.number().int().min(0).max(6).optional().nullable(),
  assessment_type: z.enum(["시험", "퀴즈", "과제", "수행평가", "출석점수"]).optional(),
  scoring_method: z.enum(["score", "grade", "check"]).optional(),
  total_points: z.coerce.number().int().min(1).max(10000).optional().nullable(),
  is_active: z.enum(["true", "false"]).optional(),
});

// ─── Attendance ─────────────────────────────────────────────────────────────

export const recordAttendanceSchema = z.object({
  student_id: uuid,
  subject_id: uuid,
  date: dateString,
  class_time_start: optionalString,
  class_time_end: optionalString,
  check_in_time: optionalString,
  status: z.enum(["출석", "지각", "결석", "인정결석"]),
  reason: optionalString,
  check_method: z.enum(["qr", "pin", "manual"]).optional(),
  recorded_by: optionalString,
});

export const updateAttendanceSchema = z.object({
  status: z.enum(["출석", "지각", "결석", "인정결석"]).optional(),
  check_in_time: z.string().optional(),
  reason: z.string().optional(),
  check_method: z.enum(["qr", "pin", "manual"]).optional(),
  recorded_by: z.string().optional(),
});

export const checkInByPinSchema = z.object({
  pinCode: z.string().min(1, "PIN 코드를 입력하세요.").max(20),
  subjectId: uuid,
});

// ─── Assignments ────────────────────────────────────────────────────────────

export const createAssignmentSchema = z.object({
  title: requiredString("과제 제목").max(200),
  subject_id: uuid,
  chapter_id: optionalUuid,
  description: optionalString,
  due_date: z.string().min(1, "마감일을 입력하세요."),
  submission_type: z.enum(["photo", "file", "check"]).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional().nullable(),
  is_required: z.enum(["true", "false", "1", "0"]).optional(),
});

export const updateStudentStatusSchema = z.object({
  status: z.enum(["pending", "submitted", "not_submitted", "resubmit"]),
  feedback: z.string().optional(),
});

// ─── Vocab ──────────────────────────────────────────────────────────────────

export const vocabBookSchema = z.object({
  title: requiredString("단어장 이름").max(100),
  description: optionalString,
});

export const vocabWordSchema = z.object({
  english: requiredString("영어 단어").max(200),
  korean: requiredString("한국어 뜻").max(200),
});

// ─── Scores ─────────────────────────────────────────────────────────────────

export const saveScoreSchema = z.object({
  studentId: uuid,
  vocabBookId: uuid,
  testDate: dateString,
  correctCount: z.number().int().min(0),
  totalCount: z.number().int().min(1, "총 문항 수는 1 이상이어야 합니다."),
  testType: z.enum(["eng_to_kor", "kor_to_eng"]),
});

// ─── Textbooks ──────────────────────────────────────────────────────────────

export const textbookSchema = z.object({
  name: requiredString("교재 이름").max(100),
  subject_id: uuid,
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  grade: optionalString,
  pdf_url: optionalString,
});

export const chapterSchema = z.object({
  textbook_id: uuid,
  title: requiredString("단원 이름").max(200),
  level: z.enum(["major", "middle", "minor"]).optional(),
  parent_chapter_id: optionalUuid,
  sort_order: z.coerce.number().int().min(0).optional(),
});

// ─── Notifications ──────────────────────────────────────────────────────────

export const createNotificationSchema = z.object({
  student_id: uuid.optional(),
  type: z.enum(["attendance", "score", "assignment", "reminder", "risk_alert", "monthly_report"]),
  channel: z.enum(["in_app", "email", "sms", "kakao"]).optional(),
  title: requiredString("알림 제목").max(200),
  message: requiredString("알림 내용").max(2000),
});

// ─── Schedules ──────────────────────────────────────────────────────────────

export const createScheduleSchema = z.object({
  studentId: uuid,
  vocabBookId: uuid,
  scheduledDate: dateString,
  note: z.string().optional(),
});

// ─── Academy Settings ───────────────────────────────────────────────────────

export const academySettingsSchema = z.object({
  weak_threshold: z.coerce.number().int().min(0).max(100),
  risk_score_threshold: z.coerce.number().int().min(0).max(100),
  risk_score_count: z.coerce.number().int().min(1).max(100),
  risk_absence_rate: z.coerce.number().int().min(0).max(100),
  risk_missing_count: z.coerce.number().int().min(1).max(100),
  late_threshold_min: z.coerce.number().int().min(0).max(180),
  absent_threshold_min: z.coerce.number().int().min(0).max(360),
  notify_attendance: z.enum(["true", "false"]),
  notify_score: z.enum(["true", "false"]),
  notify_assignment: z.enum(["true", "false"]),
  notify_monthly_report: z.enum(["true", "false"]),
});

// ─── Settings (Academy Info) ────────────────────────────────────────────────

export const academyInfoSchema = z.object({
  name: requiredString("학원 이름").max(100),
  phone: optionalString,
  address: optionalString,
  operating_hours_start: optionalString,
  operating_hours_end: optionalString,
});
