import { defineCard } from "../define.js";

// EDHREC rank 10143.

const DRAW_TEXT =
  "Whenever a creature you control with a counter on it deals combat damage to a player, you draw a card and you lose 1 life.";

export default defineCard({
  name: "Yathan Tombguard",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "deals-combat-damage-to-player",
        who: "you-control",
        // A counter of any kind.
        filter: { type: "creature", counters: { compare: { op: "gte", n: 1 } } },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
        ],
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
