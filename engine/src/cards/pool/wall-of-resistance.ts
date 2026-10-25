import { defineCard } from "../define.js";

// Mirage. EDHREC rank 21761.
//
// Rulings:
//   [2004-10-04] It gets only one counter a turn, not one per point of damage.

export default defineCard({
  name: "Wall of Resistance",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 3,
  keywords: ["defender", "flying"],
  text: "Defender (This creature can't attack.)\nFlying\nAt the beginning of each end step, if this creature was dealt damage this turn, put a +0/+1 counter on it.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "source", filter: { damagedThisTurnBy: {} } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+0/+1", amount: 1 },
      resolve: null,
      text: "At the beginning of each end step, if this creature was dealt damage this turn, put a +0/+1 counter on it.",
    },
  ],
});
