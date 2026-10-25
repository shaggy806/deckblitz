import { defineCard } from "../define.js";

// EDHREC rank 9760. A delayed flicker (Kykar's shape) whose return brings the
// card back with a +1/+1 counter on it as it enters (Spaceshift's `entering`),
// creature or not (the ruling). A token exiled this way never returns, and one
// exiled during an end step waits for the next turn's (the rulings).
const TEXT =
  "Exile target creature. At the beginning of the next end step, return that card to the battlefield under its owner's control with a +1/+1 counter on it.";

export default defineCard({
  name: "Long Road Home",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: TEXT,
  targets: ["creature"],
  effect: {
    kind: "flicker",
    target: 0,
    returnAt: "next-end-step",
    thenCounters: { kind: "+1/+1", amount: 1, entering: true },
    returnText: "Return the exiled card to the battlefield under its owner's control with a +1/+1 counter on it.",
  },
});
