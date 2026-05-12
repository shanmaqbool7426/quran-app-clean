import * as FileSystem from "expo-file-system/legacy";
import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";
import { SurahDetail } from "./quranApi";

const DB_NAME = "quran_offline.db";
const AUDIO_DIR = `${FileSystem.documentDirectory}audio/`;

// SQLite connection
let db: SQLite.SQLiteDatabase | null = null;

export async function initOfflineDatabase() {
  if (Platform.OS === "web") return;
  
  try {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    
    // Create Surah Cache Table
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

    // Create Audio Cache Table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS audio_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT UNIQUE,
        local_uri TEXT,
        cached_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure audio directory exists
    const dirInfo = await FileSystem.getInfoAsync(AUDIO_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(AUDIO_DIR, { intermediates: true });
    }
    
    console.log("[OfflineService] Database & Folders Initialized");
  } catch (error) {
    console.error("[OfflineService] Init Error:", error);
  }
}

// ── Surah Caching ─────────────────────────────────────────────────────────────

export async function getCachedSurah(
  surahId: number, 
  reciterEdition: string, 
  translationEdition: string
): Promise<SurahDetail | null> {
  if (!db || Platform.OS === "web") return null;
  
  try {
    const result = await db.getFirstAsync<{ data: string }>(
      "SELECT data FROM surah_cache WHERE surah_id = ? AND reciter_edition = ? AND translation_edition = ?",
      [surahId, reciterEdition, translationEdition]
    );
    
    if (result) {
      return JSON.parse(result.data);
    }
    return null;
  } catch (error) {
    console.error("[OfflineService] Fetch Cache Error:", error);
    return null;
  }
}

export async function saveSurahToCache(
  surahId: number,
  reciterEdition: string,
  translationEdition: string,
  data: SurahDetail
) {
  if (!db || Platform.OS === "web") return;
  
  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO surah_cache (surah_id, reciter_edition, translation_edition, data) 
       VALUES (?, ?, ?, ?)`,
      [surahId, reciterEdition, translationEdition, JSON.stringify(data)]
    );
  } catch (error) {
    console.error("[OfflineService] Save Cache Error:", error);
  }
}

// ── Audio Caching ─────────────────────────────────────────────────────────────

export async function getLocalAudioUri(url: string): Promise<string | null> {
  if (!db || Platform.OS === "web") return null;
  
  try {
    const result = await db.getFirstAsync<{ local_uri: string }>(
      "SELECT local_uri FROM audio_cache WHERE url = ?",
      [url]
    );
    
    if (result) {
      // Verify file still exists
      const fileInfo = await FileSystem.getInfoAsync(result.local_uri);
      if (fileInfo.exists) return result.local_uri;
    }
    return null;
  } catch {
    return null;
  }
}

export async function downloadAudio(url: string): Promise<string | null> {
  if (!db || Platform.OS === "web") return null;

  try {
    // Check if already downloaded
    const existing = await getLocalAudioUri(url);
    if (existing) return existing;

    const filename = url.split("/").pop() || `${Date.now()}.mp3`;
    const localUri = `${AUDIO_DIR}${filename}`;
    
    const downloadRes = await FileSystem.downloadAsync(url, localUri);
    
    if (downloadRes.status === 200) {
      await db.runAsync(
        "INSERT OR REPLACE INTO audio_cache (url, local_uri) VALUES (?, ?)",
        [url, localUri]
      );
      return localUri;
    }
    return null;
  } catch (error) {
    console.error("[OfflineService] Download Error:", error);
    return null;
  }
}

// ── Utility ───────────────────────────────────────────────────────────────────

export async function clearCache() {
  if (!db || Platform.OS === "web") return;
  try {
    await db.execAsync("DELETE FROM surah_cache");
    await db.execAsync("DELETE FROM audio_cache");
    await FileSystem.deleteAsync(AUDIO_DIR, { idempotent: true });
    await FileSystem.makeDirectoryAsync(AUDIO_DIR, { intermediates: true });
  } catch (error) {
    console.error("[OfflineService] Clear Cache Error:", error);
  }
}
