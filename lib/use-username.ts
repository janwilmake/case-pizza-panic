"use client";

import { useCallback, useSyncExternalStore } from "react";

// We have no auth (see README). Instead each device remembers a "username" in
// localStorage that identifies whoever is operating it. It is required before
// creating an order or changing a status, and is recorded in the _by columns.

const KEY = "pizza-panic:username";
const EVENT = "pizza-panic:username-change";

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback); // sync across tabs
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): string {
  return localStorage.getItem(KEY) ?? "";
}

function getServerSnapshot(): string {
  return "";
}

export function useUsername() {
  const username = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setUsername = useCallback((name: string) => {
    const trimmed = name.trim();
    if (trimmed) localStorage.setItem(KEY, trimmed);
    else localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { username, setUsername };
}
