import { defineCard } from "../define.js";

// EDHREC rank 31786.

const SAC_TEXT =
  '{5}{U}, {T}, Sacrifice this land: Draw two cards. Create a tapped Planet land token named New Planet with "{T}: Add one mana of any color."';

export default defineCard({
  name: "Gaseous Anomaly",
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
      cost: { mana: "{5}{U}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "create-token", token: "New Planet Token", count: 1, tapped: true },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
