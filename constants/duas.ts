export interface Dua {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  category: string;
  reference?: string;
}

export const DUA_CATEGORIES = [
  "Morning & Evening",
  "Prayer",
  "Food & Drink",
  "Sleep",
  "Travel",
  "Protection",
  "Gratitude",
  "Forgiveness",
];

export const DUAS: Dua[] = [
  {
    id: "1",
    title: "Morning Dua",
    category: "Morning & Evening",
    arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
    transliteration: "Allahumma bika asbahna wa bika amsayna wa bika nahya wa bika namutu wa ilayka n-nushur",
    translation: "O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and to You is the resurrection.",
    reference: "Abu Dawud"
  },
  {
    id: "2",
    title: "Evening Dua",
    category: "Morning & Evening",
    arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",
    transliteration: "Allahumma bika amsayna wa bika asbahna wa bika nahya wa bika namutu wa ilayka l-masir",
    translation: "O Allah, by You we enter the evening and by You we enter the morning, by You we live and by You we die, and to You is the Final Return.",
    reference: "Abu Dawud"
  },
  {
    id: "3",
    title: "Before Eating",
    category: "Food & Drink",
    arabic: "بِسْمِ اللَّهِ",
    transliteration: "Bismillah",
    translation: "In the name of Allah.",
    reference: "Bukhari & Muslim"
  },
  {
    id: "4",
    title: "After Eating",
    category: "Food & Drink",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    transliteration: "Alhamdu lillahi l-ladhi at'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah",
    translation: "All praise is for Allah who fed me this and provided it for me, without any strength or power on my part.",
    reference: "Abu Dawud & Tirmidhi"
  },
  {
    id: "5",
    title: "Before Sleeping",
    category: "Sleep",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Bismika Allahumma amutu wa ahya",
    translation: "In Your name O Allah, I die and I live.",
    reference: "Bukhari"
  },
  {
    id: "6",
    title: "Upon Waking",
    category: "Sleep",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration: "Alhamdu lillahi l-ladhi ahyana ba'da ma amatana wa ilayhi n-nushur",
    translation: "All praise is for Allah who gave us life after having taken it from us, and unto Him is the resurrection.",
    reference: "Bukhari"
  },
  {
    id: "7",
    title: "Entering Masjid",
    category: "Prayer",
    arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    transliteration: "Allahumma ftah li abwaba rahmatik",
    translation: "O Allah, open the gates of Your mercy for me.",
    reference: "Muslim"
  },
  {
    id: "8",
    title: "Dua for Forgiveness",
    category: "Forgiveness",
    arabic: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنتَ التَّوَّابُ الرَّحِيمُ",
    transliteration: "Rabbi ighfir li wa tub 'alayya innaka anta t-tawwabu r-raheem",
    translation: "My Lord, forgive me and accept my repentance. Indeed, You are the Accepting of Repentance, the Merciful.",
    reference: "Tirmidhi"
  },
  {
    id: "9",
    title: "Dua for Protection",
    category: "Protection",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration: "A'udhu bi kalimatillahi t-tammati min sharri ma khalaq",
    translation: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    reference: "Muslim"
  },
  {
    id: "10",
    title: "Dua for Travel",
    category: "Travel",
    arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنقَلِبُونَ",
    transliteration: "Subhana l-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin wa inna ila rabbina lamunqalibun",
    translation: "Glory is to Him Who has subjected these to us and we could never have it (by ourselves), and verily to our Lord we indeed are to return.",
    reference: "Muslim"
  },
  {
    id: "11",
    title: "Gratitude Dua",
    category: "Gratitude",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ نَفْسًا بِكَ مُطْمَئِنَّةً تُؤْمِنُ بِلِقَائِكَ وَتَرْضَى بِقَضَائِكَ",
    transliteration: "Allahumma inni as'aluka nafsan bika mutma'innatan tu'minu biliqa'ika wa tarda biqada'ik",
    translation: "O Allah, I ask You for a soul that is at peace with You, that believes in meeting You, and is pleased with Your decree.",
    reference: "Nasai"
  },
  {
    id: "12",
    title: "Sayyidul Istighfar",
    category: "Forgiveness",
    arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ",
    transliteration: "Allahumma anta rabbi la ilaha illa anta khalaqtani wa ana abduk",
    translation: "O Allah, You are my Lord. None has the right to be worshipped but You. You created me and I am your servant.",
    reference: "Bukhari"
  },
];
