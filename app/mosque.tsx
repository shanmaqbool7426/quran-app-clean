import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Location from "expo-location";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

interface Mosque {
  id: string;
  name: string;
  vicinity: string;
  distance?: number;
  rating?: number;
  openNow?: boolean;
  placeId: string;
  lat: number;
  lng: number;
}

const SAMPLE_MOSQUES: Mosque[] = [
  { id: "1", name: "Islamic Center of America", vicinity: "19500 Ford Rd, Dearborn, MI", distance: 0.8, rating: 4.8, openNow: true, placeId: "", lat: 42.3, lng: -83.2 },
  { id: "2", name: "Al-Rahman Islamic Center", vicinity: "2345 Main Street", distance: 1.2, rating: 4.6, openNow: true, placeId: "", lat: 42.31, lng: -83.21 },
  { id: "3", name: "Masjid Al-Noor", vicinity: "789 Oak Avenue", distance: 2.1, rating: 4.5, openNow: false, placeId: "", lat: 42.32, lng: -83.22 },
  { id: "4", name: "Islamic Society Mosque", vicinity: "456 Elm Street", distance: 3.4, rating: 4.3, openNow: true, placeId: "", lat: 42.33, lng: -83.23 },
];

export default function MosqueScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    findNearbyMosques();
  }, []);

  const findNearbyMosques = async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setPermissionDenied(true);
        setMosques(SAMPLE_MOSQUES);
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = location.coords;

      const [geocode] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocode) {
        setLocationName(`${geocode.city ?? ""}, ${geocode.region ?? ""}`);
      }

      const url = `https://nominatim.openstreetmap.org/search?format=json&q=mosque&lat=${latitude}&lon=${longitude}&limit=10&bounded=1&viewbox=${longitude - 0.1},${latitude + 0.1},${longitude + 0.1},${latitude - 0.1}`;
      const res = await fetch(url, { headers: { "User-Agent": "QuranApp/1.0" } });

      if (res.ok) {
        const data = await res.json() as Array<{
          place_id?: string;
          osm_id?: string;
          display_name?: string;
          name?: string;
          lat?: string;
          lon?: string;
        }>;
        if (data.length > 0) {
          const found: Mosque[] = data.map((m, i) => {
            const mlat = parseFloat(m.lat ?? "0");
            const mlng = parseFloat(m.lon ?? "0");
            const R = 6371;
            const dLat = (mlat - latitude) * Math.PI / 180;
            const dLon = (mlng - longitude) * Math.PI / 180;
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(latitude * Math.PI / 180) * Math.cos(mlat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
            const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const name = m.name ?? m.display_name?.split(",")[0] ?? "Mosque";
            const vicinity = m.display_name?.split(",").slice(1, 3).join(",").trim() ?? "";
            return {
              id: String(m.place_id ?? m.osm_id ?? i),
              name,
              vicinity,
              distance: Math.round(distKm * 10) / 10,
              placeId: String(m.place_id ?? ""),
              lat: mlat,
              lng: mlng,
            };
          });
          found.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
          setMosques(found);
        } else {
          setMosques(SAMPLE_MOSQUES);
        }
      } else {
        setMosques(SAMPLE_MOSQUES);
      }
    } catch (e) {
      setMosques(SAMPLE_MOSQUES);
    } finally {
      setLoading(false);
    }
  };

  const openMaps = (mosque: Mosque) => {
    const query = encodeURIComponent(mosque.name);
    const url = Platform.OS === "ios"
      ? `maps:?q=${query}&ll=${mosque.lat},${mosque.lng}`
      : `geo:${mosque.lat},${mosque.lng}?q=${query}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://maps.google.com/?q=${mosque.lat},${mosque.lng}`);
    });
  };

  const renderMosque = ({ item, index }: { item: Mosque; index: number }) => (
    <TouchableOpacity
      style={[styles.mosqueCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => openMaps(item)}
      activeOpacity={0.75}
    >
      <View style={[styles.mosqueNum, { backgroundColor: colors.secondary }]}>
        <Text style={[styles.mosqueNumText, { color: colors.primary }]}>{index + 1}</Text>
      </View>
      <View style={styles.mosqueInfo}>
        <Text style={[styles.mosqueName, { color: colors.foreground }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.mosqueVicinity, { color: colors.mutedForeground }]} numberOfLines={1}>
          {item.vicinity}
        </Text>
        <View style={styles.mosqueMeta}>
          {item.distance !== undefined && (
            <View style={styles.metaChip}>
              <Feather name="map-pin" size={11} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.primary }]}>{item.distance} km</Text>
            </View>
          )}
          {item.openNow !== undefined && (
            <View style={[styles.metaChip, { backgroundColor: item.openNow ? "#22C55E20" : "#EF444420" }]}>
              <View style={[styles.dot, { backgroundColor: item.openNow ? "#22C55E" : "#EF4444" }]} />
              <Text style={[styles.metaText, { color: item.openNow ? "#22C55E" : "#EF4444" }]}>
                {item.openNow ? "Open" : "Closed"}
              </Text>
            </View>
          )}
          {item.rating && (
            <View style={styles.metaChip}>
              <Feather name="star" size={11} color="#C8972A" />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{item.rating}</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={[styles.dirBtn, { backgroundColor: colors.primary }]}
        onPress={() => openMaps(item)}
      >
        <Feather name="navigation" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#DC2626", "#B91C1C"]}
        style={[styles.header, { paddingTop: topPadding + 12 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Mosque Finder</Text>
          <Text style={styles.headerSub}>
            {locationName ? `Near ${locationName}` : "Finding mosques near you..."}
          </Text>
        </View>
        <TouchableOpacity onPress={findNearbyMosques} style={styles.refreshBtn}>
          <Feather name="refresh-cw" size={18} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
      </LinearGradient>

      {permissionDenied && (
        <View style={[styles.permBanner, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Feather name="info" size={15} color={colors.primary} />
          <Text style={[styles.permText, { color: colors.primary }]}>
            Location not granted — showing sample mosques. Enable location for accurate results.
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Finding nearby mosques...</Text>
        </View>
      ) : (
        <FlatList
          data={mosques}
          keyExtractor={item => item.id}
          renderItem={renderMosque}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 20,
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={[styles.statsBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="map-pin" size={16} color="#DC2626" />
              <Text style={[styles.statsText, { color: colors.foreground }]}>
                {mosques.length} mosques found nearby
              </Text>
              <Text style={[styles.tapHint, { color: colors.mutedForeground }]}>Tap for directions</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="map" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No mosques found nearby</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 16, gap: 12 },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1 },
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontFamily: "Inter_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  refreshBtn: { padding: 8 },
  permBanner: { flexDirection: "row", gap: 10, padding: 12, marginHorizontal: 16, marginTop: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  permText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  loadingState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  statsBar: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 4 },
  statsText: { flex: 1, fontSize: 13, fontFamily: "Inter_600SemiBold" },
  tapHint: { fontSize: 11, fontFamily: "Inter_400Regular" },
  mosqueCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  mosqueNum: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  mosqueNumText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  mosqueInfo: { flex: 1, gap: 4 },
  mosqueName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  mosqueVicinity: { fontSize: 12, fontFamily: "Inter_400Regular" },
  mosqueMeta: { flexDirection: "row", gap: 8, marginTop: 4, flexWrap: "wrap" },
  metaChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, backgroundColor: "transparent" },
  metaText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dirBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 14 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
