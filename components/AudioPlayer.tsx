import { Feather } from "@expo/vector-icons";
import { Audio, AVPlaybackStatus } from "expo-av";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Reciter, RECITERS } from "@/constants/reciters";
import { useColors } from "@/hooks/useColors";

class WebAudio {
  private el: HTMLAudioElement | null = null;
  private onEnd: (() => void) | null = null;
  private onProgress: ((pos: number, dur: number) => void) | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  async load(uri: string, onEnd: () => void, onProgress: (pos: number, dur: number) => void) {
    this.stop();
    this.onEnd = onEnd;
    this.onProgress = onProgress;
    const audio = new (window as any).Audio(uri) as HTMLAudioElement;
    audio.addEventListener("ended", () => { this.cleanup(); onEnd(); });
    audio.addEventListener("error", () => { this.cleanup(); onEnd(); });
    this.el = audio;
    await audio.play();
    this.intervalId = setInterval(() => {
      if (this.el) onProgress(this.el.currentTime * 1000, (this.el.duration || 0) * 1000);
    }, 200);
  }

  async play() { await this.el?.play(); }
  async pause() { this.el?.pause(); }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;
    if (this.el) { this.el.pause(); this.el.src = ""; this.el = null; }
  }

  private cleanup() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;
    this.el = null;
  }
}
const webAudio = Platform.OS === "web" ? new WebAudio() : null;

interface Props {
  audioUrls: string[];
  ayahNumbers: number[];
  currentIndex: number;
  onAyahChange: (index: number) => void;
  onProgress?: (position: number, duration: number) => void;
  reciter: Reciter;
  onReciterChange: (reciter: Reciter) => void;
  totalAyahs: number;
  surahName: string;
}

type PlayerState = "idle" | "loading" | "playing" | "paused";

/** Animated waveform bar — each bar oscillates independently */
function WaveBar({ isPlaying, delay, color }: { isPlaying: boolean; delay: number; color: string }) {
  const anim = useRef(new Animated.Value(0.25)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isPlaying) {
      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 380 + delay * 60,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0.2,
            duration: 360 + delay * 50,
            useNativeDriver: false,
          }),
        ])
      );
      setTimeout(() => loopRef.current?.start(), delay * 80);
    } else {
      loopRef.current?.stop();
      Animated.timing(anim, { toValue: 0.25, duration: 200, useNativeDriver: false }).start();
    }
    return () => loopRef.current?.stop();
  }, [isPlaying]);

  return (
    <Animated.View
      style={{
        width: 3,
        borderRadius: 2,
        backgroundColor: color,
        height: anim.interpolate({ inputRange: [0, 1], outputRange: [4, 22] }),
        opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
      }}
    />
  );
}

export default function AudioPlayer({
  audioUrls,
  ayahNumbers,
  currentIndex,
  onAyahChange,
  onProgress,
  reciter,
  onReciterChange,
  totalAyahs,
  surahName,
}: Props) {
  const colors = useColors();
  const soundRef = useRef<Audio.Sound | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>("idle");
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showReciters, setShowReciters] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (Platform.OS !== "web") {
      Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      }).catch(() => {});
    }
    return () => {
      soundRef.current?.unloadAsync();
      webAudio?.stop();
    };
  }, []);

  useEffect(() => {
    if (playerState === "playing") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [playerState]);

  const handleProgress = useCallback((pos: number, dur: number) => {
    setPosition(pos);
    setDuration(dur);
    if (dur > 0) progressAnim.setValue(pos / dur);
    onProgress?.(pos, dur);
  }, [onProgress]);

  const loadAndPlay = useCallback(
    async (index: number) => {
      const url = audioUrls[index];
      if (!url) return;

      setPlayerState("loading");

      if (Platform.OS === "web" && webAudio) {
        try {
          await webAudio.load(
            url,
            () => {
              const next = index + 1;
              if (next < audioUrls.length) { onAyahChange(next); loadAndPlay(next); }
              else setPlayerState("idle");
            },
            handleProgress
          );
          setPlayerState("playing");
        } catch {
          setPlayerState("idle");
        }
        return;
      }

      try {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
        const { sound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: true },
          (status: AVPlaybackStatus) => {
            if (!status.isLoaded) return;
            handleProgress(status.positionMillis, status.durationMillis ?? 0);
            if (status.didJustFinish) {
              const next = index + 1;
              if (next < audioUrls.length) { onAyahChange(next); loadAndPlay(next); }
              else setPlayerState("idle");
            }
          }
        );
        soundRef.current = sound;
        setPlayerState("playing");
      } catch {
        setPlayerState("idle");
      }
    },
    [audioUrls, onAyahChange, handleProgress]
  );

  const handlePlayPause = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (playerState === "idle") {
      loadAndPlay(currentIndex);
    } else if (playerState === "playing") {
      if (Platform.OS === "web") await webAudio?.pause();
      else await soundRef.current?.pauseAsync();
      setPlayerState("paused");
    } else if (playerState === "paused") {
      if (Platform.OS === "web") await webAudio?.play();
      else await soundRef.current?.playAsync();
      setPlayerState("playing");
    }
  };

  const handlePrev = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const prev = Math.max(0, currentIndex - 1);
    onAyahChange(prev);
    if (playerState !== "idle") loadAndPlay(prev);
  };

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = Math.min(audioUrls.length - 1, currentIndex + 1);
    onAyahChange(next);
    if (playerState !== "idle") loadAndPlay(next);
  };

  const handleReciterSelect = async (r: Reciter) => {
    setShowReciters(false);
    const wasPlaying = playerState === "playing";
    if (Platform.OS === "web") { webAudio?.stop(); }
    else if (soundRef.current) { await soundRef.current.unloadAsync(); soundRef.current = null; }
    setPlayerState("idle");
    setPosition(0);
    setDuration(0);
    progressAnim.setValue(0);
    onReciterChange(r);
    if (wasPlaying) setTimeout(() => loadAndPlay(currentIndex), 300);
  };

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  const isPlaying = playerState === "playing";

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Reciter selector */}
      <TouchableOpacity
        style={[styles.reciterRow, { backgroundColor: colors.secondary }]}
        onPress={() => setShowReciters(v => !v)}
      >
        <View style={[styles.reciterDot, { backgroundColor: reciter.color }]} />
        <View style={styles.reciterInfo}>
          <Text style={[styles.reciterName, { color: colors.foreground }]}>{reciter.name}</Text>
          <Text style={[styles.reciterSub, { color: colors.mutedForeground }]}>
            {reciter.arabicName} • {reciter.country}
          </Text>
        </View>
        <Feather name={showReciters ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
      </TouchableOpacity>

      {/* Reciter list */}
      {showReciters && (
        <View style={[styles.reciterList, { borderColor: colors.border }]}>
          {RECITERS.map(r => (
            <TouchableOpacity
              key={r.id}
              style={[
                styles.reciterItem,
                { borderBottomColor: colors.border },
                r.id === reciter.id && { backgroundColor: colors.secondary },
              ]}
              onPress={() => handleReciterSelect(r)}
            >
              <View style={[styles.reciterDot, { backgroundColor: r.color }]} />
              <View style={styles.reciterItemInfo}>
                <Text style={[styles.reciterItemName, { color: colors.foreground }]}>{r.name}</Text>
                <Text style={[styles.reciterItemSub, { color: colors.mutedForeground }]}>
                  {r.arabicName} • {r.style}
                </Text>
              </View>
              {r.id === reciter.id && (
                <Feather name="check" size={16} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Now playing + waveform */}
      <View style={styles.nowPlaying}>
        <View style={styles.npLeft}>
          <Text style={[styles.npTitle, { color: colors.foreground }]} numberOfLines={1}>
            {surahName}
          </Text>
          <Text style={[styles.npSub, { color: colors.mutedForeground }]}>
            Ayah {ayahNumbers[currentIndex] ?? currentIndex + 1} of {totalAyahs}
          </Text>
        </View>

        {/* Live waveform visualizer */}
        <View style={styles.waveform}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <WaveBar
              key={i}
              isPlaying={isPlaying}
              delay={i}
              color={isPlaying ? reciter.color : colors.border}
            />
          ))}
        </View>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: reciter.color,
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }) as any,
            },
          ]}
        />
      </View>
      <View style={styles.timeRow}>
        <Text style={[styles.timeText, { color: colors.mutedForeground }]}>{fmt(position)}</Text>
        <Text style={[styles.timeText, { color: colors.mutedForeground }]}>{fmt(duration)}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={handlePrev} style={styles.ctrlBtn} disabled={currentIndex === 0}>
          <Feather
            name="skip-back"
            size={22}
            color={currentIndex === 0 ? colors.border : colors.foreground}
          />
        </TouchableOpacity>

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity onPress={handlePlayPause} activeOpacity={0.85}>
            <LinearGradient
              colors={[reciter.color, reciter.color + "CC"]}
              style={styles.playBtn}
            >
              {playerState === "loading" ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Feather
                  name={isPlaying ? "pause" : "play"}
                  size={28}
                  color="#FFFFFF"
                />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          onPress={handleNext}
          style={styles.ctrlBtn}
          disabled={currentIndex >= audioUrls.length - 1}
        >
          <Feather
            name="skip-forward"
            size={22}
            color={currentIndex >= audioUrls.length - 1 ? colors.border : colors.foreground}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 20, borderWidth: 1, overflow: "hidden", marginHorizontal: 20, marginBottom: 16 },
  reciterRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  reciterDot: { width: 10, height: 10, borderRadius: 5 },
  reciterInfo: { flex: 1 },
  reciterName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  reciterSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  reciterList: { borderTopWidth: 1 },
  reciterItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  reciterItemInfo: { flex: 1 },
  reciterItemName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  reciterItemSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  nowPlaying: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, paddingHorizontal: 16 },
  npLeft: { flex: 1, gap: 3 },
  npTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  npSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  waveform: { flexDirection: "row", alignItems: "center", gap: 3, height: 28 },
  progressTrack: { height: 4, marginHorizontal: 16, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  timeRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, marginTop: 6 },
  timeText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 32, paddingVertical: 16 },
  ctrlBtn: { padding: 8 },
  playBtn: { width: 62, height: 62, borderRadius: 31, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 8 },
});
