import { defineCard } from "../define.js";

// Tempt with Vengeance's shape: inside `each-player-may` the effect is the
// accepting opponent's, so "creature you control" is theirs.
const COUNTERS = {
  kind: "add-counter-all",
  filter: { type: "creature", controlledBy: "you" },
  counter: "+1/+1",
  amount: 1,
} as const;

export default defineCard({
  name: "Tempt with Glory",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text:
    "Tempting offer — Put a +1/+1 counter on each creature you control. Each opponent may put a +1/+1 counter on each creature they control. For each opponent who does, put a +1/+1 counter on each creature you control.",
  effect: {
    kind: "sequence",
    effects: [
      COUNTERS,
      {
        kind: "each-player-may",
        who: "each-opponent",
        prompt: "Put a +1/+1 counter on each creature you control?",
        effect: COUNTERS,
        ifDid: COUNTERS,
      },
    ],
  },
});
