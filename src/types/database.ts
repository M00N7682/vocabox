export type Database = {
  public: {
    Tables: {
      academies: {
        Row: {
          id: string;
          name: string;
          slug: string;
          phone: string | null;
          logo_url: string | null;
          address: string | null;
          operating_hours_start: string | null;
          operating_hours_end: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          phone?: string | null;
          logo_url?: string | null;
          address?: string | null;
          operating_hours_start?: string | null;
          operating_hours_end?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          phone?: string | null;
          logo_url?: string | null;
          address?: string | null;
          operating_hours_start?: string | null;
          operating_hours_end?: string | null;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          academy_id: string;
          name: string;
          email: string;
          role: "admin" | "teacher";
          created_at: string;
        };
        Insert: {
          id: string;
          academy_id: string;
          name: string;
          email: string;
          role: "admin" | "teacher";
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          name?: string;
          email?: string;
          role?: "admin" | "teacher";
          created_at?: string;
        };
      };
      classes: {
        Row: {
          id: string;
          academy_id: string;
          name: string;
          description: string | null;
          subject_id: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          name: string;
          description?: string | null;
          subject_id?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          name?: string;
          description?: string | null;
          subject_id?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          academy_id: string;
          name: string;
          english_name: string | null;
          phone: string | null;
          parent_phone: string | null;
          school: string | null;
          grade: string | null;
          pin_code: string | null;
          memo: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          name: string;
          english_name?: string | null;
          phone?: string | null;
          parent_phone?: string | null;
          school?: string | null;
          grade?: string | null;
          pin_code?: string | null;
          memo?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          name?: string;
          english_name?: string | null;
          phone?: string | null;
          parent_phone?: string | null;
          school?: string | null;
          grade?: string | null;
          pin_code?: string | null;
          memo?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      class_students: {
        Row: {
          id: string;
          class_id: string;
          student_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          student_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          student_id?: string;
          created_at?: string;
        };
      };
      vocab_books: {
        Row: {
          id: string;
          academy_id: string;
          title: string;
          description: string | null;
          word_count: number;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          title: string;
          description?: string | null;
          word_count?: number;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          title?: string;
          description?: string | null;
          word_count?: number;
          created_by?: string | null;
          created_at?: string;
        };
      };
      vocab_words: {
        Row: {
          id: string;
          vocab_book_id: string;
          english: string;
          korean: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          vocab_book_id: string;
          english: string;
          korean: string;
          sort_order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          vocab_book_id?: string;
          english?: string;
          korean?: string;
          sort_order?: number;
          created_at?: string;
        };
      };
      schedules: {
        Row: {
          id: string;
          academy_id: string;
          student_id: string;
          vocab_book_id: string;
          scheduled_date: string;
          status: "scheduled" | "in_progress" | "completed" | "missed";
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          student_id: string;
          vocab_book_id: string;
          scheduled_date: string;
          status?: "scheduled" | "in_progress" | "completed" | "missed";
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          student_id?: string;
          vocab_book_id?: string;
          scheduled_date?: string;
          status?: "scheduled" | "in_progress" | "completed" | "missed";
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      scores: {
        Row: {
          id: string;
          academy_id: string;
          student_id: string;
          vocab_book_id: string;
          test_date: string;
          correct_count: number;
          total_count: number;
          score_percentage: number;
          test_type: "eng_to_kor" | "kor_to_eng";
          recorded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          student_id: string;
          vocab_book_id: string;
          test_date: string;
          correct_count: number;
          total_count: number;
          score_percentage: number;
          test_type: "eng_to_kor" | "kor_to_eng";
          recorded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          student_id?: string;
          vocab_book_id?: string;
          test_date?: string;
          correct_count?: number;
          total_count?: number;
          score_percentage?: number;
          test_type?: "eng_to_kor" | "kor_to_eng";
          recorded_by?: string | null;
          created_at?: string;
        };
      };
      test_records: {
        Row: {
          id: string;
          academy_id: string;
          student_id: string;
          vocab_book_id: string;
          test_type: "eng_to_kor" | "kor_to_eng";
          is_shuffled: boolean;
          word_from: number | null;
          word_to: number | null;
          printed_by: string | null;
          printed_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          student_id: string;
          vocab_book_id: string;
          test_type: "eng_to_kor" | "kor_to_eng";
          is_shuffled?: boolean;
          word_from?: number | null;
          word_to?: number | null;
          printed_by?: string | null;
          printed_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          student_id?: string;
          vocab_book_id?: string;
          test_type?: "eng_to_kor" | "kor_to_eng";
          is_shuffled?: boolean;
          word_from?: number | null;
          word_to?: number | null;
          printed_by?: string | null;
          printed_at?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          academy_id: string;
          name: string;
          type: "정규" | "특강" | "캠프" | "수행평가" | "프로젝트" | "내신관리" | "반복테스트";
          color: string;
          icon: string | null;
          grade_weight: Record<string, number> | null;
          instructor_id: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          name: string;
          type?: "정규" | "특강" | "캠프" | "수행평가" | "프로젝트" | "내신관리" | "반복테스트";
          color?: string;
          icon?: string | null;
          grade_weight?: Record<string, number> | null;
          instructor_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          name?: string;
          type?: "정규" | "특강" | "캠프" | "수행평가" | "프로젝트" | "내신관리" | "반복테스트";
          color?: string;
          icon?: string | null;
          grade_weight?: Record<string, number> | null;
          instructor_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      subject_students: {
        Row: {
          id: string;
          subject_id: string;
          student_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          subject_id: string;
          student_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          subject_id?: string;
          student_id?: string;
          created_at?: string;
        };
      };
      textbooks: {
        Row: {
          id: string;
          academy_id: string;
          name: string;
          subject_id: string;
          year: number | null;
          grade: string | null;
          pdf_url: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          name: string;
          subject_id: string;
          year?: number | null;
          grade?: string | null;
          pdf_url?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          name?: string;
          subject_id?: string;
          year?: number | null;
          grade?: string | null;
          pdf_url?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      textbook_chapters: {
        Row: {
          id: string;
          textbook_id: string;
          title: string;
          parent_chapter_id: string | null;
          level: "major" | "middle" | "minor";
          sort_order: number;
          status: "완료" | "진행중" | "미진행";
          created_at: string;
        };
        Insert: {
          id?: string;
          textbook_id: string;
          title: string;
          parent_chapter_id?: string | null;
          level?: "major" | "middle" | "minor";
          sort_order?: number;
          status?: "완료" | "진행중" | "미진행";
          created_at?: string;
        };
        Update: {
          id?: string;
          textbook_id?: string;
          title?: string;
          parent_chapter_id?: string | null;
          level?: "major" | "middle" | "minor";
          sort_order?: number;
          status?: "완료" | "진행중" | "미진행";
          created_at?: string;
        };
      };
      assessments: {
        Row: {
          id: string;
          academy_id: string;
          name: string;
          subject_id: string;
          textbook_id: string | null;
          template_id: string | null;
          class_id: string | null;
          type: "시험" | "퀴즈" | "과제" | "수행평가" | "출석점수";
          date: string;
          total_points: number;
          scoring_method: "score" | "grade" | "check";
          is_public: boolean;
          weight: number;
          status: "완료" | "진행중" | "예정";
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          name: string;
          subject_id: string;
          textbook_id?: string | null;
          template_id?: string | null;
          class_id?: string | null;
          type?: "시험" | "퀴즈" | "과제" | "수행평가" | "출석점수";
          date: string;
          total_points?: number;
          scoring_method?: "score" | "grade" | "check";
          is_public?: boolean;
          weight?: number;
          status?: "완료" | "진행중" | "예정";
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          name?: string;
          subject_id?: string;
          textbook_id?: string | null;
          template_id?: string | null;
          class_id?: string | null;
          type?: "시험" | "퀴즈" | "과제" | "수행평가" | "출석점수";
          date?: string;
          total_points?: number;
          scoring_method?: "score" | "grade" | "check";
          is_public?: boolean;
          weight?: number;
          status?: "완료" | "진행중" | "예정";
          created_by?: string | null;
          created_at?: string;
        };
      };
      assessment_scores: {
        Row: {
          id: string;
          assessment_id: string;
          student_id: string;
          score: number | null;
          grade_value: string | null;
          check_value: boolean | null;
          status: "응시" | "결시" | "지각" | "미제출" | "보강예정" | "면제";
          note: string | null;
          recorded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          student_id: string;
          score?: number | null;
          grade_value?: string | null;
          check_value?: boolean | null;
          status?: "응시" | "결시" | "지각" | "미제출" | "보강예정" | "면제";
          note?: string | null;
          recorded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          assessment_id?: string;
          student_id?: string;
          score?: number | null;
          grade_value?: string | null;
          check_value?: boolean | null;
          status?: "응시" | "결시" | "지각" | "미제출" | "보강예정" | "면제";
          note?: string | null;
          recorded_by?: string | null;
          created_at?: string;
        };
      };
      assessment_chapters: {
        Row: {
          id: string;
          assessment_id: string;
          chapter_id: string;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          chapter_id: string;
        };
        Update: {
          id?: string;
          assessment_id?: string;
          chapter_id?: string;
        };
      };
      assessment_templates: {
        Row: {
          id: string;
          academy_id: string;
          subject_id: string;
          name: string;
          recurrence: "weekly" | "biweekly" | "monthly";
          day_of_week: number | null;
          assessment_type: "시험" | "퀴즈" | "과제" | "수행평가" | "출석점수";
          scoring_method: "score" | "grade" | "check";
          total_points: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          subject_id: string;
          name: string;
          recurrence: "weekly" | "biweekly" | "monthly";
          day_of_week?: number | null;
          assessment_type?: "시험" | "퀴즈" | "과제" | "수행평가" | "출석점수";
          scoring_method?: "score" | "grade" | "check";
          total_points?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          subject_id?: string;
          name?: string;
          recurrence?: "weekly" | "biweekly" | "monthly";
          day_of_week?: number | null;
          assessment_type?: "시험" | "퀴즈" | "과제" | "수행평가" | "출석점수";
          scoring_method?: "score" | "grade" | "check";
          total_points?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      attendance: {
        Row: {
          id: string;
          academy_id: string;
          student_id: string;
          subject_id: string;
          date: string;
          class_time_start: string | null;
          class_time_end: string | null;
          check_in_time: string | null;
          status: "출석" | "지각" | "결석" | "인정결석";
          check_method: "qr" | "pin" | "manual" | null;
          reason: string | null;
          recorded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          student_id: string;
          subject_id: string;
          date: string;
          class_time_start?: string | null;
          class_time_end?: string | null;
          check_in_time?: string | null;
          status?: "출석" | "지각" | "결석" | "인정결석";
          check_method?: "qr" | "pin" | "manual" | null;
          reason?: string | null;
          recorded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          student_id?: string;
          subject_id?: string;
          date?: string;
          class_time_start?: string | null;
          class_time_end?: string | null;
          check_in_time?: string | null;
          status?: "출석" | "지각" | "결석" | "인정결석";
          check_method?: "qr" | "pin" | "manual" | null;
          reason?: string | null;
          recorded_by?: string | null;
          created_at?: string;
        };
      };
      assignments: {
        Row: {
          id: string;
          academy_id: string;
          title: string;
          subject_id: string;
          class_id: string | null;
          chapter_id: string | null;
          description: string | null;
          due_date: string;
          submission_type: "photo" | "file" | "check";
          difficulty: "easy" | "medium" | "hard" | null;
          is_required: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          title: string;
          subject_id: string;
          class_id?: string | null;
          chapter_id?: string | null;
          description?: string | null;
          due_date: string;
          submission_type?: "photo" | "file" | "check";
          difficulty?: "easy" | "medium" | "hard" | null;
          is_required?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          title?: string;
          subject_id?: string;
          class_id?: string | null;
          chapter_id?: string | null;
          description?: string | null;
          due_date?: string;
          submission_type?: "photo" | "file" | "check";
          difficulty?: "easy" | "medium" | "hard" | null;
          is_required?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
      };
      assignment_students: {
        Row: {
          id: string;
          assignment_id: string;
          student_id: string;
          status: "pending" | "submitted" | "not_submitted" | "resubmit";
          submitted_at: string | null;
          feedback: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          student_id: string;
          status?: "pending" | "submitted" | "not_submitted" | "resubmit";
          submitted_at?: string | null;
          feedback?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          assignment_id?: string;
          student_id?: string;
          status?: "pending" | "submitted" | "not_submitted" | "resubmit";
          submitted_at?: string | null;
          feedback?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          academy_id: string;
          student_id: string | null;
          type: "attendance" | "score" | "assignment" | "reminder" | "risk_alert" | "monthly_report";
          channel: "in_app" | "email" | "sms" | "kakao";
          title: string;
          message: string;
          is_sent: boolean;
          sent_at: string | null;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          student_id?: string | null;
          type: "attendance" | "score" | "assignment" | "reminder" | "risk_alert" | "monthly_report";
          channel?: "in_app" | "email" | "sms" | "kakao";
          title: string;
          message: string;
          is_sent?: boolean;
          sent_at?: string | null;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          student_id?: string | null;
          type?: "attendance" | "score" | "assignment" | "reminder" | "risk_alert" | "monthly_report";
          channel?: "in_app" | "email" | "sms" | "kakao";
          title?: string;
          message?: string;
          is_sent?: boolean;
          sent_at?: string | null;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
      };
      risk_alerts: {
        Row: {
          id: string;
          academy_id: string;
          student_id: string;
          risk_level: "concern" | "caution" | "danger";
          reasons: Record<string, unknown>[];
          is_resolved: boolean;
          resolved_at: string | null;
          resolved_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          student_id: string;
          risk_level: "concern" | "caution" | "danger";
          reasons: Record<string, unknown>[];
          is_resolved?: boolean;
          resolved_at?: string | null;
          resolved_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          student_id?: string;
          risk_level?: "concern" | "caution" | "danger";
          reasons?: Record<string, unknown>[];
          is_resolved?: boolean;
          resolved_at?: string | null;
          resolved_by?: string | null;
          created_at?: string;
        };
      };
      class_textbooks: {
        Row: {
          id: string;
          class_id: string;
          textbook_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          textbook_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          textbook_id?: string;
          created_at?: string;
        };
      };
      quick_records: {
        Row: {
          id: string;
          academy_id: string;
          class_id: string;
          student_id: string;
          record_date: string;
          category: string;
          label: string | null;
          value: string | null;
          numeric_value: number | null;
          note: string | null;
          recorded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          class_id: string;
          student_id: string;
          record_date: string;
          category?: string;
          label?: string | null;
          value?: string | null;
          numeric_value?: number | null;
          note?: string | null;
          recorded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          class_id?: string;
          student_id?: string;
          record_date?: string;
          category?: string;
          label?: string | null;
          value?: string | null;
          numeric_value?: number | null;
          note?: string | null;
          recorded_by?: string | null;
          created_at?: string;
        };
      };
      parent_report_tokens: {
        Row: {
          id: string;
          academy_id: string;
          student_id: string;
          token: string;
          is_active: boolean;
          expires_at: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          student_id: string;
          token?: string;
          is_active?: boolean;
          expires_at?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          student_id?: string;
          token?: string;
          is_active?: boolean;
          expires_at?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          academy_id: string;
          student_id: string;
          amount: number;
          description: string;
          due_date: string;
          status: "pending" | "paid" | "overdue" | "cancelled";
          paid_at: string | null;
          payment_method: "cash" | "transfer" | "card" | "auto" | "other" | null;
          memo: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          student_id: string;
          amount: number;
          description: string;
          due_date: string;
          status?: "pending" | "paid" | "overdue" | "cancelled";
          paid_at?: string | null;
          payment_method?: "cash" | "transfer" | "card" | "auto" | "other" | null;
          memo?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          student_id?: string;
          amount?: number;
          description?: string;
          due_date?: string;
          status?: "pending" | "paid" | "overdue" | "cancelled";
          paid_at?: string | null;
          payment_method?: "cash" | "transfer" | "card" | "auto" | "other" | null;
          memo?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      academy_settings: {
        Row: {
          id: string;
          academy_id: string;
          weak_threshold: number;
          risk_score_threshold: number;
          risk_score_count: number;
          risk_absence_rate: number;
          risk_missing_count: number;
          late_threshold_min: number;
          absent_threshold_min: number;
          notify_attendance: boolean;
          notify_score: boolean;
          notify_assignment: boolean;
          notify_monthly_report: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          weak_threshold?: number;
          risk_score_threshold?: number;
          risk_score_count?: number;
          risk_absence_rate?: number;
          risk_missing_count?: number;
          late_threshold_min?: number;
          absent_threshold_min?: number;
          notify_attendance?: boolean;
          notify_score?: boolean;
          notify_assignment?: boolean;
          notify_monthly_report?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          weak_threshold?: number;
          risk_score_threshold?: number;
          risk_score_count?: number;
          risk_absence_rate?: number;
          risk_missing_count?: number;
          late_threshold_min?: number;
          absent_threshold_min?: number;
          notify_attendance?: boolean;
          notify_score?: boolean;
          notify_assignment?: boolean;
          notify_monthly_report?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      get_my_academy_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      get_report_by_token: {
        Args: { p_token: string };
        Returns: { student_id: string; academy_id: string; student_name: string; academy_name: string }[];
      };
      get_student_attendance_by_token: {
        Args: { p_token: string };
        Returns: { date: string; status: string; subject_name: string }[];
      };
      get_student_assignments_by_token: {
        Args: { p_token: string };
        Returns: { title: string; due_date: string; status: string; subject_name: string }[];
      };
      get_student_records_by_token: {
        Args: { p_token: string };
        Returns: { record_date: string; category: string; label: string; value: string; numeric_value: number }[];
      };
      get_student_scores_by_token: {
        Args: { p_token: string };
        Returns: { assessment_name: string; assessment_date: string; assessment_type: string; score: number; total_points: number; status: string; subject_name: string }[];
      };
      get_student_payments_by_token: {
        Args: { p_token: string };
        Returns: { description: string; amount: number; due_date: string; status: string; paid_at: string }[];
      };
    };
  };
};

// Convenience types
export type Academy = Database["public"]["Tables"]["academies"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Class = Database["public"]["Tables"]["classes"]["Row"];
export type Student = Database["public"]["Tables"]["students"]["Row"];
export type ClassStudent = Database["public"]["Tables"]["class_students"]["Row"];
export type VocabBook = Database["public"]["Tables"]["vocab_books"]["Row"];
export type VocabWord = Database["public"]["Tables"]["vocab_words"]["Row"];
export type Schedule = Database["public"]["Tables"]["schedules"]["Row"];
export type Score = Database["public"]["Tables"]["scores"]["Row"];
export type TestRecord = Database["public"]["Tables"]["test_records"]["Row"];
export type Subject = Database["public"]["Tables"]["subjects"]["Row"];
export type SubjectStudent = Database["public"]["Tables"]["subject_students"]["Row"];
export type Textbook = Database["public"]["Tables"]["textbooks"]["Row"];
export type TextbookChapter = Database["public"]["Tables"]["textbook_chapters"]["Row"];
export type Assessment = Database["public"]["Tables"]["assessments"]["Row"];
export type AssessmentScore = Database["public"]["Tables"]["assessment_scores"]["Row"];
export type AssessmentChapter = Database["public"]["Tables"]["assessment_chapters"]["Row"];
export type AssessmentTemplate = Database["public"]["Tables"]["assessment_templates"]["Row"];
export type Attendance = Database["public"]["Tables"]["attendance"]["Row"];
export type Assignment = Database["public"]["Tables"]["assignments"]["Row"];
export type AssignmentStudent = Database["public"]["Tables"]["assignment_students"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type RiskAlert = Database["public"]["Tables"]["risk_alerts"]["Row"];
export type AcademySettings = Database["public"]["Tables"]["academy_settings"]["Row"];
export type ClassTextbook = Database["public"]["Tables"]["class_textbooks"]["Row"];
export type QuickRecord = Database["public"]["Tables"]["quick_records"]["Row"];
export type ParentReportToken = Database["public"]["Tables"]["parent_report_tokens"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
