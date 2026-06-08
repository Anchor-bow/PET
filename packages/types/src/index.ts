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

export const buttonPropsSchema = z.object({
  label: z.string().default('Button'),
  variant: z.enum(['primary', 'secondary', 'danger']).default('primary'),
  disabled: z.boolean().default(false),
});
export type ButtonProps = z.infer<typeof buttonPropsSchema>;

export const inputPropsSchema = z.object({
  label: z.string().default(''),
  placeholder: z.string().default(''),
  inputType: z.enum(['text', 'number', 'email', 'password']).default('text'),
  value: z.string().default(''),
  required: z.boolean().default(false),
});
export type InputProps = z.infer<typeof inputPropsSchema>;

export const containerPropsSchema = z.object({
  direction: z.enum(['row', 'column']).default('column'),
  gap: z.number().int().min(0).default(8),
  padding: z.number().int().min(0).default(0),
});
export type ContainerProps = z.infer<typeof containerPropsSchema>;

export const textPropsSchema = z.object({
  content: z.string().default('Text'),
  variant: z.enum(['heading1', 'heading2', 'body', 'caption']).default('body'),
});
export type TextProps = z.infer<typeof textPropsSchema>;

export const imagePropsSchema = z.object({
  src: z.string().default(''),
  alt: z.string().default(''),
  width: z.union([z.number(), z.string()]).default('100%'),
});
export type ImageProps = z.infer<typeof imagePropsSchema>;

export function getDefaultComponentProps(type: ComponentType): ComponentProps {
  switch (type) {
    case 'button':
      return buttonPropsSchema.parse({}) as ComponentProps;
    case 'input':
      return inputPropsSchema.parse({}) as ComponentProps;
    case 'container':
      return containerPropsSchema.parse({}) as ComponentProps;
    case 'text':
      return textPropsSchema.parse({}) as ComponentProps;
    case 'image':
      return imagePropsSchema.parse({}) as ComponentProps;
    case 'custom':
      return {};
  }
}

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
  description?: string;
  parentPageId?: Id;
}

export const pageDefinitionSchema: z.ZodType<PageDefinition> = z.object({
  id: idSchema,
  name: z.string().min(1),
  path: z.string().regex(/^\/[a-zA-Z0-9/_-]*$/),
  root: componentNodeSchema,
  description: z.string().optional(),
  parentPageId: idSchema.optional(),
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
