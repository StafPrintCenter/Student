import { useSyncExternalStore } from "react";
import type { CommunityContentTarget } from "@/data/community";

const reported = new Set<string>();
const listeners = new Set<() => void>();

const keyOf = (t: CommunityContentTarget) => `${t.kind}:${t.id}`;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export function markContentReported(target: CommunityContentTarget) {
  reported.add(keyOf(target));
  listeners.forEach((listener) => listener());
}

export function useIsContentReported(target: CommunityContentTarget): boolean {
  const key = keyOf(target);
  return useSyncExternalStore(
    subscribe,
    () => reported.has(key),
    () => false
  );
}