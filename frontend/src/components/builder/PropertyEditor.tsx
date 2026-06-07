import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import type { ComponentNode, JsonValue } from '@pet/types';
import { findNode } from '../../lib/tree';
import { useAppStore } from '../../store/useAppStore';
import { getComponentDefinition } from './registry';
import {
  propertyFieldsByType,
  type FieldDef,
  type TypeFieldsConfig,
} from './propertyFields';

export function PropertyEditor() {
  const selectedNodeId = useAppStore((s) => s.selectedNodeId);
  const draft = useAppStore((s) => s.currentAppDraft);

  const selected: ComponentNode | null = useMemo(() => {
    if (!selectedNodeId || !draft) return null;
    for (const page of draft.pages) {
      const node = findNode(page.root, selectedNodeId);
      if (node) return node;
    }
    return null;
  }, [selectedNodeId, draft]);

  if (!selected) {
    return (
      <aside className="property-editor property-editor--empty">
        Komponente auswählen, um Eigenschaften zu bearbeiten.
      </aside>
    );
  }

  const definition = getComponentDefinition(selected.type);
  const config = propertyFieldsByType[selected.type];

  return (
    <aside className="property-editor">
      <header className="property-editor__header">
        <span className="property-editor__title">{definition.label}</span>
        <span className="property-editor__subtitle">{selected.id}</span>
      </header>
      {config === null ? (
        <p className="property-editor--empty">Keine Eigenschaften verfügbar.</p>
      ) : (
        config.fields.map((field) => (
          <FieldRow
            key={field.key}
            nodeId={selected.id}
            field={field}
            value={selected.props[field.key]}
            config={config}
          />
        ))
      )}
    </aside>
  );
}

interface FieldRowProps {
  nodeId: string;
  field: FieldDef;
  value: JsonValue | undefined;
  config: TypeFieldsConfig;
}

function formatForInput(value: JsonValue | undefined): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

function FieldRow({ nodeId, field, value, config }: FieldRowProps) {
  const updateComponentProps = useAppStore((s) => s.updateComponentProps);

  const [local, setLocal] = useState<string>(() => formatForInput(value));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocal(formatForInput(value));
    setError(null);
  }, [nodeId, value]);

  const commit = (raw: string | boolean) => {
    const fieldSchema = config.schema.shape[field.key];
    if (!fieldSchema) return;

    let parsed: unknown = raw;
    if (typeof raw === 'string') {
      if (field.kind === 'number') {
        const trimmed = raw.trim();
        if (trimmed === '' || Number.isNaN(Number(trimmed))) {
          setError('Muss eine Zahl sein.');
          return;
        }
        parsed = Number(trimmed);
      } else if (field.kind === 'widthValue') {
        const trimmed = raw.trim();
        parsed = /^-?\d+(\.\d+)?$/.test(trimmed) ? Number(trimmed) : trimmed;
      }
    }

    const result = fieldSchema.safeParse(parsed);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Ungültiger Wert');
      return;
    }
    setError(null);
    updateComponentProps(nodeId, { [field.key]: result.data as JsonValue });
  };

  if (field.kind === 'checkbox') {
    return (
      <label className="property-editor__field property-editor__field-row">
        <input
          type="checkbox"
          className="property-editor__checkbox"
          checked={Boolean(value)}
          onChange={(e) => commit(e.target.checked)}
        />
        <span className="property-editor__label">{field.label}</span>
      </label>
    );
  }

  if (field.kind === 'select') {
    return (
      <div className="property-editor__field">
        <span className="property-editor__label">{field.label}</span>
        <select
          className={`property-editor__select${error ? ' is-invalid' : ''}`}
          value={formatForInput(value)}
          onChange={(e) => commit(e.target.value)}
        >
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {error && <span className="property-editor__error">{error}</span>}
      </div>
    );
  }

  const handleBlur = () => commit(local);
  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (e.key === 'Enter' && field.kind !== 'textarea') {
      e.preventDefault();
      commit(local);
    }
  };
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setLocal(e.target.value);
  };

  const invalidClass = error ? ' is-invalid' : '';

  if (field.kind === 'textarea') {
    return (
      <div className="property-editor__field">
        <span className="property-editor__label">{field.label}</span>
        <textarea
          className={`property-editor__textarea${invalidClass}`}
          value={local}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        {field.hint && <span className="property-editor__hint">{field.hint}</span>}
        {error && <span className="property-editor__error">{error}</span>}
      </div>
    );
  }

  const inputType = field.kind === 'number' ? 'number' : 'text';

  return (
    <div className="property-editor__field">
      <span className="property-editor__label">{field.label}</span>
      <input
        type={inputType}
        className={`property-editor__input${invalidClass}`}
        value={local}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      {field.hint && <span className="property-editor__hint">{field.hint}</span>}
      {error && <span className="property-editor__error">{error}</span>}
    </div>
  );
}
