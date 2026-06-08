import type { ComponentAction, JsonValue } from '@pet/types';

export type RuntimeState = Record<string, JsonValue>;

export interface ActionContext {
  navigate: (path: string) => void;
  fetch: typeof window.fetch;
  getState: () => RuntimeState;
  setState: (updater: (prev: RuntimeState) => RuntimeState) => void;
  getPagePath: (pageId: string) => string | undefined;
}

export async function executeAction(
  action: ComponentAction,
  context: ActionContext,
): Promise<void> {
  switch (action.type) {
    case 'navigate':
      return executeNavigate(action.payload, context);
    case 'apiCall':
      return executeApiCall(action.payload, context);
    case 'stateUpdate':
      return executeStateUpdate(action.payload, context);
    case 'submit':
      return executeSubmit(action.payload, context);
    case 'custom':
      return executeCustom(action.payload, context);
  }
}

export async function executeActions(
  actions: ComponentAction[],
  context: ActionContext,
): Promise<void> {
  for (const action of actions) {
    await executeAction(action, context);
  }
}

async function executeNavigate(
  payload: Record<string, JsonValue>,
  context: ActionContext,
): Promise<void> {
  const targetPageId = payload.targetPageId as string | undefined;
  if (!targetPageId) return;
  const path = context.getPagePath(targetPageId);
  if (path) context.navigate(path);
}

async function executeApiCall(
  payload: Record<string, JsonValue>,
  context: ActionContext,
): Promise<void> {
  const url = payload.url as string | undefined;
  if (!url) return;
  const method = (payload.method as string) ?? 'GET';
  const body = payload.body as string | undefined;
  const headers: Record<string, string> = {};
  if (payload.headers && typeof payload.headers === 'object') {
    for (const [key, value] of Object.entries(payload.headers)) {
      headers[key] = String(value);
    }
  }
  const init: RequestInit = { method, headers };
  if (body && method !== 'GET' && method !== 'HEAD') {
    init.body = body;
  }
  const response = await context.fetch(url, init);
  if (!response.ok) {
    throw new Error(`apiCall failed: ${response.status} ${response.statusText}`);
  }
  const data = (await response.json()) as JsonValue;
  if (payload.saveToState && typeof payload.saveToState === 'string') {
    context.setState((prev) => ({ ...prev, [payload.saveToState as string]: data }));
  }
}

async function executeStateUpdate(
  payload: Record<string, JsonValue>,
  context: ActionContext,
): Promise<void> {
  const key = payload.key as string | undefined;
  const value = payload.value;
  if (!key) return;
  context.setState((prev) => ({ ...prev, [key]: value }));
}

async function executeSubmit(
  payload: Record<string, JsonValue>,
  context: ActionContext,
): Promise<void> {
  const formId = payload.formId as string | undefined;
  if (!formId) return;
  const currentState = context.getState();
  const stateKey = `__form_${formId}`;
  context.setState((prev) => ({ ...prev, [`${stateKey}_submitted`]: true }));
  if (payload.apiUrl && typeof payload.apiUrl === 'string') {
    const body = JSON.stringify(currentState[stateKey] ?? {});
    await context.fetch(payload.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
  }
}

async function executeCustom(
  payload: Record<string, JsonValue>,
  _context: ActionContext,
): Promise<void> {
  const code = payload.code as string | undefined;
  if (!code) return;
  try {
    const fn = new Function('payload', code);
    await fn(payload);
  } catch (err) {
    throw new Error(`custom action failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}
