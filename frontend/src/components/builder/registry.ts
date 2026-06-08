import type { ActionTrigger, ComponentType } from '@pet/types';
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
  supportedTriggers: ActionTrigger[];
}

export const componentRegistry: Record<ComponentType, ComponentDefinition> = {
  container: {
    type: 'container',
    label: 'Container',
    Component: ContainerPrimitive,
    supportsChildren: true,
    supportedTriggers: [],
  },
  text: {
    type: 'text',
    label: 'Text',
    Component: TextPrimitive,
    supportsChildren: false,
    supportedTriggers: [],
  },
  button: {
    type: 'button',
    label: 'Button',
    Component: ButtonPrimitive,
    supportsChildren: false,
    supportedTriggers: ['onClick'],
  },
  input: {
    type: 'input',
    label: 'Eingabefeld',
    Component: InputPrimitive,
    supportsChildren: false,
    supportedTriggers: ['onChange'],
  },
  image: {
    type: 'image',
    label: 'Bild',
    Component: ImagePrimitive,
    supportsChildren: false,
    supportedTriggers: [],
  },
  custom: {
    type: 'custom',
    label: 'Custom',
    Component: CustomPrimitive,
    supportsChildren: true,
    supportedTriggers: ['onClick'],
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
