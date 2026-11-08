import { defineCard } from "../define.js";

const TEXT = "Whenever you lose life for the first time each turn, put a +1/+1 counter on this creature. (Damage causes loss of life.)";

// The timing wrapper's `firstTimeEachTurn` on `loses-life` (B278): a loss
// earlier in the turn, before it arrived too, uses it up (its ruling).
export default defineCard({
  name: "Vengeful Warchief",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Orc", "Warrior"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "loses-life", who: "you", firstTimeEachTurn: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
