import { SupabaseService } from '../app/supabase/supabase.service';

/**
 * Result shape a Supabase query resolves to, whatever the chain that produced it.
 */
export interface SupabaseResult<T = unknown> {
  data: T | null;
  error: { message: string } | null;
  count?: number | null;
}

/**
 * A recorded query-builder call: the method name and the arguments it received.
 * Tests assert on these to check the query that was *built*, which is the only
 * way to observe things like role filtering — the returned rows are stubbed, so
 * the filter itself is invisible in the result.
 */
export interface RecordedCall {
  method: string;
  args: unknown[];
}

export interface MockSupabase {
  /** The object to inject in place of the real `SupabaseService`. */
  service: SupabaseService;
  /** Every builder call made, in order, across all tables. */
  calls: RecordedCall[];
  /** Table names passed to `.from()`, in order. */
  tables: string[];
  /** Sets the result the next chains resolve to. */
  setResult(result: SupabaseResult): void;
  /** Queues results consumed one per terminal call, for services that query twice. */
  queueResults(results: SupabaseResult[]): void;
  /** Users returned by `auth.admin.listUsers`. */
  setUsers(users: unknown[]): void;
  /** True when `method` was called with arguments deep-equal to `args`. */
  wasCalledWith(method: string, ...args: unknown[]): boolean;
  /** True when `method` was called at all. */
  wasCalled(method: string): boolean;
}

/**
 * Builds a stand-in for `SupabaseService`.
 *
 * The services under test chain fluent calls — `from().select().order().contains().range()`
 * — where every step returns a builder and only the last one resolves. Writing that
 * by hand as a nested literal breaks whenever the call order changes, so the mock is a
 * Proxy instead: unknown methods return the builder itself, and the builder is thenable,
 * so it resolves whether the chain ends on `.range()`, `.single()`, or a bare `await`.
 *
 * Every call is recorded, which is what makes role filtering testable: the assertion is
 * that `contains('user_ids', [userId])` was issued for a regular user and not for an admin.
 */
export function createMockSupabase(initial?: SupabaseResult): MockSupabase {
  const calls: RecordedCall[] = [];
  const tables: string[] = [];
  let result: SupabaseResult = initial ?? { data: null, error: null, count: 0 };
  let queue: SupabaseResult[] = [];
  let users: unknown[] = [];

  const nextResult = (): SupabaseResult => (queue.length > 0 ? (queue.shift() as SupabaseResult) : result);

  const createBuilder = (): unknown => {
    const target = {
      // Makes the builder awaitable: `await query` and `await query.range(...)`
      // both settle through here.
      then: (resolve: (value: SupabaseResult) => unknown, reject?: (reason: unknown) => unknown) =>
        Promise.resolve(nextResult()).then(resolve, reject),
    };

    return new Proxy(target, {
      get(obj, prop) {
        if (prop === 'then') return obj.then;

        return (...args: unknown[]) => {
          calls.push({ method: String(prop), args });

          // Terminal calls resolve; every other step keeps the chain going.
          if (prop === 'single' || prop === 'maybeSingle') {
            return Promise.resolve(nextResult());
          }
          return createBuilder();
        };
      },
    });
  };

  const service = {
    admin: {
      from: (table: string) => {
        tables.push(table);
        calls.push({ method: 'from', args: [table] });
        return createBuilder();
      },
      auth: {
        admin: {
          listUsers: async () => ({ data: { users }, error: null }),
        },
      },
    },
  } as unknown as SupabaseService;

  return {
    service,
    calls,
    tables,
    setResult(next) {
      result = next;
    },
    queueResults(next) {
      queue = [...next];
    },
    setUsers(next) {
      users = next;
    },
    wasCalledWith(method, ...args) {
      return calls.some(
        call => call.method === method && JSON.stringify(call.args) === JSON.stringify(args)
      );
    },
    wasCalled(method) {
      return calls.some(call => call.method === method);
    },
  };
}
