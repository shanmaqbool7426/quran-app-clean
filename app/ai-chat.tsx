import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  Layout,
  FadeIn,
  FadeOut
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { AI_CHAT_SUGGESTED_QUESTIONS } from "@/constants/learnHub";
import { useColors } from "@/hooks/useColors";
import { streamChat, testConnection, type ChatMessage } from "@/services/aiService";

const STORAGE_KEY = "@quran_app_chat_history";

interface Message extends ChatMessage {
  id: string;
  isLoading?: boolean;
  timestamp: number;
}

export default function AIChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ prompt?: string | string[] }>();
  const initialPrompt = Array.isArray(params.prompt) ? params.prompt[0] : params.prompt;
  const initialPromptConsumed = useRef(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "As-salamu alaykum! I am your AI Islamic Scholar. Ask me anything about the Quran, Hadith, Islamic jurisprudence, prayer, fasting, or any aspect of Islam. How can I help you today?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"testing" | "ok" | "error">("testing");
  const listRef = useRef<FlatList>(null);
  const messagesRef = useRef<Message[]>(messages);
  const isNearBottom = useRef(true);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };
    loadHistory();

    // Check connection to backend
    testConnection().then(res => {
      setConnectionStatus(res.success ? "ok" : "error");
    });
  }, []);

  // Save history on change
  useEffect(() => {
    messagesRef.current = messages;
    if (messages.length > 1) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages)).catch(() => { });
    }
  }, [messages]);

  // Auto-scroll when new content streams in and user is near bottom
  const lastMsg = messages[messages.length - 1];
  useEffect(() => {
    if (isNearBottom.current && lastMsg && !lastMsg.isLoading) {
      const timer = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
      return () => clearTimeout(timer);
    }
  }, [lastMsg?.content, lastMsg?.isLoading]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const trimmed = text.trim();
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    const assistantId = `a-${Date.now() + 1}`;
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      isLoading: true,
      timestamp: Date.now() + 1,
    };

    const historyMessages: ChatMessage[] = messagesRef.current
      .filter((m) =>
        m.id !== "welcome" &&
        !m.content.includes("I encountered an error") &&
        m.content.trim() !== ""
      )
      .map((m) => ({ role: m.role, content: m.content }));

    historyMessages.push({ role: "user", content: trimmed });

    setInput("");
    setMessages((p) => [...p, userMsg, assistantMsg]);
    setIsStreaming(true);

    // Minor delay to let UI update before streaming starts
    await new Promise(r => setTimeout(r, 100));

    try {
      await streamChat(
        historyMessages,
        (chunk) => {
          console.log(`[AIChat] Received chunk: "${chunk.substring(0, 20)}..."`);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + chunk, isLoading: false } : m
            )
          );
        },
        () => {
          setIsStreaming(false);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
        (err) => {
          setIsStreaming(false);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                  ...m,
                  content: m.content || "I encountered an error. Please try again.",
                  isLoading: false,
                }
                : m
            )
          );
        }
      );
    } catch (e) {
      setIsStreaming(false);
    }
  }, [isStreaming]);

  const clearHistory = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    const welcome: Message = {
      id: "welcome",
      role: "assistant",
      content: "As-salamu alaykum! How can I help you today?",
      timestamp: Date.now(),
    };
    setMessages([welcome]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  // Handle initial prompt from router
  useEffect(() => {
    if (initialPromptConsumed.current) return;
    if (typeof initialPrompt !== "string" || !initialPrompt.trim()) return;
    initialPromptConsumed.current = true;

    const timer = setTimeout(() => {
      void sendMessage(decodeURIComponent(initialPrompt));
    }, 500);
    return () => clearTimeout(timer);
  }, [initialPrompt, sendMessage]);

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isUser = item.role === "user";
    const showAvatar = index === 0 || messages[index - 1].role !== item.role;

    return (
      <Animated.View
        entering={FadeInDown.duration(400).springify().damping(20)}
        style={[
          styles.messageRow,
          isUser && styles.messageRowUser,
          !showAvatar && { marginBottom: 2 }
        ]}
      >
        {!isUser && (
          <View style={[styles.avatar, { backgroundColor: colors.primary, opacity: showAvatar ? 1 : 0 }]}>
            <Feather name="cpu" size={14} color="#FFFFFF" />
          </View>
        )}

        <View
          style={[
            styles.bubble,
            isUser
              ? [styles.bubbleUser, { backgroundColor: colors.primary }]
              : [styles.bubbleAI, { backgroundColor: colors.card, borderColor: colors.border }],
          ]}
        >
          {item.isLoading ? (
            <View style={styles.typingRow}>
              <ActivityIndicator size={12} color={colors.primary} />
              <Text style={[styles.typingText, { color: colors.mutedForeground }]}>Contemplating...</Text>
            </View>
          ) : (
            <Text selectable style={[styles.bubbleText, { color: isUser ? "#FFFFFF" : colors.foreground }]}>
              {item.content}
            </Text>
          )}
        </View>

        {isUser && (
          <View style={[styles.avatar, { backgroundColor: colors.secondary, opacity: showAvatar ? 1 : 0 }]}>
            <Feather name="user" size={14} color={colors.primary} />
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#8B5CF6", "#6D28D9"]}
        style={[styles.header, { paddingTop: topPadding + 12 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerIconWrap}>
            <Feather name="cpu" size={18} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Islamic Scholar</Text>
            <View style={styles.statusRow}>
              {/* <View style={[
                styles.statusDot,
                { backgroundColor: connectionStatus === "ok" ? "#34D399" : connectionStatus === "error" ? "#F87171" : "#FBBF24" }
              ]} /> */}
              {/* <Text style={styles.headerSub}>
                {connectionStatus === "ok" ? "Backend Connected" : connectionStatus === "error" ? "Connection Error" : "Testing Connection..."}
              </Text> */}
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.headerActionBtn} onPress={clearHistory}>
          <Feather name="trash-2" size={18} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 72 : 0}
      >
        <Animated.FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={[styles.messageList, { paddingBottom: 24 }]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            if (isNearBottom.current) {
              listRef.current?.scrollToEnd({ animated: true });
            }
          }}
          onLayout={() => {
            listRef.current?.scrollToEnd({ animated: false });
          }}
          onScroll={(e) => {
            const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
            isNearBottom.current = contentOffset.y + layoutMeasurement.height >= contentSize.height - 80;
          }}
          scrollEventThrottle={16}
          itemLayoutAnimation={Layout.springify()}
          ListHeaderComponent={
            messages.length <= 1 ? (
              <Animated.View entering={FadeIn.delay(300)} style={styles.suggestions}>
                <Text style={[styles.suggestTitle, { color: colors.mutedForeground }]}>Suggested topics</Text>
                <View style={styles.suggestionGrid}>
                  {AI_CHAT_SUGGESTED_QUESTIONS.map((q, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.suggestionChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                      onPress={() => sendMessage(q)}
                    >
                      <Text style={[styles.suggestionText, { color: colors.foreground }]}>{q}</Text>
                      <Feather name="arrow-up-right" size={12} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            ) : null
          }
        />

        <Animated.View
          layout={Layout.springify()}
          style={[
            styles.inputBar,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              paddingBottom: Math.max(insets.bottom, 12),
            }
          ]}
        >
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
            placeholder="Ask anything about Islam..."
            placeholderTextColor={colors.mutedForeground}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={1000}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              {
                backgroundColor: input.trim() && !isStreaming ? "#8B5CF6" : colors.muted,
                opacity: input.trim() || isStreaming ? 1 : 0.6
              }
            ]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
          >
            {isStreaming ? (
              <ActivityIndicator size={16} color="#FFFFFF" />
            ) : (
              <Feather name="send" size={18} color={input.trim() ? "#FFFFFF" : colors.mutedForeground} />
            )}
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFFFFF", fontSize: 17, fontFamily: "Inter_700Bold" },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#34D399" },
  headerSub: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "Inter_400Regular" },
  headerActionBtn: { padding: 8 },
  messageList: { padding: 16, gap: 10 },
  suggestions: { marginBottom: 24, gap: 12 },
  suggestTitle: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginLeft: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  suggestionGrid: { gap: 8 },
  suggestionChip: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  suggestionText: { fontSize: 14, fontFamily: "Inter_500Medium", flex: 1, marginRight: 8 },
  messageRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 8 },
  messageRowUser: { flexDirection: "row-reverse" },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  bubble: { maxWidth: "82%", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  bubbleUser: { borderBottomRightRadius: 4 },
  bubbleAI: { borderWidth: 1, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 24 },
  typingRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 },
  typingText: { fontSize: 14, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  inputBar: {
    borderTopWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
    maxHeight: 120
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
});

