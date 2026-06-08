import type { CSSProperties, ReactNode } from 'react';
import {
  buttonPropsSchema,
  containerPropsSchema,
  imagePropsSchema,
  inputPropsSchema,
  textPropsSchema,
  type ComponentNode,
  type ComponentStyles,
} from '@pet/types';

function toStyle(styles: ComponentStyles | undefined): CSSProperties | undefined {
  if (!styles) return undefined;
  return styles as CSSProperties;
}

export interface PrimitiveProps {
  node: ComponentNode;
  children?: ReactNode;
  onAction?: Record<string, () => void>;
}

export function ContainerPrimitive({ node, children }: PrimitiveProps) {
  const props = containerPropsSchema.parse(node.props);
  const style: CSSProperties = {
    display: 'flex',
    flexDirection: props.direction,
    gap: props.gap,
    padding: props.padding,
    ...toStyle(node.styles),
  };
  return (
    <div className="builder-container" style={style}>
      {children}
    </div>
  );
}

export function TextPrimitive({ node }: PrimitiveProps) {
  const props = textPropsSchema.parse(node.props);
  const style = toStyle(node.styles);
  switch (props.variant) {
    case 'heading1':
      return <h1 style={style}>{props.content}</h1>;
    case 'heading2':
      return <h2 style={style}>{props.content}</h2>;
    case 'caption':
      return (
        <small className="builder-caption" style={style}>
          {props.content}
        </small>
      );
    case 'body':
    default:
      return <p style={style}>{props.content}</p>;
  }
}

export function ButtonPrimitive({ node, onAction }: PrimitiveProps) {
  const props = buttonPropsSchema.parse(node.props);
  return (
    <button
      type="button"
      className={`builder-button builder-button-${props.variant}`}
      disabled={props.disabled}
      style={toStyle(node.styles)}
      onClick={onAction?.onClick}
    >
      {props.label}
    </button>
  );
}

export function InputPrimitive({ node, onAction }: PrimitiveProps) {
  const props = inputPropsSchema.parse(node.props);
  return (
    <label className="builder-input" style={toStyle(node.styles)}>
      {props.label && <span className="builder-input-label">{props.label}</span>}
      <input
        type={props.inputType}
        placeholder={props.placeholder}
        defaultValue={props.value}
        required={props.required}
        readOnly
        onChange={onAction?.onChange}
      />
    </label>
  );
}

export function ImagePrimitive({ node }: PrimitiveProps) {
  const props = imagePropsSchema.parse(node.props);
  const style: CSSProperties = {
    width: props.width,
    ...toStyle(node.styles),
  };
  if (!props.src) {
    return (
      <div className="builder-image-placeholder" style={style}>
        Bild
      </div>
    );
  }
  return <img src={props.src} alt={props.alt} style={style} />;
}

export function CustomPrimitive({ node }: PrimitiveProps) {
  return (
    <div className="builder-custom" style={toStyle(node.styles)}>
      <code>custom: {node.name ?? node.id}</code>
    </div>
  );
}
