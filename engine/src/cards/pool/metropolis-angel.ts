import { defineCard } from "../define.js";

const ATTACK_TEXT = "Whenever you attack with one or more creatures with counters on them, draw a card.";

// Ruling: one card however many of the attackers had counters on them — one
// trigger per attack declaration.
export default defineCard({
  name: "Metropolis Angel",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Angel", "Soldier"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "attack-with",
        who: "you",
        atLeast: 1,
        filter: { type: "creature", counters: { compare: { op: "gte", n: 1 } } },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
