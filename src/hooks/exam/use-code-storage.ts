"use client";

import { useCallback, useEffect, useState } from "react";
import { z } from "zod";

const StorageSchema = z.record(
  z.string(),
  z.object({
    code: z.string(),
    language: z.string(),
    lastModified: z.number(),
  }),
);

type StorageType = z.infer<typeof StorageSchema>;

export function useCodeStorage(sessionId: string) {
  const [storage, setStorage] = useState<StorageType>({});

  // key: exam-storage-{sessionId}
  const storageKey = `exam-storage-${sessionId}`;

  // Load from local storage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        const result = StorageSchema.safeParse(parsed);
        if (result.success) {
          setStorage(result.data);
        } else {
          console.error("Invalid storage schema, clearing", result.error);
          localStorage.removeItem(storageKey);
        }
      }
    } catch (e) {
      console.error("Failed to load code storage", e);
    }
  }, [storageKey]);

  const saveCode = useCallback(
    (problemId: string, code: string, language: string) => {
      setStorage((prev) => {
        const displayCode = code || ""; // Ensure string

        const next = {
          ...prev,
          [problemId]: {
            code: displayCode,
            language,
            lastModified: Date.now(),
          },
        };

        localStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });
    },
    [storageKey],
  );

  const getCode = useCallback(
    (problemId: string) => {
      return storage[problemId]?.code || "";
    },
    [storage],
  );

  const clearStorage = useCallback(() => {
    localStorage.removeItem(storageKey);
    setStorage({});
  }, [storageKey]);

  return {
    saveCode,
    getCode,
    clearStorage,
    storage,
  };
}
