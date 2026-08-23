/**
 * Machine-readable copy of everything held about one user, served by
 * GET /api/users/me/export for the GDPR portability right.
 *
 * Scope rule: the requester only. A shared session names the dogs and the
 * activity, never the other participants — see ExportedSession.
 */
export interface UserDataExport {
  /** ISO 8601 timestamp of the moment the export was produced. */
  exportedAt: string;
  /** Schema version of this document, so a later reader can tell revisions apart. */
  formatVersion: string;
  account: ExportedAccount;
  consent: ExportedConsent;
  preferences: ExportedPreferences;
  dogs: ExportedDog[];
  sessions: ExportedSession[];
}

export interface ExportedAccount {
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string | null;
  lastSignInAt: string | null;
}

/** Proof of consent as recorded in user_metadata at sign-up. Null for accounts predating the consent checkbox. */
export interface ExportedConsent {
  acceptedAt: string | null;
  documentsVersion: string | null;
}

/** Interface preferences held on the account. The theme is stored in user_metadata, not in the browser. */
export interface ExportedPreferences {
  /** 'light' or 'dark'; null when the user never changed it. */
  theme: string | null;
}

export interface ExportedDog {
  name: string;
  birthDate: string;
  createdAt: string;
}

/**
 * A session as it concerns the requester. Participant identifiers and names are
 * deliberately absent: a shared session belongs to several people, and only the
 * count of the others may be disclosed.
 */
export interface ExportedSession {
  date: string;
  exerciseType: string;
  duration: number;
  dogNames: string[];
  location: string | null;
  locationLat: number | null;
  locationLon: number | null;
  environment: string | null;
  weather: string | null;
  route: string | null;
  previousObjectives: string | null;
  nextObjectives: string | null;
  ownerObservations: string | null;
  trainerObservations: string | null;
  /** Number of participants besides the requester, without naming them. */
  otherParticipantCount: number;
}
