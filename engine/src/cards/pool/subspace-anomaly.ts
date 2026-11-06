import { defineCard } from "../define.js";

// EDHREC rank 28295.

const MAKE_TEXT =
  '{4}{W}, {T}, Sacrifice this land: Create two 1/1 red Officer creature tokens. Create a tapped Planet land token named New Planet with "{T}: Add one mana of any color."';

export default defineCard({
  name: "Subspace Anomaly",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${MAKE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{4}{W}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Officer Token", count: 2 },
          { kind: "create-token", token: "New Planet Token", count: 1, tapped: true },
        ],
      },
      resolve: null,
      text: MAKE_TEXT,
    },
  ],
});
