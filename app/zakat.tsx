import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState, useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const GOLD_PRICE_PER_GRAM = 85;
const SILVER_PRICE_PER_GRAM = 1.05;
const NISAB_GOLD_GRAMS = 87.48;
const NISAB_SILVER_GRAMS = 612.36;
const ZAKAT_RATE = 0.025;

interface AssetCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  hint: string;
  unit?: string;
}

const ASSETS: AssetCategory[] = [
  { id: "cash", label: "Cash & Bank Balance", icon: "dollar-sign", color: "#22C55E", hint: "Total cash + savings" },
  { id: "gold", label: "Gold (grams)", icon: "sun", color: "#C8972A", hint: `Current price: $${GOLD_PRICE_PER_GRAM}/g`, unit: "grams" },
  { id: "silver", label: "Silver (grams)", icon: "circle", color: "#6B7280", hint: `Current price: $${SILVER_PRICE_PER_GRAM}/g`, unit: "grams" },
  { id: "investments", label: "Investments & Stocks", icon: "trending-up", color: "#3B82F6", hint: "Market value of investments" },
  { id: "business", label: "Business Assets", icon: "briefcase", color: "#8B5CF6", hint: "Trade goods, receivables" },
  { id: "rental", label: "Rental Income", icon: "home", color: "#F59E0B", hint: "Net rental income received" },
  { id: "debts", label: "Debts Owed to You", icon: "users", color: "#0D5C3A", hint: "Money others owe you" },
  { id: "liabilities", label: "Liabilities (Deduct)", icon: "minus-circle", color: "#EF4444", hint: "Your debts and obligations" },
];

export default function ZakatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [values, setValues] = useState<Record<string, string>>({});
  const [nisabStandard, setNisabStandard] = useState<"gold" | "silver">("gold");
  const [showResult, setShowResult] = useState(false);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const setValue = (id: string, val: string) => {
    setValues(prev => ({ ...prev, [id]: val }));
    setShowResult(false);
  };

  const calculation = useMemo(() => {
    const cash = parseFloat(values.cash || "0");
    const goldGrams = parseFloat(values.gold || "0");
    const silverGrams = parseFloat(values.silver || "0");
    const investments = parseFloat(values.investments || "0");
    const business = parseFloat(values.business || "0");
    const rental = parseFloat(values.rental || "0");
    const debtsOwed = parseFloat(values.debts || "0");
    const liabilities = parseFloat(values.liabilities || "0");

    const goldValue = goldGrams * GOLD_PRICE_PER_GRAM;
    const silverValue = silverGrams * SILVER_PRICE_PER_GRAM;

    const totalAssets = cash + goldValue + silverValue + investments + business + rental + debtsOwed;
    const netWorth = Math.max(0, totalAssets - liabilities);

    const nisabGold = NISAB_GOLD_GRAMS * GOLD_PRICE_PER_GRAM;
    const nisabSilver = NISAB_SILVER_GRAMS * SILVER_PRICE_PER_GRAM;
    const nisabValue = nisabStandard === "gold" ? nisabGold : nisabSilver;

    const eligible = netWorth >= nisabValue;
    const zakatDue = eligible ? netWorth * ZAKAT_RATE : 0;

    return {
      totalAssets,
      netWorth,
      nisabValue,
      nisabGold,
      nisabSilver,
      eligible,
      zakatDue,
      goldValue,
      silverValue,
    };
  }, [values, nisabStandard]);

  const formatMoney = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#C8972A", "#D4A840"]}
        style={[styles.header, { paddingTop: topPadding + 12 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Zakat Calculator</Text>
          <Text style={styles.headerSub}>Calculate your annual Zakat obligation</Text>
        </View>
        <View style={[styles.rateBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <Text style={styles.rateText}>2.5%</Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 20, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.infoCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Feather name="info" size={16} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.primary }]}>
            Zakat is 2.5% of your total net wealth if it exceeds the Nisab threshold and has been held for one lunar year (Hawl).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Nisab Standard</Text>
          <View style={[styles.nisabRow, { backgroundColor: colors.muted, borderRadius: 12 }]}>
            {(["gold", "silver"] as const).map(std => (
              <TouchableOpacity
                key={std}
                style={[
                  styles.nisabBtn,
                  nisabStandard === std && { backgroundColor: colors.primary, borderRadius: 10 }
                ]}
                onPress={() => { setNisabStandard(std); setShowResult(false); }}
              >
                <Text style={[styles.nisabBtnText, { color: nisabStandard === std ? "#FFFFFF" : colors.mutedForeground }]}>
                  {std === "gold" ? `Gold (${formatMoney(NISAB_GOLD_GRAMS * GOLD_PRICE_PER_GRAM)})` : `Silver (${formatMoney(NISAB_SILVER_GRAMS * SILVER_PRICE_PER_GRAM)})`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your Assets</Text>
          {ASSETS.map(asset => (
            <View
              key={asset.id}
              style={[styles.assetRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.assetIcon, { backgroundColor: asset.color + "20" }]}>
                <Feather name={asset.icon as any} size={18} color={asset.color} />
              </View>
              <View style={styles.assetInfo}>
                <Text style={[styles.assetLabel, { color: asset.id === "liabilities" ? "#EF4444" : colors.foreground }]}>
                  {asset.label}
                </Text>
                <Text style={[styles.assetHint, { color: colors.mutedForeground }]}>{asset.hint}</Text>
              </View>
              <View style={styles.inputWrap}>
                {!asset.unit && <Text style={[styles.currency, { color: colors.mutedForeground }]}>$</Text>}
                <TextInput
                  style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
                  placeholder="0"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="decimal-pad"
                  value={values[asset.id] ?? ""}
                  onChangeText={v => setValue(asset.id, v)}
                />
                {asset.unit && <Text style={[styles.unit, { color: colors.mutedForeground }]}>{asset.unit}</Text>}
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.calcBtn, { backgroundColor: "#C8972A" }]}
          onPress={() => setShowResult(true)}
        >
          <Feather name="percent" size={18} color="#FFFFFF" />
          <Text style={styles.calcBtnText}>Calculate Zakat</Text>
        </TouchableOpacity>

        {showResult && (
          <LinearGradient
            colors={calculation.eligible ? ["#C8972A", "#D4A840"] : ["#6B7280", "#4B5563"]}
            style={[styles.resultCard, { borderRadius: 20 }]}
          >
            <Text style={styles.resultTitle}>
              {calculation.eligible ? "Zakat is Due" : "No Zakat Required"}
            </Text>

            <View style={styles.resultRows}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Total Assets</Text>
                <Text style={styles.resultValue}>{formatMoney(calculation.totalAssets)}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Net Wealth</Text>
                <Text style={styles.resultValue}>{formatMoney(calculation.netWorth)}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Nisab ({nisabStandard})</Text>
                <Text style={styles.resultValue}>{formatMoney(calculation.nisabValue)}</Text>
              </View>
              <View style={[styles.resultDivider]} />
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { fontSize: 16, fontFamily: "Inter_700Bold" }]}>Zakat Due (2.5%)</Text>
                <Text style={[styles.resultValue, { fontSize: 22, fontFamily: "Inter_700Bold" }]}>
                  {formatMoney(calculation.zakatDue)}
                </Text>
              </View>
            </View>

            {!calculation.eligible && (
              <Text style={styles.resultNote}>
                Your net wealth ({formatMoney(calculation.netWorth)}) is below the Nisab threshold ({formatMoney(calculation.nisabValue)}). No Zakat is obligatory this year.
              </Text>
            )}
            {calculation.eligible && (
              <Text style={styles.resultNote}>
                May Allah accept your Zakat. Remember to give it before the next lunar year completes.
              </Text>
            )}
          </LinearGradient>
        )}

        <View style={[styles.rulesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.rulesTitle, { color: colors.foreground }]}>Zakat Rules</Text>
          {[
            { icon: "check" as const, text: "Muslim, adult, sane, free" },
            { icon: "check" as const, text: "Wealth above Nisab threshold" },
            { icon: "check" as const, text: "One full lunar year (Hawl) has passed" },
            { icon: "check" as const, text: "Wealth is in excess of basic needs" },
          ].map((r, i) => (
            <View key={i} style={styles.ruleRow}>
              <View style={[styles.ruleIcon, { backgroundColor: "#22C55E20" }]}>
                <Feather name={r.icon} size={12} color="#22C55E" />
              </View>
              <Text style={[styles.ruleText, { color: colors.mutedForeground }]}>{r.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
  rateBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  rateText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  infoCard: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1 },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  nisabRow: { flexDirection: "row", padding: 4, gap: 4 },
  nisabBtn: { flex: 1, paddingVertical: 10, alignItems: "center" },
  nisabBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  assetRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  assetIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  assetInfo: { flex: 1 },
  assetLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  assetHint: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  currency: { fontSize: 14, fontFamily: "Inter_500Medium" },
  input: { width: 90, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "right" },
  unit: { fontSize: 11, fontFamily: "Inter_400Regular" },
  calcBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, borderRadius: 16 },
  calcBtnText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  resultCard: { padding: 24, gap: 16 },
  resultTitle: { color: "#FFFFFF", fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center" },
  resultRows: { gap: 10 },
  resultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  resultLabel: { color: "rgba(255,255,255,0.85)", fontSize: 14, fontFamily: "Inter_400Regular" },
  resultValue: { color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  resultDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.3)" },
  resultNote: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  rulesCard: { padding: 18, borderRadius: 16, borderWidth: 1, gap: 10 },
  rulesTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 4 },
  ruleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  ruleIcon: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  ruleText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
});
