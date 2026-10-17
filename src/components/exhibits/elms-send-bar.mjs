// the state behind the elms send bar (figma 420:809). incomplete until a person is chosen; ready names who gets the
// message and turns Send on; the × takes the person back out and the message stays; sent confirms in the bar and
// offers Send another, which starts over.

/** @typedef {"incomplete" | "ready" | "sent"} SendBarState */

/** @returns {SendBarState} */
export const createSendBar = () => "incomplete";

/** choosing a person readies the bar; nothing else changes. */
export const choose = (state) => (state === "incomplete" ? "ready" : state);

/** the × undoes the choice, so Send turns off again. */
export const remove = (state) => (state === "ready" ? "incomplete" : state);

/** Send only works once someone is named; Send another starts a fresh message. */
export const send = (state) => (state === "ready" ? "sent" : state === "sent" ? "incomplete" : state);

/** the line in the bar for a state, naming the person, course and time it is given. */
export function barText(state, { person, course, time }) {
  if (state === "ready") return `Sending to ${person} · ${course} · 1 recipient`;
  if (state === "sent") return `✓  Message sent to ${person} · ${course} at ${time}`;
  return "Required: choose who gets this message.";
}

/** the bar's button: off until ready, Send another once sent. */
export function sendButton(state) {
  return { label: state === "sent" ? "Send another" : "Send message", disabled: state === "incomplete" };
}
