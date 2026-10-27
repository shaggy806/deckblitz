import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 32018.

const TEXT = "{U}: Mill a card. If a land card was milled this way, this creature can't be blocked this turn.";

export default defineCard({
  name: "Saprazzan Breaker",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "milled", filter: { type: "land" } },
            then: { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
