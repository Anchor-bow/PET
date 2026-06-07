import type { ComponentType } from '@pet/types';
import type { ComponentType as ReactComponentType } from 'react';
import {
  ButtonPrimitive,
  ContainerPrimitive,
  CustomPrimitive,
  ImagePrimitive,
  InputPrimitive,
  TextPrimitive,
  type PrimitiveProps,
} from './primitives';

export interface ComponentDefinition {
  type: ComponentType;
  label: string;
  Component: ReactComponentType<PrimitiveProps>;
  supportsChildren: boolean;
}

export const componentRegistry: Record<ComponentType, ComponentDefinition> = {
  container: {
    type: 'container',
    label: 'Container',
    Component: ContainerPrimitive,
    supportsChildren: true,
  },
  text: {
    type: 'text',
    label: 'Text',
    Component: TextPrimitive,
    supportsChildren: false,
  },
  button: {
    type: 'button',
    label: 'Button',
    Component: ButtonPrimitive,
    supportsChildren: false,
  },
  input: {
    type: 'input',
    label: 'Eingabefeld',
    Component: InputPrimitive,
    supportsChildren: false,
  },
  image: {
    type: 'image',
    label: 'Bild',
    Component: ImagePrimitive,
    supportsChildren: false,
  },
  custom: {
    type: 'custom',
    label: 'Custom',
    Component: CustomPrimitive,
    supportsChildren: true,
  },
};

export function getComponentDefinition(type: ComponentType): ComponentDefinition {
  return componentRegistry[type];
}

export const insertableComponentTypes: ComponentType[] = [
  'container',
  'text',
  'button',
  'input',
  'image',
];
