import webpush from "web-push";
import { supabaseServer } from "@/lib/supabaseServer";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

  if (!publicKey || !privateKey) {
    throw new Error("Missing VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY.");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

// Sends a notification to every subscribed device. Cleans up subscriptions
// that have expired or been revoked (410/404 responses) as it goes.
export async function sendPushToAll({ title, body, url = "/" }) {
  ensureConfigured();
  const supabase = supabaseServer();

  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("device_id, subscription");

  if (error) throw error;
  if (!subs || subs.length === 0) return { sent: 0, removed: 0 };

  const payload = JSON.stringify({ title, body, url });
  let sent = 0;
  const toRemove = [];

  await Promise.all(
    subs.map(async ({ device_id, subscription }) => {
      try {
        await webpush.sendNotification(subscription, payload);
        sent += 1;
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          toRemove.push(device_id);
        }
        // Other errors (e.g. transient network issues) are ignored here;
        // the subscription stays and will be retried next time.
      }
    })
  );

  if (toRemove.length > 0) {
    await supabase.from("push_subscriptions").delete().in("device_id", toRemove);
  }

  return { sent, removed: toRemove.length };
}
