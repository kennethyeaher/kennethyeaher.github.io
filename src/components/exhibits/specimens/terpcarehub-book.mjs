// the state behind the TerpCareHub booking specimen (figma 368:523). the card opens in place to three times, a
// confirm books the chosen one, a toast offers Undo for five seconds, and after that the booking lands in Your
// bookings, where it stays.

export const TOAST_MS = 5000;
export const slots = ["2:40 PM", "3:20 PM", "4:00 PM"];

export const createBooking = () => ({ phase: "idle", time: slots[0] });

export const open = (state) => (state.phase === "idle" ? { ...state, phase: "picking" } : state);

export const pick = (state, time) => (state.phase === "picking" && slots.includes(time) ? { ...state, time } : state);

export const confirm = (state) => (state.phase === "picking" ? { ...state, phase: "booked" } : state);

/** only while the toast is up. */
export const undo = (state) => (state.phase === "booked" ? createBooking() : state);

/** the toast's five seconds are up. */
export const expire = (state) => (state.phase === "booked" ? { ...state, phase: "landed" } : state);

export const confirmLabel = (state) => `Confirm ${state.time}`;
export const bookedLabel = (state) => `Booked · Today, ${state.time}`;
