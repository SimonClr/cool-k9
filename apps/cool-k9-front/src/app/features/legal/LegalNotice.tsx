import { LegalLayout } from './components/LegalLayout';
import { LegalSection } from './components/LegalSection';
import { PendingInfo } from './components/PendingInfo';
import { LEGAL_INFO } from './constants/legal-info.constants';

export function LegalNotice() {
  return (
    <LegalLayout title="Mentions légales">
      <LegalSection title="Éditeur du site">
        <p>
          Le présent site est édité par <PendingInfo value={LEGAL_INFO.editorName} />,{' '}
          <PendingInfo value={LEGAL_INFO.editorLegalForm} />.
        </p>
        <dl className="flex flex-col gap-1">
          <div className="flex flex-wrap gap-2">
            <dt className="font-medium">Adresse :</dt>
            <dd>
              <PendingInfo value={LEGAL_INFO.editorAddress} />
            </dd>
          </div>
          <div className="flex flex-wrap gap-2">
            <dt className="font-medium">SIRET :</dt>
            <dd>
              <PendingInfo value={LEGAL_INFO.editorSiret} />
            </dd>
          </div>
          <div className="flex flex-wrap gap-2">
            <dt className="font-medium">Contact :</dt>
            <dd>
              <PendingInfo value={LEGAL_INFO.editorEmail} />
            </dd>
          </div>
        </dl>
      </LegalSection>

      <LegalSection title="Directeur de la publication">
        <p>
          <PendingInfo value={LEGAL_INFO.publicationDirector} />
        </p>
      </LegalSection>

      <LegalSection title="Hébergement du site">
        <p>
          L'application est hébergée par <PendingInfo value={LEGAL_INFO.appHost} />.
        </p>
      </LegalSection>

      <LegalSection title="Hébergement des données">
        <p>
          Les données de l'application (comptes, chiens et séances) sont hébergées par{' '}
          {LEGAL_INFO.dataHost}, dans la région {LEGAL_INFO.dataHostRegion}. Elles ne font l'objet
          d'aucun transfert en dehors de l'Union européenne.
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          L'ensemble des contenus présents sur ce site — textes, images, logo et éléments
          graphiques — est protégé au titre du droit d'auteur. Toute reproduction ou représentation,
          totale ou partielle, sans autorisation préalable de l'éditeur est interdite.
        </p>
      </LegalSection>

      <LegalSection title="Données personnelles">
        <p>
          Le traitement des données personnelles est décrit dans la politique de confidentialité,
          accessible depuis le pied de page de chaque document légal.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
