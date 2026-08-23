import { dogsSchema } from './dogs.schema';

describe('dogsSchema', () => {
  const messagesFor = (values: unknown): string[] => {
    const result = dogsSchema.safeParse(values);
    if (result.success) return [];
    return result.error.issues.map(issue => issue.message);
  };

  it('accepts an empty list, which is an owner with no dog yet', () => {
    expect(dogsSchema.safeParse({ dogs: [] }).success).toBe(true);
  });

  it('accepts a complete row', () => {
    expect(dogsSchema.safeParse({ dogs: [{ name: 'Rex', birthDate: '2020-05-01' }] }).success).toBe(
      true
    );
  });

  // An existing dog carries its identifier; a newly added row does not yet.
  it('accepts a row with or without an identifier', () => {
    expect(
      dogsSchema.safeParse({ dogs: [{ id: 'dog-1', name: 'Rex', birthDate: '2020-05-01' }] })
        .success
    ).toBe(true);
  });

  it('reports a missing name', () => {
    expect(messagesFor({ dogs: [{ name: '', birthDate: '2020-05-01' }] })).toContain(
      'Le nom est obligatoire'
    );
  });

  it('reports a missing birth date', () => {
    expect(messagesFor({ dogs: [{ name: 'Rex', birthDate: '' }] })).toContain(
      'La date de naissance est obligatoire'
    );
  });

  it('refuses a name beyond the accepted length', () => {
    expect(
      dogsSchema.safeParse({ dogs: [{ name: 'x'.repeat(51), birthDate: '2020-05-01' }] }).success
    ).toBe(false);
  });

  it('validates every row, not only the first', () => {
    const result = dogsSchema.safeParse({
      dogs: [
        { name: 'Rex', birthDate: '2020-05-01' },
        { name: '', birthDate: '2021-05-01' },
      ],
    });

    expect(result.success).toBe(false);
    expect(!result.success && result.error.issues[0].path).toEqual(['dogs', 1, 'name']);
  });
});
