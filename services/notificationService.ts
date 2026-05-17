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

export interface PrayerTime {
  name: string;
  arabicName: string;
  hour: number;
  minute: number;
}

/** Schedule a daily notification for each prayer, 5 min before the prayer time. */
export async function schedulePrayerNotifications(
  prayers: PrayerTime[]
): Promise<boolean> {
  if (Platform.OS === "web") return false;
  if (!Device.isDevice) return false;

  const Notifications = await loadNotifications();
  if (!Notifications) return false;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return false;

  // Cancel existing prayer notifications (keep other notifs)
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if ((n.content.data as any)?.type === "prayer") {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  // Schedule one daily notification per prayer (5 min early)
  for (const prayer of prayers) {
    let h = prayer.hour;
    let m = prayer.minute - 5;
    if (m < 0) { m += 60; h = (h - 1 + 24) % 24; }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🕌 ${prayer.name} (${prayer.arabicName}) — in 5 min`,
        body: `Time for ${prayer.name} prayer. May Allah accept your prayers.`,
        sound: true,
        data: { type: "prayer", prayer: prayer.name },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: h,
        minute: m,
      },
    });
  }
  return true;
}

export async function cancelPrayerNotifications(): Promise<void> {
  if (Platform.OS === "web") return;
  const Notifications = await loadNotifications();
  if (!Notifications) return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if ((n.content.data as any)?.type === "prayer") {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
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
