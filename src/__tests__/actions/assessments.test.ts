import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockSupabaseClient } from "../mocks/supabase";

const mockClient = createMockSupabaseClient();
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockClient)),
}));

import {
  getAssessments,
  getAssessment,
  createAssessment,
  deleteAssessment,
} from "@/lib/actions/assessments";

describe("Assessment Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClient._qb.setResult(null, null);
  });

  describe("getAssessments", () => {
    it("should query assessments from supabase", async () => {
      const mockAssessments = [
        { id: "1", name: "중간고사", type: "시험" },
      ];
      mockClient._qb.setResult(mockAssessments);

      const result = await getAssessments();

      expect(mockClient.from).toHaveBeenCalledWith("assessments");
      expect(result).toEqual(mockAssessments);
    });

    it("should apply subject filter", async () => {
      mockClient._qb.setResult([]);

      await getAssessments({ subjectId: "sub-1" });

      expect(mockClient._qb.eq).toHaveBeenCalledWith("subject_id", "sub-1");
    });

    it("should apply type filter", async () => {
      mockClient._qb.setResult([]);

      await getAssessments({ type: "퀴즈" });

      expect(mockClient._qb.eq).toHaveBeenCalledWith("type", "퀴즈");
    });

    it("should apply search filter", async () => {
      mockClient._qb.setResult([]);

      await getAssessments({ search: "중간" });

      expect(mockClient._qb.ilike).toHaveBeenCalledWith("name", "%중간%");
    });

    it("should throw on error", async () => {
      mockClient._qb.setResult(null, { message: "DB error" });

      await expect(getAssessments()).rejects.toEqual({ message: "DB error" });
    });
  });

  describe("getAssessment", () => {
    it("should query single assessment by id", async () => {
      const mockAssessment = { id: "1", name: "중간고사" };
      mockClient._qb.setResult(mockAssessment);

      const result = await getAssessment("1");

      expect(mockClient._qb.eq).toHaveBeenCalledWith("id", "1");
      expect(result).toEqual(mockAssessment);
    });
  });

  describe("createAssessment", () => {
    it("should return error when profile not found", async () => {
      (mockClient._qb.single as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: null,
        error: null,
      });

      const formData = new FormData();
      formData.set("name", "Test");
      formData.set("subject_id", "sub-1");
      formData.set("date", "2025-03-01");

      const result = await createAssessment(formData);

      expect(result).toEqual({ error: "프로필을 찾을 수 없습니다." });
    });
  });

  describe("deleteAssessment", () => {
    it("should delete assessment by id", async () => {
      mockClient._qb.setResult(null, null);

      const result = await deleteAssessment("assess-1");

      expect(mockClient.from).toHaveBeenCalledWith("assessments");
      expect(result).toEqual({ success: true });
    });

    it("should return error on delete failure", async () => {
      mockClient._qb.setResult(null, { message: "Foreign key constraint" });

      const result = await deleteAssessment("assess-1");

      expect(result).toEqual({ error: "Foreign key constraint" });
    });
  });
});
