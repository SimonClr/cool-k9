import { Link } from 'react-router-dom';
import { LegalLayout } from './components/LegalLayout';
import { LegalSection } from './components/LegalSection';
import { PendingInfo } from './components/PendingInfo';
import { LEGAL_INFO } from './constants/legal-info.constants';
import { LEGAL_ROUTES } from './constants/legal-routes.constants';

export function PrivacyPolicy() {
  return (
    <LegalLayout title="Politique de confidentialité">
      <LegalSection title="Responsable du traitement">
        <p>
          Le responsable du traitement des données collectées sur ce site est{' '}
          <PendingInfo value={LEGAL_INFO.editorName} />, que vous pouvez contacter à l'adresse{' '}
          <PendingInfo value={LEGAL_INFO.editorEmail} />.
        </p>
      </LegalSection>

      <LegalSection title="Données collectées">
        <p>Les données suivantes sont collectées et conservées :</p>
        <dl className="flex flex-col gap-3">
          <div>
            <dt className="font-medium">Compte</dt>
            <dd className="text-muted-foreground">
              Adresse électronique, prénom et nom. L'adresse électronique sert d'identifiant de
              connexion. Le mot de passe n'est jamais conservé en clair.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Chiens</dt>
            <dd className="text-muted-foreground">Nom et date de naissance de chaque chien.</dd>
          </div>
          <div>
            <dt className="font-medium">Séances</dt>
            <dd className="text-muted-foreground">
              Date, durée, type d'exercice, lieu et coordonnées géographiques, environnement,
              conditions météorologiques, parcours, objectifs précédents et suivants, ainsi que les
              observations rédigées par le propriétaire et par l'éducateur.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Préférences d'affichage</dt>
            <dd className="text-muted-foreground">
              Le thème choisi pour l'interface, clair ou sombre.
            </dd>
          </div>
        </dl>
        <p>
          Aucune donnée n'est collectée à votre insu : toutes proviennent des informations que vous
          saisissez ou de celles renseignées par l'éducateur lors des séances.
        </p>
      </LegalSection>

      <LegalSection title="Finalités et bases légales">
        <p>Ces données sont traitées aux fins suivantes :</p>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-muted-foreground">
          <li>
            <span className="text-foreground">Gestion de votre compte et de votre accès</span> —
            sur la base de votre consentement, recueilli lors de l'inscription.
          </li>
          <li>
            <span className="text-foreground">Suivi des séances de dressage</span> — sur la base de
            l'exécution du contrat de prestation qui vous lie à l'éducateur.
          </li>
        </ul>
        <p>
          Vos données ne sont utilisées à aucune fin publicitaire et ne font l'objet d'aucune
          décision automatisée ni d'aucun profilage.
        </p>
      </LegalSection>

      <LegalSection title="Durée de conservation">
        <p>
          Les données sont conservées <PendingInfo value={LEGAL_INFO.dataRetention} />. Elles sont
          supprimées lorsque vous supprimez votre compte.
        </p>
      </LegalSection>

      <LegalSection title="Destinataires">
        <p>
          Vos données sont accessibles à l'éditeur du site en sa qualité d'éducateur, ainsi qu'aux
          prestataires techniques strictement nécessaires au fonctionnement du service :{' '}
          <PendingInfo value={LEGAL_INFO.appHost} /> pour l'hébergement de l'application et{' '}
          {LEGAL_INFO.dataHost} pour l'hébergement de la base de données.
        </p>
        <p>
          Lorsqu'une séance réunit plusieurs participants, les autres participants peuvent voir les
          informations relatives à cette séance commune. Elles ne sont ni vendues ni transmises à
          des tiers à d'autres fins.
        </p>
      </LegalSection>

      <LegalSection title="Transferts hors de l'Union européenne">
        <p>
          Les données sont hébergées dans la région {LEGAL_INFO.dataHostRegion} et ne font l'objet
          d'aucun transfert en dehors de l'Union européenne.
        </p>
      </LegalSection>

      <LegalSection title="Vos droits">
        <p>
          Conformément au règlement général sur la protection des données, vous disposez des droits
          d'accès, de rectification, d'effacement, de portabilité, de limitation et d'opposition sur
          les données qui vous concernent.
        </p>
        <p>
          Vous pouvez exercer ces droits en écrivant à{' '}
          <PendingInfo value={LEGAL_INFO.editorEmail} />. Vous pouvez également modifier vos
          informations directement depuis votre profil.
        </p>
        <p>
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une
          réclamation auprès de la Commission nationale de l'informatique et des libertés (CNIL).
        </p>
      </LegalSection>

      <LegalSection title="Sécurité">
        <p>
          L'accès à vos données est protégé par une authentification individuelle et par des règles
          de cloisonnement appliquées au niveau de la base de données : chaque utilisateur n'accède
          qu'aux séances auxquelles il participe et aux chiens qu'il a déclarés.
        </p>
      </LegalSection>

      <LegalSection title="Modification de la présente politique">
        <p>
          La présente politique peut être modifiée. La version en vigueur et sa date de mise à jour
          figurent en bas de cette page. Les{' '}
          <Link to={LEGAL_ROUTES.terms} className="text-primary underline underline-offset-4">
            conditions générales d'utilisation
          </Link>{' '}
          complètent ce document.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
