import { apiClient } from './client';

export interface FileMetadata {
  id: string;
  appId: string;
  filename: string;
  mimetype: string;
  size: number;
  createdAt: string;
}

export async function fetchFiles(appId: string) {
  const res = await apiClient.get<FileMetadata[]>(`/apps/${appId}/media`);
  return res.data;
}

export async function uploadFile(appId: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await apiClient.post<FileMetadata>(`/apps/${appId}/media`, form);
  return res.data;
}

export async function deleteFile(appId: string, fileId: string) {
  await apiClient.delete(`/apps/${appId}/media/${fileId}`);
}

export function fileUrl(appId: string, fileId: string) {
  return `/api/apps/${appId}/media/${fileId}/file`;
}
