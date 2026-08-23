const apiBaseUrl = import.meta.env['VITE_API_BASE_URL'] as string | undefined;

if (!apiBaseUrl) {
  throw new Error(
    'VITE_API_BASE_URL is not defined. Set it in the app .env file (see .env.example) ' +
      'or in the deployment platform environment variables.'
  );
}

export const API_BASE_URL = apiBaseUrl;
