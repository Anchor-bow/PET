import { apiClient } from './client';

export interface AppSummary {
  id: string;
  name: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export async function fetchApps(): Promise<AppSummary[]> {
  const { data } = await apiClient.get<AppSummary[]>('/apps');
  return data;
}
