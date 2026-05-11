import { useQuery } from "@tanstack/react-query";
import { fetchAllSurahs, ApiSurah } from "@/services/quranApi";
import { SURAHS } from "@/constants/quranData";

export function useQuranSurahs() {
  return useQuery<ApiSurah[]>({
    queryKey: ["surahs"],
    queryFn: fetchAllSurahs,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
    placeholderData: SURAHS.map(s => ({
      number: s.id,
      name: s.arabicName,
      englishName: s.name,
      englishNameTranslation: s.meaning,
      numberOfAyahs: s.ayahs,
      revelationType: s.type,
    })),
  });
}
