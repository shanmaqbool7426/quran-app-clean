export interface Reciter {
  id: string;
  edition: string;
  name: string;
  arabicName: string;
  country: string;
  style: string;
  color: string;
}

export const RECITERS: Reciter[] = [
  {
    id: "alafasy",
    edition: "ar.alafasy",
    name: "Mishary Al-Afasy",
    arabicName: "مشاري العفاسي",
    country: "Kuwait",
    style: "Murattal",
    color: "#0D5C3A",
  },
  {
    id: "husary",
    edition: "ar.husary",
    name: "Mahmoud Al-Husary",
    arabicName: "محمود الحصري",
    country: "Egypt",
    style: "Murattal",
    color: "#2563EB",
  },
  {
    id: "abdulbasit",
    edition: "ar.abdulbasitmurattal",
    name: "Abdul Basit",
    arabicName: "عبد الباسط",
    country: "Egypt",
    style: "Murattal",
    color: "#8B5CF6",
  },
  {
    id: "minshawi",
    edition: "ar.minshawi",
    name: "Al-Minshawi",
    arabicName: "المنشاوي",
    country: "Egypt",
    style: "Murattal",
    color: "#C8972A",
  },
  {
    id: "sudais",
    edition: "ar.abdurrahmansudais",
    name: "Abdur-Rahman Al-Sudais",
    arabicName: "عبدالرحمن السديس",
    country: "Saudi Arabia",
    style: "Murattal",
    color: "#DC2626",
  },
];

export const DEFAULT_RECITER = RECITERS[0];
