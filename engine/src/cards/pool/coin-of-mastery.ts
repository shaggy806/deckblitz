import { defineCard } from "../define.js";

// EDHREC rank 4664.
// Makes Treasure → use "Treasure Token".
// Kalain, Reclusive Painter's replacement, counting mana from artifact sources.

const COUNTERS_TEXT =
  "Each creature you control enters with an additional +1/+1 counter on it for each mana from an artifact source spent to cast it.";
const TREASURE_TEXT = "{T}: Create a Treasure token.";

export default defineCard({
  name: "Coin of Mastery",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${COUNTERS_TEXT}\n${TREASURE_TEXT} (It's an artifact with "{T}, Sacrifice this token: Add one mana of any color.")`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", controlledBy: "you" },
        counters: { kind: "+1/+1", amount: { manaSpentOf: "trigger-object", from: { type: "artifact" } } },
      },
      text: COUNTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: TREASURE_TEXT,
    },
  ],
});
