// Only constants are re-exported here. Components and pages are imported from
// their own files: this index is pulled into the entry bundle (AuthProvider
// reads LEGAL_INFO) as well as into lazy chunks, so re-exporting a component
// through it makes Rollup build a circular dependency between those chunks.
export { LEGAL_ROUTES } from './constants/legal-routes.constants';
export { LEGAL_INFO, PENDING_VALUE } from './constants/legal-info.constants';
