import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export interface NotificationPrefs {
  enabled: boolean;
  hour: number;
  minute: number;
}

export const DEFAULT_NOTIF_PREFS: NotificationPrefs = {
  enabled: false,
  hour: 7,
  minute: 0,
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type PermissionStatus = "granted" | "denied" | "undetermined" | "web";

export async function requestNotificationPermission(): Promise<PermissionStatus> {
  if (Platform.OS === "web") {
    return "web";
  }

  if (!Device.isDevice) {
    return "undetermined";
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return "granted";

  const { status } = await Notifications.requestPermissionsAsync();
  return status as PermissionStatus;
}

export async function getPermissionStatus(): Promise<PermissionStatus> {
  if (Platform.OS === "web") return "web";
  if (!Device.isDevice) return "undetermined";
  const { status } = await Notifications.getPermissionsAsync();
  return status as PermissionStatus;
}

export async function scheduleDailyReminder(
  prefs: NotificationPrefs,
  notifTitle: string,
  notifBody: string
): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!prefs.enabled) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: notifTitle,
      body: notifBody,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: prefs.hour,
      minute: prefs.minute,
    },
  });
}

export async function cancelDailyReminder(): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function sendTestNotification(
  notifTitle: string,
  notifBody: string
): Promise<boolean> {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(notifTitle, { body: notifBody });
        return true;
      }
    }
    return false;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: { title: notifTitle, body: notifBody, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3,
        repeats: false,
      },
    });
    return true;
  } catch {
    return false;
  }
}

export function formatTime(hour: number, minute: number): string {
  const amPm = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const m = String(minute).padStart(2, "0");
  return `${h}:${m} ${amPm}`;
}
