import { vi } from "vitest";

/**
 * Creates a thenable query builder that chains like the real Supabase client.
 *
 * All chain methods (select, eq, order, etc.) return the same builder.
 * The builder is "thenable" so `await builder` resolves to `{ data, error }`.
 * Use `setResult(data, error)` to configure what `await` resolves to.
 */
function createQueryBuilder() {
  let result: { data: unknown; error: unknown } = { data: null, error: null };

  const builder: Record<string, unknown> = {};

  const chainMethods = [
    "select",
    "insert",
    "update",
    "delete",
    "upsert",
    "eq",
    "neq",
    "gte",
    "lte",
    "ilike",
    "or",
    "order",
    "limit",
  ];

  for (const method of chainMethods) {
    builder[method] = vi.fn(() => builder);
  }

  // Terminal methods
  builder.single = vi.fn(() => Promise.resolve(result));
  builder.maybeSingle = vi.fn(() => Promise.resolve(result));

  // Make builder thenable - this is what makes `await query` work
  builder.then = (
    resolve: (val: { data: unknown; error: unknown }) => void,
    reject?: (err: unknown) => void
  ) => {
    return Promise.resolve(result).then(resolve, reject);
  };

  // Helper to set the resolved result
  builder.setResult = (data: unknown, error: unknown = null) => {
    result = { data, error };
    (builder.single as ReturnType<typeof vi.fn>).mockImplementation(() =>
      Promise.resolve(result)
    );
    (builder.maybeSingle as ReturnType<typeof vi.fn>).mockImplementation(() =>
      Promise.resolve(result)
    );
  };

  return builder;
}

export function createMockSupabaseClient() {
  const qb = createQueryBuilder();

  const mockClient = {
    from: vi.fn(() => qb),
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signUp: vi.fn().mockResolvedValue({
        data: { user: { id: "test-user-id" } },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "test-user-id", email: "test@example.com" } },
      }),
    },
    _qb: qb,
  };

  return mockClient;
}
