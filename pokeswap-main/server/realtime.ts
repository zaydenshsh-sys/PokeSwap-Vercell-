import { supabaseAdmin } from "./supabase.js";
import type { User } from "./lib.js";

// Serverless functions cannot hold WebSocket connections. Publish short events
// through Supabase Realtime Broadcast instead.
const globalChannel = () => supabaseAdmin.channel("pokeswap-live", { config: { broadcast: { self: false } } });
const userChannel = (id: number) => supabaseAdmin.channel(`pokeswap-user-${id}`, { config: { broadcast: { self: false } } });

export function broadcast(data: unknown) {
  const channel = globalChannel();
  void channel.send({ type: "broadcast", event: "app-event", payload: data }).finally(() => {
    void supabaseAdmin.removeChannel(channel);
  });
}
export function sendToUser(userId: number, data: unknown) {
  const channel = userChannel(userId);
  void channel.send({ type: "broadcast", event: "user-event", payload: data }).finally(() => {
    void supabaseAdmin.removeChannel(channel);
  });
}
export function kickUser(userId: number, reason: string) {
  sendToUser(userId, { type: "kicked", reason });
}
export function onlineUsers() { return []; }
export function refreshUser(_user: User) { /* Presence is tracked by connected clients. */ }
