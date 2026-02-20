import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockSupabaseClient } from "../mocks/supabase";

const mockClient = createMockSupabaseClient();
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockClient)),
}));

import {
  getAttendance,
  getAttendanceSummary,
  recordAttendance,
  updateAttendance,
} from "@/lib/actions/attendance";

describe("Attendance Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClient._qb.setResult(null, null);
  });

  describe("getAttendance", () => {
    it("should query attendance records for a date", async () => {
      const mockRecords = [
        { id: "1", status: "출석", students: { id: "s1", name: "김철수" } },
      ];
      mockClient._qb.setResult(mockRecords);

      const result = await getAttendance({ date: "2025-03-01" });

      expect(mockClient.from).toHaveBeenCalledWith("attendance");
      expect(mockClient._qb.eq).toHaveBeenCalledWith("date", "2025-03-01");
      expect(result).toEqual(mockRecords);
    });

    it("should filter by subject", async () => {
      mockClient._qb.setResult([]);

      await getAttendance({ subjectId: "sub-1" });

      expect(mockClient._qb.eq).toHaveBeenCalledWith("subject_id", "sub-1");
    });

    it("should filter by search keyword (client-side)", async () => {
      const records = [
        { id: "1", status: "출석", students: { id: "s1", name: "김철수" } },
        { id: "2", status: "출석", students: { id: "s2", name: "이영희" } },
      ];
      mockClient._qb.setResult(records);

      const result = await getAttendance({ search: "김" });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });
  });

  describe("getAttendanceSummary", () => {
    it("should calculate attendance summary correctly", async () => {
      const mockData = [
        { status: "출석" },
        { status: "출석" },
        { status: "지각" },
        { status: "결석" },
        { status: "인정결석" },
      ];
      mockClient._qb.setResult(mockData);

      const result = await getAttendanceSummary("2025-03-01");

      expect(result.total).toBe(5);
      expect(result.present).toBe(2);
      expect(result.late).toBe(1);
      expect(result.absent).toBe(1);
      expect(result.excused).toBe(1);
      expect(result.rate).toBe(80);
    });
  });

  describe("recordAttendance", () => {
    it("should return error when profile not found", async () => {
      (mockClient._qb.single as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await recordAttendance({
        student_id: "550e8400-e29b-41d4-a716-446655440000",
        subject_id: "6ba7b810-9dad-41d4-80b4-00c04fd430c8",
        date: "2025-03-01",
        status: "출석",
      });

      expect(result).toEqual({ error: "프로필을 찾을 수 없습니다." });
    });
  });
});
