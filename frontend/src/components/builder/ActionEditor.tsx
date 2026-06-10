import type { ActionTrigger, ActionType, ComponentAction, ComponentNode, Id, JsonValue } from '@pet/types';
import { useAppStore } from '../../store/useAppStore';
import { getComponentDefinition } from './registry';

const TRIGGER_LABELS: Record<ActionTrigger, string> = {
  onClick: 'Beim Klicken',
  onChange: 'Bei Änderung',
  onSubmit: 'Beim Absenden',
  onLoad: 'Beim Laden',
};

const TYPE_LABELS: Record<ActionType, string> = {
  navigate: 'Navigation',
  apiCall: 'API-Aufruf',
  stateUpdate: 'State aktualisieren',
  submit: 'Formular senden',
  custom: 'Benutzerdefiniert',
};

interface ActionEditorProps {
  node: ComponentNode;
}

export function ActionEditor({ node }: ActionEditorProps) {
  const updateComponentActions = useAppStore((s) => s.updateComponentActions);
  const definition = getComponentDefinition(node.type);
  const actions = node.actions ?? [];

  const addAction = () => {
    const trigger = definition.supportedTriggers[0];
    if (!trigger) return;
    const newAction: ComponentAction = {
      id: crypto.randomUUID(),
      trigger,
      type: 'navigate',
      payload: {},
    };
    updateComponentActions(node.id, [...actions, newAction]);
  };

  const removeAction = (actionId: Id) => {
    updateComponentActions(node.id, actions.filter((a) => a.id !== actionId));
  };

  const updateAction = (actionId: Id, patch: Partial<ComponentAction>) => {
    updateComponentActions(
      node.id,
      actions.map((a) => (a.id === actionId ? { ...a, ...patch } : a)),
    );
  };

  const updatePayload = (actionId: Id, payload: Record<string, JsonValue>) => {
    updateAction(actionId, { payload });
  };

  if (definition.supportedTriggers.length === 0) {
    return null;
  }

  return (
    <div className="action-editor">
      <header className="action-editor__header">
        <span className="action-editor__title">Aktionen</span>
        <button className="action-editor__add" onClick={addAction}>
          + Hinzufügen
        </button>
      </header>
      {actions.length === 0 && (
        <p className="action-editor--empty">Keine Aktionen konfiguriert.</p>
      )}
      {actions.map((action) => (
        <ActionRow
          key={action.id}
          action={action}
          supportedTriggers={definition.supportedTriggers}
          onUpdate={(patch) => updateAction(action.id, patch)}
          onRemove={() => removeAction(action.id)}
          onPayloadChange={(payload) => updatePayload(action.id, payload)}
        />
      ))}
    </div>
  );
}

interface ActionRowProps {
  action: ComponentAction;
  supportedTriggers: ActionTrigger[];
  onUpdate: (patch: Partial<ComponentAction>) => void;
  onRemove: () => void;
  onPayloadChange: (payload: Record<string, JsonValue>) => void;
}

function ActionRow({ action, supportedTriggers, onUpdate, onRemove, onPayloadChange }: ActionRowProps) {
  const triggerOptions = supportedTriggers;
  const typeOptions: ActionType[] = ['navigate', 'apiCall', 'stateUpdate', 'submit', 'custom'];

  return (
    <div className="action-editor__row">
      <div className="action-editor__row-header">
        <select
          className="action-editor__select"
          value={action.trigger}
          onChange={(e) => onUpdate({ trigger: e.target.value as ActionTrigger })}
        >
          {triggerOptions.map((t) => (
            <option key={t} value={t}>
              {TRIGGER_LABELS[t]}
            </option>
          ))}
        </select>
        <select
          className="action-editor__select"
          value={action.type}
          onChange={(e) => {
            onUpdate({ type: e.target.value as ActionType, payload: {} });
          }}
        >
          {typeOptions.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <button className="action-editor__remove" onClick={onRemove} title="Aktion löschen">
          ✕
        </button>
      </div>
      <PayloadEditor type={action.type} payload={action.payload} onChange={onPayloadChange} />
    </div>
  );
}

interface PayloadEditorProps {
  type: ActionType;
  payload: Record<string, JsonValue>;
  onChange: (payload: Record<string, JsonValue>) => void;
}

function PayloadEditor({ type, payload, onChange }: PayloadEditorProps) {
  const set = (key: string, value: JsonValue) => {
    onChange({ ...payload, [key]: value });
  };

  switch (type) {
    case 'navigate':
      return <NavigatePayload payload={payload} onSet={set} />;
    case 'apiCall':
      return <ApiCallPayload payload={payload} onSet={set} />;
    case 'stateUpdate':
      return <StateUpdatePayload payload={payload} onSet={set} />;
    case 'submit':
      return <SubmitPayload payload={payload} onSet={set} />;
    case 'custom':
      return <CustomPayload payload={payload} onSet={set} />;
  }
}

function NavigatePayload({ payload, onSet }: { payload: Record<string, JsonValue>; onSet: (k: string, v: JsonValue) => void }) {
  const pages = useAppStore((s) => s.currentAppDraft?.pages ?? []);

  return (
    <div className="action-editor__payload">
      <label className="action-editor__field">
        <span className="action-editor__label">Ziel-Seite</span>
        <select
          className="action-editor__select"
          value={(payload.targetPageId as string) ?? ''}
          onChange={(e) => onSet('targetPageId', e.target.value)}
        >
          <option value="">— Seite wählen —</option>
          {pages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function ApiCallPayload({ payload, onSet }: { payload: Record<string, JsonValue>; onSet: (k: string, v: JsonValue) => void }) {
  return (
    <div className="action-editor__payload">
      <label className="action-editor__field">
        <span className="action-editor__label">URL</span>
        <input
          className="action-editor__input"
          type="text"
          value={(payload.url as string) ?? ''}
          placeholder="https://api.example.com/data"
          onChange={(e) => onSet('url', e.target.value)}
        />
      </label>
      <label className="action-editor__field">
        <span className="action-editor__label">Methode</span>
        <select
          className="action-editor__select"
          value={(payload.method as string) ?? 'GET'}
          onChange={(e) => onSet('method', e.target.value)}
        >
          {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </label>
      <label className="action-editor__field">
        <span className="action-editor__label">Body (JSON)</span>
        <textarea
          className="action-editor__textarea"
          value={(payload.body as string) ?? ''}
          placeholder='{"key": "value"}'
          onChange={(e) => onSet('body', e.target.value)}
        />
      </label>
      <label className="action-editor__field">
        <span className="action-editor__label">In State speichern als</span>
        <input
          className="action-editor__input"
          type="text"
          value={(payload.saveToState as string) ?? ''}
          placeholder="z.B. users"
          onChange={(e) => onSet('saveToState', e.target.value)}
        />
      </label>
    </div>
  );
}

function StateUpdatePayload({ payload, onSet }: { payload: Record<string, JsonValue>; onSet: (k: string, v: JsonValue) => void }) {
  return (
    <div className="action-editor__payload">
      <label className="action-editor__field">
        <span className="action-editor__label">State-Key</span>
        <input
          className="action-editor__input"
          type="text"
          value={(payload.key as string) ?? ''}
          placeholder="z.B. counter"
          onChange={(e) => onSet('key', e.target.value)}
        />
      </label>
      <label className="action-editor__field">
        <span className="action-editor__label">Wert</span>
        <input
          className="action-editor__input"
          type="text"
          value={payload.value !== undefined ? String(payload.value) : ''}
          placeholder="z.B. 1"
          onChange={(e) => onSet('value', e.target.value)}
        />
      </label>
    </div>
  );
}

function SubmitPayload({ payload, onSet }: { payload: Record<string, JsonValue>; onSet: (k: string, v: JsonValue) => void }) {
  return (
    <div className="action-editor__payload">
      <label className="action-editor__field">
        <span className="action-editor__label">Formular-ID</span>
        <input
          className="action-editor__input"
          type="text"
          value={(payload.formId as string) ?? ''}
          placeholder="z.B. contact-form"
          onChange={(e) => onSet('formId', e.target.value)}
        />
      </label>
      <label className="action-editor__field">
        <span className="action-editor__label">API-URL (optional)</span>
        <input
          className="action-editor__input"
          type="text"
          value={(payload.apiUrl as string) ?? ''}
          placeholder="https://api.example.com/submit"
          onChange={(e) => onSet('apiUrl', e.target.value)}
        />
      </label>
    </div>
  );
}

function CustomPayload({ payload, onSet }: { payload: Record<string, JsonValue>; onSet: (k: string, v: JsonValue) => void }) {
  return (
    <div className="action-editor__payload">
      <label className="action-editor__field">
        <span className="action-editor__label">Code</span>
        <textarea
          className="action-editor__textarea action-editor__textarea--code"
          value={(payload.code as string) ?? ''}
          placeholder="console.log('Hello from custom action');"
          onChange={(e) => onSet('code', e.target.value)}
        />
      </label>
    </div>
  );
}
