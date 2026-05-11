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
  const url = `${BASE}/${edition}/${bookNumber}.min.json`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`Hadith API error: ${res.status}`);
    const data = await res.json() as Record<string, unknown>;

    const hadiths: Hadith[] = [];
    const raw = data.hadiths ?? data;

    if (Array.isArray(raw)) {
      (raw as Array<Record<string, unknown>>).forEach((h) => {
        const body = (h.body ?? h.text ?? "") as string;
        hadiths.push({
          number: (h.hadithnumber ?? h.number ?? hadiths.length + 1) as number,
          body,
          collection: edition,
          bookNumber,
          reference: h.reference
            ? `Book ${(h.reference as Record<string, unknown>).book}, Hadith ${(h.reference as Record<string, unknown>).hadith}`
            : undefined,
        });
      });
    } else if (typeof raw === "object" && raw !== null) {
      Object.entries(raw as Record<string, unknown>).forEach(([key, val]) => {
        const body = typeof val === "string" ? val : ((val as Record<string, unknown>)?.body ?? (val as Record<string, unknown>)?.text ?? "") as string;
        hadiths.push({
          number: parseInt(key) || hadiths.length + 1,
          body,
          collection: edition,
          bookNumber,
        });
      });
    }

    const filtered = hadiths.filter(h => h.body && h.body.length > 10);
    if (filtered.length >= 5) return filtered;
    const samples = SAMPLE_HADITHS_BY_COLLECTION[edition] ?? SAMPLE_HADITHS;
    const combined = [
      ...filtered,
      ...samples.filter(s => !filtered.some(f => f.number === s.number)),
    ];
    return combined;
  } catch {
    clearTimeout(timeoutId);
    return SAMPLE_HADITHS_BY_COLLECTION[edition] ?? SAMPLE_HADITHS;
  }
}

export const SAMPLE_HADITHS: Hadith[] = [
  {
    number: 1,
    body: "Narrated 'Umar bin Al-Khattab: I heard Allah's Messenger (ﷺ) saying, 'The reward of deeds depends upon the intentions and every person will get the reward according to what he has intended. So whoever emigrated for worldly benefits or for a woman to marry, his emigration was for what he emigrated for.'",
    collection: "eng-bukhari",
    bookNumber: 1,
    reference: "Book 1, Hadith 1",
  },
  {
    number: 2,
    body: "Narrated Aisha: The commencement of the Divine Inspiration to Allah's Messenger (ﷺ) was in the form of good dreams which came true like bright daylight, and then the love of seclusion was bestowed upon him. He used to go in seclusion in the cave of Hira where he used to worship (Allah alone) continuously for many days before his desire to see his family.",
    collection: "eng-bukhari",
    bookNumber: 1,
    reference: "Book 1, Hadith 3",
  },
  {
    number: 3,
    body: "Narrated Abu Huraira: Allah's Messenger (ﷺ) said, 'Islam is based on (the following) five (principles): To testify that none has the right to be worshipped but Allah and Muhammad is Allah's Messenger (ﷺ). To offer the (compulsory congregational) prayers dutifully and perfectly. To pay Zakat (i.e. obligatory charity). To perform Hajj. To observe fast during the month of Ramadan.'",
    collection: "eng-bukhari",
    bookNumber: 2,
    reference: "Book 2, Hadith 7",
  },
  {
    number: 4,
    body: "Narrated Ibn 'Umar: Allah's Messenger (ﷺ) said: 'A Muslim is a brother of another Muslim, so he should not oppress him, nor should he hand him over to an oppressor. Whoever fulfilled the needs of his brother, Allah will fulfill his needs; whoever brought his (Muslim) brother out of a discomfort, Allah will bring him out of the discomforts of the Day of Resurrection.'",
    collection: "eng-bukhari",
    bookNumber: 46,
    reference: "Book 46, Hadith 622",
  },
  {
    number: 5,
    body: "Narrated Abu Huraira: The Prophet (ﷺ) said, 'Whoever believes in Allah and the Last Day should talk what is good or keep quiet, and whoever believes in Allah and the Last Day should not hurt (or insult) his neighbor; and whoever believes in Allah and the Last Day, should entertain his guest generously.'",
    collection: "eng-bukhari",
    bookNumber: 78,
    reference: "Book 78, Hadith 156",
  },
  {
    number: 6,
    body: "Narrated Abdullah bin Amr: A man asked the Prophet (ﷺ), 'What sort of deeds or (what qualities of) Islam are good?' The Prophet (ﷺ) replied, 'To feed (the poor) and greet those whom you know and those whom you do not know.'",
    collection: "eng-bukhari",
    bookNumber: 2,
    reference: "Book 2, Hadith 11",
  },
  {
    number: 7,
    body: "Narrated Anas: The Prophet (ﷺ) said, 'None of you will have faith till he wishes for his (Muslim) brother what he likes for himself.'",
    collection: "eng-bukhari",
    bookNumber: 2,
    reference: "Book 2, Hadith 12",
  },
  {
    number: 8,
    body: "Narrated Abu Huraira: Allah's Messenger (ﷺ) said, 'By Him in Whose Hands my life is, none of you will have faith till he loves me more than his father and his children.'",
    collection: "eng-bukhari",
    bookNumber: 2,
    reference: "Book 2, Hadith 13",
  },
  {
    number: 9,
    body: "Narrated Anas bin Malik: The Prophet (ﷺ) said, 'Whoever possesses the following three qualities will have the sweetness (delight) of faith: The one to whom Allah and His Apostle becomes dearer than anything else; Who loves a person and he loves him only for Allah's sake; Who hates to revert to Atheism (disbelief) as he hates to be thrown into the fire.'",
    collection: "eng-bukhari",
    bookNumber: 2,
    reference: "Book 2, Hadith 15",
  },
  {
    number: 10,
    body: "Narrated Abu Said Al-Khudri: The Prophet (ﷺ) said, 'When you see a person who has been given more than you in money and appearance, then look at those who have been given less.'",
    collection: "eng-bukhari",
    bookNumber: 76,
    reference: "Book 76, Hadith 494",
  },
  {
    number: 11,
    body: "Narrated Abu Huraira: Allah's Messenger (ﷺ) said, 'Beware of suspicion, for suspicion is the worst of false tales; and do not look for the others' faults and do not spy, and do not be jealous of one another, and do not desert (cut your relation with) one another, and do not hate one another; and O Allah's worshippers! Be brothers (as Allah has ordered you!).'",
    collection: "eng-bukhari",
    bookNumber: 73,
    reference: "Book 73, Hadith 90",
  },
  {
    number: 12,
    body: "Narrated 'Abdullah: The Prophet (ﷺ) said, 'Truthfulness leads to righteousness and righteousness leads to Paradise. A man keeps on telling the truth until he becomes a truthful person. Falsehood leads to Al-Fajur (i.e. wickedness, evil-doing), and Al-Fajur leads to the (Hell) Fire, and a man may keep on telling lies till he is written before Allah, a liar.'",
    collection: "eng-bukhari",
    bookNumber: 73,
    reference: "Book 73, Hadith 116",
  },
];

export const SAMPLE_HADITHS_BY_COLLECTION: Record<string, Hadith[]> = {
  "eng-muslim": [
    { number: 1, body: "It is narrated on the authority of Amir ul-Mu'minin, Abu Hafs Umar bin al-Khattab (ra) who said: I heard the Messenger of Allah (ﷺ) say: 'Actions are according to intentions, and everyone will get what was intended. Whoever migrates with an intention for Allah and His messenger, the migration will be for the sake of Allah and His Messenger. And whoever migrates for worldly gain or to marry a woman, then his migration will be for the sake of whatever he migrated for.'", collection: "eng-muslim", bookNumber: 1, reference: "Book 1, Hadith 1" },
    { number: 2, body: "It is narrated on the authority of Yahya b. Ya'mur that the first man who discussed about qadr (divine decree) in Basra was Ma'bad al-Juhani. I along with Humaid b. 'Abdur-Rahman Himyari set out for pilgrimage or for 'Umrah and said: Should it so happen that we come into contact with one of the Companions of the Messenger of Allah (ﷺ) we shall ask him about what is talked about taqdir (Divine Decree).", collection: "eng-muslim", bookNumber: 1, reference: "Book 1, Hadith 5" },
    { number: 3, body: "Abu Huraira reported: The Messenger of Allah (ﷺ) said: 'Faith has over seventy branches — or over sixty branches — the uppermost of which is the declaration that there is no god but Allah, and the least of which is the removal of something harmful from a road. And shyness is a branch of faith.'", collection: "eng-muslim", bookNumber: 1, reference: "Book 1, Hadith 56" },
    { number: 4, body: "Abu Huraira reported: The Messenger of Allah (ﷺ) said: 'Do you know who is the bankrupt?' They said: 'The bankrupt among us is one who has neither dirham nor wealth.' He said: 'The bankrupt of my nation is the one who comes on the Day of Resurrection with prayers, fasts and zakat but comes having insulted this person, slandered that person, consumed the wealth of this person, shed the blood of that person, and beat this person. Each of these will be given from his good deeds, and if his good deeds are exhausted before the score is settled, the sins of those people will be cast upon him and he will be thrown into the Hellfire.'", collection: "eng-muslim", bookNumber: 45, reference: "Book 45, Hadith 6251" },
    { number: 5, body: "Jabir reported: I heard the Messenger of Allah (ﷺ) saying: 'A Muslim is he from whose hand and tongue the Muslims are safe.'", collection: "eng-muslim", bookNumber: 1, reference: "Book 1, Hadith 64" },
    { number: 6, body: "Abu Huraira reported: The Messenger of Allah (ﷺ) said: 'The strong man is not the one who overcomes the people by his strength, but the strong man is the one who controls himself while in anger.'", collection: "eng-muslim", bookNumber: 45, reference: "Book 45, Hadith 6313" },
  ],
  "eng-abudawud": [
    { number: 1, body: "Abu Hurairah said: The Messenger of Allah (ﷺ) said: 'Cleanliness is half of faith, and praise of Allah fills the scale, and glory be to Allah and praise of Allah fills — or fills between — the heavens and the earth, and prayer is a light, and charity is proof (of one's faith), and patience is brightness, and the Qur'an is a proof on your behalf or against you.'", collection: "eng-abudawud", bookNumber: 1, reference: "Book 1, Hadith 61" },
    { number: 2, body: "Abu Hurairah reported the Messenger of Allah (ﷺ) as saying: 'When you go to bed, perform ablution like that for prayer, then lie down on your right side and say: O Allah, I have turned my face to Thee and surrendered myself to Thee, and committed my affair to Thee, and sought Thy refuge for love of Thee and fear of Thee.'", collection: "eng-abudawud", bookNumber: 1, reference: "Book 1, Hadith 5046" },
    { number: 3, body: "Narrated Mu'adh ibn Jabal: The Prophet (ﷺ) said: 'The key to Paradise is prayer, and the key to prayer is cleanliness.'", collection: "eng-abudawud", bookNumber: 1, reference: "Book 1, Hadith 61" },
  ],
  "eng-tirmidhi": [
    { number: 1, body: "Abu Hurairah narrated that the Messenger of Allah (ﷺ) said: 'From the excellence of a person's Islam is that he leaves what does not concern him.'", collection: "eng-tirmidhi", bookNumber: 37, reference: "Book 37, Hadith 2317" },
    { number: 2, body: "Anas bin Malik narrated that: The Messenger of Allah (ﷺ) said: 'None of you believes until he loves for his brother — or he said for his neighbor — what he loves for himself.'", collection: "eng-tirmidhi", bookNumber: 37, reference: "Book 37, Hadith 2515" },
    { number: 3, body: "Abu Hurairah narrated that the Prophet (ﷺ) said: 'Do not be envious of one another; do not artificially inflate prices against one another; do not hate one another; do not turn away from one another; and do not undercut one another, but be you, O servants of Allah, brothers.'", collection: "eng-tirmidhi", bookNumber: 37, reference: "Book 37, Hadith 2514" },
  ],
  "eng-ibnmajah": [
    { number: 1, body: "It was narrated that 'Ubadah bin Samit said: 'The Messenger of Allah (ﷺ) said: \"Whoever loves to meet Allah, Allah loves to meet him. And whoever hates to meet Allah, Allah hates to meet him.\"' His wife said: 'We dislike death.' He said: 'It is not that. Rather, it is that when the moment of death of the believer approaches, he receives the glad tidings of the pleasure of Allah and His honor, and nothing is more beloved to him than what is ahead of him.'", collection: "eng-ibnmajah", bookNumber: 37, reference: "Book 37, Hadith 4264" },
    { number: 2, body: "It was narrated from Abu Hurairah that the Prophet (ﷺ) said: 'Whoever is able to benefit his brother, let him do so.'", collection: "eng-ibnmajah", bookNumber: 33, reference: "Book 33, Hadith 3683" },
  ],
  "eng-nasai": [
    { number: 1, body: "It was narrated that Anas bin Malik said: 'The Messenger of Allah (ﷺ) said: \"Make things easy and do not make things difficult; give glad tidings and do not cause aversion.\"'", collection: "eng-nasai", bookNumber: 25, reference: "Book 25, Hadith 5872" },
    { number: 2, body: "It was narrated that Abu Hurairah said: 'The Messenger of Allah (ﷺ) said: \"The best of charity is that given by one who has little. And start with those for whom you are responsible.\"'", collection: "eng-nasai", bookNumber: 23, reference: "Book 23, Hadith 2543" },
  ],
};
