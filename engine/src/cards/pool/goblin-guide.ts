import { defineCard } from "../define.js";

// EDHREC rank 15068.
//
// The defending player (the `"trigger-player"` of an attack trigger — the
// controller of an attacked planeswalker, its ruling) reveals their top card;
// a land must be taken into their hand (`min: 1` over a land filter), anything
// else stays on top (the ruling). Not a draw.

const TEXT =
  "Whenever this creature attacks, defending player reveals the top card of their library. If it's a land card, that player puts it into their hand.";

export default defineCard({
  name: "Goblin Guide",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Scout"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "trigger-player",
        effect: {
          kind: "look-and-choose",
          player: "that-player",
          zone: "library",
          count: 1,
          reveal: true,
          min: 1,
          max: 1,
          filter: { type: "land" },
          destination: "hand",
          leftover: "stay",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
