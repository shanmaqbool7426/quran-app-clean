/**
 * Learn hub — single source of truth for the Learn tab layout.
 *
 * Islamic “AI chat” in production: there is no one global free “Islam GPT” API.
 * Typical pattern: your own backend (see `services/aiService.ts`) calling OpenAI /
 * Anthropic / Google with a strict system prompt (Quran, sahih hadith, madhhab
 * scope, disclaimers). Open *data* APIs (Quran text, prayer times, hadith DBs)
 * complement that but are not generative chat.
 */

import type { Href } from "expo-router";

export type LearnGradientPreset = "violet" | "brand" | "gold";

export const LEARN_HERO = {
  id: "ai-islamic-scholar",
  badge: "AI POWERED",
  title: "AI Islamic Scholar",
  subtitle:
    "Ask about Quran, Hadith, prayer, fasting, and ethics.",
  cta: "Start conversation",
  gradient: "violet" as const satisfies LearnGradientPreset,
  href: { pathname: "/ai-chat" } as const satisfies Href,
} as const;

export type LearnFeatureId = "recitation" | "memorize";

export const LEARN_FEATURE_CARDS: ReadonlyArray<{
  id: LearnFeatureId;
  icon: "mic" | "heart";
  title: string;
  subtitle: string;
  gradient: "brand" | "gold";
  href: Href;
  a11yLabel: string;
}> = [
    {
      id: "recitation",
      icon: "mic",
      title: "AI Recitation",
      subtitle: "Tajweed feedback",
      gradient: "brand",
      href: "/recitation",
      a11yLabel: "AI Recitation practice",
    },
    {
      id: "memorize",
      icon: "heart",
      title: "Hifz Planner",
      subtitle: "Memorize Quran",
      gradient: "gold",
      href: "/memorize",
      a11yLabel: "Hifz planner and memorization",
    },
  ];

/** Short chips on Learn → open AI chat with this question (URL param). */
export const LEARN_AI_QUICK_PROMPTS: readonly string[] = [
  "What are the five pillars of Islam?",
  "How do I perform Wudu step by step?",
  "What is Laylat al-Qadr?",
  "Explain Tawheed in simple terms",
];

export const LEARN_QAIDA_SECTION = {
  title: "Qaida — full course",
  linkLabel: "Alphabet & list",
  href: "/qaida" as const satisfies Href,
  progressHint:
    "Complete each lesson in order. Tap “Mark lesson complete” at the end of a lesson to unlock the next.",
} as const;

export const GRADIENT_PRESETS: Record<Exclude<LearnGradientPreset, "brand">, readonly [string, string]> = {
  violet: ["#8B5CF6", "#6D28D9"],
  gold: ["#C8972A", "#D4A840"],
};

/** Resolve preset to real colors (brand uses theme tokens). */
export function resolveLearnGradient(
  preset: LearnGradientPreset,
  primary: string,
  primaryLight: string
): readonly [string, string] {
  if (preset === "brand") return [primary, primaryLight];
  return GRADIENT_PRESETS[preset];
}

/** Suggested questions inside the AI chat screen (includes Learn quick prompts). */
export const AI_CHAT_SUGGESTED_QUESTIONS: readonly string[] = [
  ...LEARN_AI_QUICK_PROMPTS,
  "What does the Quran say about patience?",
  "What is the significance of Surah Al-Fatiha?",
  "Tell me about Zakat basics",
];
