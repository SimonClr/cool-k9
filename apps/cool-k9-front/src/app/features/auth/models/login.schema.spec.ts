import { loginSchema } from './login.schema';

describe('loginSchema', () => {
  const messagesFor = (values: unknown): Record<string, string> => {
    const result = loginSchema.safeParse(values);
    if (result.success) return {};
    return Object.fromEntries(
      result.error.issues.map(issue => [String(issue.path[0]), issue.message])
    );
  };

  it('accepts a complete submission', () => {
    expect(loginSchema.safeParse({ email: 'ada@example.com', password: 'secret' }).success).toBe(
      true
    );
  });

  it('reports both fields when the form is empty', () => {
    expect(messagesFor({ email: '', password: '' })).toEqual({
      email: "L'email est obligatoire",
      password: 'Le mot de passe est obligatoire',
    });
  });

  it('reports a missing email', () => {
    expect(messagesFor({ email: '', password: 'secret' })['email']).toBe(
      "L'email est obligatoire"
    );
  });

  it('reports a missing password', () => {
    expect(messagesFor({ email: 'ada@example.com', password: '' })['password']).toBe(
      'Le mot de passe est obligatoire'
    );
  });

  // Sign-in deliberately does not check the address format: the credentials are
  // verified remotely, and rejecting the shape here would only leak which
  // addresses are known.
  it('does not judge the shape of the address', () => {
    expect(loginSchema.safeParse({ email: 'not-an-email', password: 'secret' }).success).toBe(true);
  });
});
