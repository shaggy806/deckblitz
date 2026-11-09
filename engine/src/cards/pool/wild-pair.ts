import { defineCard } from "../define.js";

const TEXT =
  "Whenever a creature enters, if you cast it from your hand, you may search your library for a creature card with the same total power and toughness, put it onto the battlefield, then shuffle.";

// EDHREC rank 11261. Compared with the entered creature as it is, or as it
// last existed if it has left (the rulings).
export default defineCard({
  name: "Wild Pair",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" } },
      condition: { kind: "trigger-object", filter: { cast: true, castBy: "you", castFrom: "hand" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a creature card with the same total power and toughness?",
        effect: {
          kind: "search-library",
          filter: {
            type: "creature",
            totalPowerToughness: { op: "eq", n: { amount: { sum: [{ powerOf: "trigger-object" }, { toughnessOf: "trigger-object" }] } } },
          },
          destination: "battlefield",
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
