import { defineCard } from "../define.js";

// EDHREC rank 6352.
//
// Rulings:
//   [2015-08-25] The mana produced by the last ability can't be spent on a colorless spell unless
//     that spell specifically has the devoid ability.

const DEVOID_MANA_TEXT = "{T}, Pay 1 life: Add one mana of any color. Spend this mana only to cast a spell with devoid.";

export default defineCard({
  name: "Corrupted Crossroads",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}. ({C} represents colorless mana.)\n${DEVOID_MANA_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true, payLife: 1 },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        // The printed keyword (rule 702.114), not any colorless spell.
        spendOnly: { spell: { hasKeyword: "devoid" }, text: "Spend this mana only to cast a spell with devoid." },
      },
      resolve: null,
      text: DEVOID_MANA_TEXT,
    },
  ],
});
