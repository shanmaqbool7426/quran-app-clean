import { useQuery } from "@tanstack/react-query";
import { fetchSurahDetail, SurahDetail } from "@/services/quranApi";

export function useQuranSurah(surahId: number, edition: string = "ar.alafasy", translationEdition: string = "en.asad") {
  return useQuery<SurahDetail>({
    queryKey: ["surah", surahId, edition, translationEdition],
    queryFn: () => fetchSurahDetail(surahId, edition, translationEdition),
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
    enabled: surahId > 0,
  });
}
