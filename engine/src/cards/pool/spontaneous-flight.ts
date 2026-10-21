import { defineCard } from "../define.js";

export default defineCard({
  name: "Spontaneous Flight",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn. Put a flying counter on it.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "add-counter", target: 0, counter: "flying", amount: 1 },
    ],
  },
});
