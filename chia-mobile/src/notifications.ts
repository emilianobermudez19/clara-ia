// Recordatorios de medicamentos como notificaciones LOCALES del teléfono: llegan con la app cerrada
// y no necesitan servidor. Discreción: el aviso nunca dice el nombre del medicamento.
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { Reminder } from "./shared/lib/vault";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("reminders", { name: "Recordatorios", importance: Notifications.AndroidImportance.HIGH });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

/** Reprograma todos los avisos según los recordatorios activos (uno diario por hora). */
export async function syncReminders(reminders: Reminder[]): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const times = [...new Set(reminders.filter((r) => r.active).flatMap((r) => r.times))];
  if (times.length === 0) return;
  if (!(await Notifications.getPermissionsAsync()).granted) return;
  for (const t of times) {
    const [hour = Number.NaN, minute = Number.NaN] = t.split(":").map(Number);
    if (Number.isNaN(hour) || Number.isNaN(minute)) continue;
    await Notifications.scheduleNotificationAsync({
      content: { title: "Chía", body: "Tienes un recordatorio pendiente." },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: "reminders" },
    });
  }
}

export async function clearReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
