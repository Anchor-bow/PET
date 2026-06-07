import type { AppDefinition, ComponentNode, JsonValue, StoredApp } from '@pet/types';
import { create } from 'zustand';
import {
  type AppSummary,
  createApp as apiCreateApp,
  deleteApp as apiDeleteApp,
  fetchApp,
  fetchApps,
  updateApp as apiUpdateApp,
} from '../api/apps';
import { createEmptyApp } from '../lib/createEmptyApp';
import { findNode, insertNode, moveNode, removeNode, updateNodeProps } from '../lib/tree';

const HISTORY_LIMIT = 50;

interface AppState {
  apps: AppSummary[];
  isLoading: boolean;
  error: string | null;

  currentApp: StoredApp | null;
  currentAppDraft: AppDefinition | null;
  isCurrentAppLoading: boolean;
  currentAppError: string | null;
  isDirty: boolean;
  isSaving: boolean;

  history: AppDefinition[];
  future: AppDefinition[];

  // TODO Phase 10 (Multi-Page): bei Page-Wechsel auf null setzen.
  selectedNodeId: string | null;

  loadApps: () => Promise<void>;
  loadApp: (id: string) => Promise<void>;
  clearCurrentApp: () => void;
  createApp: (name: string) => Promise<StoredApp>;
  deleteApp: (id: string) => Promise<void>;
  updateDraft: (updater: (draft: AppDefinition) => AppDefinition) => void;
  addComponentToCurrentPage: (node: ComponentNode) => void;
  insertComponentAt: (parentId: string, index: number, node: ComponentNode) => void;
  moveComponent: (nodeId: string, targetParentId: string, targetIndex: number) => void;
  removeComponent: (nodeId: string) => void;
  setSelectedNode: (id: string | null) => void;
  updateComponentProps: (nodeId: string, patch: Record<string, JsonValue>) => void;
  saveCurrentApp: () => Promise<void>;
  undo: () => void;
  redo: () => void;
}

function selectionSurvives(draft: AppDefinition | null, id: string | null): boolean {
  if (!draft || !id) return false;
  return draft.pages.some((page) => findNode(page.root, id) !== null);
}

function toMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  return fallback;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function isEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export const useAppStore = create<AppState>((set, get) => ({
  apps: [],
  isLoading: false,
  error: null,

  currentApp: null,
  currentAppDraft: null,
  isCurrentAppLoading: false,
  currentAppError: null,
  isDirty: false,
  isSaving: false,

  history: [],
  future: [],

  selectedNodeId: null,

  loadApps: async () => {
    set({ isLoading: true, error: null });
    try {
      const apps = await fetchApps();
      set({ apps, isLoading: false });
    } catch (err) {
      set({ error: toMessage(err, 'Apps konnten nicht geladen werden.'), isLoading: false, apps: [] });
    }
  },

  loadApp: async (id) => {
    set({ isCurrentAppLoading: true, currentAppError: null });
    try {
      const app = await fetchApp(id);
      set({
        currentApp: app,
        currentAppDraft: clone(app.schema),
        history: [],
        future: [],
        isDirty: false,
        isCurrentAppLoading: false,
        selectedNodeId: null,
      });
    } catch (err) {
      set({
        currentApp: null,
        currentAppDraft: null,
        history: [],
        future: [],
        isDirty: false,
        currentAppError: toMessage(err, 'App konnte nicht geladen werden.'),
        isCurrentAppLoading: false,
        selectedNodeId: null,
      });
    }
  },

  clearCurrentApp: () => {
    set({
      currentApp: null,
      currentAppDraft: null,
      history: [],
      future: [],
      isDirty: false,
      currentAppError: null,
      isCurrentAppLoading: false,
      isSaving: false,
      selectedNodeId: null,
    });
  },

  createApp: async (name) => {
    const schema = createEmptyApp(name);
    const created = await apiCreateApp({ name: schema.name, schema });
    const summary: AppSummary = {
      id: created.id,
      name: created.name,
      version: created.version,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
    set((state) => ({ apps: [summary, ...state.apps.filter((a) => a.id !== created.id)] }));
    return created;
  },

  deleteApp: async (id) => {
    await apiDeleteApp(id);
    set((state) => {
      const apps = state.apps.filter((a) => a.id !== id);
      if (state.currentApp?.id === id) {
        return {
          apps,
          currentApp: null,
          currentAppDraft: null,
          history: [],
          future: [],
          isDirty: false,
          selectedNodeId: null,
        };
      }
      return { apps };
    });
  },

  updateDraft: (updater) => {
    const { currentAppDraft, history } = get();
    if (!currentAppDraft) return;

    const nextHistory = [...history, currentAppDraft];
    if (nextHistory.length > HISTORY_LIMIT) nextHistory.shift();

    const nextDraft = updater(clone(currentAppDraft));

    set({
      currentAppDraft: nextDraft,
      history: nextHistory,
      future: [],
      isDirty: true,
    });
  },

  addComponentToCurrentPage: (node) => {
    const { currentAppDraft, updateDraft } = get();
    if (!currentAppDraft) return;
    updateDraft((draft) => {
      const page = draft.pages.find((p) => p.id === draft.defaultPageId) ?? draft.pages[0];
      if (!page) return draft;
      const root = page.root;
      root.children = [...(root.children ?? []), node];
      return draft;
    });
  },

  insertComponentAt: (parentId, index, node) => {
    const { updateDraft } = get();
    updateDraft((draft) => {
      const page = draft.pages.find((p) => p.id === draft.defaultPageId) ?? draft.pages[0];
      if (!page) return draft;
      insertNode(page.root, parentId, index, node);
      return draft;
    });
  },

  moveComponent: (nodeId, targetParentId, targetIndex) => {
    const { updateDraft } = get();
    updateDraft((draft) => {
      const page = draft.pages.find((p) => p.id === draft.defaultPageId) ?? draft.pages[0];
      if (!page) return draft;
      moveNode(page.root, nodeId, targetParentId, targetIndex);
      return draft;
    });
  },

  removeComponent: (nodeId) => {
    const { updateDraft } = get();
    updateDraft((draft) => {
      const page = draft.pages.find((p) => p.id === draft.defaultPageId) ?? draft.pages[0];
      if (!page) return draft;
      if (page.root.id === nodeId) return draft;
      removeNode(page.root, nodeId);
      return draft;
    });
    const { currentAppDraft, selectedNodeId } = get();
    if (selectedNodeId && !selectionSurvives(currentAppDraft, selectedNodeId)) {
      set({ selectedNodeId: null });
    }
  },

  setSelectedNode: (id) => {
    if (id === null) {
      set({ selectedNodeId: null });
      return;
    }
    const { currentAppDraft } = get();
    if (!selectionSurvives(currentAppDraft, id)) return;
    set({ selectedNodeId: id });
  },

  updateComponentProps: (nodeId, patch) => {
    const { updateDraft } = get();
    updateDraft((draft) => {
      const page = draft.pages.find((p) => p.id === draft.defaultPageId) ?? draft.pages[0];
      if (!page) return draft;
      updateNodeProps(page.root, nodeId, patch);
      return draft;
    });
  },

  saveCurrentApp: async () => {
    const { currentApp, currentAppDraft } = get();
    if (!currentApp || !currentAppDraft) return;

    set({ isSaving: true, currentAppError: null });
    try {
      const saved = await apiUpdateApp(currentApp.id, {
        name: currentAppDraft.name,
        schema: currentAppDraft,
      });
      const summary: AppSummary = {
        id: saved.id,
        name: saved.name,
        version: saved.version,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
      };
      set((state) => ({
        currentApp: saved,
        currentAppDraft: clone(saved.schema),
        isDirty: false,
        isSaving: false,
        future: [],
        apps: state.apps.map((a) => (a.id === saved.id ? summary : a)),
      }));
    } catch (err) {
      set({
        isSaving: false,
        currentAppError: toMessage(err, 'App konnte nicht gespeichert werden.'),
      });
    }
  },

  undo: () => {
    const { history, future, currentAppDraft, currentApp, selectedNodeId } = get();
    if (history.length === 0 || !currentAppDraft) return;

    const previous = history[history.length - 1];
    const nextHistory = history.slice(0, -1);
    const nextFuture = [...future, currentAppDraft];

    set({
      currentAppDraft: previous,
      history: nextHistory,
      future: nextFuture,
      isDirty: !isEqual(previous, currentApp?.schema),
      selectedNodeId: selectionSurvives(previous, selectedNodeId) ? selectedNodeId : null,
    });
  },

  redo: () => {
    const { history, future, currentAppDraft, currentApp, selectedNodeId } = get();
    if (future.length === 0 || !currentAppDraft) return;

    const next = future[future.length - 1];
    const nextFuture = future.slice(0, -1);
    const nextHistory = [...history, currentAppDraft];

    set({
      currentAppDraft: next,
      history: nextHistory,
      future: nextFuture,
      isDirty: !isEqual(next, currentApp?.schema),
      selectedNodeId: selectionSurvives(next, selectedNodeId) ? selectedNodeId : null,
    });
  },
}));
