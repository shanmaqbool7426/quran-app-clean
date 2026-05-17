import * as FileSystem from "expo-file-system/legacy";
import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";
import { SurahDetail } from "./quranApi";

const DB_NAME = "quran_offline.db";
const AUDIO_DIR = `${FileSystem.documentDirectory}audio/`;

// SQLite connection — guarded by a single init promise
let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<void> | null = null;

export function initOfflineDatabase(): Promise<void> {
  if (Platform.OS === "web") return Promise.resolve();
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      db = await SQLite.openDatabaseAsync(DB_NAME);

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS surah_cache (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          surah_id INTEGER,
          reciter_edition TEXT,
          translation_edition TEXT,
          data TEXT,
          cached_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(surah_id, reciter_edition, translation_edition)
        );
      `);

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS audio_cache (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          url TEXT UNIQUE,
          local_uri TEXT,
          cached_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const dirInfo = await FileSystem.getInfoAsync(AUDIO_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(AUDIO_DIR, { intermediates: true });
      }

      console.log("[OfflineService] Database initialized");
    } catch (error) {
      // Reset so next call can retry
      initPromise = null;
      db = null;
      console.warn("[OfflineService] Init failed (non-fatal):", error);
    }
  })();

  return initPromise;
}

/** Wait for DB to be ready before using it */
async function getDb(): Promise<SQLite.SQLiteDatabase | null> {
  if (Platform.OS === "web") return null;
  await initOfflineDatabase();
  return db;
}

// ── Surah Caching ─────────────────────────────────────────────────────────────

export async function getCachedSurah(
  surahId: number,
  reciterEdition: string,
  translationEdition: string
): Promise<SurahDetail | null> {
  const database = await getDb();
  if (!database) return null;

  try {
    const result = await database.getFirstAsync<{ data: string }>(
      "SELECT data FROM surah_cache WHERE surah_id = ? AND reciter_edition = ? AND translation_edition = ?",
      [surahId, reciterEdition, translationEdition]
    );
    return result ? JSON.parse(result.data) : null;
  } catch (error) {
    console.warn("[OfflineService] Fetch Cache Error:", error);
    return null;
  }
}

export async function saveSurahToCache(
  surahId: number,
  reciterEdition: string,
  translationEdition: string,
  data: SurahDetail
) {
  const database = await getDb();
  if (!database) return;

  try {
    await database.runAsync(
      `INSERT OR REPLACE INTO surah_cache (surah_id, reciter_edition, translation_edition, data)
       VALUES (?, ?, ?, ?)`,
      [surahId, reciterEdition, translationEdition, JSON.stringify(data)]
    );
  } catch (error) {
    console.warn("[OfflineService] Save Cache Error:", error);
  }
}

// ── Audio Caching ─────────────────────────────────────────────────────────────

export async function getLocalAudioUri(url: string): Promise<string | null> {
  const database = await getDb();
  if (!database) return null;

  try {
    const result = await database.getFirstAsync<{ local_uri: string }>(
      "SELECT local_uri FROM audio_cache WHERE url = ?",
      [url]
    );
    if (result) {
      const fileInfo = await FileSystem.getInfoAsync(result.local_uri);
      if (fileInfo.exists) return result.local_uri;
    }
    return null;
  } catch {
    return null;
  }
}

export async function downloadAudio(url: string): Promise<string | null> {
  const database = await getDb();
  if (!database) return null;

  try {
    const existing = await getLocalAudioUri(url);
    if (existing) return existing;

    const filename = url.split("/").pop() || `${Date.now()}.mp3`;
    const localUri = `${AUDIO_DIR}${filename}`;
    const downloadRes = await FileSystem.downloadAsync(url, localUri);

    if (downloadRes.status === 200) {
      await database.runAsync(
        "INSERT OR REPLACE INTO audio_cache (url, local_uri) VALUES (?, ?)",
        [url, localUri]
      );
      return localUri;
    }
    return null;
  } catch (error) {
    console.warn("[OfflineService] Download Error:", error);
    return null;
  }
}

// ── Utility ───────────────────────────────────────────────────────────────────

export async function clearCache() {
  const database = await getDb();
  if (!database) return;
  try {
    await database.execAsync("DELETE FROM surah_cache");
    await database.execAsync("DELETE FROM audio_cache");
    await FileSystem.deleteAsync(AUDIO_DIR, { idempotent: true });
    await FileSystem.makeDirectoryAsync(AUDIO_DIR, { intermediates: true });
  } catch (error) {
    console.warn("[OfflineService] Clear Cache Error:", error);
  }
}
