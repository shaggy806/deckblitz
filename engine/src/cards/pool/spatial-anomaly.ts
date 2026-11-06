import { defineCard } from "../define.js";

// EDHREC rank 30943.

const SAC_TEXT =
  '{4}{R}, {T}, Sacrifice this land: It deals 2 damage to target creature. Create a tapped Planet land token named New Planet with "{T}: Add one mana of any color."';

export default defineCard({
  name: "Spatial Anomaly",
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
      cost: { mana: "{4}{R}", tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 2, target: 0 },
          { kind: "create-token", token: "New Planet Token", count: 1, tapped: true },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
