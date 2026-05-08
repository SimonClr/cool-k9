import { ExerciseType, PaginatedResponse, Session } from '@models';
import { API_BASE_URL } from '@/app/constants/api.constants';
import { getAuthHeaders } from '@/utils/auth-headers.utils';
import { CreateSessionInput } from '../services/session.service';

const API_URL = `${API_BASE_URL}/sessions`;

export async function apiFetchSessions(params?: {
  exerciseTypes?: ExerciseType[];
  page?: number;
  perPage?: number;
  userIds?: string[];
  dogIds?: string[];
}): Promise<PaginatedResponse<Session>> {
  const query = new URLSearchParams();
  if (params?.exerciseTypes?.length) query.set('exerciseTypes', params.exerciseTypes.join(','));
  if (params?.page != null) query.set('page', String(params.page));
  if (params?.perPage != null) query.set('perPage', String(params.perPage));
  if (params?.userIds?.length) query.set('userIds', params.userIds.join(','));
  if (params?.dogIds?.length) query.set('dogIds', params.dogIds.join(','));

  const url = query.toString() ? `${API_URL}?${query}` : API_URL;
  const response = await fetch(url, { headers: await getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch sessions');
  return response.json();
}

export async function apiFetchSession(id: string): Promise<Session> {
  const response = await fetch(`${API_URL}/${id}`, { headers: await getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch session');
  return response.json();
}

export async function apiUpdateSession(id: string, dto: Partial<CreateSessionInput>): Promise<Session> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: { ...(await getAuthHeaders()), 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  if (!response.ok) throw new Error('Failed to update session');
  return response.json();
}

export async function apiCreateSession(dto: CreateSessionInput): Promise<Session> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { ...(await getAuthHeaders()), 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  if (!response.ok) throw new Error('Failed to create session');
  return response.json();
}
