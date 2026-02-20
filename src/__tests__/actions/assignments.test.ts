import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockSupabaseClient } from "../mocks/supabase";

const mockClient = createMockSupabaseClient();
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockClient)),
}));

import {
  getAssignments,
  createAssignment,
  deleteAssignment,
  assignStudents,
} from "@/lib/actions/assignments";

describe("Assignment Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClient._qb.setResult(null, null);
  });

  describe("getAssignments", () => {
    it("should query assignments from supabase", async () => {
      const mockAssignments = [
        { id: "1", title: "숙제 1", assignment_students: [] },
      ];
      mockClient._qb.setResult(mockAssignments);

      const result = await getAssignments();

      expect(mockClient.from).toHaveBeenCalledWith("assignments");
      expect(result).toEqual(mockAssignments);
    });

    it("should apply subject filter", async () => {
      mockClient._qb.setResult([]);

      await getAssignments({ subjectId: "sub-1" });

      expect(mockClient._qb.eq).toHaveBeenCalledWith("subject_id", "sub-1");
    });

    it("should apply search filter", async () => {
      mockClient._qb.setResult([]);

      await getAssignments({ search: "숙제" });

      expect(mockClient._qb.ilike).toHaveBeenCalledWith("title", "%숙제%");
    });
  });

  describe("createAssignment", () => {
    it("should return error when profile not found", async () => {
      (mockClient._qb.single as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: null,
        error: { message: "Not found" },
      });

      const formData = new FormData();
      formData.set("title", "Test Assignment");
      formData.set("subject_id", "sub-1");
      formData.set("due_date", "2025-04-01");

      const result = await createAssignment(formData);

      expect(result).toEqual({ error: "프로필을 찾을 수 없습니다." });
    });
  });

  describe("deleteAssignment", () => {
    it("should delete assignment by id", async () => {
      mockClient._qb.setResult(null, null);

      const result = await deleteAssignment("assign-1");

      expect(mockClient.from).toHaveBeenCalledWith("assignments");
      expect(result).toEqual({ success: true });
    });
  });

  describe("assignStudents", () => {
    it("should upsert assignment_students records", async () => {
      mockClient._qb.setResult(null, null);

      const result = await assignStudents("assign-1", ["s1", "s2"]);

      expect(mockClient.from).toHaveBeenCalledWith("assignment_students");
      expect(result).toEqual({ success: true });
    });
  });
});
