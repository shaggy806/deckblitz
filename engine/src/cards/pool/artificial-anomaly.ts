import { defineCard } from "../define.js";

// EDHREC rank 31260.

const SAC_TEXT =
  '{3}{B}, {T}, Sacrifice this land: Each opponent loses 2 life and you gain 2 life. Create a tapped Planet land token named New Planet with "{T}: Add one mana of any color."';

export default defineCard({
  name: "Artificial Anomaly",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{3}{B}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2, who: "each-opponent" },
          { kind: "gain-life", amount: 2 },
          { kind: "create-token", token: "New Planet Token", count: 1, tapped: true },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
