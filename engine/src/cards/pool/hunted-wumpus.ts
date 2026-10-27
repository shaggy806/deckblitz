import { defineCard } from "../define.js";

// "Each other player" is each opponent: each is asked in turn order, and a
// creature card one of them puts onto the battlefield is theirs.

const TEXT =
  "When this creature enters, each other player may put a creature card from their hand onto the battlefield.";

export default defineCard({
  name: "Hunted Wumpus",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 6,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-opponent",
        options: [
          {
            putFromHand: { type: "creature" },
            text: "Put a creature card from your hand onto the battlefield",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
