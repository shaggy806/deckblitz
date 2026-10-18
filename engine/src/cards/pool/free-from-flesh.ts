import { defineCard } from "../define.js";

// EDHREC rank 18932.

export default defineCard({
  name: "Free from Flesh",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn. Put two oil counters on it.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "add-counter", target: 0, counter: "oil", amount: 2 },
    ],
  },
});
