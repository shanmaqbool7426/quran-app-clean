import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

/** Loading `expo-notifications` runs push token registration; that is unsupported in Expo Go on Android (SDK 53+). */
export function shouldLoadExpoNotificationsModule(): boolean {
  if (Platform.OS === "web") return false;
  if (Platform.OS === "android" && Constants.appOwnership === "expo") return false;
  return true;
}

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

type NotificationsModule = typeof import("expo-notifications");

let notificationsPromise: Promise<NotificationsModule | null> | null = null;

async function loadNotifications(): Promise<NotificationsModule | null> {
  if (!shouldLoadExpoNotificationsModule()) return null;
  if (!notificationsPromise) {
    notificationsPromise = import("expo-notifications").then((N) => {
      N.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      return N;
    });
  }
  return notificationsPromise;
}

/** Register default handler and return the module (null in environments where the module must not load). */
export async function getNotificationsModule(): Promise<NotificationsModule | null> {
  return loadNotifications();
}

export type PermissionStatus = "granted" | "denied" | "undetermined" | "web";

export async function requestNotificationPermission(): Promise<PermissionStatus> {
  if (Platform.OS === "web") {
    return "web";
  }

  if (!Device.isDevice) {
    return "undetermined";
  }

  const Notifications = await loadNotifications();
  if (!Notifications) return "undetermined";

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return "granted";

  const { status } = await Notifications.requestPermissionsAsync();
  return status as PermissionStatus;
}

export async function getPermissionStatus(): Promise<PermissionStatus> {
  if (Platform.OS === "web") return "web";
  if (!Device.isDevice) return "undetermined";
  const Notifications = await loadNotifications();
  if (!Notifications) return "undetermined";
  const { status } = await Notifications.getPermissionsAsync();
  return status as PermissionStatus;
}

export async function scheduleDailyReminder(
  prefs: NotificationPrefs,
  notifTitle: string,
  notifBody: string
): Promise<void> {
  if (Platform.OS === "web") return;
  const Notifications = await loadNotifications();
  if (!Notifications) return;

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
  const Notifications = await loadNotifications();
  if (!Notifications) return;
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

  const Notifications = await loadNotifications();
  if (!Notifications) return false;

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
