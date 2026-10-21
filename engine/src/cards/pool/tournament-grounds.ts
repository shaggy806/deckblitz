import { defineCard } from "../define.js";

const RESTRICTED = "{T}: Add {R}, {W}, or {B}. Spend this mana only to cast a Knight or Equipment spell.";

export default defineCard({
  name: "Tournament Grounds",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${RESTRICTED}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { oneOf: ["R", "W", "B"] },
        amount: 1,
        // A spell only: the mana can't pay for an ability, equip included (its ruling).
        spendOnly: {
          spell: { subtypes: ["Knight", "Equipment"] },
          text: "Spend this mana only to cast a Knight or Equipment spell.",
        },
      },
      resolve: null,
      text: RESTRICTED,
    },
  ],
});
