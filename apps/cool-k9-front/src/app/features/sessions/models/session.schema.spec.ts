import { Environment, ExerciseType, Weather } from '@models';
import { sessionSchema } from './session.schema';

/**
 * The form's own validation rules, exercised through the schema that drives it.
 *
 * Testing the schema rather than the rendered form keeps these assertions on the
 * rules themselves, independent of the field widgets that happen to present them.
 */
describe('sessionSchema', () => {
  const validValues = {
    userIds: ['user-1'],
    dogIds: ['dog-1'],
    date: new Date('2026-02-01T09:00:00Z'),
    duration: 60,
    exerciseType: ExerciseType.EDUCATION,
  };

  const messagesFor = (values: unknown): Record<string, string> => {
    const result = sessionSchema.safeParse(values);
    if (result.success) return {};
    return Object.fromEntries(
      result.error.issues.map(issue => [String(issue.path[0]), issue.message])
    );
  };

  it('accepts a complete submission', () => {
    expect(sessionSchema.safeParse(validValues).success).toBe(true);
  });

  describe('incomplete submission', () => {
    it('is blocked when every field is missing', () => {
      expect(sessionSchema.safeParse({}).success).toBe(false);
    });

    it('reports each missing field rather than stopping at the first', () => {
      const messages = messagesFor({});

      expect(Object.keys(messages).sort()).toEqual([
        'date',
        'duration',
        'exerciseType',
        'userIds',
      ]);
    });

    it('is blocked when no client is selected', () => {
      const messages = messagesFor({ ...validValues, userIds: [] });

      expect(messages['userIds']).toBe('Veuillez sélectionner au moins un client');
    });

    it('is blocked when the date is missing', () => {
      expect(sessionSchema.safeParse({ ...validValues, date: undefined }).success).toBe(false);
    });

    it('is blocked when the exercise type is missing', () => {
      expect(sessionSchema.safeParse({ ...validValues, exerciseType: undefined }).success).toBe(
        false
      );
    });
  });

  describe('duration', () => {
    it('refuses a duration of zero', () => {
      const messages = messagesFor({ ...validValues, duration: 0 });

      expect(messages['duration']).toBe('La durée doit être supérieure à 0');
    });

    it('refuses a negative duration', () => {
      expect(sessionSchema.safeParse({ ...validValues, duration: -5 }).success).toBe(false);
    });

    // The field is a text input, so the value arrives as a string and is coerced.
    it('accepts a numeric string coming from the input', () => {
      const result = sessionSchema.safeParse({ ...validValues, duration: '45' });

      expect(result.success).toBe(true);
      expect(result.success && result.data.duration).toBe(45);
    });

    it('refuses a value that is not a number', () => {
      expect(sessionSchema.safeParse({ ...validValues, duration: 'abc' }).success).toBe(false);
    });
  });

  describe('enumerations', () => {
    it('refuses an exercise type outside the accepted set', () => {
      expect(sessionSchema.safeParse({ ...validValues, exerciseType: 'NOPE' }).success).toBe(false);
    });

    it('accepts every declared exercise type', () => {
      for (const type of Object.values(ExerciseType)) {
        expect(sessionSchema.safeParse({ ...validValues, exerciseType: type }).success).toBe(true);
      }
    });

    it('accepts the optional environment and weather when supplied', () => {
      const result = sessionSchema.safeParse({
        ...validValues,
        environment: Environment.OUTDOOR,
        weather: Weather.SUNNY,
      });

      expect(result.success).toBe(true);
    });

    it('refuses a weather outside the accepted set', () => {
      expect(sessionSchema.safeParse({ ...validValues, weather: 'HAIL' }).success).toBe(false);
    });
  });

  describe('optional fields', () => {
    it('accepts a submission carrying none of them', () => {
      expect(sessionSchema.safeParse(validValues).success).toBe(true);
    });

    it('accepts null coordinates, which is how the field is cleared', () => {
      const result = sessionSchema.safeParse({
        ...validValues,
        locationLat: null,
        locationLon: null,
      });

      expect(result.success).toBe(true);
    });
  });

  /**
   * Guards the French wording the interface is meant to show.
   *
   * These three rules declare their message through the Zod 3 constructor options
   * `required_error` / `invalid_type_error`, which Zod 4 ignores: the message that
   * actually reaches the user is Zod's own English default. The assertions below
   * record that as the behaviour in force today, so the day the schema is ported
   * they fail and have to be updated deliberately.
   *
   * See the note raised with this change: the fix belongs to the schema, not here.
   */
  describe('messages lost to the Zod 4 upgrade', () => {
    it('answers a missing date in English instead of French', () => {
      const messages = messagesFor({ ...validValues, date: undefined });

      expect(messages['date']).not.toBe('La date est obligatoire');
      expect(messages['date']).toContain('expected date');
    });

    it('answers a missing duration in English instead of French', () => {
      const messages = messagesFor({ ...validValues, duration: undefined });

      expect(messages['duration']).not.toBe('La durée est obligatoire');
    });

    it('answers a missing exercise type in English instead of French', () => {
      const messages = messagesFor({ ...validValues, exerciseType: undefined });

      expect(messages['exerciseType']).not.toBe('Le type de séance est obligatoire');
    });
  });
});
