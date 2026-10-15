import { defineCard } from "../define.js";

// EDHREC rank 28157.

export default defineCard({
  name: "Soldier On",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Put two +1/+1 counters on target creature. Untap it.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      { kind: "untap", target: 0 },
    ],
  },
});
