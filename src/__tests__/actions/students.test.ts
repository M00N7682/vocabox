import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockSupabaseClient } from "../mocks/supabase";

const mockClient = createMockSupabaseClient();
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockClient)),
}));

import { getStudents, getStudent, createStudent, updateStudent } from "@/lib/actions/students";

describe("Student Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClient._qb.setResult(null, null);
  });

  describe("getStudents", () => {
    it("should query students from supabase", async () => {
      const mockStudents = [
        { id: "1", name: "김철수", class_students: [], subject_students: [] },
      ];
      mockClient._qb.setResult(mockStudents);

      const result = await getStudents();

      expect(mockClient.from).toHaveBeenCalledWith("students");
      expect(result).toEqual(mockStudents);
    });

    it("should filter by search term", async () => {
      mockClient._qb.setResult([]);

      await getStudents({ search: "김" });

      expect(mockClient._qb.or).toHaveBeenCalled();
    });

    it("should filter by activeOnly", async () => {
      mockClient._qb.setResult([]);

      await getStudents({ activeOnly: true });

      expect(mockClient._qb.eq).toHaveBeenCalledWith("is_active", true);
    });

    it("should throw on error", async () => {
      mockClient._qb.setResult(null, { message: "DB error" });

      await expect(getStudents()).rejects.toEqual({ message: "DB error" });
    });
  });

  describe("getStudent", () => {
    it("should query single student by id", async () => {
      const mockStudent = { id: "1", name: "김철수" };
      mockClient._qb.setResult(mockStudent);

      const result = await getStudent("1");

      expect(mockClient.from).toHaveBeenCalledWith("students");
      expect(mockClient._qb.eq).toHaveBeenCalledWith("id", "1");
      expect(result).toEqual(mockStudent);
    });
  });

  describe("createStudent", () => {
    it("should insert student with form data", async () => {
      // Profile lookup via .single() returns academy_id
      // Insert call resolves via thenable with no error
      mockClient._qb.setResult(null, null);
      (mockClient._qb.single as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { academy_id: "academy-1" },
        error: null,
      });

      const formData = new FormData();
      formData.set("name", "이영희");
      formData.set("phone", "010-1234-5678");
      formData.set("school", "서울중학교");
      formData.set("grade", "중2");

      const result = await createStudent(formData);

      expect(result).toEqual({ success: true });
    });

    it("should return error when profile not found", async () => {
      (mockClient._qb.single as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: null,
        error: null,
      });

      const formData = new FormData();
      formData.set("name", "이영희");

      const result = await createStudent(formData);

      expect(result).toEqual({ error: "프로필을 찾을 수 없습니다." });
    });
  });

  describe("updateStudent", () => {
    it("should update student by id", async () => {
      mockClient._qb.setResult(null, null);

      const formData = new FormData();
      formData.set("name", "김철수");
      formData.set("is_active", "true");
      formData.set("pin_code", "1234");

      const result = await updateStudent("student-1", formData);

      expect(mockClient.from).toHaveBeenCalledWith("students");
      expect(result).toEqual({ success: true });
    });
  });
});
