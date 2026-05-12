export interface ArabicLetter {
  id: string;
  letter: string;
  name: string;
  transliteration: string;
  isolated: string;
  initial: string;
  medial: string;
  final: string;
  example: string;
  exampleMeaning: string;
}

export const ARABIC_ALPHABET: ArabicLetter[] = [
  { id: "1", letter: "ا", name: "Alif", transliteration: "a/aa", isolated: "ا", initial: "ا", medial: "ـا", final: "ـا", example: "أَب", exampleMeaning: "Father" },
  { id: "2", letter: "ب", name: "Ba", transliteration: "b", isolated: "ب", initial: "بـ", medial: "ـبـ", final: "ـب", example: "بَيْت", exampleMeaning: "House" },
  { id: "3", letter: "ت", name: "Ta", transliteration: "t", isolated: "ت", initial: "تـ", medial: "ـتـ", final: "ـت", example: "تَمْر", exampleMeaning: "Date (fruit)" },
  { id: "4", letter: "ث", name: "Tha", transliteration: "th", isolated: "ث", initial: "ثـ", medial: "ـثـ", final: "ـث", example: "ثَوْب", exampleMeaning: "Garment" },
  { id: "5", letter: "ج", name: "Jim", transliteration: "j", isolated: "ج", initial: "جـ", medial: "ـجـ", final: "ـج", example: "جَبَل", exampleMeaning: "Mountain" },
  { id: "6", letter: "ح", name: "Ha", transliteration: "h (heavy)", isolated: "ح", initial: "حـ", medial: "ـحـ", final: "ـح", example: "حَلِيب", exampleMeaning: "Milk" },
  { id: "7", letter: "خ", name: "Kha", transliteration: "kh", isolated: "خ", initial: "خـ", medial: "ـخـ", final: "ـخ", example: "خُبْز", exampleMeaning: "Bread" },
  { id: "8", letter: "د", name: "Dal", transliteration: "d", isolated: "د", initial: "د", medial: "ـد", final: "ـد", example: "دَرْس", exampleMeaning: "Lesson" },
  { id: "9", letter: "ذ", name: "Dhal", transliteration: "dh", isolated: "ذ", initial: "ذ", medial: "ـذ", final: "ـذ", example: "ذَهَب", exampleMeaning: "Gold" },
  { id: "10", letter: "ر", name: "Ra", transliteration: "r", isolated: "ر", initial: "ر", medial: "ـر", final: "ـر", example: "رَأْس", exampleMeaning: "Head" },
  { id: "11", letter: "ز", name: "Zay", transliteration: "z", isolated: "ز", initial: "ز", medial: "ـز", final: "ـز", example: "زَيْت", exampleMeaning: "Oil" },
  { id: "12", letter: "س", name: "Sin", transliteration: "s", isolated: "س", initial: "سـ", medial: "ـسـ", final: "ـس", example: "سَمَاء", exampleMeaning: "Sky" },
  { id: "13", letter: "ش", name: "Shin", transliteration: "sh", isolated: "ش", initial: "شـ", medial: "ـشـ", final: "ـش", example: "شَمْس", exampleMeaning: "Sun" },
  { id: "14", letter: "ص", name: "Sad", transliteration: "s (heavy)", isolated: "ص", initial: "صـ", medial: "ـصـ", final: "ـص", example: "صَبْر", exampleMeaning: "Patience" },
  { id: "15", letter: "ض", name: "Dad", transliteration: "d (heavy)", isolated: "ض", initial: "ضـ", medial: "ـضـ", final: "ـض", example: "ضَوْء", exampleMeaning: "Light" },
  { id: "16", letter: "ط", name: "Ta", transliteration: "t (heavy)", isolated: "ط", initial: "طـ", medial: "ـطـ", final: "ـط", example: "طَائِر", exampleMeaning: "Bird" },
  { id: "17", letter: "ظ", name: "Dha", transliteration: "dh (heavy)", isolated: "ظ", initial: "ظـ", medial: "ـظـ", final: "ـظ", example: "ظِل", exampleMeaning: "Shadow" },
  { id: "18", letter: "ع", name: "Ayn", transliteration: "'a", isolated: "ع", initial: "عـ", medial: "ـعـ", final: "ـع", example: "عَيْن", exampleMeaning: "Eye" },
  { id: "19", letter: "غ", name: "Ghayn", transliteration: "gh", isolated: "غ", initial: "غـ", medial: "ـغـ", final: "ـغ", example: "غَيْم", exampleMeaning: "Cloud" },
  { id: "20", letter: "ف", name: "Fa", transliteration: "f", isolated: "ف", initial: "فـ", medial: "ـفـ", final: "ـف", example: "فَجْر", exampleMeaning: "Dawn" },
  { id: "21", letter: "ق", name: "Qaf", transliteration: "q", isolated: "ق", initial: "قـ", medial: "ـقـ", final: "ـق", example: "قَلْب", exampleMeaning: "Heart" },
  { id: "22", letter: "ك", name: "Kaf", transliteration: "k", isolated: "ك", initial: "كـ", medial: "ـكـ", final: "ـك", example: "كِتَاب", exampleMeaning: "Book" },
  { id: "23", letter: "ل", name: "Lam", transliteration: "l", isolated: "ل", initial: "لـ", medial: "ـلـ", final: "ـل", example: "لَيْل", exampleMeaning: "Night" },
  { id: "24", letter: "م", name: "Mim", transliteration: "m", isolated: "م", initial: "مـ", medial: "ـمـ", final: "ـم", example: "مَاء", exampleMeaning: "Water" },
  { id: "25", letter: "ن", name: "Nun", transliteration: "n", isolated: "ن", initial: "نـ", medial: "ـنـ", final: "ـن", example: "نُور", exampleMeaning: "Light" },
  { id: "26", letter: "ه", name: "Ha", transliteration: "h (light)", isolated: "ه", initial: "هـ", medial: "ـهـ", final: "ـه", example: "هَوَاء", exampleMeaning: "Air" },
  { id: "27", letter: "و", name: "Waw", transliteration: "w/uu", isolated: "و", initial: "و", medial: "ـو", final: "ـو", example: "وَرْد", exampleMeaning: "Rose" },
  { id: "28", letter: "ي", name: "Ya", transliteration: "y/ii", isolated: "ي", initial: "يـ", medial: "ـيـ", final: "ـي", example: "يَد", exampleMeaning: "Hand" },
];

export const TAJWEED_RULES = [
  { id: "1", name: "Ikhfa", arabic: "إخفاء", description: "Concealment of Noon Sakin/Tanwin", color: "#C8972A" },
  { id: "2", name: "Idgham", arabic: "إدغام", description: "Merging of Noon Sakin/Tanwin", color: "#0D5C3A" },
  { id: "3", name: "Iqlab", arabic: "إقلاب", description: "Conversion of Noon Sakin to Mim", color: "#8B5CF6" },
  { id: "4", name: "Izhar", arabic: "إظهار", description: "Clear pronunciation of Noon Sakin", color: "#2563EB" },
  { id: "5", name: "Madd", arabic: "مد", description: "Prolongation of letters", color: "#DC2626" },
  { id: "6", name: "Qalqalah", arabic: "قلقلة", description: "Echo/Rebound sound", color: "#D97706" },
];

export interface LessonItem {
  id: string;
  arabic: string;
  transliteration: string;
  meaning?: string;
  audio?: string;
}

export interface LessonContent {
  id: string;
  title: string;
  description: string;
  items: LessonItem[];
}

export const LESSON_DATA: Record<string, LessonContent> = {
  "1": {
    id: "1",
    title: "Arabic Alphabet",
    description: "The foundation of the Arabic language consisting of 28 letters.",
    items: ARABIC_ALPHABET.map(l => ({
      id: l.id,
      arabic: l.letter,
      transliteration: l.name,
      meaning: l.exampleMeaning
    }))
  },
  "2": {
    id: "2",
    title: "Harakat (Vowels)",
    description: "Short vowels that change the sound of a letter.",
    items: [
      { id: "2-1", arabic: "بَ", transliteration: "Ba (Fatha)", meaning: "Sound 'a'" },
      { id: "2-2", arabic: "بِ", transliteration: "Bi (Kasra)", meaning: "Sound 'i'" },
      { id: "2-3", arabic: "بُ", transliteration: "Bu (Damma)", meaning: "Sound 'u'" },
      { id: "2-4", arabic: "تَ", transliteration: "Ta (Fatha)", meaning: "Sound 'a'" },
      { id: "2-5", arabic: "تِ", transliteration: "Ti (Kasra)", meaning: "Sound 'i'" },
      { id: "2-6", arabic: "تُ", transliteration: "Tu (Damma)", meaning: "Sound 'u'" },
    ]
  },
  "3": {
    id: "3",
    title: "Tanwin",
    description: "Double vowels that add an 'n' sound to the end of a word.",
    items: [
      { id: "3-1", arabic: "بًا", transliteration: "Ban", meaning: "Fathatayn" },
      { id: "3-2", arabic: "بٍ", transliteration: "Bin", meaning: "Kasratayn" },
      { id: "3-3", arabic: "بٌ", transliteration: "Bun", meaning: "Dammatayn" },
    ]
  },
  "4": {
    id: "4",
    title: "Madd (Stretching)",
    description: "Long vowels that stretch the sound of a letter.",
    items: [
      { id: "4-1", arabic: "بَا", transliteration: "Baa", meaning: "Alif Madd" },
      { id: "4-2", arabic: "بِي", transliteration: "Bee", meaning: "Ya Madd" },
      { id: "4-3", arabic: "بُو", transliteration: "Buu", meaning: "Waw Madd" },
    ]
  },
  "5": {
    id: "5",
    title: "Sukun & Shaddah",
    description: "Sukun indicates no vowel, Shaddah indicates a double letter.",
    items: [
      { id: "5-1", arabic: "أَبْ", transliteration: "Ab", meaning: "Ba with Sukun" },
      { id: "5-2", arabic: "أَبَّ", transliteration: "Abba", meaning: "Ba with Shaddah" },
      { id: "5-3", arabic: "أَبِّ", transliteration: "Abbi", meaning: "Ba with Shaddah & Kasra" },
      { id: "5-4", arabic: "أَبُّ", transliteration: "Abbu", meaning: "Ba with Shaddah & Damma" },
    ],
  },
  "6": {
    id: "6",
    title: "Noon Sakin & Tanwin",
    description: "Four rules when نْ or tanwin meets the next letter: Ikhfa, Izhar, Idgham, and Iqlab.",
    items: [
      { id: "6-1", arabic: "مِنْ كِتَابٍ", transliteration: "Ikhfa", meaning: "Hide noon before ك" },
      { id: "6-2", arabic: "مِنْ رَبِّكَ", transliteration: "Izhar", meaning: "Clear noon before ر" },
      { id: "6-3", arabic: "مِنْ مَّالٍ", transliteration: "Idgham", meaning: "Merge into م (with ghunnah)" },
      { id: "6-4", arabic: "مِنْ بَعْدِ", transliteration: "Iqlab", meaning: "Turn noon into م sound before ب" },
      { id: "6-5", arabic: "عَلِيمٌ حَكِيمٌ", transliteration: "Ikhfa", meaning: "Tanwin + ح (practice)" },
      { id: "6-6", arabic: "سَمِيعٌ بَصِيرٌ", transliteration: "Iqlab", meaning: "Tanwin + ب (practice)" },
    ],
  },
  "7": {
    id: "7",
    title: "Mim Sakin Rules",
    description: "Rules when مْ meets the next letter: Ikhfa Shafawi, Idgham Shafawi, Izhar Shafawi, and Iqlab.",
    items: [
      { id: "7-1", arabic: "لَهُمْ بِهَا", transliteration: "Ikhfa Shafawi", meaning: "Hide م before ب" },
      { id: "7-2", arabic: "فَأَتْبَعَهُمْ مَنْ", transliteration: "Idgham Shafawi", meaning: "Merge مْ into م" },
      { id: "7-3", arabic: "عَلِيمٌ بِذَٰلِكَ", transliteration: "Ikhfa Shafawi", meaning: "مْ before ذ (practice)" },
      { id: "7-4", arabic: "أَنتَ وَلِيُّنَا", transliteration: "Idgham Shafawi", meaning: "مْ before م (practice)" },
      { id: "7-5", arabic: "لَهُمْ عَذَابٌ", transliteration: "Izhar Shafawi", meaning: "Clear م before ع" },
      { id: "7-6", arabic: "لَهُمْ وَزِيرٌ", transliteration: "Izhar Shafawi", meaning: "Clear م before و" },
    ],
  },
  "8": {
    id: "8",
    title: "Madd (Tajweed)",
    description: "Natural lengthening (Madd Asli) and other common madd types you meet in the Mushaf.",
    items: [
      { id: "8-1", arabic: "قَالَ", transliteration: "Madd by Alif", meaning: "Natural madd after فتح" },
      { id: "8-2", arabic: "سُوءٌ", transliteration: "Madd by Waw", meaning: "Lengthen و with ضمة" },
      { id: "8-3", arabic: "قِيلَ", transliteration: "Madd by Ya", meaning: "Lengthen ي with كسرة" },
      { id: "8-4", arabic: "آمَنُوا", transliteration: "Madd Lazim", meaning: "Must lengthen after همزة on Alif" },
      { id: "8-5", arabic: "السَّمَاءُ", transliteration: "Madd Munfasil", meaning: "Hamzah after madd letter" },
      { id: "8-6", arabic: "جَاءَ", transliteration: "Madd Arid", meaning: "Stopping on madd letter" },
    ],
  },
};

export interface QaidaLessonMeta {
  id: string;
  title: string;
  subtitle: string;
}

export const QAIDA_LESSONS: QaidaLessonMeta[] = [
  { id: "1", title: "Arabic Alphabet", subtitle: "28 letters" },
  { id: "2", title: "Harakat (Vowels)", subtitle: "Fatha, Kasra, Damma" },
  { id: "3", title: "Tanwin", subtitle: "Double vowels" },
  { id: "4", title: "Madd (Stretching)", subtitle: "Long vowels" },
  { id: "5", title: "Sukun & Shaddah", subtitle: "No vowel & double letter" },
  { id: "6", title: "Noon Sakin Rules", subtitle: "Izhar, Idgham, Iqlab, Ikhfa" },
  { id: "7", title: "Mim Sakin Rules", subtitle: "Ikhfa Shafawi, Idgham" },
  { id: "8", title: "Madd Rules", subtitle: "Types of prolongation" },
];

export const QAIDA_LESSON_ORDER = QAIDA_LESSONS.map((l) => l.id);

export function getQaidaLessonTitle(id: string): string {
  return QAIDA_LESSONS.find((l) => l.id === id)?.title ?? `Lesson ${id}`;
}

