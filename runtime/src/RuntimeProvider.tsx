import { createContext, useContext, useReducer, useCallback, useMemo, type ReactNode } from 'react';
import type { AppDefinition, ComponentAction, JsonValue, PageDefinition } from '@pet/types';
import { executeActions as executeActionsEngine } from './actionExecutor';

export type RuntimeState = Record<string, JsonValue>;

export interface RuntimeContextValue {
  app: AppDefinition;
  currentPageId: string;
  currentPage: PageDefinition | null;
  navigate: (pageId: string) => void;
  state: RuntimeState;
  setRuntimeState: (updater: (prev: RuntimeState) => RuntimeState) => void;
  executeActions: (actions: ComponentAction[]) => Promise<void>;
  getPagePath: (pageId: string) => string | undefined;
  getInputValue: (nodeId: string) => string | undefined;
  setInputValue: (nodeId: string, value: string) => void;
  isLicensed: boolean;
}

const RuntimeContext = createContext<RuntimeContextValue | null>(null);

type InputState = Record<string, string>;

interface InternalState {
  pageId: string;
  runtimeState: RuntimeState;
  inputState: InputState;
}

type Action =
  | { type: 'NAVIGATE'; pageId: string }
  | { type: 'SET_RUNTIME_STATE'; updater: (prev: RuntimeState) => RuntimeState }
  | { type: 'SET_INPUT_VALUE'; nodeId: string; value: string };

function reducer(state: InternalState, action: Action): InternalState {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, pageId: action.pageId };
    case 'SET_RUNTIME_STATE':
      return { ...state, runtimeState: action.updater(state.runtimeState) };
    case 'SET_INPUT_VALUE':
      return {
        ...state,
        inputState: { ...state.inputState, [action.nodeId]: action.value },
      };
  }
}

interface RuntimeProviderProps {
  app: AppDefinition;
  pageId?: string;
  onPageChange?: (pageId: string) => void;
  children?: ReactNode;
  isLicensed?: boolean;
}

export function RuntimeProvider({ app, pageId: externalPageId, onPageChange, children, isLicensed = false }: RuntimeProviderProps) {
  const [internal, dispatch] = useReducer(reducer, {
    pageId: externalPageId ?? app.defaultPageId,
    runtimeState: {},
    inputState: {},
  });

  const resolvedPageId = externalPageId ?? internal.pageId;

  const currentPage = useMemo(
    () => app.pages.find((p) => p.id === resolvedPageId) ?? null,
    [app.pages, resolvedPageId],
  );

  const navigate = useCallback((pageId: string) => {
    if (onPageChange) {
      onPageChange(pageId);
    } else {
      dispatch({ type: 'NAVIGATE', pageId });
    }
  }, [onPageChange]);

  const setRuntimeState = useCallback(
    (updater: (prev: RuntimeState) => RuntimeState) => {
      dispatch({ type: 'SET_RUNTIME_STATE', updater });
    },
    [],
  );

  const getPagePath = useCallback(
    (pageId: string): string | undefined => {
      return app.pages.find((p) => p.id === pageId)?.path;
    },
    [app.pages],
  );

  const executeActions = useCallback(
    async (actions: ComponentAction[]) => {
      const pagePathMap: Record<string, string> = {};
      for (const p of app.pages) {
        pagePathMap[p.id] = p.path;
      }
      await executeActionsEngine(actions, {
        navigate: (path: string) => {
          const target = app.pages.find((p) => p.path === path);
          if (target) navigate(target.id);
        },
        fetch: window.fetch,
        getState: () => internal.runtimeState,
        setState: setRuntimeState,
        getPagePath: (id: string) => pagePathMap[id],
      });
    },
    [app.pages, navigate, internal.runtimeState, setRuntimeState],
  );

  const getInputValue = useCallback(
    (nodeId: string): string | undefined => internal.inputState[nodeId],
    [internal.inputState],
  );

  const setInputValue = useCallback((nodeId: string, value: string) => {
    dispatch({ type: 'SET_INPUT_VALUE', nodeId, value });
  }, []);

  const value: RuntimeContextValue = useMemo(
    () => ({
      app,
      currentPageId: resolvedPageId,
      currentPage,
      navigate,
      state: internal.runtimeState,
      setRuntimeState,
      executeActions,
      getPagePath,
      getInputValue,
      setInputValue,
      isLicensed,
    }),
    [
      app,
      resolvedPageId,
      internal.runtimeState,
      currentPage,
      navigate,
      setRuntimeState,
      executeActions,
      getPagePath,
      getInputValue,
      setInputValue,
      isLicensed,
    ],
  );

  return <RuntimeContext.Provider value={value}>{children}</RuntimeContext.Provider>;
}

export function useRuntime(): RuntimeContextValue {
  const ctx = useContext(RuntimeContext);
  if (!ctx) {
    throw new Error('useRuntime must be used within a RuntimeProvider');
  }
  return ctx;
}
