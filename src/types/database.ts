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
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          phone?: string | null;
          logo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          phone?: string | null;
          logo_url?: string | null;
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
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          name: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          name?: string;
          description?: string | null;
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
    };
    Functions: {
      get_my_academy_id: {
        Args: Record<string, never>;
        Returns: string;
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
