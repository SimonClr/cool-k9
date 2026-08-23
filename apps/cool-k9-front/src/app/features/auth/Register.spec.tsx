import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Register } from './Register';

const authRegister = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('./AuthProvider', () => ({
  useAuth: () => mockUseAuth(),
}));

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

const renderForm = () =>
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

/** Fills every field with values the schema accepts. */
const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Prénom'), 'Ada');
  await user.type(screen.getByLabelText('Nom'), 'Lovelace');
  await user.type(screen.getByLabelText('Email'), 'ada@example.com');
  await user.type(screen.getByLabelText('Mot de passe'), 'secret123');
  await user.type(screen.getByLabelText('Confirmer le mot de passe'), 'secret123');
  await user.click(screen.getByRole('checkbox'));
};

const submit = async (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: 'Créer un compte' }));

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authRegister.mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({ register: authRegister, isLoading: false, error: null });
  });

  describe('invalid submission', () => {
    it('shows the expected message for every missing field', async () => {
      const user = userEvent.setup();
      renderForm();

      await submit(user);

      expect(await screen.findByText('Le prénom est obligatoire')).toBeInTheDocument();
      expect(screen.getByText('Le nom est obligatoire')).toBeInTheDocument();
      expect(screen.getByText("L'email est obligatoire")).toBeInTheDocument();
      expect(screen.getByText('Le mot de passe est obligatoire')).toBeInTheDocument();
      expect(screen.getByText('Veuillez confirmer le mot de passe')).toBeInTheDocument();
    });

    it('does not submit when the form is invalid', async () => {
      const user = userEvent.setup();
      renderForm();

      await submit(user);

      await screen.findByText('Le prénom est obligatoire');
      expect(authRegister).not.toHaveBeenCalled();
    });

    // The field is an <input type="email">, so a malformed address fails the
    // browser's own constraint validation and the form never submits. The schema
    // rule behind it is therefore never reached in a real browser either, which is
    // why this asserts the blocking rather than the French message.
    it('blocks a malformed email before the form is submitted', async () => {
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByLabelText('Email'), 'not-an-email');
      await submit(user);

      const email = screen.getByLabelText('Email') as HTMLInputElement;
      expect(email.validity.typeMismatch).toBe(true);
      expect(authRegister).not.toHaveBeenCalled();
    });

    it('reports an empty email with the expected message', async () => {
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByLabelText('Prénom'), 'Ada');
      await submit(user);

      expect(await screen.findByText("L'email est obligatoire")).toBeInTheDocument();
      expect(authRegister).not.toHaveBeenCalled();
    });

    it('reports mismatched passwords', async () => {
      const user = userEvent.setup();
      renderForm();

      await fillValidForm(user);
      await user.clear(screen.getByLabelText('Confirmer le mot de passe'));
      await user.type(screen.getByLabelText('Confirmer le mot de passe'), 'different');
      await submit(user);

      expect(
        await screen.findByText('Les mots de passe ne correspondent pas')
      ).toBeInTheDocument();
      expect(authRegister).not.toHaveBeenCalled();
    });

    // Consent is a legal requirement, so an unchecked box has to block the account
    // creation rather than merely warn.
    it('refuses to submit without consent to the legal documents', async () => {
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByLabelText('Prénom'), 'Ada');
      await user.type(screen.getByLabelText('Nom'), 'Lovelace');
      await user.type(screen.getByLabelText('Email'), 'ada@example.com');
      await user.type(screen.getByLabelText('Mot de passe'), 'secret123');
      await user.type(screen.getByLabelText('Confirmer le mot de passe'), 'secret123');
      await submit(user);

      expect(
        await screen.findByText(
          'Vous devez accepter les conditions générales et la politique de confidentialité'
        )
      ).toBeInTheDocument();
      expect(authRegister).not.toHaveBeenCalled();
    });

    it('marks the offending field for assistive technology', async () => {
      const user = userEvent.setup();
      renderForm();

      await submit(user);

      await screen.findByText("L'email est obligatoire");
      expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('valid submission', () => {
    it('passes the entered values on', async () => {
      const user = userEvent.setup();
      renderForm();

      await fillValidForm(user);
      await submit(user);

      await waitFor(() =>
        expect(authRegister).toHaveBeenCalledWith(
          'ada@example.com',
          'secret123',
          'Ada',
          'Lovelace'
        )
      );
    });

    it('sends the submission exactly once', async () => {
      const user = userEvent.setup();
      renderForm();

      await fillValidForm(user);
      await submit(user);

      await waitFor(() => expect(authRegister).toHaveBeenCalledTimes(1));
    });

    it('moves on to the sessions once the account is created', async () => {
      const user = userEvent.setup();
      renderForm();

      await fillValidForm(user);
      await submit(user);

      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/sessions', { replace: true }));
    });

    it('stays put when the account creation fails', async () => {
      authRegister.mockRejectedValue(new Error('Email already taken'));
      const user = userEvent.setup();
      renderForm();

      await fillValidForm(user);
      await submit(user);

      await waitFor(() => expect(authRegister).toHaveBeenCalled());
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  describe('feedback from the authentication context', () => {
    it('shows the error it reports', () => {
      mockUseAuth.mockReturnValue({
        register: authRegister,
        isLoading: false,
        error: 'Email déjà utilisé',
      });
      renderForm();

      expect(screen.getByRole('alert')).toHaveTextContent('Email déjà utilisé');
    });

    it('disables the button while the request is in flight', () => {
      mockUseAuth.mockReturnValue({ register: authRegister, isLoading: true, error: null });
      renderForm();

      expect(screen.getByRole('button', { name: /Création/ })).toBeDisabled();
    });
  });
});
