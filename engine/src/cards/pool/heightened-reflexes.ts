import { defineCard } from "../define.js";

// EDHREC rank 16362. Ikoria: Lair of Behemoths.

export default defineCard({
  name: "Heightened Reflexes",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature gets +1/+0 until end of turn. Put a first strike counter on it.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "add-counter", target: 0, counter: "first-strike", amount: 1 },
    ],
  },
});
