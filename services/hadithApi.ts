const BASE = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";

export interface HadithCollection {
  id: string;
  edition: string;
  name: string;
  arabicName: string;
  books: number;
  totalHadiths: number;
  color: string;
}

export interface Hadith {
  number: number;
  body: string;
  collection: string;
  bookNumber: number;
  reference?: string;
}

export const HADITH_COLLECTIONS: HadithCollection[] = [
  { id: "bukhari", edition: "eng-bukhari", name: "Sahih Bukhari", arabicName: "صحيح البخاري", books: 97, totalHadiths: 7563, color: "#0D5C3A" },
  { id: "muslim", edition: "eng-muslim", name: "Sahih Muslim", arabicName: "صحيح مسلم", books: 56, totalHadiths: 7470, color: "#2563EB" },
  { id: "abudawud", edition: "eng-abudawud", name: "Abu Dawud", arabicName: "سنن أبي داود", books: 43, totalHadiths: 5274, color: "#8B5CF6" },
  { id: "tirmidhi", edition: "eng-tirmidhi", name: "Tirmidhi", arabicName: "جامع الترمذي", books: 49, totalHadiths: 3956, color: "#C8972A" },
  { id: "ibnmajah", edition: "eng-ibnmajah", name: "Ibn Majah", arabicName: "سنن ابن ماجه", books: 37, totalHadiths: 4341, color: "#DC2626" },
  { id: "nasai", edition: "eng-nasai", name: "An-Nasai", arabicName: "سنن النسائي", books: 51, totalHadiths: 5758, color: "#D97706" },
];

export async function fetchHadiths(edition: string, bookNumber: number = 1): Promise<Hadith[]> {
  const url = `${BASE}/${edition}/sections/${bookNumber}.min.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Hadith API error: ${res.status}`);
  const data = await res.json();

  const hadiths: Hadith[] = [];

  if (Array.isArray(data)) {
    data.forEach((h: any, idx: number) => {
      hadiths.push({
        number: h.hadithnumber ?? h.number ?? idx + 1,
        body: h.text ?? h.body ?? "",
        collection: edition,
        bookNumber,
        reference: h.reference ? `Book ${h.reference.book}, Hadith ${h.reference.hadith}` : undefined,
      });
    });
  } else if (data.hadiths && Array.isArray(data.hadiths)) {
    data.hadiths.forEach((h: any) => {
      hadiths.push({
        number: h.hadithnumber ?? h.number ?? hadiths.length + 1,
        body: h.text ?? h.body ?? "",
        collection: edition,
        bookNumber,
        reference: h.reference ? `Book ${h.reference.book}, Hadith ${h.reference.hadith}` : undefined,
      });
    });
  } else if (typeof data === "object") {
    Object.entries(data).forEach(([key, val]: [string, any]) => {
      if (key === "name" || key === "metadata" || key === "hadiths") return;
      const num = parseInt(key);
      if (isNaN(num)) return;
      hadiths.push({
        number: num,
        body: val?.text ?? val?.body ?? (typeof val === "string" ? val : ""),
        collection: edition,
        bookNumber,
      });
    });
  }

  return hadiths
    .filter(h => h.body && h.body.length > 10)
    .sort((a, b) => a.number - b.number);
}

export const SAMPLE_HADITHS: Hadith[] = [
  {
    number: 1,
    body: "Narrated 'Umar bin Al-Khattab: I heard Allah's Messenger (ﷺ) saying, 'The reward of deeds depends upon the intentions and every person will get the reward according to what he has intended.'",
    collection: "eng-bukhari",
    bookNumber: 1,
    reference: "Book 1, Hadith 1",
  },
  {
    number: 2,
    body: "Narrated Aisha: The commencement of the Divine Inspiration to Allah's Messenger (ﷺ) was in the form of good dreams which came true like bright daylight, and then the love of seclusion was bestowed upon him.",
    collection: "eng-bukhari",
    bookNumber: 1,
    reference: "Book 1, Hadith 3",
  },
  {
    number: 3,
    body: "It is narrated on the authority of Amir ul-Mu'minin, Abu Hafs 'Umar bin al-Khattab (ra) who said: I heard the Messenger of Allah (ﷺ) say: 'Actions are according to intentions, and everyone will get what was intended.'",
    collection: "eng-muslim",
    bookNumber: 45,
    reference: "Book 45, Hadith 1",
  },
  {
    number: 4,
    body: "Abu Hurairah (May Allah be pleased with him) reported: The Messenger of Allah (ﷺ) said: 'He who believes in Allah and the Last Day, let him be hospitable to his guest; and he who believes in Allah and the Last Day, let him maintain the ties of kinship.'",
    collection: "eng-bukhari",
    bookNumber: 78,
    reference: "Book 78, Hadith 156",
  },
  {
    number: 5,
    body: "Abdullah bin 'Amr bin Al-'As (May Allah be pleased with them) reported: The Prophet (ﷺ) said: 'A Muslim is the one from whose tongue and hands the Muslims are safe; and a Muhajir (Emigrant) is the one who refrains from what Allah has forbidden.'",
    collection: "eng-bukhari",
    bookNumber: 2,
    reference: "Book 2, Hadith 10",
  },
];
