/**
 * Editor and hosting details. The site owner is the publisher and the data
 * controller, so these values come from them, not from this repository.
 *
 * Values still set to PENDING_VALUE are placeholders: the legal pages must not
 * be deployed while any of them remains, since incomplete legal notices are
 * worse than none at all.
 *
 * Check before any release: grep -rn "PENDING_" apps/cool-k9-front/src
 */
export const PENDING_VALUE = 'PENDING_À_COMPLÉTER';

export const LEGAL_INFO = {
  editorName: PENDING_VALUE,
  editorLegalForm: PENDING_VALUE,
  editorSiret: PENDING_VALUE,
  editorAddress: PENDING_VALUE,
  editorEmail: PENDING_VALUE,
  publicationDirector: PENDING_VALUE,

  /** Depends on the production-infrastructure change: no host chosen yet. */
  appHost: PENDING_VALUE,

  /** Supabase project cool-k9 runs in region eu-west-1 (Ireland), inside the EU. */
  dataHost: 'Supabase Inc.',
  dataHostRegion: 'Irlande (eu-west-1), Union européenne',

  /** Retention period is the owner's decision; task 6.1 checks it against behaviour. */
  dataRetention: PENDING_VALUE,

  /** Recorded with each consent so a later revision can be told apart. Read by the register form. */
  documentsVersion: '1.0',

  lastUpdated: PENDING_VALUE,
} as const;
