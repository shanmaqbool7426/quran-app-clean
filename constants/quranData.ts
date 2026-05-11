export interface Surah {
  id: number;
  name: string;
  arabicName: string;
  meaning: string;
  ayahs: number;
  type: "Meccan" | "Medinan";
  juz: number;
  description: string;
}

export interface Ayah {
  number: number;
  arabic: string;
  translation: string;
  transliteration: string;
}

export const SURAHS: Surah[] = [
  { id: 1, name: "Al-Fatiha", arabicName: "الفاتحة", meaning: "The Opening", ayahs: 7, type: "Meccan", juz: 1, description: "The opening chapter, recited in every prayer" },
  { id: 2, name: "Al-Baqarah", arabicName: "البقرة", meaning: "The Cow", ayahs: 286, type: "Medinan", juz: 1, description: "The longest surah, containing Ayat al-Kursi" },
  { id: 3, name: "Al-Imran", arabicName: "آل عمران", meaning: "Family of Imran", ayahs: 200, type: "Medinan", juz: 3, description: "Named after the family of the Virgin Mary" },
  { id: 4, name: "An-Nisa", arabicName: "النساء", meaning: "The Women", ayahs: 176, type: "Medinan", juz: 4, description: "Addresses the rights and role of women" },
  { id: 5, name: "Al-Ma'idah", arabicName: "المائدة", meaning: "The Table", ayahs: 120, type: "Medinan", juz: 6, description: "The heavenly table spread" },
  { id: 6, name: "Al-An'am", arabicName: "الأنعام", meaning: "The Cattle", ayahs: 165, type: "Meccan", juz: 7, description: "Revealed in its entirety in one night" },
  { id: 7, name: "Al-A'raf", arabicName: "الأعراف", meaning: "The Heights", ayahs: 206, type: "Meccan", juz: 8, description: "The Purgatory between Heaven and Hell" },
  { id: 8, name: "Al-Anfal", arabicName: "الأنفال", meaning: "The Spoils of War", ayahs: 75, type: "Medinan", juz: 9, description: "Revealed after the Battle of Badr" },
  { id: 9, name: "At-Tawbah", arabicName: "التوبة", meaning: "The Repentance", ayahs: 129, type: "Medinan", juz: 10, description: "The only surah without Bismillah" },
  { id: 10, name: "Yunus", arabicName: "يونس", meaning: "Jonah", ayahs: 109, type: "Meccan", juz: 11, description: "Named after the Prophet Jonah" },
  { id: 11, name: "Hud", arabicName: "هود", meaning: "Hud", ayahs: 123, type: "Meccan", juz: 11, description: "Named after the Prophet Hud" },
  { id: 12, name: "Yusuf", arabicName: "يوسف", meaning: "Joseph", ayahs: 111, type: "Meccan", juz: 12, description: "The best of all stories" },
  { id: 13, name: "Ar-Ra'd", arabicName: "الرعد", meaning: "The Thunder", ayahs: 43, type: "Medinan", juz: 13, description: "Thunder glorifies Allah's praises" },
  { id: 14, name: "Ibrahim", arabicName: "إبراهيم", meaning: "Abraham", ayahs: 52, type: "Meccan", juz: 13, description: "Named after the Prophet Ibrahim" },
  { id: 15, name: "Al-Hijr", arabicName: "الحجر", meaning: "The Rocky Tract", ayahs: 99, type: "Meccan", juz: 14, description: "The stone valley in Arabia" },
  { id: 16, name: "An-Nahl", arabicName: "النحل", meaning: "The Bee", ayahs: 128, type: "Meccan", juz: 14, description: "The bee as a sign of Allah's wisdom" },
  { id: 17, name: "Al-Isra", arabicName: "الإسراء", meaning: "The Night Journey", ayahs: 111, type: "Meccan", juz: 15, description: "The miraculous night journey of the Prophet" },
  { id: 18, name: "Al-Kahf", arabicName: "الكهف", meaning: "The Cave", ayahs: 110, type: "Meccan", juz: 15, description: "Recited on Fridays for protection from Dajjal" },
  { id: 19, name: "Maryam", arabicName: "مريم", meaning: "Mary", ayahs: 98, type: "Meccan", juz: 16, description: "Named after the Virgin Mary" },
  { id: 20, name: "Ta-Ha", arabicName: "طه", meaning: "Ta-Ha", ayahs: 135, type: "Meccan", juz: 16, description: "Mysterious letters opening this surah" },
  { id: 36, name: "Ya-Sin", arabicName: "يس", meaning: "Ya-Sin", ayahs: 83, type: "Meccan", juz: 22, description: "The Heart of the Quran" },
  { id: 55, name: "Ar-Rahman", arabicName: "الرحمن", meaning: "The Beneficent", ayahs: 78, type: "Medinan", juz: 27, description: "Which of the favors of your Lord will you deny?" },
  { id: 67, name: "Al-Mulk", arabicName: "الملك", meaning: "The Sovereignty", ayahs: 30, type: "Meccan", juz: 29, description: "Protects from the punishment of the grave" },
  { id: 112, name: "Al-Ikhlas", arabicName: "الإخلاص", meaning: "Sincerity", ayahs: 4, type: "Meccan", juz: 30, description: "Equal to one-third of the Quran" },
  { id: 113, name: "Al-Falaq", arabicName: "الفلق", meaning: "The Daybreak", ayahs: 5, type: "Meccan", juz: 30, description: "Seeking refuge in the Lord of daybreak" },
  { id: 114, name: "An-Nas", arabicName: "الناس", meaning: "Mankind", ayahs: 6, type: "Meccan", juz: 30, description: "Seeking refuge from whispers of evil" },
];

export const FATIHA_AYAHS: Ayah[] = [
  {
    number: 1,
    arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
    transliteration: "Bismillahi r-rahmani r-raheem"
  },
  {
    number: 2,
    arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    translation: "All praise is due to Allah, Lord of the worlds.",
    transliteration: "Alhamdu lillahi rabbi l-'alamin"
  },
  {
    number: 3,
    arabic: "الرَّحْمَٰنِ الرَّحِيمِ",
    translation: "The Entirely Merciful, the Especially Merciful,",
    transliteration: "Ar-rahmani r-raheem"
  },
  {
    number: 4,
    arabic: "مَالِكِ يَوْمِ الدِّينِ",
    translation: "Sovereign of the Day of Recompense.",
    transliteration: "Maliki yawmi d-deen"
  },
  {
    number: 5,
    arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
    translation: "It is You we worship and You we ask for help.",
    transliteration: "Iyyaka na'budu wa-iyyaka nasta'een"
  },
  {
    number: 6,
    arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
    translation: "Guide us to the straight path -",
    transliteration: "Ihdinas-sirata l-mustaqeem"
  },
  {
    number: 7,
    arabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
    translation: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
    transliteration: "Sirata l-ladhina an'amta 'alayhim ghayri l-maghdubi 'alayhim wa-la d-dallin"
  },
];

export const IKHLAS_AYAHS: Ayah[] = [
  { number: 1, arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ", translation: "Say, He is Allah, [who is] One,", transliteration: "Qul huwa Allahu ahad" },
  { number: 2, arabic: "اللَّهُ الصَّمَدُ", translation: "Allah, the Eternal Refuge.", transliteration: "Allahu s-samad" },
  { number: 3, arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ", translation: "He neither begets nor is born,", transliteration: "Lam yalid wa-lam yulad" },
  { number: 4, arabic: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", translation: "Nor is there to Him any equivalent.", transliteration: "Wa-lam yakun lahu kufuwan ahad" },
];

export const DAILY_AYAHS = [
  {
    arabic: "وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ",
    translation: "But perhaps you hate a thing and it is good for you.",
    reference: "Al-Baqarah 2:216"
  },
  {
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translation: "Indeed, with hardship will be ease.",
    reference: "Ash-Sharh 94:6"
  },
  {
    arabic: "وَاللَّهُ يُحِبُّ الصَّابِرِينَ",
    translation: "And Allah loves the patient.",
    reference: "Al-Imran 3:146"
  },
  {
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translation: "For indeed, with hardship [will be] ease.",
    reference: "Ash-Sharh 94:5"
  },
  {
    arabic: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ",
    translation: "And He is with you wherever you are.",
    reference: "Al-Hadid 57:4"
  },
  {
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    translation: "Sufficient for us is Allah, and [He is] the best Disposer of affairs.",
    reference: "Al-Imran 3:173"
  },
  {
    arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
    translation: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence.",
    reference: "Al-Baqarah 2:255"
  },
];

export const LEARNING_PROGRESS_MOCK = {
  totalSurahs: 114,
  memorized: 12,
  inProgress: 3,
  juzCompleted: 1,
};
