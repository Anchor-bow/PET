import { apiClient } from './client';

export interface FieldDefinition {
  id: string;
  name: string;
  key: string;
  type: string;
  required: boolean;
  defaultValue?: unknown;
  options?: string[];
  relation?: { type: string; targetTableId: string };
}

export interface TableDefinition {
  id: string;
  name: string;
  slug: string;
  fields: FieldDefinition[];
}

export interface StoredRecord {
  id: string;
  appId: string;
  tableId: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export async function fetchTables(appId: string): Promise<TableDefinition[]> {
  const { data } = await apiClient.get<TableDefinition[]>(`/apps/${appId}/tables`);
  return data;
}

export async function createTable(appId: string, table: { name: string; slug: string; fields?: Omit<FieldDefinition, 'id'>[] }): Promise<TableDefinition> {
  const { data } = await apiClient.post<TableDefinition>(`/apps/${appId}/tables`, table);
  return data;
}

export async function updateTable(appId: string, tableId: string, table: { name?: string; slug?: string; fields?: Omit<FieldDefinition, 'id'>[] }): Promise<TableDefinition> {
  const { data } = await apiClient.patch<TableDefinition>(`/apps/${appId}/tables/${tableId}`, table);
  return data;
}

export async function deleteTable(appId: string, tableId: string): Promise<void> {
  await apiClient.delete(`/apps/${appId}/tables/${tableId}`);
}

export async function fetchRecords(appId: string, tableId: string): Promise<StoredRecord[]> {
  const { data } = await apiClient.get<StoredRecord[]>(`/apps/${appId}/records/${tableId}`);
  return data;
}

export async function createRecord(appId: string, tableId: string, record: { data: Record<string, unknown> }): Promise<StoredRecord> {
  const { data } = await apiClient.post<StoredRecord>(`/apps/${appId}/records/${tableId}`, record);
  return data;
}

export async function updateRecord(appId: string, tableId: string, recordId: string, record: { data: Record<string, unknown> }): Promise<StoredRecord> {
  const { data } = await apiClient.patch<StoredRecord>(`/apps/${appId}/records/${tableId}/${recordId}`, record);
  return data;
}

export async function deleteRecord(appId: string, tableId: string, recordId: string): Promise<void> {
  await apiClient.delete(`/apps/${appId}/records/${tableId}/${recordId}`);
}
