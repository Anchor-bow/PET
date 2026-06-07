import {
  buttonPropsSchema,
  containerPropsSchema,
  imagePropsSchema,
  inputPropsSchema,
  textPropsSchema,
  type ComponentType,
} from '@pet/types';

export type FieldKind = 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'widthValue';

export interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  options?: readonly string[];
  hint?: string;
}

export type FieldSafeParseResult =
  | { success: true; data: unknown }
  | { success: false; error: { issues: ReadonlyArray<{ message: string }> } };

export interface FieldSchema {
  safeParse(value: unknown): FieldSafeParseResult;
}

export interface PropsSchema {
  shape: Record<string, FieldSchema>;
}

export interface TypeFieldsConfig {
  schema: PropsSchema;
  fields: readonly FieldDef[];
}

export const propertyFieldsByType: Record<ComponentType, TypeFieldsConfig | null> = {
  container: {
    schema: containerPropsSchema,
    fields: [
      { key: 'direction', label: 'Ausrichtung', kind: 'select', options: ['column', 'row'] },
      { key: 'gap', label: 'Abstand (px)', kind: 'number' },
      { key: 'padding', label: 'Innenabstand (px)', kind: 'number' },
    ],
  },
  text: {
    schema: textPropsSchema,
    fields: [
      { key: 'content', label: 'Inhalt', kind: 'textarea' },
      {
        key: 'variant',
        label: 'Variante',
        kind: 'select',
        options: ['heading1', 'heading2', 'body', 'caption'],
      },
    ],
  },
  button: {
    schema: buttonPropsSchema,
    fields: [
      { key: 'label', label: 'Beschriftung', kind: 'text' },
      {
        key: 'variant',
        label: 'Variante',
        kind: 'select',
        options: ['primary', 'secondary', 'danger'],
      },
      { key: 'disabled', label: 'Deaktiviert', kind: 'checkbox' },
    ],
  },
  input: {
    schema: inputPropsSchema,
    fields: [
      { key: 'label', label: 'Beschriftung', kind: 'text' },
      { key: 'placeholder', label: 'Platzhalter', kind: 'text' },
      {
        key: 'inputType',
        label: 'Eingabetyp',
        kind: 'select',
        options: ['text', 'number', 'email', 'password'],
      },
      { key: 'value', label: 'Startwert', kind: 'text' },
      { key: 'required', label: 'Pflichtfeld', kind: 'checkbox' },
    ],
  },
  image: {
    schema: imagePropsSchema,
    fields: [
      { key: 'src', label: 'Quelle (URL)', kind: 'text' },
      { key: 'alt', label: 'Alt-Text', kind: 'text' },
      {
        key: 'width',
        label: 'Breite',
        kind: 'widthValue',
        hint: 'Zahl (px) oder String, z.B. 100%, 320, auto',
      },
    ],
  },
  custom: null,
};
