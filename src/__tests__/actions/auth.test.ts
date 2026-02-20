import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockSupabaseClient } from "../mocks/supabase";

const mockClient = createMockSupabaseClient();
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockClient)),
}));

import { login, signup, logout, getSession, getProfile } from "@/lib/actions/auth";
import { redirect } from "next/navigation";

describe("Auth Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClient._qb.setResult(null, null);
  });

  describe("login", () => {
    it("should call signInWithPassword with email and password", async () => {
      mockClient.auth.signInWithPassword.mockResolvedValue({
        data: {},
        error: null,
      });

      const formData = new FormData();
      formData.set("email", "test@example.com");
      formData.set("password", "password123");

      await login(formData).catch(() => {});

      expect(mockClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    it("should return error when login fails", async () => {
      mockClient.auth.signInWithPassword.mockResolvedValue({
        data: {},
        error: { message: "Invalid credentials" },
      });

      const formData = new FormData();
      formData.set("email", "test@example.com");
      formData.set("password", "wrong");

      const result = await login(formData);

      expect(result).toEqual({ error: "Invalid credentials" });
    });

    it("should redirect to /dashboard on success", async () => {
      mockClient.auth.signInWithPassword.mockResolvedValue({
        data: {},
        error: null,
      });

      const formData = new FormData();
      formData.set("email", "test@example.com");
      formData.set("password", "password123");

      await login(formData).catch(() => {});

      expect(redirect).toHaveBeenCalledWith("/dashboard");
    });
  });

  describe("signup", () => {
    it("should return error when signUp fails", async () => {
      mockClient.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: "Email already taken" },
      });

      const formData = new FormData();
      formData.set("email", "test@example.com");
      formData.set("password", "password123");
      formData.set("academyName", "Test Academy");
      formData.set("ownerName", "Test Owner");

      const result = await signup(formData);

      expect(result).toEqual({ error: "Email already taken" });
    });
  });

  describe("logout", () => {
    it("should call signOut and redirect to /login", async () => {
      await logout().catch(() => {});

      expect(mockClient.auth.signOut).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith("/login");
    });
  });

  describe("getSession", () => {
    it("should return user when authenticated", async () => {
      const mockUser = { id: "user-1", email: "test@example.com" };
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });

      const user = await getSession();

      expect(user).toEqual(mockUser);
    });
  });
});
