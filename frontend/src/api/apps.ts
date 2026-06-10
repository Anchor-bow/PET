import type { AppDefinition, StoredApp } from '@pet/types';
import { apiClient } from './client';

export interface AppSummary {
  id: string;
  name: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppPayload {
  name?: string;
  schema: AppDefinition;
}

export interface UpdateAppPayload {
  name?: string;
  schema?: AppDefinition;
}

export async function fetchApps(): Promise<AppSummary[]> {
  const { data } = await apiClient.get<AppSummary[]>('/apps');
  return data;
}

export async function fetchApp(id: string): Promise<StoredApp> {
  const { data } = await apiClient.get<StoredApp>(`/apps/${id}`);
  return data;
}

export async function createApp(payload: CreateAppPayload): Promise<StoredApp> {
  const { data } = await apiClient.post<StoredApp>('/apps', payload);
  return data;
}

export async function updateApp(id: string, payload: UpdateAppPayload): Promise<StoredApp> {
  const { data } = await apiClient.patch<StoredApp>(`/apps/${id}`, payload);
  return data;
}

export async function deleteApp(id: string): Promise<void> {
  await apiClient.delete(`/apps/${id}`);
}

export async function exportAppWeb(id: string): Promise<Blob> {
  const { data } = await apiClient.post<Blob>(
    `/apps/${id}/export`,
    {},
    { responseType: 'blob' },
  );
  return data;
}

export async function exportAppDesktop(id: string): Promise<Blob> {
  const { data } = await apiClient.post<Blob>(
    `/apps/${id}/export/desktop`,
    {},
    { responseType: 'blob' },
  );
  return data;
}

export async function exportAppAndroid(id: string): Promise<Blob> {
  const { data } = await apiClient.post<Blob>(
    `/apps/${id}/export/android`,
    {},
    { responseType: 'blob' },
  );
  return data;
}
