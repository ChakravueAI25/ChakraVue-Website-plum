import { useSyncExternalStore } from "react";

/**
 * Whether the Product Assistant is open and whether it is searching, shared
 * by the chat window (ChatAssistant.tsx) and the kid who hosts it on the
 * growth rail (GrowRail.tsx): the kid opens the chat and reacts while it
 * looks for an answer.
 */
type State = { open: boolean; searching: boolean };

let state: State = { open: false, searching: false };
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

export const assistant = {
  open: () => set({ open: true }),
  close: () => set({ open: false }),
  toggle: () => set({ open: !state.open }),
  searching: (searching: boolean) => set({ searching }),
  get: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useAssistant() {
  return useSyncExternalStore(assistant.subscribe, assistant.get);
}
