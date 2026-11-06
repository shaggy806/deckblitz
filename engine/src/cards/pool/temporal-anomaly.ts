import { defineCard } from "../define.js";

// EDHREC rank 31693.

const SAC_TEXT =
  '{3}{G}, {T}, Sacrifice this land: Mill four cards. You may put a permanent card from among them into your hand. Create a tapped Planet land token named New Planet with "{T}: Add one mana of any color."';

export default defineCard({
  name: "Temporal Anomaly",
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
      cost: { mana: "{3}{G}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 4 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 1,
            destination: "hand",
            leftover: "stay",
            filter: {
              thisWay: "milled",
              typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
            },
          },
          { kind: "create-token", token: "New Planet Token", count: 1, tapped: true },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
