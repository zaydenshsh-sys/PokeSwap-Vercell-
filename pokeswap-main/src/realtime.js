import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const listeners = new Set();
const statusListeners = new Set();
let client = null;
let globalChannel = null;
let userChannel = null;
let status = "offline";

function setStatus(value) {
  status = value;
  statusListeners.forEach((fn) => fn(value));
}
function emit(message) {
  listeners.forEach((fn) => fn(message));
}

export function startRealtime(me) {
  if (!url || !anonKey || !me || globalChannel) {
    if (!url || !anonKey) setStatus("offline");
    return;
  }
  client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  globalChannel = client.channel("pokeswap-live", { config: { broadcast: { self: false }, presence: { key: String(me.id) } } });
  globalChannel
    .on("broadcast", { event: "app-event" }, ({ payload }) => emit(payload))
    .on("presence", { event: "sync" }, () => {
      const state = globalChannel.presenceState();
      const online = Object.values(state).flat().map((entry) => entry.user).filter(Boolean);
      emit({ type: "presence", online });
    })
    .subscribe(async (state) => {
      if (state === "SUBSCRIBED") {
        setStatus("live");
        await globalChannel.track({ user: { id: me.id, username: me.username, displayName: me.displayName, isAdmin: me.isAdmin, avatarDex: me.avatarDex } });
        emit({ type: "hello", online: [] });
      } else if (state === "CHANNEL_ERROR" || state === "TIMED_OUT" || state === "CLOSED") setStatus("offline");
    });
  userChannel = client.channel(`pokeswap-user-${me.id}`, { config: { broadcast: { self: false } } });
  userChannel.on("broadcast", { event: "user-event" }, ({ payload }) => emit(payload)).subscribe();
}

export async function stopRealtime() {
  if (client) await client.removeAllChannels();
  client = null;
  globalChannel = null;
  userChannel = null;
  setStatus("offline");
}
export function onRealtime(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function onStatus(fn) { statusListeners.add(fn); fn(status); return () => statusListeners.delete(fn); }
export function sendRealtime(data) {
  if (globalChannel) void globalChannel.send({ type: "broadcast", event: "app-event", payload: data });
}
