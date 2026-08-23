import { Link } from 'react-router-dom';
import { LegalLayout } from './components/LegalLayout';
import { LegalSection } from './components/LegalSection';
import { PendingInfo } from './components/PendingInfo';
import { LEGAL_INFO } from './constants/legal-info.constants';
import { LEGAL_ROUTES } from './constants/legal-routes.constants';

export function TermsOfService() {
  return (
    <LegalLayout title="Conditions générales d'utilisation">
      <LegalSection title="Objet">
        <p>
          Les présentes conditions définissent les modalités d'utilisation de l'application Cool K9,
          éditée par <PendingInfo value={LEGAL_INFO.editorName} />. L'application permet aux clients
          de suivre les séances de dressage de leurs chiens : consultation des séances passées,
          objectifs, et échange d'observations avec l'éducateur.
        </p>
        <p>
          L'utilisation de l'application suppose l'acceptation pleine et entière des présentes
          conditions, recueillie lors de la création du compte.
        </p>
      </LegalSection>

      <LegalSection title="Accès au service">
        <p>
          L'accès à l'application requiert la création d'un compte et est réservé aux clients de
          l'éducateur. Vous vous engagez à fournir des informations exactes lors de l'inscription et
          à les tenir à jour.
        </p>
        <p>
          Vous êtes responsable de la confidentialité de votre mot de passe et des actions
          effectuées depuis votre compte. En cas d'utilisation non autorisée, il vous appartient
          d'en informer l'éditeur sans délai.
        </p>
        <p>
          L'application est fournie sans garantie de disponibilité continue. L'éditeur peut en
          suspendre l'accès temporairement, notamment pour maintenance.
        </p>
      </LegalSection>

      <LegalSection title="Utilisation">
        <p>Vous vous engagez à ne pas :</p>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-muted-foreground">
          <li>tenter d'accéder à des données autres que les vôtres ;</li>
          <li>perturber le fonctionnement de l'application ou en compromettre la sécurité ;</li>
          <li>
            publier dans les champs d'observation des contenus illicites, injurieux ou portant
            atteinte aux droits de tiers.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Prestations de dressage">
        <p>
          L'application est un outil de suivi. Elle ne constitue ni un contrat de prestation, ni une
          garantie de résultat quant au dressage. Les modalités, tarifs et conditions des séances
          relèvent de l'accord conclu directement avec l'éducateur.
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          L'application, sa structure et ses contenus sont protégés par le droit de la propriété
          intellectuelle. Vous conservez la propriété des contenus que vous saisissez, et accordez à
          l'éditeur le droit de les conserver et de les afficher dans le seul but d'assurer le
          service.
        </p>
      </LegalSection>

      <LegalSection title="Responsabilité">
        <p>
          L'éditeur met en œuvre les moyens raisonnables pour assurer le bon fonctionnement et la
          sécurité de l'application. Sa responsabilité ne saurait être engagée en cas
          d'indisponibilité temporaire, de perte de données résultant d'un usage non conforme, ou de
          dommage indirect lié à l'utilisation du service.
        </p>
      </LegalSection>

      <LegalSection title="Résiliation">
        <p>
          Vous pouvez cesser d'utiliser l'application à tout moment et supprimer votre compte
          vous-même depuis votre profil, sans avoir à en faire la demande. La suppression entraîne
          l'effacement immédiat de vos données dans les conditions décrites par la{' '}
          <Link to={LEGAL_ROUTES.privacy} className="text-primary underline underline-offset-4">
            politique de confidentialité
          </Link>
          .
        </p>
        <p>
          L'éditeur peut suspendre ou résilier un compte en cas de manquement aux présentes
          conditions, après vous en avoir informé.
        </p>
      </LegalSection>

      <LegalSection title="Modification des conditions">
        <p>
          Les présentes conditions peuvent être modifiées afin de suivre les évolutions de
          l'application ou de la réglementation. La version en vigueur et sa date de mise à jour
          figurent en bas de cette page.
        </p>
      </LegalSection>

      <LegalSection title="Droit applicable">
        <p>
          Les présentes conditions sont soumises au droit français. En cas de litige, une solution
          amiable sera recherchée avant toute action contentieuse. À défaut, les tribunaux français
          sont compétents.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
