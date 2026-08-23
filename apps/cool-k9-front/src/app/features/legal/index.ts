// Pages are intentionally NOT re-exported here: app.tsx loads them lazily from
// their own files so each ends up in its own chunk. Re-exporting them would pull
// all three into whatever bundle imports this index.
export { LegalLinks } from './components/LegalLinks';
export { LEGAL_ROUTES } from './constants/legal-routes.constants';
export { LEGAL_INFO, PENDING_VALUE } from './constants/legal-info.constants';
