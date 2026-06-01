import { z } from 'zod';

export type Id = string;

export interface Versioned {
  id: Id;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export const TYPES_PACKAGE_VERSION = '0.0.1';
export const APP_SCHEMA_VERSION = 1;

export const idSchema = z.string().min(1);

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);

export const componentTypeSchema = z.enum([
  'container',
  'text',
  'button',
  'input',
  'image',
  'custom',
]);
export type ComponentType = z.infer<typeof componentTypeSchema>;

export const actionTriggerSchema = z.enum(['onClick', 'onChange', 'onSubmit', 'onLoad']);
export type ActionTrigger = z.infer<typeof actionTriggerSchema>;

export const actionTypeSchema = z.enum(['navigate', 'apiCall', 'stateUpdate', 'submit', 'custom']);
export type ActionType = z.infer<typeof actionTypeSchema>;

export const styleValueSchema = z.union([z.string(), z.number()]);
export type StyleValue = z.infer<typeof styleValueSchema>;

export type ComponentProps = Record<string, JsonValue>;
export type ComponentStyles = Record<string, StyleValue>;

export interface ComponentAction {
  id: Id;
  trigger: ActionTrigger;
  type: ActionType;
  payload: Record<string, JsonValue>;
}

export const componentActionSchema: z.ZodType<ComponentAction> = z.object({
  id: idSchema,
  trigger: actionTriggerSchema,
  type: actionTypeSchema,
  payload: z.record(z.string(), jsonValueSchema),
});

export interface ComponentNode {
  id: Id;
  type: ComponentType;
  name?: string;
  props: ComponentProps;
  styles?: ComponentStyles;
  actions?: ComponentAction[];
  children?: ComponentNode[];
}

export const componentNodeSchema: z.ZodType<ComponentNode> = z.lazy(() =>
  z.object({
    id: idSchema,
    type: componentTypeSchema,
    name: z.string().min(1).optional(),
    props: z.record(z.string(), jsonValueSchema),
    styles: z.record(z.string(), styleValueSchema).optional(),
    actions: z.array(componentActionSchema).optional(),
    children: z.array(componentNodeSchema).optional(),
  }),
);

export interface PageDefinition {
  id: Id;
  name: string;
  path: string;
  root: ComponentNode;
}

export const pageDefinitionSchema: z.ZodType<PageDefinition> = z.object({
  id: idSchema,
  name: z.string().min(1),
  path: z.string().regex(/^\/[a-zA-Z0-9/_-]*$/),
  root: componentNodeSchema,
});

export interface AppDefinition {
  schemaVersion: typeof APP_SCHEMA_VERSION;
  name: string;
  defaultPageId: Id;
  pages: PageDefinition[];
  theme?: Record<string, JsonValue>;
  metadata?: Record<string, JsonValue>;
}

export const appDefinitionSchema: z.ZodType<AppDefinition> = z
  .object({
    schemaVersion: z.literal(APP_SCHEMA_VERSION),
    name: z.string().min(1),
    defaultPageId: idSchema,
    pages: z.array(pageDefinitionSchema).min(1),
    theme: z.record(z.string(), jsonValueSchema).optional(),
    metadata: z.record(z.string(), jsonValueSchema).optional(),
  })
  .superRefine((app, ctx) => {
    if (!app.pages.some((page) => page.id === app.defaultPageId)) {
      ctx.addIssue({
        code: 'custom',
        path: ['defaultPageId'],
        message: 'defaultPageId must reference an existing page.',
      });
    }
  });

export interface StoredApp extends Versioned {
  name: string;
  schema: AppDefinition;
}

export const storedAppSchema: z.ZodType<StoredApp> = z.object({
  id: idSchema,
  name: z.string().min(1),
  version: z.number().int().positive(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  schema: appDefinitionSchema,
});

export function parseAppDefinition(value: unknown): AppDefinition {
  return appDefinitionSchema.parse(value);
}

export function isAppDefinition(value: unknown): value is AppDefinition {
  return appDefinitionSchema.safeParse(value).success;
}
