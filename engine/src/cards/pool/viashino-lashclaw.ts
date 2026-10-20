import { defineCard } from "../define.js";

// EDHREC rank 22005. Modern Horizons 2.
//
// "Creatures you control" are the ones there as it resolves; one that
// arrives later this turn doesn't gain haste.
const TEXT = "{T}, Discard a card: Creatures you control gain haste until end of turn.";

export default defineCard({
  name: "Viashino Lashclaw",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Warrior"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "haste",
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
