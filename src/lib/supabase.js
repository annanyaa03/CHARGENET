// Robust Mock Supabase client for local-only development (supports chaining)
const createMockQueryBuilder = () => {
  const queryBuilder = {
    // Methods that return the query builder itself for chaining
    select: () => queryBuilder,
    insert: () => queryBuilder,
    update: () => queryBuilder,
    delete: () => queryBuilder,
    eq: () => queryBuilder,
    neq: () => queryBuilder,
    gt: () => queryBuilder,
    lt: () => queryBuilder,
    gte: () => queryBuilder,
    lte: () => queryBuilder,
    like: () => queryBuilder,
    ilike: () => queryBuilder,
    is: () => queryBuilder,
    in: () => queryBuilder,
    contains: () => queryBuilder,
    containedBy: () => queryBuilder,
    range: () => queryBuilder,
    order: () => queryBuilder,
    limit: () => queryBuilder,
    single: () => queryBuilder,
    maybeSingle: () => queryBuilder,
    
    // Promise behavior to resolve the chain
    then: (resolve) => resolve({ data: [], error: null }),
    catch: (reject) => reject(null),
  }
  return queryBuilder
}

export const supabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.reject(new Error("Supabase is mocked. Use mock login.")),
    signUp: () => Promise.reject(new Error("Supabase is mocked. Use mock register.")),
    signOut: () => Promise.resolve({ error: null }),
  },
  from: () => createMockQueryBuilder(),
}

console.log("Supabase is currently mocked for local-only development (no backend). Chaining supported.")
