import { defineCard } from "../define.js";

// EDHREC rank 11380. Ikoria: Lair of Behemoths.

export default defineCard({
  name: "Fully Grown",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +3/+3 until end of turn. Put a trample counter on it.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      { kind: "add-counter", target: 0, counter: "trample", amount: 1 },
    ],
  },
});
