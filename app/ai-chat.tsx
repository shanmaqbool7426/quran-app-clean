import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState, useRef, useCallback } from "react";
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

import { useColors } from "@/hooks/useColors";
import { streamChat, type ChatMessage } from "@/services/aiService";

const SUGGESTED_QUESTIONS = [
  "What is the importance of Salah in Islam?",
  "Explain the pillars of Islam",
  "What does the Quran say about patience?",
  "How to perform Wudu correctly?",
  "What is the significance of Surah Al-Fatiha?",
  "Tell me about the Night of Power (Laylat al-Qadr)",
];

interface Message extends ChatMessage {
  id: string;
  isLoading?: boolean;
}

export default function AIChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "As-salamu alaykum! I am your AI Islamic Scholar. Ask me anything about the Quran, Hadith, Islamic jurisprudence, prayer, fasting, or any aspect of Islam. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const listRef = useRef<FlatList>(null);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
    };

    setInput("");
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);

    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      isLoading: true,
    };
    setMessages(prev => [...prev, assistantMsg]);

    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

    const historyMessages: ChatMessage[] = messages
      .filter(m => m.id !== "welcome")
      .map(m => ({ role: m.role, content: m.content }));
    historyMessages.push({ role: "user", content: text.trim() });

    await streamChat(
      historyMessages,
      (chunk) => {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: m.content + chunk, isLoading: false }
              : m
          )
        );
        setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 50);
      },
      () => {
        setIsStreaming(false);
        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, isLoading: false } : m)
        );
      },
      () => {
        setIsStreaming(false);
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: m.content || "Sorry, I could not process your request. Please try again.", isLoading: false }
              : m
          )
        );
      }
    );
  }, [messages, isStreaming]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
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
              <Text style={[styles.typingText, { color: colors.mutedForeground }]}>Thinking...</Text>
            </View>
          ) : (
            <Text style={[styles.bubbleText, { color: isUser ? "#FFFFFF" : colors.foreground }]}>
              {item.content}
            </Text>
          )}
        </View>
        {isUser && (
          <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
            <Feather name="user" size={14} color={colors.primary} />
          </View>
        )}
      </View>
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
            <Text style={styles.headerSub}>Powered by AI • Ask anything</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={() => {
            setMessages([{
              id: "welcome",
              role: "assistant",
              content: "As-salamu alaykum! How can I help you today?",
            }]);
          }}
        >
          <Feather name="refresh-ccw" size={18} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={[styles.messageList, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListHeaderComponent={
            messages.length <= 1 ? (
              <View style={styles.suggestions}>
                <Text style={[styles.suggestTitle, { color: colors.mutedForeground }]}>Suggested questions</Text>
                <View style={styles.suggestionGrid}>
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.suggestionChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                      onPress={() => sendMessage(q)}
                    >
                      <Text style={[styles.suggestionText, { color: colors.foreground }]}>{q}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null
          }
        />

        <View style={[
          styles.inputBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: Platform.OS === "ios" ? insets.bottom + 8 : 12,
          }
        ]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
            placeholder="Ask about Quran, Islam, prayer..."
            placeholderTextColor={colors.mutedForeground}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: input.trim() && !isStreaming ? "#8B5CF6" : colors.muted }]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
          >
            <Feather name="send" size={18} color={input.trim() && !isStreaming ? "#FFFFFF" : colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontFamily: "Inter_400Regular" },
  clearBtn: { padding: 8 },
  messageList: { padding: 16, gap: 12 },
  suggestions: { marginBottom: 20, gap: 12 },
  suggestTitle: { fontSize: 12, fontFamily: "Inter_500Medium", textAlign: "center" },
  suggestionGrid: { gap: 8 },
  suggestionChip: { padding: 12, borderRadius: 12, borderWidth: 1 },
  suggestionText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  messageRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 4 },
  messageRowUser: { flexDirection: "row-reverse" },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  bubble: { maxWidth: "80%", padding: 12, borderRadius: 16 },
  bubbleUser: { borderBottomRightRadius: 4 },
  bubbleAI: { borderWidth: 1, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  typingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  typingText: { fontSize: 13, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  inputBar: { borderTopWidth: 1, paddingTop: 10, paddingHorizontal: 16, flexDirection: "row", gap: 10, alignItems: "flex-end" },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, fontFamily: "Inter_400Regular", borderWidth: 1, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});
