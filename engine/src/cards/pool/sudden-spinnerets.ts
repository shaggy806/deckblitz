import { defineCard } from "../define.js";

// EDHREC rank 13533. Ikoria: Lair of Behemoths.
//
// Rulings:
//   [2020-04-17] Sudden Spinnerets can target a creature that's already untapped. It will still
//     get +1/+3 and a reach counter.

export default defineCard({
  name: "Sudden Spinnerets",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +1/+3 until end of turn. Put a reach counter on it. Untap it.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 3, duration: "end-of-turn" },
      { kind: "add-counter", target: 0, counter: "reach", amount: 1 },
      { kind: "untap", target: 0 },
    ],
  },
});
