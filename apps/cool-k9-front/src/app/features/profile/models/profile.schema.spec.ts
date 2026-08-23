import { profileSchema } from './profile.schema';

describe('profileSchema', () => {
  const messagesFor = (values: unknown): Record<string, string> => {
    const result = profileSchema.safeParse(values);
    if (result.success) return {};
    return Object.fromEntries(
      result.error.issues.map(issue => [String(issue.path[0]), issue.message])
    );
  };

  it('accepts a complete submission', () => {
    expect(profileSchema.safeParse({ firstName: 'Ada', lastName: 'Lovelace' }).success).toBe(true);
  });

  it('reports a missing first name', () => {
    expect(messagesFor({ firstName: '', lastName: 'Lovelace' })['firstName']).toBe(
      'Le prénom est obligatoire'
    );
  });

  it('reports a missing last name', () => {
    expect(messagesFor({ firstName: 'Ada', lastName: '' })['lastName']).toBe(
      'Le nom est obligatoire'
    );
  });

  it('refuses a first name beyond the accepted length', () => {
    expect(
      profileSchema.safeParse({ firstName: 'x'.repeat(41), lastName: 'Lovelace' }).success
    ).toBe(false);
  });

  it('refuses a last name beyond the accepted length', () => {
    expect(profileSchema.safeParse({ firstName: 'Ada', lastName: 'x'.repeat(31) }).success).toBe(
      false
    );
  });

  it('accepts names at exactly the accepted length', () => {
    expect(
      profileSchema.safeParse({ firstName: 'x'.repeat(40), lastName: 'y'.repeat(30) }).success
    ).toBe(true);
  });
});
