import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockSupabaseClient } from "../mocks/supabase";

const mockClient = createMockSupabaseClient();
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockClient)),
}));

import { getClasses, createClass, updateClass, addStudentToClass } from "@/lib/actions/classes";

describe("Class Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClient._qb.setResult(null, null);
  });

  describe("getClasses", () => {
    it("should query classes from supabase", async () => {
      const mockClasses = [
        { id: "1", name: "A반", class_students: [] },
      ];
      mockClient._qb.setResult(mockClasses);

      const result = await getClasses();

      expect(mockClient.from).toHaveBeenCalledWith("classes");
      expect(result).toEqual(mockClasses);
    });

    it("should throw on error", async () => {
      mockClient._qb.setResult(null, { message: "DB error" });

      await expect(getClasses()).rejects.toEqual({ message: "DB error" });
    });
  });

  describe("createClass", () => {
    it("should return error when profile not found", async () => {
      (mockClient._qb.single as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: null,
        error: null,
      });

      const formData = new FormData();
      formData.set("name", "B반");

      const result = await createClass(formData);

      expect(result).toEqual({ error: "프로필을 찾을 수 없습니다." });
    });
  });

  describe("updateClass", () => {
    it("should update class by id", async () => {
      mockClient._qb.setResult(null, null);

      const formData = new FormData();
      formData.set("name", "B반 (수정)");
      formData.set("description", "Updated description");

      const result = await updateClass("class-1", formData);

      expect(mockClient.from).toHaveBeenCalledWith("classes");
      expect(result).toEqual({ success: true });
    });
  });

  describe("addStudentToClass", () => {
    it("should insert class_students record", async () => {
      mockClient._qb.setResult(null, null);

      const result = await addStudentToClass("class-1", "student-1");

      expect(mockClient.from).toHaveBeenCalledWith("class_students");
      expect(result).toEqual({ success: true });
    });
  });
});
