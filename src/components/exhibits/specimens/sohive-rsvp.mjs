// the state behind the sohive rsvp specimen (figma 369:633). a tap adds you to the room: the count rolls up by one,
// the capacity bar fills, a ticket with a door code comes in, and the toast offers Undo for five seconds. a second
// tap leaves, and that toast offers Undo too.

export const CAPACITY = 300;
export const TOAST_MS = 5000;
const BASE = 241;

/** @typedef {{ going: boolean, count: number, toast: string | null }} Rsvp */

/** @returns {Rsvp} */
export const createRsvp = () => ({ going: false, count: BASE, toast: null });

const going = (count) => ({ going: true, count, toast: `You're going. ${count} people now.` });
const left = (count) => ({ going: false, count, toast: "You're no longer going." });

export const tap = (state) => (state.going ? left(state.count - 1) : going(state.count + 1));

/** undo puts back whatever the last tap changed, and the toast goes with it. */
export function undo(state) {
  if (!state.toast) return state;
  return state.going ? { going: false, count: state.count - 1, toast: null } : { going: true, count: state.count + 1, toast: null };
}

export const expire = (state) => ({ ...state, toast: null });

export const spotsLeft = (state) => CAPACITY - state.count;
export const fillPercent = (state) => Math.round((state.count / CAPACITY) * 10000) / 100;
export const digits = (count) => String(count).split("").map(Number);
