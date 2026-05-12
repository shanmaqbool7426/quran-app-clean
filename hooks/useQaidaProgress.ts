import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useSyncExternalStore } from "react";

import { QAIDA_LESSON_ORDER, getQaidaLessonTitle } from "@/constants/qaida";

const STORAGE_KEY = "qaidaCompletedLessonIds";

type Listener = () => void;
const listeners = new Set<Listener>();

let completedCache: string[] = [];

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((l) => l());
}

function setCompleted(next: string[]) {
  const sorted = [...new Set(next.filter((id) => QAIDA_LESSON_ORDER.includes(id)))].sort(
    (a, b) => QAIDA_LESSON_ORDER.indexOf(a) - QAIDA_LESSON_ORDER.indexOf(b)
  );
  completedCache = sorted;
  emit();
}

function getSnapshot() {
  return completedCache.join("\u0001");
}

function getServerSnapshot() {
  return "";
}

let loadPromise: Promise<void> | null = null;

function loadFromStorage() {
  if (!loadPromise) {
    loadPromise = (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as unknown;
          if (Array.isArray(parsed)) {
            setCompleted(parsed.filter((x): x is string => typeof x === "string"));
            return;
          }
        }
        setCompleted([]);
      } catch {
        setCompleted([]);
      }
    })();
  }
  return loadPromise;
}

export function useQaidaProgress() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const completedIds = snap === "" ? [] : snap.split("\u0001").filter(Boolean);

  useEffect(() => {
    void loadFromStorage();
  }, []);

  const isLessonComplete = useCallback(
    (id: string) => completedIds.includes(id),
    [completedIds]
  );

  const isLessonUnlocked = useCallback(
    (id: string) => {
      const idx = QAIDA_LESSON_ORDER.indexOf(id);
      if (idx <= 0) return true;
      for (let i = 0; i < idx; i++) {
        if (!completedIds.includes(QAIDA_LESSON_ORDER[i]!)) return false;
      }
      return true;
    },
    [completedIds]
  );

  const unlockHint = useCallback(
    (id: string): string | null => {
      const idx = QAIDA_LESSON_ORDER.indexOf(id);
      if (idx <= 0) return null;
      for (let i = 0; i < idx; i++) {
        const pid = QAIDA_LESSON_ORDER[i]!;
        if (!completedIds.includes(pid)) {
          return `Finish “${getQaidaLessonTitle(pid)}” to unlock`;
        }
      }
      return null;
    },
    [completedIds]
  );

  const markLessonComplete = useCallback(async (id: string) => {
    if (!QAIDA_LESSON_ORDER.includes(id)) return;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const existing = raw ? (JSON.parse(raw) as unknown) : [];
      const base = Array.isArray(existing)
        ? existing.filter((x): x is string => typeof x === "string" && QAIDA_LESSON_ORDER.includes(x))
        : [];
      if (base.includes(id)) return;
      const next = [...base, id].sort((a, b) => QAIDA_LESSON_ORDER.indexOf(a) - QAIDA_LESSON_ORDER.indexOf(b));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setCompleted(next);
    } catch {
      const merged = [...completedCache];
      if (!merged.includes(id)) {
        merged.push(id);
        merged.sort((a, b) => QAIDA_LESSON_ORDER.indexOf(a) - QAIDA_LESSON_ORDER.indexOf(b));
        setCompleted(merged);
      }
    }
  }, []);

  const completedCount = QAIDA_LESSON_ORDER.filter((id) => completedIds.includes(id)).length;
  const totalLessons = QAIDA_LESSON_ORDER.length;

  return {
    completedIds,
    completedCount,
    totalLessons,
    isLessonComplete,
    isLessonUnlocked,
    markLessonComplete,
    unlockHint,
  };
}
