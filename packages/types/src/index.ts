export type Id = string;

export interface Versioned {
  id: Id;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export const TYPES_PACKAGE_VERSION = '0.0.1';
